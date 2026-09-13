import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getDecryptedCredentialsForUser, withAuthGuard } from "@/lib/credentials";
import { getHiddenCourseIds } from "@/lib/hidden-courses";
import { listCourses } from "@/lib/canvas/courses";
import { listCalendarEvents, isoDate, eventToCalendarItem, assignmentToCalendarItem } from "@/lib/canvas/calendar";
import { listAssignmentsInRange } from "@/lib/canvas/assignments";
import type { CalendarItem } from "@/lib/canvas/types";
import { MonthCalendar } from "@/components/month-calendar";
import { Button } from "@/components/ui/button";

const MONTH_NAMES_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function monthHref(year: number, month: number): string {
  return `/calendar?month=${year}-${String(month).padStart(2, "0")}`;
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month: monthParam } = await searchParams;

  const userId = await getSessionUserId();
  if (!userId) redirect("/onboarding");

  const credentials = await getDecryptedCredentialsForUser(userId);
  if (!credentials) redirect("/onboarding");

  const today = new Date();
  const [year, month] = monthParam
    ? monthParam.split("-").map(Number)
    : [today.getFullYear(), today.getMonth() + 1];

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  const [courses, hiddenIds] = await withAuthGuard(userId, () =>
    Promise.all([listCourses(credentials), getHiddenCourseIds(userId)]),
  );
  const visibleCourses = courses.filter((course) => !hiddenIds.has(String(course.id)));

  const [events, assignmentsInRange] = await withAuthGuard(userId, () =>
    Promise.all([
      listCalendarEvents(credentials, visibleCourses, { startDate: isoDate(monthStart), endDate: isoDate(monthEnd) }),
      listAssignmentsInRange(credentials, visibleCourses, { start: monthStart, end: monthEnd }),
    ]),
  );

  const items: CalendarItem[] = [
    ...events.filter((event) => event.start_at != null).map(eventToCalendarItem),
    ...assignmentsInRange.map(({ assignment, courseId }) => assignmentToCalendarItem(assignment, courseId)),
  ];

  const prevDate = new Date(year, month - 2, 1);
  const nextDate = new Date(year, month, 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {MONTH_NAMES_PT[month - 1]} {year}
        </h1>
        <div className="flex gap-2">
          <Link href={monthHref(prevDate.getFullYear(), prevDate.getMonth() + 1)}>
            <Button variant="outline" size="sm">
              Anterior
            </Button>
          </Link>
          <Link href={monthHref(today.getFullYear(), today.getMonth() + 1)}>
            <Button variant="outline" size="sm">
              Hoje
            </Button>
          </Link>
          <Link href={monthHref(nextDate.getFullYear(), nextDate.getMonth() + 1)}>
            <Button variant="outline" size="sm">
              Próximo
            </Button>
          </Link>
        </div>
      </div>
      <MonthCalendar year={year} month={month} items={items} />
    </div>
  );
}
