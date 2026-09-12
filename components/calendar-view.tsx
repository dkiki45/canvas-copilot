import { Card, CardContent } from "@/components/ui/card";
import type { CalendarEvent } from "@/lib/canvas/types";

export function CalendarView({ events }: { events: CalendarEvent[] }) {
  if (events.length === 0) {
    return <p className="text-muted-foreground">Nenhum evento no período.</p>;
  }

  const sorted = [...events].sort((a, b) => {
    const aDate = a.start_at ? new Date(a.start_at).getTime() : 0;
    const bDate = b.start_at ? new Date(b.start_at).getTime() : 0;
    return aDate - bDate;
  });

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((event) => (
        <Card key={event.id}>
          <CardContent>
            <p className="font-medium">{event.title}</p>
            {event.start_at && (
              <p className="text-sm text-muted-foreground">{new Date(event.start_at).toLocaleString("pt-BR")}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
