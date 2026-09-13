"use server";

import { revalidatePath } from "next/cache";
import { getSessionUserId } from "@/lib/session";
import { markAssignmentHandled, unmarkAssignmentHandled } from "@/lib/assignment-overrides";

export async function setAssignmentOverride(courseId: number, assignmentId: number, marked: boolean): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) return;

  if (marked) {
    await markAssignmentHandled(userId, String(courseId), String(assignmentId));
  } else {
    await unmarkAssignmentHandled(userId, String(assignmentId));
  }

  revalidatePath(`/courses/${courseId}/assignments/${assignmentId}`);
  revalidatePath("/painel");
}
