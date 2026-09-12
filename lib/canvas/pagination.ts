/**
 * Parseia o header `Link` (RFC 5988) que o Canvas retorna para paginação.
 * Formato: <url>; rel="next", <url>; rel="last", ...
 */
export function parseLinkHeader(header: string | null): Partial<Record<"next" | "prev" | "first" | "last", string>> {
  if (!header) return {};

  const links: Partial<Record<"next" | "prev" | "first" | "last", string>> = {};

  for (const part of header.split(",")) {
    const match = part.trim().match(/^<([^>]+)>;\s*rel="([^"]+)"$/);
    if (!match) continue;
    const [, url, rel] = match;
    if (rel === "next" || rel === "prev" || rel === "first" || rel === "last") {
      links[rel] = url;
    }
  }

  return links;
}
