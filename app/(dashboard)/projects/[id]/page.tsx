import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { setArchivedAction } from "@/app/actions/projects";
import { ActivityFeed } from "@/components/activity-feed";
import { NoteForm } from "@/components/forms/note-form";
import { MilestoneList } from "@/components/milestone-list";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/dates";
import { calculateProgress } from "@/lib/services/progress";
import { getProject } from "@/lib/services/projects";
import { requireUser } from "@/lib/session";

type PageProps = { params: Promise<{ id: string }> };

// Shared by the page and its metadata so the project is only queried once per request.
const loadProject = cache(async (id: string) => {
  const user = await requireUser();
  return { user, project: await getProject(user, id) };
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { project } = await loadProject((await params).id);
  return { title: project?.name ?? "Project" };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { user, project } = await loadProject((await params).id);
  if (!project) notFound();

  const isAdmin = user.role === "ADMIN";
  const percent = calculateProgress(project.milestones);
  const completedCount = project.milestones.filter((milestone) => milestone.completedAt).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <StatusBadge status={project.status} />
            {project.archivedAt && (
              <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                Archived
              </span>
            )}
          </div>
          {isAdmin && <p className="mt-1 text-sm text-slate-600">Client: {project.client.name}</p>}
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Link href={`/projects/${project.id}/edit`} className={buttonClasses("secondary")}>
              Edit
            </Link>
            <form action={setArchivedAction}>
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="archived" value={String(!project.archivedAt)} />
              <button type="submit" className={buttonClasses("danger")}>
                {project.archivedAt ? "Restore" : "Archive"}
              </button>
            </form>
          </div>
        )}
      </div>

      <Card>
        {project.description && (
          <p className="mb-4 whitespace-pre-wrap text-sm text-slate-700">{project.description}</p>
        )}
        <ProgressBar percent={percent} label="Project progress" />
        <p className="mt-2 text-sm text-slate-600">
          {completedCount} of {project.milestones.length} milestones completed
        </p>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Start date</dt>
            <dd>{formatDate(project.startDate)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Due date</dt>
            <dd>{formatDate(project.dueDate)}</dd>
          </div>
        </dl>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Milestones</CardTitle>
          <MilestoneList milestones={project.milestones} canEdit={isAdmin} />
        </Card>

        <Card>
          <CardTitle>Activity</CardTitle>
          {isAdmin && (
            <div className="mb-5 border-b border-slate-100 pb-5">
              <NoteForm projectId={project.id} />
            </div>
          )}
          <ActivityFeed activities={project.activities} />
        </Card>
      </div>
    </div>
  );
}
