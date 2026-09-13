import { redirect } from "next/navigation";
import { BookOpen, GraduationCap, ListTodo } from "lucide-react";
import { getSessionUserId } from "@/lib/session";
import { getDecryptedCredentialsForUser, withAuthGuard } from "@/lib/credentials";
import { getHiddenCourseIds } from "@/lib/hidden-courses";
import { getRecentCourseIds } from "@/lib/course-visits";
import { getOverriddenAssignmentIds } from "@/lib/assignment-overrides";
import { listCourses } from "@/lib/canvas/courses";
import { getDeadlinesInRange, isSubmitted, daysFromNow, countUrgentDeadlines } from "@/lib/canvas/deadlines";
import { getConsolidatedGrades, computeAverageCurrentScore } from "@/lib/canvas/grades";
import { RecentCourseCard } from "@/components/recent-course-card";
import { DeadlineItem } from "@/components/deadline-item";
import { GradesSummaryTable } from "@/components/grades-summary-table";
import { UrgentBanner } from "@/components/urgent-banner";
import { StatTile } from "@/components/stat-tile";

const PENDING_WINDOW_DAYS = 30;

export default async function PainelPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/onboarding");

  const credentials = await getDecryptedCredentialsForUser(userId);
  if (!credentials) redirect("/onboarding");

  const [courses, hiddenIds, recentIds, overriddenIds] = await Promise.all([
    withAuthGuard(userId, () => listCourses(credentials)),
    getHiddenCourseIds(userId),
    getRecentCourseIds(userId, 3),
    getOverriddenAssignmentIds(userId),
  ]);

  const visibleCourses = courses.filter((course) => !hiddenIds.has(String(course.id)));
  const recentCourses = recentIds
    .map((id) => visibleCourses.find((course) => String(course.id) === id))
    .filter((course) => course != null);

  const [deadlines, gradeSummaries] = await withAuthGuard(userId, () =>
    Promise.all([
      getDeadlinesInRange(credentials, visibleCourses, { start: null, end: daysFromNow(PENDING_WINDOW_DAYS) }),
      getConsolidatedGrades(credentials, visibleCourses),
    ]),
  );
  const futureTasks = deadlines.filter(
    (item) => !isSubmitted(item) && !overriddenIds.has(String(item.assignment.id)),
  );
  const averageScore = computeAverageCurrentScore(gradeSummaries);
  const { overdueCount, dueSoonCount } = countUrgentDeadlines(futureTasks);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold">Painel</h1>

      <UrgentBanner overdueCount={overdueCount} dueSoonCount={dueSoonCount} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Cursos ativos" value={String(visibleCourses.length)} icon={BookOpen} />
        <StatTile
          label="Tarefas futuras (30 dias)"
          value={String(futureTasks.length)}
          icon={ListTodo}
          tone={overdueCount > 0 ? "critical" : futureTasks.length > 0 ? "warning" : "good"}
        />
        <StatTile
          label="Média geral"
          value={averageScore != null ? averageScore.toFixed(1) : "—"}
          icon={GraduationCap}
        />
      </div>

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
        <h2 className="text-lg font-medium">Tarefas futuras</h2>
        {futureTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma tarefa futura. 🎉</p>
        ) : (
          <div className="flex flex-col gap-2">
            {futureTasks.map((item) => (
              <DeadlineItem key={`${item.courseId}-${item.assignment.id}`} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-medium">Notas</h2>
          {averageScore != null && (
            <p className="text-sm text-muted-foreground">Média geral: {averageScore.toFixed(1)}</p>
          )}
        </div>
        <GradesSummaryTable summaries={gradeSummaries} />
      </section>
    </div>
  );
}
