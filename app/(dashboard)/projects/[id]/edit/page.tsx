import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddMilestoneForm, MilestoneRow } from "@/components/forms/milestone-forms";
import { ProjectForm } from "@/components/forms/project-form";
import { Card, CardTitle, EmptyState } from "@/components/ui/card";
import { toDateInputValue } from "@/lib/dates";
import { getProject, listClients } from "@/lib/services/projects";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;

  const [project, clients] = await Promise.all([getProject(admin, id), listClients()]);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href={`/projects/${project.id}`} className="text-sm text-indigo-700 hover:underline">
          ← Back to project
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Edit project</h1>
      </div>

      <Card>
        <ProjectForm
          clients={clients}
          projectId={project.id}
          cancelHref={`/projects/${project.id}`}
          initialValues={{
            name: project.name,
            description: project.description ?? "",
            status: project.status,
            clientId: project.clientId,
            startDate: toDateInputValue(project.startDate),
            dueDate: toDateInputValue(project.dueDate),
          }}
        />
      </Card>

      <Card>
        <CardTitle>Milestones</CardTitle>
        {project.milestones.length === 0 ? (
          <EmptyState>No milestones yet. Add the first one below.</EmptyState>
        ) : (
          <div className="divide-y divide-slate-100">
            {project.milestones.map((milestone, index) => (
              <MilestoneRow
                key={milestone.id}
                milestone={{
                  id: milestone.id,
                  title: milestone.title,
                  dueDate: toDateInputValue(milestone.dueDate),
                }}
                isFirst={index === 0}
                isLast={index === project.milestones.length - 1}
              />
            ))}
          </div>
        )}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <AddMilestoneForm projectId={project.id} />
        </div>
      </Card>
    </div>
  );
}
