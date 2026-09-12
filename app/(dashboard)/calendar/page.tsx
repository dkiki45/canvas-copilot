import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getDecryptedCredentialsForUser } from "@/lib/credentials";
import { listCourses } from "@/lib/canvas/courses";
import { listCalendarEvents } from "@/lib/canvas/calendar";
import { CalendarView } from "@/components/calendar-view";

export default async function CalendarPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/onboarding");

  const credentials = await getDecryptedCredentialsForUser(userId);
  if (!credentials) redirect("/onboarding");

  const courses = await listCourses(credentials);
  const events = await listCalendarEvents(credentials, courses);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Calendário</h1>
      <CalendarView events={events} />
    </div>
  );
}
