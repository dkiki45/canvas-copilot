import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SubmissionStatusBadge } from "@/components/submission-status-badge";
import type { DeadlineItem as DeadlineItemType } from "@/lib/canvas/types";

export function DeadlineItem({ item }: { item: DeadlineItemType }) {
  const dueDate = item.assignment.due_at ? new Date(item.assignment.due_at) : null;

  return (
    <Link href={`/courses/${item.courseId}/assignments/${item.assignment.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">{item.assignment.name}</p>
            <p className="text-sm text-muted-foreground">{item.courseName}</p>
            {dueDate && <p className="text-sm text-muted-foreground">Prazo: {dueDate.toLocaleString("pt-BR")}</p>}
          </div>
          {item.submission && <SubmissionStatusBadge workflowState={item.submission.workflow_state} />}
        </CardContent>
      </Card>
    </Link>
  );
}
