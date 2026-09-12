import { AlertTriangle } from "lucide-react";

export function UrgentBanner({ overdueCount, dueSoonCount }: { overdueCount: number; dueSoonCount: number }) {
  if (overdueCount === 0 && dueSoonCount === 0) return null;

  const isCritical = overdueCount > 0;
  const parts: string[] = [];
  if (overdueCount > 0) parts.push(`${overdueCount} atrasada${overdueCount > 1 ? "s" : ""}`);
  if (dueSoonCount > 0) parts.push(`${dueSoonCount} vencendo hoje ou amanhã`);

  return (
    <div
      role="status"
      className={`flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-medium ${
        isCritical
          ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
          : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
      }`}
    >
      <AlertTriangle className="size-4 shrink-0" />
      <span>{parts.join(" · ")}</span>
    </div>
  );
}
