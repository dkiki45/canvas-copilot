"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setCourseHidden } from "@/app/(dashboard)/courses/actions";
import type { Course } from "@/lib/canvas/types";

export function HiddenCourseRow({ course }: { course: Course }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleShow() {
    startTransition(async () => {
      await setCourseHidden(course.id, false);
      router.refresh();
    });
  }

  return (
    <li className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm text-muted-foreground">{course.name}</span>
      <Button variant="outline" size="sm" onClick={handleShow} disabled={isPending}>
        Mostrar
      </Button>
    </li>
  );
}
