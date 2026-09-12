import "server-only";
import { getGradesForCourse } from "./enrollments";
import type { CanvasCredentials } from "./client";
import type { Course } from "./types";

export interface CourseGradeSummary {
  courseId: number;
  courseName: string;
  currentScore: number | null;
  finalScore: number | null;
  currentGrade: string | null;
  finalGrade: string | null;
}

/** Cruza as notas de todos os cursos (visíveis) numa lista única, pra ver o semestre inteiro de uma vez. */
export async function getConsolidatedGrades(
  creds: CanvasCredentials,
  courses: Course[],
): Promise<CourseGradeSummary[]> {
  return Promise.all(
    courses.map(async (course): Promise<CourseGradeSummary> => {
      try {
        const [enrollment] = await getGradesForCourse(creds, course.id);
        return {
          courseId: course.id,
          courseName: course.name,
          currentScore: enrollment?.grades?.current_score ?? null,
          finalScore: enrollment?.grades?.final_score ?? null,
          currentGrade: enrollment?.grades?.current_grade ?? null,
          finalGrade: enrollment?.grades?.final_grade ?? null,
        };
      } catch {
        return {
          courseId: course.id,
          courseName: course.name,
          currentScore: null,
          finalScore: null,
          currentGrade: null,
          finalGrade: null,
        };
      }
    }),
  );
}

/** Média simples das notas atuais disponíveis (ignora cursos sem nota lançada ainda). */
export function computeAverageCurrentScore(summaries: CourseGradeSummary[]): number | null {
  const scores = summaries.map((s) => s.currentScore).filter((score) => score != null);
  if (scores.length === 0) return null;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}
