import { UPCOMING_DEADLINE_DAYS } from "@/lib/constants";
import { addDaysUtc } from "@/lib/dates";
import { db } from "@/lib/db";
import { projectScope } from "@/lib/services/permissions";
import type { SessionUser } from "@/lib/session";

const RECENTLY_COMPLETED_LIMIT = 5;
const UPCOMING_LIMIT = 8;

/** Data for the dashboard overview, scoped to what `viewer` may see. */
export async function getDashboard(viewer: SessionUser, now: Date = new Date()) {
  const scope = projectScope(viewer);
  const projectSelect = { select: { id: true, name: true } } as const;

  const [activeProjects, upcomingDeadlines, recentlyCompleted, completedProjectCount] = await Promise.all([
    db.project.findMany({
      where: { ...scope, status: "ACTIVE" },
      include: {
        client: { select: { id: true, name: true } },
        milestones: { select: { completedAt: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    // Open milestones due within the look-ahead window, including overdue ones.
    db.milestone.findMany({
      where: {
        completedAt: null,
        dueDate: { not: null, lte: addDaysUtc(now, UPCOMING_DEADLINE_DAYS) },
        project: { ...scope, status: { not: "COMPLETED" } },
      },
      include: { project: projectSelect },
      orderBy: { dueDate: "asc" },
      take: UPCOMING_LIMIT,
    }),
    db.milestone.findMany({
      where: { completedAt: { not: null }, project: scope },
      include: { project: projectSelect },
      orderBy: { completedAt: "desc" },
      take: RECENTLY_COMPLETED_LIMIT,
    }),
    db.project.count({ where: { ...scope, status: "COMPLETED" } }),
  ]);

  return { activeProjects, upcomingDeadlines, recentlyCompleted, completedProjectCount };
}
