import { ACTIVITY_FEED_LIMIT, PROJECT_STATUS_LABELS } from "@/lib/constants";
import { db } from "@/lib/db";
import { ServiceError } from "@/lib/errors";
import { projectScope } from "@/lib/services/permissions";
import type { SessionUser } from "@/lib/session";
import type { ProjectInput } from "@/lib/validation/project";

/** Projects visible to `viewer`, newest activity first, with what is needed for progress bars. */
export async function listProjects(viewer: SessionUser, options: { includeArchived?: boolean } = {}) {
  return db.project.findMany({
    where: projectScope(viewer, options),
    include: {
      client: { select: { id: true, name: true } },
      milestones: { select: { completedAt: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

/** One project with milestones and activity, or `null` if it does not exist or is not visible. */
export async function getProject(viewer: SessionUser, projectId: string) {
  return db.project.findFirst({
    where: { id: projectId, ...projectScope(viewer, { includeArchived: true }) },
    include: {
      client: { select: { id: true, name: true, email: true } },
      milestones: { orderBy: { order: "asc" } },
      activities: {
        orderBy: { createdAt: "desc" },
        take: ACTIVITY_FEED_LIMIT,
        include: { actor: { select: { name: true } } },
      },
    },
  });
}

/** All client accounts, for the "assign to client" selector. */
export async function listClients() {
  return db.user.findMany({
    where: { role: "CLIENT" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}

async function assertClientExists(clientId: string): Promise<void> {
  const client = await db.user.findFirst({ where: { id: clientId, role: "CLIENT" }, select: { id: true } });
  if (!client) throw new ServiceError("The selected client does not exist");
}

/** Create a project for a client and record its creation in the activity feed. */
export async function createProject(actor: SessionUser, input: ProjectInput) {
  await assertClientExists(input.clientId);

  return db.project.create({
    data: {
      name: input.name,
      description: input.description,
      status: input.status,
      clientId: input.clientId,
      startDate: input.startDate,
      dueDate: input.dueDate,
      activities: {
        create: { type: "PROJECT_CREATED", message: "Project created", actorId: actor.id },
      },
    },
  });
}

/** Update a project. A status change is recorded in the activity feed. */
export async function updateProject(actor: SessionUser, projectId: string, input: ProjectInput) {
  const existing = await db.project.findUnique({ where: { id: projectId }, select: { status: true } });
  if (!existing) throw new ServiceError("Project not found");
  await assertClientExists(input.clientId);

  const statusChanged = existing.status !== input.status;
  const fromLabel = PROJECT_STATUS_LABELS[existing.status];
  const toLabel = PROJECT_STATUS_LABELS[input.status];

  return db.project.update({
    where: { id: projectId },
    data: {
      name: input.name,
      description: input.description,
      status: input.status,
      clientId: input.clientId,
      startDate: input.startDate,
      dueDate: input.dueDate,
      ...(statusChanged && {
        activities: {
          create: {
            type: "STATUS_CHANGED",
            message: `Status changed from ${fromLabel} to ${toLabel}`,
            actorId: actor.id,
          },
        },
      }),
    },
  });
}

/** Archive or restore a project. Archived projects are hidden from clients. */
export async function setProjectArchived(projectId: string, archived: boolean) {
  const existing = await db.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!existing) throw new ServiceError("Project not found");

  await db.project.update({
    where: { id: projectId },
    data: { archivedAt: archived ? new Date() : null },
  });
}
