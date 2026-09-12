import "server-only";
import { canvasPaginated, type CanvasCredentials } from "./client";
import type { Enrollment } from "./types";

/** Retorna as notas do aluno num curso específico. */
export async function getGradesForCourse(creds: CanvasCredentials, courseId: number): Promise<Enrollment[]> {
  return canvasPaginated<Enrollment>(creds, `/courses/${courseId}/enrollments`, {
    query: { user_id: "self" },
  });
}
