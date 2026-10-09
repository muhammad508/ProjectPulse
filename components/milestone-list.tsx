import { toggleMilestoneAction } from "@/app/actions/milestones";
import { EmptyState } from "@/components/ui/card";
import { formatDate, isOverdue } from "@/lib/dates";

type MilestoneListProps = {
  milestones: { id: string; title: string; dueDate: Date | null; completedAt: Date | null }[];
  /** Admins can mark milestones completed or reopen them; clients see a read-only list. */
  canEdit: boolean;
};

export function MilestoneList({ milestones, canEdit }: MilestoneListProps) {
  if (milestones.length === 0) return <EmptyState>No milestones yet.</EmptyState>;

  const now = new Date();

  return (
    <ol className="divide-y divide-slate-100">
      {milestones.map((milestone) => {
        const done = milestone.completedAt !== null;
        const late = !done && milestone.dueDate !== null && isOverdue(milestone.dueDate, now);

        return (
          <li key={milestone.id} className="flex items-center gap-3 py-3">
            {canEdit ? (
              <form action={toggleMilestoneAction}>
                <input type="hidden" name="milestoneId" value={milestone.id} />
                <input type="hidden" name="completed" value={String(!done)} />
                <button
                  type="submit"
                  aria-label={done ? `Reopen "${milestone.title}"` : `Mark "${milestone.title}" as completed`}
                  className={`flex size-6 items-center justify-center rounded-full border text-xs ${
                    done
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-300 bg-white text-transparent hover:border-indigo-600"
                  }`}
                >
                  ✓
                </button>
              </form>
            ) : (
              <span
                aria-hidden="true"
                className={`flex size-6 items-center justify-center rounded-full border text-xs ${
                  done ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-transparent"
                }`}
              >
                ✓
              </span>
            )}

            <div className="min-w-0 flex-1">
              <p className={done ? "text-slate-500 line-through" : "text-slate-900"}>{milestone.title}</p>
              <p className={`text-xs ${late ? "font-medium text-red-600" : "text-slate-500"}`}>
                {done
                  ? `Completed ${formatDate(milestone.completedAt)}`
                  : milestone.dueDate
                    ? `${late ? "Overdue · " : "Due "}${formatDate(milestone.dueDate)}`
                    : "No due date"}
              </p>
            </div>
            <span className="sr-only">{done ? "Completed" : "Open"}</span>
          </li>
        );
      })}
    </ol>
  );
}
