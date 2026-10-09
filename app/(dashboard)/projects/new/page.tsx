import type { Metadata } from "next";
import { ProjectForm } from "@/components/forms/project-form";
import { Card, EmptyState } from "@/components/ui/card";
import { listClients } from "@/lib/services/projects";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  await requireAdmin();
  const clients = await listClients();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">New project</h1>
      <Card>
        {clients.length === 0 ? (
          <EmptyState>
            There are no client accounts yet. Create one with <code>npm run user:create</code>, then come
            back.
          </EmptyState>
        ) : (
          <ProjectForm clients={clients} cancelHref="/projects" />
        )}
      </Card>
    </div>
  );
}
