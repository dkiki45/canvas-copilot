import "server-only";
import { canvasRequest, canvasPaginated, type CanvasCredentials } from "./client";
import type { Assignment, AssignmentDetail, Course } from "./types";

/** Lista as atividades de um curso. */
export async function listAssignmentsForCourse(creds: CanvasCredentials, courseId: number): Promise<Assignment[]> {
  return canvasPaginated<Assignment>(creds, `/courses/${courseId}/assignments`);
}

export interface AssignmentInCourse {
  assignment: Assignment;
  courseId: number;
}

/**
 * Assignments com `due_at` dentro da janela, de vários cursos — sem buscar status de submissão
 * (diferente de `getDeadlinesInRange`), pra ser barato o suficiente pra desenhar um calendário.
 */
export async function listAssignmentsInRange(
  creds: CanvasCredentials,
  courses: Pick<Course, "id">[],
  range: { start: Date; end: Date },
): Promise<AssignmentInCourse[]> {
  const startTime = range.start.getTime();
  const endTime = range.end.getTime();

  const perCourse = await Promise.all(
    courses.map(async (course) => {
      try {
        const assignments = await listAssignmentsForCourse(creds, course.id);
        return assignments
          .filter((assignment) => assignment.due_at != null)
          .filter((assignment) => {
            const dueTime = new Date(assignment.due_at as string).getTime();
            return dueTime >= startTime && dueTime <= endTime;
          })
          .map((assignment) => ({ assignment, courseId: course.id }));
      } catch {
        return [];
      }
    }),
  );

  return perCourse.flat();
}

/** Detalhe de uma atividade: descrição, prazo, pontos, anexos. */
export async function getAssignment(
  creds: CanvasCredentials,
  courseId: number,
  assignmentId: number,
): Promise<AssignmentDetail> {
  const { data } = await canvasRequest<AssignmentDetail>(creds, `/courses/${courseId}/assignments/${assignmentId}`);
  return data;
}
