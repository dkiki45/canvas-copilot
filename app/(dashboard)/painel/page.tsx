import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getDecryptedCredentialsForUser } from "@/lib/credentials";
import { getHiddenCourseIds } from "@/lib/hidden-courses";
import { getRecentCourseIds } from "@/lib/course-visits";
import { listCourses } from "@/lib/canvas/courses";
import { getDeadlinesInRange, isSubmitted, daysFromNow } from "@/lib/canvas/deadlines";
import { RecentCourseCard } from "@/components/recent-course-card";
import { DeadlineItem } from "@/components/deadline-item";

const PENDING_WINDOW_DAYS = 30;

export default async function PainelPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/onboarding");

  const credentials = await getDecryptedCredentialsForUser(userId);
  if (!credentials) redirect("/onboarding");

  const [courses, hiddenIds, recentIds] = await Promise.all([
    listCourses(credentials),
    getHiddenCourseIds(userId),
    getRecentCourseIds(userId, 3),
  ]);

  const visibleCourses = courses.filter((course) => !hiddenIds.has(String(course.id)));
  const recentCourses = recentIds
    .map((id) => visibleCourses.find((course) => String(course.id) === id))
    .filter((course) => course != null);

  const deadlines = await getDeadlinesInRange(credentials, visibleCourses, {
    start: null,
    end: daysFromNow(PENDING_WINDOW_DAYS),
  });
  const pending = deadlines.filter((item) => !isSubmitted(item));

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Painel</h1>

      {recentCourses.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Cursos recentes</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {recentCourses.map((course) => (
              <RecentCourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Pendências</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma pendência. 🎉</p>
        ) : (
          <div className="flex flex-col gap-2">
            {pending.map((item) => (
              <DeadlineItem key={`${item.courseId}-${item.assignment.id}`} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
