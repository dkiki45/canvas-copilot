import Link from "next/link";
import type { CalendarItem, CalendarItemKind } from "@/lib/canvas/types";

const WEEKDAY_LABELS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const ITEM_STYLES: Record<CalendarItemKind, string> = {
  event: "bg-primary/10 text-primary hover:bg-primary/20",
  assignment: "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400",
  quiz: "bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400 font-medium",
};

function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startWeekday = firstDay.getDay();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month - 1, day));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function itemLabel(item: CalendarItem): string {
  return item.kind === "quiz" ? `Prova: ${item.title}` : item.title;
}

export function MonthCalendar({ year, month, items }: { year: number; month: number; items: CalendarItem[] }) {
  const weeks = getMonthGrid(year, month);
  const today = new Date();

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[640px] grid-cols-7 gap-px rounded-md border bg-border text-xs">
        {WEEKDAY_LABELS_PT.map((label) => (
          <div key={label} className="bg-muted px-2 py-1 text-center font-medium text-muted-foreground">
            {label}
          </div>
        ))}

        {weeks.flatMap((week, weekIndex) =>
          week.map((date, dayIndex) => {
            const dayItems = date ? items.filter((item) => isSameDay(new Date(item.start_at), date)) : [];
            const isToday = date != null && isSameDay(date, today);

            return (
              <div key={`${weekIndex}-${dayIndex}`} className={`min-h-[100px] bg-background p-1.5 ${date ? "" : "bg-muted/30"}`}>
                {date && (
                  <>
                    <p className={`mb-1 text-right ${isToday ? "font-bold text-primary" : "text-muted-foreground"}`}>
                      {date.getDate()}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {dayItems.slice(0, 3).map((item) =>
                        item.external ? (
                          <a
                            key={item.id}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={item.title}
                            className={`truncate rounded px-1 py-0.5 text-[0.7rem] ${ITEM_STYLES[item.kind]}`}
                          >
                            {itemLabel(item)}
                          </a>
                        ) : (
                          <Link
                            key={item.id}
                            href={item.href}
                            title={item.title}
                            className={`truncate rounded px-1 py-0.5 text-[0.7rem] ${ITEM_STYLES[item.kind]}`}
                          >
                            {itemLabel(item)}
                          </Link>
                        ),
                      )}
                      {dayItems.length > 3 && (
                        <span className="text-[0.65rem] text-muted-foreground">+{dayItems.length - 3} mais</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
