import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Course } from "@/lib/canvas/types";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle>{course.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{course.course_code}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
