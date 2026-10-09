/**
 * Domain constants and display labels.
 *
 * Declared here (instead of imported from @prisma/client) so that client components and
 * the shared Zod schemas never pull the Prisma runtime into the browser bundle. The
 * string unions are structurally identical to the Prisma enums.
 */

export const ROLES = ["ADMIN", "CLIENT"] as const;
export type Role = (typeof ROLES)[number];

export const PROJECT_STATUSES = ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const ACTIVITY_TYPES = [
  "PROJECT_CREATED",
  "STATUS_CHANGED",
  "MILESTONE_COMPLETED",
  "MILESTONE_REOPENED",
  "NOTE_ADDED",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
};

/** How many days ahead the dashboard looks for upcoming milestone deadlines. */
export const UPCOMING_DEADLINE_DAYS = 14;

/** Maximum number of activity entries shown on a project page. */
export const ACTIVITY_FEED_LIMIT = 50;
