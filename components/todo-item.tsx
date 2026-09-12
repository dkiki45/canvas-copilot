import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { TodoItem as TodoItemType } from "@/lib/canvas/types";

export function TodoItem({ item }: { item: TodoItemType }) {
  const assignment = item.assignment;

  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="font-medium">{assignment?.name ?? "Item pendente"}</p>
          {assignment?.due_at && (
            <p className="text-sm text-muted-foreground">
              Prazo: {new Date(assignment.due_at).toLocaleString("pt-BR")}
            </p>
          )}
        </div>
        {assignment && (
          <Link
            href={`/courses/${item.course_id}/assignments/${assignment.id}`}
            className="text-sm text-primary hover:underline"
          >
            Ver atividade
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
