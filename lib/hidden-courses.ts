import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { hiddenCourses } from "@/db/schema";

export async function getHiddenCourseIds(userId: string): Promise<Set<string>> {
  const rows = await db
    .select({ canvasCourseId: hiddenCourses.canvasCourseId })
    .from(hiddenCourses)
    .where(eq(hiddenCourses.userId, userId));

  return new Set(rows.map((row) => row.canvasCourseId));
}

export async function hideCourse(userId: string, canvasCourseId: string): Promise<void> {
  await db.insert(hiddenCourses).values({ userId, canvasCourseId }).onConflictDoNothing();
}

export async function unhideCourse(userId: string, canvasCourseId: string): Promise<void> {
  await db
    .delete(hiddenCourses)
    .where(and(eq(hiddenCourses.userId, userId), eq(hiddenCourses.canvasCourseId, canvasCourseId)));
}
