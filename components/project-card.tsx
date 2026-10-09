import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ProjectStatus } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { calculateProgress } from "@/lib/services/progress";

type ProjectCardProps = {
  project: {
    id: string;
    name: string;
    status: ProjectStatus;
    dueDate: Date | null;
    archivedAt: Date | null;
    client: { name: string };
    milestones: { completedAt: Date | null }[];
  };
  /** Show the client's name (useful to admins, redundant for the client themselves). */
  showClient: boolean;
};

export function ProjectCard({ project, showClient }: ProjectCardProps) {
  const percent = calculateProgress(project.milestones);

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{project.name}</h3>
          {showClient && <p className="text-sm text-slate-500">{project.client.name}</p>}
        </div>
        <div className="flex items-center gap-2">
          {project.archivedAt && (
            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              Archived
            </span>
          )}
          <StatusBadge status={project.status} />
        </div>
      </div>
      <ProgressBar percent={percent} label={`${project.name} progress`} />
      <p className="mt-2 text-xs text-slate-500">Due {formatDate(project.dueDate)}</p>
    </Link>
  );
}
