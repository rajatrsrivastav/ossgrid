import type { Announcement } from "@/lib/community-types";

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

interface AnnouncementsFeedProps {
  items: Announcement[];
  emptyLabel?: string;
}

/** Official announcements list — one source of truth for organisers. */
export default function AnnouncementsFeed({
  items,
  emptyLabel = "No announcements yet.",
}: AnnouncementsFeedProps) {
  if (items.length === 0) {
    return <p className="text-sm text-[var(--text-secondary)]">{emptyLabel}</p>;
  }

  return (
    <ol className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="card p-5">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">{item.title}</h3>
            <time dateTime={item.publishedAt} className="num text-xs text-[var(--text-muted)]">
              {formatDate(item.publishedAt)}
            </time>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{item.body}</p>
          <p className="mt-3 text-xs text-[var(--text-muted)]">{item.author}</p>
        </li>
      ))}
    </ol>
  );
}
