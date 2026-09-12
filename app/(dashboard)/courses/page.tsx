import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getDecryptedCredentialsForUser } from "@/lib/credentials";
import { getHiddenCourseIds } from "@/lib/hidden-courses";
import { listCourses } from "@/lib/canvas/courses";
import { CourseCard } from "@/components/course-card";
import { HiddenCourseRow } from "@/components/hidden-course-row";

export default async function CoursesPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/onboarding");

  const credentials = await getDecryptedCredentialsForUser(userId);
  if (!credentials) redirect("/onboarding");

  const [courses, hiddenIds] = await Promise.all([listCourses(credentials), getHiddenCourseIds(userId)]);

  const visibleCourses = courses.filter((course) => !hiddenIds.has(String(course.id)));
  const hiddenCourses = courses.filter((course) => hiddenIds.has(String(course.id)));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Meus cursos</h1>
      {visibleCourses.length === 0 ? (
        <p className="text-muted-foreground">Nenhum curso ativo encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {hiddenCourses.length > 0 && (
        <details className="rounded-md border p-3">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            Cursos ocultos ({hiddenCourses.length})
          </summary>
          <ul className="mt-2 divide-y">
            {hiddenCourses.map((course) => (
              <HiddenCourseRow key={course.id} course={course} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
