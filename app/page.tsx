import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getDecryptedCredentialsForUser } from "@/lib/credentials";

export default async function RootPage() {
  const userId = await getSessionUserId();
  const credentials = userId ? await getDecryptedCredentialsForUser(userId) : null;

  redirect(credentials ? "/painel" : "/onboarding");
}
