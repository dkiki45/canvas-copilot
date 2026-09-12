import type { LucideIcon } from "lucide-react";

type StatTileTone = "neutral" | "critical" | "warning" | "good";

const TONE_STYLES: Record<StatTileTone, string> = {
  neutral: "text-foreground",
  critical: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
  good: "text-green-600 dark:text-green-400",
};

export function StatTile({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  tone?: StatTileTone;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border p-4">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {Icon && <Icon className="size-4" />}
        <span>{label}</span>
      </div>
      <p className={`text-2xl font-semibold ${TONE_STYLES[tone]}`}>{value}</p>
    </div>
  );
}
