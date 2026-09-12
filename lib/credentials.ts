import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { canvasCredentials } from "@/db/schema";
import { decryptToken } from "@/lib/crypto";
import type { CanvasCredentials } from "@/lib/canvas/client";

/**
 * Carrega e descriptografa a credencial do Canvas do usuário, só em memória,
 * para uso imediato numa chamada à API. Nunca retornar isso ao cliente.
 */
export async function getDecryptedCredentialsForUser(userId: string): Promise<CanvasCredentials | null> {
  const [row] = await db
    .select()
    .from(canvasCredentials)
    .where(eq(canvasCredentials.userId, userId))
    .limit(1);

  if (!row || !row.isValid) return null;

  return {
    baseUrl: row.baseUrl,
    token: decryptToken(row.encryptedToken, row.iv),
  };
}

export async function markCredentialsInvalid(userId: string): Promise<void> {
  await db.update(canvasCredentials).set({ isValid: false }).where(eq(canvasCredentials.userId, userId));
}
