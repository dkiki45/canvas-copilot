import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { getDecryptedCredentialsForUser, markCredentialsInvalid } from "@/lib/credentials";
import { submitFileToAssignment } from "@/lib/canvas/submissions";
import { CanvasAuthError, CanvasApiError } from "@/lib/canvas/client";

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  }

  const credentials = await getDecryptedCredentialsForUser(userId);
  if (!credentials) {
    return NextResponse.json({ error: "Conecte-se ao Canvas novamente" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const courseId = formData.get("courseId");
  const assignmentId = formData.get("assignmentId");

  if (!(file instanceof File) || typeof courseId !== "string" || typeof assignmentId !== "string") {
    return NextResponse.json({ error: "Dados de envio inválidos" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const submission = await submitFileToAssignment(credentials, Number(courseId), Number(assignmentId), {
      name: file.name,
      size: file.size,
      contentType: file.type || "application/octet-stream",
      buffer,
    });

    return NextResponse.json({ submission });
  } catch (err) {
    if (err instanceof CanvasAuthError) {
      await markCredentialsInvalid(userId);
      return NextResponse.json({ error: "Token do Canvas expirado. Reconecte sua conta." }, { status: 401 });
    }
    if (err instanceof CanvasApiError) {
      return NextResponse.json({ error: "Falha ao enviar a entrega ao Canvas" }, { status: 502 });
    }
    return NextResponse.json({ error: "Erro inesperado ao enviar a entrega" }, { status: 500 });
  }
}
