import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { assignmentOverrides } from "@/db/schema";

export async function getOverriddenAssignmentIds(userId: string): Promise<Set<string>> {
  const rows = await db
    .select({ canvasAssignmentId: assignmentOverrides.canvasAssignmentId })
    .from(assignmentOverrides)
    .where(eq(assignmentOverrides.userId, userId));

  return new Set(rows.map((row) => row.canvasAssignmentId));
}

export async function isAssignmentOverridden(userId: string, assignmentId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: assignmentOverrides.id })
    .from(assignmentOverrides)
    .where(and(eq(assignmentOverrides.userId, userId), eq(assignmentOverrides.canvasAssignmentId, assignmentId)))
    .limit(1);

  return row != null;
}

export async function markAssignmentHandled(userId: string, courseId: string, assignmentId: string): Promise<void> {
  await db
    .insert(assignmentOverrides)
    .values({ userId, canvasCourseId: courseId, canvasAssignmentId: assignmentId })
    .onConflictDoNothing();
}

export async function unmarkAssignmentHandled(userId: string, assignmentId: string): Promise<void> {
  await db
    .delete(assignmentOverrides)
    .where(and(eq(assignmentOverrides.userId, userId), eq(assignmentOverrides.canvasAssignmentId, assignmentId)));
}
