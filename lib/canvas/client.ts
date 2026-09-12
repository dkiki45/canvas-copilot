import "server-only";
import { parseLinkHeader } from "./pagination";

export interface CanvasCredentials {
  baseUrl: string; // ex: "https://pucpr.instructure.com" — sem barra final
  token: string; // token descriptografado, só em memória, nunca logado
}

interface CanvasRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  query?: Record<string, string | number | boolean | string[] | undefined>;
  body?: unknown;
}

export class CanvasApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "CanvasApiError";
  }
}

export class CanvasAuthError extends CanvasApiError {
  constructor(message = "Token do Canvas inválido ou expirado") {
    super(401, message);
    this.name = "CanvasAuthError";
  }
}

const MAX_RETRIES = 3;

function buildUrl(baseUrl: string, path: string, query?: CanvasRequestOptions["query"]): string {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/api/v1${path}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        for (const v of value) url.searchParams.append(`${key}[]`, String(v));
      } else {
        url.searchParams.append(key, String(value));
      }
    }
  }

  return url.toString();
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(url, init);

    if (response.status !== 429) return response;

    if (attempt === MAX_RETRIES) return response;

    const retryAfterHeader = response.headers.get("Retry-After");
    const retryAfterMs = retryAfterHeader
      ? Number(retryAfterHeader) * 1000
      : 2 ** attempt * 1000 + Math.random() * 250;

    await sleep(retryAfterMs);
    lastError = new Error("Rate limited");
  }

  throw lastError;
}

/** Faz uma chamada à API do Canvas. Nunca loga o token ou o header Authorization. */
export async function canvasRequest<T>(
  creds: CanvasCredentials,
  path: string,
  options: CanvasRequestOptions = {},
): Promise<{ data: T; linkHeader: string | null }> {
  const url = buildUrl(creds.baseUrl, path, options.query);

  const response = await fetchWithRetry(url, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${creds.token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401) {
    throw new CanvasAuthError();
  }

  if (!response.ok) {
    throw new CanvasApiError(response.status, `Canvas API retornou status ${response.status} para ${path}`);
  }

  const data = (await response.json()) as T;
  return { data, linkHeader: response.headers.get("Link") };
}

/** Segue a paginação via header Link até acabar (rel="next"), com um limite de segurança. */
export async function canvasPaginated<T>(
  creds: CanvasCredentials,
  path: string,
  options: CanvasRequestOptions = {},
  paginationOptions: { maxPages?: number } = {},
): Promise<T[]> {
  const maxPages = paginationOptions.maxPages ?? 50;
  const results: T[] = [];

  let nextUrl: string | null = buildUrl(creds.baseUrl, path, options.query);
  let page = 0;

  while (nextUrl && page < maxPages) {
    const response: Response = await fetchWithRetry(nextUrl, {
      method: options.method ?? "GET",
      headers: { Authorization: `Bearer ${creds.token}` },
    });

    if (response.status === 401) {
      throw new CanvasAuthError();
    }

    if (!response.ok) {
      throw new CanvasApiError(response.status, `Canvas API retornou status ${response.status} para ${path}`);
    }

    const data = (await response.json()) as T[];
    results.push(...data);

    const links = parseLinkHeader(response.headers.get("Link"));
    nextUrl = links.next ?? null;
    page++;
  }

  return results;
}
