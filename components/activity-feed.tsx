import { EmptyState } from "@/components/ui/card";
import type { ActivityType } from "@/lib/constants";
import { formatDateTime } from "@/lib/dates";

// Icon and colour for each kind of activity entry.
const markers: Record<ActivityType, { symbol: string; className: string }> = {
  PROJECT_CREATED: { symbol: "＋", className: "bg-slate-100 text-slate-600" },
  STATUS_CHANGED: { symbol: "⇄", className: "bg-amber-100 text-amber-700" },
  MILESTONE_COMPLETED: { symbol: "✓", className: "bg-emerald-100 text-emerald-700" },
  MILESTONE_REOPENED: { symbol: "↺", className: "bg-slate-100 text-slate-600" },
  NOTE_ADDED: { symbol: "✎", className: "bg-indigo-100 text-indigo-700" },
};

type ActivityFeedProps = {
  activities: { id: string; type: ActivityType; message: string; createdAt: Date; actor: { name: string } }[];
};

/** Timeline of project updates, newest first. */
export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) return <EmptyState>No activity yet.</EmptyState>;

  return (
    <ul className="space-y-4">
      {activities.map((activity) => {
        const marker = markers[activity.type];
        return (
          <li key={activity.id} className="flex gap-3">
            <span
              aria-hidden="true"
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm ${marker.className}`}
            >
              {marker.symbol}
            </span>
            <div className="min-w-0">
              <p className="whitespace-pre-wrap break-words text-sm text-slate-900">{activity.message}</p>
              <p className="text-xs text-slate-500">
                {activity.actor.name} · {formatDateTime(activity.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
