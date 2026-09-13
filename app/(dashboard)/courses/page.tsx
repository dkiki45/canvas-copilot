import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getDecryptedCredentialsForUser, withAuthGuard } from "@/lib/credentials";
import { getHiddenCourseIds } from "@/lib/hidden-courses";
import { listCourses } from "@/lib/canvas/courses";
import { CourseCard } from "@/components/course-card";
import { HiddenCourseRow } from "@/components/hidden-course-row";

export default async function CoursesPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/onboarding");

  const credentials = await getDecryptedCredentialsForUser(userId);
  if (!credentials) redirect("/onboarding");

  const [courses, hiddenIds] = await withAuthGuard(userId, () =>
    Promise.all([listCourses(credentials), getHiddenCourseIds(userId)]),
  );

  const visibleCourses = courses.filter((course) => !hiddenIds.has(String(course.id)));
  const hiddenCourses = courses.filter((course) => hiddenIds.has(String(course.id)));

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <div className="flex flex-1 flex-col gap-6">
        <h1 className="text-2xl font-semibold">Meus cursos</h1>
        {visibleCourses.length === 0 ? (
          <p className="text-muted-foreground">Nenhum curso ativo encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visibleCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>

      <aside className="w-full shrink-0 lg:w-64">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Cursos ocultos ({hiddenCourses.length})</h2>
        {hiddenCourses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum curso oculto.</p>
        ) : (
          <ul className="flex flex-col divide-y rounded-md border">
            {hiddenCourses.map((course) => (
              <HiddenCourseRow key={course.id} course={course} />
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
