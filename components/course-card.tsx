"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setCourseHidden } from "@/app/(dashboard)/courses/actions";
import type { Course } from "@/lib/canvas/types";

export function CourseCard({ course }: { course: Course }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleHide(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    startTransition(async () => {
      await setCourseHidden(course.id, true);
      router.refresh();
    });
  }

  return (
    <Card className="group relative transition-colors hover:bg-muted/50">
      <button
        type="button"
        onClick={handleHide}
        disabled={isPending}
        title="Ocultar curso"
        className="absolute top-2 right-2 z-10 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
      >
        <EyeOff className="size-4" />
      </button>
      <Link href={`/courses/${course.id}`} className="block">
        <CardHeader>
          <CardTitle className="pr-6">{course.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{course.course_code}</p>
        </CardContent>
      </Link>
    </Card>
  );
}
