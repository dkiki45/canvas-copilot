import "server-only";
import { canvasRequest, canvasPaginated, type CanvasCredentials } from "./client";
import type { Assignment, AssignmentDetail } from "./types";

/** Lista as atividades de um curso. */
export async function listAssignmentsForCourse(creds: CanvasCredentials, courseId: number): Promise<Assignment[]> {
  return canvasPaginated<Assignment>(creds, `/courses/${courseId}/assignments`);
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
