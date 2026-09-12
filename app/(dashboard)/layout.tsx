import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { getDecryptedCredentialsForUser } from "@/lib/credentials";

const NAV_ITEMS = [
  { href: "/painel", label: "Painel" },
  { href: "/courses", label: "Cursos" },
  { href: "/todo", label: "Tarefas" },
  { href: "/calendar", label: "Calendário" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/onboarding");
  }

  const credentials = await getDecryptedCredentialsForUser(userId);
  if (!credentials) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <nav className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
