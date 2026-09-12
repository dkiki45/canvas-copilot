"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { canvasCredentials } from "@/db/schema";
import { encryptToken } from "@/lib/crypto";
import { createUserSession, getSessionUserId } from "@/lib/session";
import { canvasRequest, CanvasAuthError } from "@/lib/canvas/client";
import type { CanvasUser } from "@/lib/canvas/types";

const onboardingSchema = z.object({
  baseUrl: z
    .string()
    .trim()
    .min(1, "Informe a URL da instituição")
    .transform((value) => value.replace(/^https?:\/\//, "").replace(/\/$/, ""))
    .refine((value) => /^[a-z0-9.-]+\.instructure\.com$/i.test(value), {
      message: "URL inválida. Exemplo: pucpr.instructure.com",
    }),
  token: z.string().trim().min(1, "Informe o token de acesso"),
});

export interface OnboardingState {
  error?: string;
}

export async function connectCanvas(_prevState: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const parsed = onboardingSchema.safeParse({
    baseUrl: formData.get("baseUrl"),
    token: formData.get("token"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const baseUrl = `https://${parsed.data.baseUrl}`;
  const token = parsed.data.token;

  let canvasUser: CanvasUser;
  try {
    const { data } = await canvasRequest<CanvasUser>({ baseUrl, token }, "/users/self");
    canvasUser = data;
  } catch (err) {
    if (err instanceof CanvasAuthError) {
      return { error: "Token inválido ou sem permissão. Confira o token gerado no Canvas." };
    }
    return { error: "Não foi possível conectar ao Canvas. Confira a URL da instituição." };
  }

  const { encryptedToken, iv } = encryptToken(token);

  const existingUserId = await getSessionUserId();
  const userId = existingUserId ?? (await createUserSession());

  await db
    .insert(canvasCredentials)
    .values({
      userId,
      baseUrl,
      encryptedToken,
      iv,
      canvasUserId: String(canvasUser.id),
      isValid: true,
    })
    .onConflictDoUpdate({
      target: canvasCredentials.userId,
      set: { baseUrl, encryptedToken, iv, canvasUserId: String(canvasUser.id), isValid: true, updatedAt: new Date() },
    });

  redirect("/courses");
}
