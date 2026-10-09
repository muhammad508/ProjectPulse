import { PROJECT_STATUS_LABELS, type ProjectStatus } from "@/lib/constants";

const styles: Record<ProjectStatus, string> = {
  PLANNING: "bg-slate-100 text-slate-700",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  ON_HOLD: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-indigo-100 text-indigo-800",
};

/** Coloured pill showing a project's status. */
export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}
