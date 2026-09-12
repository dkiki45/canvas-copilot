import "server-only";
import { canvasRequest, CanvasApiError, type CanvasCredentials } from "./client";
import type { Submission } from "./types";

/** Status de entrega do aluno para uma atividade. */
export async function getSubmissionSelf(
  creds: CanvasCredentials,
  courseId: number,
  assignmentId: number,
): Promise<Submission> {
  const { data } = await canvasRequest<Submission>(
    creds,
    `/courses/${courseId}/assignments/${assignmentId}/submissions/self`,
  );
  return data;
}

interface UploadTarget {
  upload_url: string;
  upload_params: Record<string, string>;
}

interface CanvasFile {
  id: number;
}

/**
 * Envia um arquivo como entrega de uma atividade, seguindo o fluxo de 3 passos
 * da API do Canvas:
 *   1. Pede uma URL de upload (submissions/self/files).
 *   2. Envia o arquivo (multipart/form-data) para essa URL; o Canvas responde
 *      com um redirect para uma URL de confirmação.
 *   3. Segue a confirmação (GET autenticado) para obter o `id` do arquivo, e
 *      finaliza a entrega com `submission_type=online_upload&file_ids=[...]`.
 */
export async function submitFileToAssignment(
  creds: CanvasCredentials,
  courseId: number,
  assignmentId: number,
  file: { name: string; size: number; contentType: string; buffer: Buffer },
): Promise<Submission> {
  // Passo 1: pedir a URL de upload.
  const { data: uploadTarget } = await canvasRequest<UploadTarget>(
    creds,
    `/courses/${courseId}/assignments/${assignmentId}/submissions/self/files`,
    {
      method: "POST",
      body: { name: file.name, size: file.size, content_type: file.contentType },
    },
  );

  // Passo 2: enviar o arquivo para a URL de storage retornada.
  const form = new FormData();
  for (const [key, value] of Object.entries(uploadTarget.upload_params)) {
    form.append(key, value);
  }
  form.append("file", new Blob([new Uint8Array(file.buffer)], { type: file.contentType }), file.name);

  const uploadResponse = await fetch(uploadTarget.upload_url, {
    method: "POST",
    body: form,
    redirect: "manual",
  });

  const confirmationUrl = uploadResponse.headers.get("Location");
  if (!confirmationUrl) {
    throw new CanvasApiError(uploadResponse.status, "Canvas não retornou URL de confirmação do upload");
  }

  const { data: uploadedFile } = await canvasRequest<CanvasFile>(creds, absolutePathFromUrl(confirmationUrl, creds.baseUrl));

  // Passo 3: finalizar a entrega com o file_id resultante.
  const { data: submission } = await canvasRequest<Submission>(
    creds,
    `/courses/${courseId}/assignments/${assignmentId}/submissions`,
    {
      method: "POST",
      body: {
        submission: { submission_type: "online_upload", file_ids: [uploadedFile.id] },
      },
    },
  );

  return submission;
}

/** `canvasRequest` monta a URL a partir de `${baseUrl}/api/v1${path}` — extrai o path relativo daí. */
function absolutePathFromUrl(url: string, baseUrl: string): string {
  const parsed = new URL(url, baseUrl);
  return parsed.pathname.replace(/^\/api\/v1/, "") + parsed.search;
}
