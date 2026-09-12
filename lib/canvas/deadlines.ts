import "server-only";
import type { CanvasCredentials } from "./client";
import { listAssignmentsForCourse } from "./assignments";
import { getSubmissionSelf } from "./submissions";
import type { Course, DeadlineItem } from "./types";

const PAST_WINDOW_DAYS = 14;
const FUTURE_WINDOW_DAYS = 30;

/**
 * Cruza assignments de todos os cursos (visíveis) num painel único, com status
 * de entrega, para dar uma visão real de "o que falta fazer" sem precisar
 * entrar curso por curso. Escopo limitado a uma janela de datas para não
 * disparar uma chamada de submissão por atividade já concluída há meses.
 */
export async function getUpcomingDeadlines(creds: CanvasCredentials, courses: Course[]): Promise<DeadlineItem[]> {
  const now = Date.now();
  const windowStart = now - PAST_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const windowEnd = now + FUTURE_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  const perCourseAssignments = await Promise.all(
    courses.map(async (course) => {
      try {
        const assignments = await listAssignmentsForCourse(creds, course.id);
        return assignments
          .filter((assignment) => assignment.due_at != null)
          .filter((assignment) => {
            const dueTime = new Date(assignment.due_at as string).getTime();
            return dueTime >= windowStart && dueTime <= windowEnd;
          })
          .map((assignment) => ({ assignment, courseId: course.id, courseName: course.name }));
      } catch {
        return [];
      }
    }),
  );

  const flattened = perCourseAssignments.flat();

  const withSubmissions = await Promise.all(
    flattened.map(async (item): Promise<DeadlineItem> => {
      try {
        const submission = await getSubmissionSelf(creds, item.courseId, item.assignment.id);
        return { ...item, submission };
      } catch {
        return { ...item, submission: null };
      }
    }),
  );

  return withSubmissions.sort(
    (a, b) => new Date(a.assignment.due_at as string).getTime() - new Date(b.assignment.due_at as string).getTime(),
  );
}

/** Separa prazos em atrasados (não entregues) e próximos. */
export function splitDeadlines(items: DeadlineItem[]): { overdue: DeadlineItem[]; upcoming: DeadlineItem[] } {
  const now = Date.now();
  const overdue = items.filter(
    (item) =>
      new Date(item.assignment.due_at as string).getTime() < now &&
      item.submission?.workflow_state !== "submitted" &&
      item.submission?.workflow_state !== "graded",
  );
  const overdueIds = new Set(overdue.map((item) => item.assignment.id));
  const upcoming = items.filter((item) => !overdueIds.has(item.assignment.id));

  return { overdue, upcoming };
}
