"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { setCourseHidden } from "@/app/(dashboard)/courses/actions";
import type { Course } from "@/lib/canvas/types";

export function CourseCard({ course }: { course: Course }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleHide() {
    startTransition(async () => {
      await setCourseHidden(course.id, true);
      router.refresh();
    });
  }

  return (
    <Card className="transition-colors hover:bg-muted/50">
      <Link href={`/courses/${course.id}`} className="block">
        <CardHeader>
          <CardTitle>{course.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{course.course_code}</p>
        </CardContent>
      </Link>
      <CardFooter className="justify-end border-t-0 bg-transparent p-0 px-(--card-spacing) pb-(--card-spacing)">
        <Button variant="ghost" size="sm" onClick={handleHide} disabled={isPending} className="text-muted-foreground">
          <EyeOff className="size-3.5" />
          Ocultar
        </Button>
      </CardFooter>
    </Card>
  );
}
