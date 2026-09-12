import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { courseVisits } from "@/db/schema";

export async function recordCourseVisit(userId: string, canvasCourseId: string): Promise<void> {
  await db
    .insert(courseVisits)
    .values({ userId, canvasCourseId })
    .onConflictDoUpdate({
      target: [courseVisits.userId, courseVisits.canvasCourseId],
      set: { visitedAt: new Date() },
    });
}

export async function getRecentCourseIds(userId: string, limit = 3): Promise<string[]> {
  const rows = await db
    .select({ canvasCourseId: courseVisits.canvasCourseId })
    .from(courseVisits)
    .where(eq(courseVisits.userId, userId))
    .orderBy(desc(courseVisits.visitedAt))
    .limit(limit);

  return rows.map((row) => row.canvasCourseId);
}
