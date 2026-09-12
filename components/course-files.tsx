import { FileText } from "lucide-react";
import type { CanvasAttachment, GroupedCourseFiles } from "@/lib/canvas/types";

function FileLink({ file, emphasize = false }: { file: CanvasAttachment; emphasize?: boolean }) {
  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className={
        emphasize
          ? "flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
          : "text-sm text-primary hover:underline"
      }
    >
      {emphasize && <FileText className="size-4 shrink-0" />}
      {file.display_name}
    </a>
  );
}

export function CourseFiles({ grouped }: { grouped: GroupedCourseFiles }) {
  const isEmpty = grouped.highlighted.length === 0 && grouped.groups.length === 0;

  if (isEmpty) {
    return <p className="text-sm text-muted-foreground">Nenhum arquivo disponível.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {grouped.highlighted.length > 0 && (
        <div className="flex flex-col gap-2">
          {grouped.highlighted.map((file) => (
            <FileLink key={file.id} file={file} emphasize />
          ))}
        </div>
      )}

      {grouped.groups.map((group) => (
        <div key={group.folderName} className="flex flex-col gap-1.5">
          <h3 className="text-sm font-medium text-muted-foreground">{group.folderName}</h3>
          <ul className="flex flex-col gap-1 pl-1">
            {group.files.map((file) => (
              <li key={file.id}>
                <FileLink file={file} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
