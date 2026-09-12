import "server-only";
import { canvasPaginated, type CanvasCredentials } from "./client";
import type { CalendarEvent, Course } from "./types";

/**
 * Lista eventos de calendário/prazos. Depende dos cursos do aluno para montar
 * os `context_codes[]=course_123` exigidos pelo endpoint — sem isso o Canvas
 * não retorna nada útil.
 */
export async function listCalendarEvents(
  creds: CanvasCredentials,
  courses: Pick<Course, "id">[],
  range?: { startDate?: string; endDate?: string },
): Promise<CalendarEvent[]> {
  if (courses.length === 0) return [];

  const contextCodes = courses.map((c) => `course_${c.id}`);

  return canvasPaginated<CalendarEvent>(creds, "/calendar_events", {
    query: {
      context_codes: contextCodes,
      type: "event",
      start_date: range?.startDate,
      end_date: range?.endDate,
      per_page: 50,
    },
  });
}
