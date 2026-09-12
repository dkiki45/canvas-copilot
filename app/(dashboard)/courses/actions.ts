"use server";

import { revalidatePath } from "next/cache";
import { getSessionUserId } from "@/lib/session";
import { hideCourse, unhideCourse } from "@/lib/hidden-courses";

export async function setCourseHidden(courseId: number, hidden: boolean): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) return;

  if (hidden) {
    await hideCourse(userId, String(courseId));
  } else {
    await unhideCourse(userId, String(courseId));
  }

  revalidatePath("/courses");
  revalidatePath("/painel");
}
