import "server-only";
import type { CanvasCredentials } from "./client";
import { listAssignmentsForCourse } from "./assignments";
import { getSubmissionSelf } from "./submissions";
import type { Course, DeadlineItem } from "./types";

export interface DeadlineWindow {
  /** null = sem limite inferior (inclui atividades atrasadas de qualquer data). */
  start: Date | null;
  end: Date;
}

/**
 * Cruza assignments de todos os cursos (visíveis) com o status de entrega, numa
 * janela de datas configurável. Só busca status de submissão para atividades
 * com prazo definido dentro da janela, pra não disparar uma chamada por
 * atividade já concluída há anos.
 */
export async function getDeadlinesInRange(
  creds: CanvasCredentials,
  courses: Course[],
  window: DeadlineWindow,
): Promise<DeadlineItem[]> {
  const windowStart = window.start?.getTime() ?? -Infinity;
  const windowEnd = window.end.getTime();

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

/** Considera "entregue" qualquer submissão já enviada, mesmo que ainda não corrigida. */
export function isSubmitted(item: DeadlineItem): boolean {
  const state = item.submission?.workflow_state;
  return state === "submitted" || state === "graded" || state === "pending_review";
}

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
