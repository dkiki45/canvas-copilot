import "server-only";
import { canvasPaginated, type CanvasCredentials } from "./client";
import type { CanvasAttachment } from "./types";

/** Lista os arquivos do curso (aba "Arquivos" do Canvas), lista plana sem navegação de pastas. */
export async function listCourseFiles(creds: CanvasCredentials, courseId: number): Promise<CanvasAttachment[]> {
  const files = await canvasPaginated<CanvasAttachment>(creds, `/courses/${courseId}/files`, {
    query: { per_page: 100 },
  });
  return [...files].sort((a, b) => a.display_name.localeCompare(b.display_name, "pt-BR"));
}
