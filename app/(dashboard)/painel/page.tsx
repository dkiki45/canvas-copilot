import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getDecryptedCredentialsForUser } from "@/lib/credentials";
import { getHiddenCourseIds } from "@/lib/hidden-courses";
import { listCourses } from "@/lib/canvas/courses";
import { getUpcomingDeadlines, splitDeadlines } from "@/lib/canvas/deadlines";
import { DeadlineItem } from "@/components/deadline-item";

export default async function PainelPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/onboarding");

  const credentials = await getDecryptedCredentialsForUser(userId);
  if (!credentials) redirect("/onboarding");

  const [courses, hiddenIds] = await Promise.all([listCourses(credentials), getHiddenCourseIds(userId)]);
  const visibleCourses = courses.filter((course) => !hiddenIds.has(String(course.id)));

  const deadlines = await getUpcomingDeadlines(credentials, visibleCourses);
  const { overdue, upcoming } = splitDeadlines(deadlines);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Painel</h1>

      {overdue.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium text-destructive">Atrasadas</h2>
          <div className="flex flex-col gap-2">
            {overdue.map((item) => (
              <DeadlineItem key={`${item.courseId}-${item.assignment.id}`} item={item} />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Próximos prazos</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum prazo nos próximos 30 dias.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map((item) => (
              <DeadlineItem key={`${item.courseId}-${item.assignment.id}`} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
