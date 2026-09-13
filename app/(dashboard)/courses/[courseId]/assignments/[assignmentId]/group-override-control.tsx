"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setAssignmentOverride } from "./actions";

export function GroupOverrideControl({
  courseId,
  assignmentId,
  isOverridden,
}: {
  courseId: number;
  assignmentId: number;
  isOverridden: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await setAssignmentOverride(courseId, assignmentId, !isOverridden);
      router.refresh();
    });
  }

  if (isOverridden) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
        <Users className="size-4 shrink-0" />
        <span className="flex-1">Marcado como entregue por outro membro do grupo</span>
        <Button variant="ghost" size="sm" onClick={toggle} disabled={isPending}>
          Desfazer
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle} disabled={isPending}>
      <Users className="size-4" />
      Marcar como entregue pelo grupo
    </Button>
  );
}
