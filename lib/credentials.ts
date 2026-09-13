import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { canvasCredentials } from "@/db/schema";
import { decryptToken } from "@/lib/crypto";
import { CanvasAuthError, type CanvasCredentials } from "@/lib/canvas/client";

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

/**
 * Roda as chamadas à API do Canvas de uma página, e se o token tiver expirado ou
 * for revogado (o Canvas da PUCPR limita tokens pessoais a 90 dias), marca a
 * credencial como inválida e redireciona pro onboarding com uma mensagem clara,
 * em vez de deixar o erro estourar como uma tela genérica quebrada.
 */
export async function withAuthGuard<T>(userId: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof CanvasAuthError) {
      await markCredentialsInvalid(userId);
      redirect("/onboarding?expired=1");
    }
    throw err;
  }
}
