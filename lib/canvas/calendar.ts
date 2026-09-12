import "server-only";
import { canvasPaginated, type CanvasCredentials } from "./client";
import type { CalendarEvent, Course } from "./types";

const DEFAULT_RANGE_DAYS_BEFORE = 14;
const DEFAULT_RANGE_DAYS_AFTER = 120;

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Lista eventos de calendário/prazos. Depende dos cursos do aluno para montar
 * os `context_codes[]=course_123` exigidos pelo endpoint — sem isso o Canvas
 * não retorna nada útil. Sem `start_date`/`end_date` explícitos, a API do
 * Canvas usa a data de hoje como padrão para os dois — por isso é preciso
 * sempre passar um intervalo, ou só o evento de hoje volta.
 */
export async function listCalendarEvents(
  creds: CanvasCredentials,
  courses: Pick<Course, "id">[],
  range?: { startDate?: string; endDate?: string },
): Promise<CalendarEvent[]> {
  if (courses.length === 0) return [];

  const contextCodes = courses.map((c) => `course_${c.id}`);
  const today = new Date();
  const startDate =
    range?.startDate ?? isoDate(new Date(today.getTime() - DEFAULT_RANGE_DAYS_BEFORE * 24 * 60 * 60 * 1000));
  const endDate =
    range?.endDate ?? isoDate(new Date(today.getTime() + DEFAULT_RANGE_DAYS_AFTER * 24 * 60 * 60 * 1000));

  return canvasPaginated<CalendarEvent>(creds, "/calendar_events", {
    query: {
      context_codes: contextCodes,
      type: "event",
      start_date: startDate,
      end_date: endDate,
      per_page: 50,
    },
  });
}
