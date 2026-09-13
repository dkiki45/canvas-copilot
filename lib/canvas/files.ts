import "server-only";
import { canvasPaginated, type CanvasCredentials } from "./client";
import { listModuleFiles } from "./modules";
import type { CanvasAttachment, CourseFileGroup, CourseFolder, GroupedCourseFiles } from "./types";

const HIGHLIGHT_PATTERN = /plano de ensino|ementa|syllabus/i;
const MODULES_GROUP_NAME = "Módulos (não listados em Arquivos)";

/** Lista os arquivos do curso (aba "Arquivos" do Canvas), lista plana sem navegação de pastas. */
export async function listCourseFiles(creds: CanvasCredentials, courseId: number): Promise<CanvasAttachment[]> {
  const files = await canvasPaginated<CanvasAttachment>(creds, `/courses/${courseId}/files`, {
    query: { per_page: 100 },
  });
  return [...files].sort((a, b) => a.display_name.localeCompare(b.display_name, "pt-BR"));
}

/** Lista as pastas do curso, usadas só pra dar nome amigável às pastas dos arquivos. */
export async function listCourseFolders(creds: CanvasCredentials, courseId: number): Promise<CourseFolder[]> {
  return canvasPaginated<CourseFolder>(creds, `/courses/${courseId}/folders`, { query: { per_page: 100 } });
}

/**
 * Arquivos do curso agrupados por pasta, com arquivos tipo Plano de Ensino/Ementa destacados
 * separadamente no topo. Também inclui arquivos linkados só em Módulos, que às vezes o professor
 * deixa fora do repositório geral de Arquivos — deduplicados pelo id do arquivo. Pastas/módulos
 * que falharem ao carregar caem de volta pra "Geral" em vez de derrubar a página inteira.
 */
export async function listCourseFilesGrouped(creds: CanvasCredentials, courseId: number): Promise<GroupedCourseFiles> {
  const [files, folders, moduleFiles] = await Promise.all([
    listCourseFiles(creds, courseId),
    listCourseFolders(creds, courseId).catch(() => [] as CourseFolder[]),
    listModuleFiles(creds, courseId).catch(() => [] as CanvasAttachment[]),
  ]);

  const knownIds = new Set(files.map((file) => file.id));
  const extraModuleFiles = moduleFiles.filter((file) => !knownIds.has(file.id));

  const folderNameById = new Map<number, string>();
  for (const folder of folders) {
    const segments = folder.full_name.split("/").slice(1);
    folderNameById.set(folder.id, segments.length > 0 ? segments.join(" / ") : "Geral");
  }

  const highlighted: CanvasAttachment[] = [];
  const rest: CanvasAttachment[] = [];
  for (const file of files) {
    if (HIGHLIGHT_PATTERN.test(file.display_name)) {
      highlighted.push(file);
    } else {
      rest.push(file);
    }
  }

  const extraHighlighted: CanvasAttachment[] = [];
  const extraRest: CanvasAttachment[] = [];
  for (const file of extraModuleFiles) {
    if (HIGHLIGHT_PATTERN.test(file.display_name)) {
      extraHighlighted.push(file);
    } else {
      extraRest.push(file);
    }
  }

  const byFolder = new Map<string, CanvasAttachment[]>();
  for (const file of rest) {
    const folderName = (file.folder_id != null ? folderNameById.get(file.folder_id) : undefined) ?? "Geral";
    const bucket = byFolder.get(folderName) ?? [];
    bucket.push(file);
    byFolder.set(folderName, bucket);
  }

  const groups: CourseFileGroup[] = [...byFolder.entries()]
    .map(([folderName, groupFiles]) => ({ folderName, files: groupFiles }))
    .sort((a, b) => {
      if (a.folderName === "Geral") return -1;
      if (b.folderName === "Geral") return 1;
      return a.folderName.localeCompare(b.folderName, "pt-BR");
    });

  if (extraRest.length > 0) {
    groups.push({
      folderName: MODULES_GROUP_NAME,
      files: extraRest.sort((a, b) => a.display_name.localeCompare(b.display_name, "pt-BR")),
    });
  }

  return { highlighted: [...highlighted, ...extraHighlighted], groups };
}
