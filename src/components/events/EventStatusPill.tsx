import { cn } from "@/lib/utils";
import type { EventStatus } from "@/lib/community-types";
import { eventStatusLabel } from "@/lib/events-data";

export default function EventStatusPill({ status }: { status: EventStatus }) {
  return (
    <span
      className={cn(
        "pill inline-flex items-center gap-1.5 text-xs font-medium",
        status === "live" && "bg-[var(--accent-soft)] text-[var(--accent)]",
        status === "upcoming" && "bg-[var(--bg-input)] text-[var(--text-secondary)]",
        status === "past" && "bg-[var(--bg-input)] text-[var(--text-muted)]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "live" && "bg-[var(--accent)]",
          status === "upcoming" && "bg-[var(--warning)]",
          status === "past" && "bg-[var(--text-muted)]",
        )}
      />
      {eventStatusLabel(status)}
    </span>
  );
}
