import "server-only";
import { canvasPaginated, canvasRequest, type CanvasCredentials } from "./client";
import type { CanvasAttachment } from "./types";

interface CanvasModuleItem {
  id: number;
  type: string;
  content_id?: number;
}

interface CanvasModule {
  id: number;
  items?: CanvasModuleItem[];
}

/**
 * Arquivos linkados dentro de Módulos do curso. Alguns professores deixam
 * arquivos "ocultos" do repositório geral (fora de `/courses/:id/files`), só
 * acessíveis via um item de Módulo — por isso é uma busca separada.
 */
export async function listModuleFiles(creds: CanvasCredentials, courseId: number): Promise<CanvasAttachment[]> {
  const modules = await canvasPaginated<CanvasModule>(creds, `/courses/${courseId}/modules`, {
    query: { include: ["items"], per_page: 50 },
  });

  const fileItemIds = modules
    .flatMap((mod) => mod.items ?? [])
    .filter((item) => item.type === "File" && item.content_id != null)
    .map((item) => item.content_id as number);

  const files = await Promise.all(
    fileItemIds.map(async (fileId) => {
      try {
        const { data } = await canvasRequest<CanvasAttachment>(creds, `/files/${fileId}`);
        return data;
      } catch {
        return null;
      }
    }),
  );

  return files.filter((file): file is CanvasAttachment => file != null);
}
