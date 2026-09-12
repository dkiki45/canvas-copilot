import type { CalendarEvent } from "@/lib/canvas/types";

const WEEKDAY_LABELS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

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

export function MonthCalendar({ year, month, events }: { year: number; month: number; events: CalendarEvent[] }) {
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
            const dayEvents = date
              ? events.filter((event) => event.start_at && isSameDay(new Date(event.start_at), date))
              : [];
            const isToday = date != null && isSameDay(date, today);

            return (
              <div key={`${weekIndex}-${dayIndex}`} className={`min-h-[100px] bg-background p-1.5 ${date ? "" : "bg-muted/30"}`}>
                {date && (
                  <>
                    <p className={`mb-1 text-right ${isToday ? "font-bold text-primary" : "text-muted-foreground"}`}>
                      {date.getDate()}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {dayEvents.slice(0, 3).map((event) => (
                        <a
                          key={event.id}
                          href={event.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={event.title}
                          className="truncate rounded bg-primary/10 px-1 py-0.5 text-[0.7rem] text-primary hover:bg-primary/20"
                        >
                          {event.title}
                        </a>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[0.65rem] text-muted-foreground">+{dayEvents.length - 3} mais</span>
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
