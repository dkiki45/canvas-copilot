import "server-only";
import { canvasPaginated, type CanvasCredentials } from "./client";
import type { Course } from "./types";

/** Lista os cursos ativos do semestre atual do aluno. */
export async function listCourses(creds: CanvasCredentials): Promise<Course[]> {
  return canvasPaginated<Course>(creds, "/courses", {
    query: { enrollment_state: "active", include: ["total_scores"] },
  });
}
