import type { Metadata } from "next";
import Link from "next/link";
import { ProjectCard } from "@/components/project-card";
import { Card, CardTitle, EmptyState } from "@/components/ui/card";
import { UPCOMING_DEADLINE_DAYS } from "@/lib/constants";
import { formatDate, isOverdue } from "@/lib/dates";
import { getDashboard } from "@/lib/services/dashboard";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const { activeProjects, upcomingDeadlines, recentlyCompleted, completedProjectCount } =
    await getDashboard(user);
  const now = new Date();
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, {user.name}</h1>
        <p className="text-sm text-slate-600">
          {isAdmin ? "An overview of all client projects." : "An overview of your projects."}
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-3">
        <Stat label="Active projects" value={activeProjects.length} />
        <Stat label={`Deadlines in ${UPCOMING_DEADLINE_DAYS} days`} value={upcomingDeadlines.length} />
        <Stat label="Completed projects" value={completedProjectCount} />
      </dl>

      <section aria-labelledby="active-heading">
        <h2 id="active-heading" className="mb-3 text-lg font-semibold">
          Active projects
        </h2>
        {activeProjects.length === 0 ? (
          <Card>
            <EmptyState>No active projects right now.</EmptyState>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} showClient={isAdmin} />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardTitle>Upcoming deadlines</CardTitle>
          {upcomingDeadlines.length === 0 ? (
            <EmptyState>Nothing due soon.</EmptyState>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcomingDeadlines.map((milestone) => {
                const late = milestone.dueDate !== null && isOverdue(milestone.dueDate, now);
                return (
                  <li key={milestone.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-slate-900">{milestone.title}</p>
                      <Link
                        href={`/projects/${milestone.project.id}`}
                        className="text-xs text-indigo-700 hover:underline"
                      >
                        {milestone.project.name}
                      </Link>
                    </div>
                    <span
                      className={`shrink-0 text-xs ${late ? "font-medium text-red-600" : "text-slate-500"}`}
                    >
                      {late ? "Overdue · " : ""}
                      {formatDate(milestone.dueDate)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle>Recently completed</CardTitle>
          {recentlyCompleted.length === 0 ? (
            <EmptyState>No milestones completed yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentlyCompleted.map((milestone) => (
                <li key={milestone.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-900">{milestone.title}</p>
                    <Link
                      href={`/projects/${milestone.project.id}`}
                      className="text-xs text-indigo-700 hover:underline"
                    >
                      {milestone.project.name}
                    </Link>
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">{formatDate(milestone.completedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

/** One headline figure on the dashboard. */
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 text-3xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
