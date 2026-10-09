import type { Metadata } from "next";
import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { buttonClasses } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { listProjects } from "@/lib/services/projects";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string }>;
}) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const showArchived = isAdmin && (await searchParams).archived === "1";

  const projects = await listProjects(user, { includeArchived: showArchived });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Projects</h1>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Link
              href={showArchived ? "/projects" : "/projects?archived=1"}
              className={buttonClasses("ghost")}
            >
              {showArchived ? "Hide archived" : "Show archived"}
            </Link>
            <Link href="/projects/new" className={buttonClasses("primary")}>
              New project
            </Link>
          </div>
        )}
      </div>

      {projects.length === 0 ? (
        <Card>
          <EmptyState>
            {isAdmin
              ? "No projects yet. Create the first one."
              : "No projects have been shared with you yet."}
          </EmptyState>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} showClient={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}
