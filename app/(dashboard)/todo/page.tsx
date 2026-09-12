import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getDecryptedCredentialsForUser } from "@/lib/credentials";
import { getHiddenCourseIds } from "@/lib/hidden-courses";
import { listCourses } from "@/lib/canvas/courses";
import { getDeadlinesInRange, isSubmitted, daysFromNow } from "@/lib/canvas/deadlines";
import { DeadlineItem } from "@/components/deadline-item";

const FUTURE_WINDOW_DAYS = 180;

export default async function TodoPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/onboarding");

  const credentials = await getDecryptedCredentialsForUser(userId);
  if (!credentials) redirect("/onboarding");

  const [courses, hiddenIds] = await Promise.all([listCourses(credentials), getHiddenCourseIds(userId)]);
  const visibleCourses = courses.filter((course) => !hiddenIds.has(String(course.id)));

  const deadlines = await getDeadlinesInRange(credentials, visibleCourses, {
    start: null,
    end: daysFromNow(FUTURE_WINDOW_DAYS),
  });
  const pending = deadlines.filter((item) => !isSubmitted(item));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Tarefas</h1>
        <p className="text-sm text-muted-foreground">
          Tudo que ainda não foi entregue em nenhum curso, incluindo atrasadas — sem limite de data.
        </p>
      </div>
      {pending.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma tarefa pendente. 🎉</p>
      ) : (
        <div className="flex flex-col gap-2">
          {pending.map((item) => (
            <DeadlineItem key={`${item.courseId}-${item.assignment.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
