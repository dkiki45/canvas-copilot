import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";

const SESSION_COOKIE = "session_token";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Cria um novo usuário + sessão, e seta o cookie httpOnly. Retorna o userId criado. */
export async function createUserSession(): Promise<string> {
  const [user] = await db.insert(users).values({}).returning({ id: users.id });

  const rawToken = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({
    tokenHash: hashToken(rawToken),
    userId: user.id,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return user.id;
}

/** Retorna o userId da sessão atual, ou null se não houver sessão válida. */
export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!rawToken) return null;

  const [session] = await db
    .select({ userId: sessions.userId, expiresAt: sessions.expiresAt })
    .from(sessions)
    .where(eq(sessions.tokenHash, hashToken(rawToken)))
    .limit(1);

  if (!session || session.expiresAt < new Date()) return null;

  return session.userId;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (rawToken) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(rawToken)));
  }
  cookieStore.delete(SESSION_COOKIE);
}
