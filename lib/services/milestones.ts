import { db } from "@/lib/db";
import { ServiceError } from "@/lib/errors";
import type { SessionUser } from "@/lib/session";
import type { MilestoneInput } from "@/lib/validation/milestone";

async function findMilestone(milestoneId: string) {
  const milestone = await db.milestone.findUnique({ where: { id: milestoneId } });
  if (!milestone) throw new ServiceError("Milestone not found");
  return milestone;
}

/** Append a milestone to the end of a project's list. */
export async function addMilestone(projectId: string, input: MilestoneInput) {
  const project = await db.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!project) throw new ServiceError("Project not found");

  const last = await db.milestone.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  return db.milestone.create({
    data: { projectId, title: input.title, dueDate: input.dueDate, order: (last?.order ?? 0) + 1 },
  });
}

/** Update a milestone's title and due date. Returns the owning project id. */
export async function updateMilestone(milestoneId: string, input: MilestoneInput): Promise<string> {
  const milestone = await findMilestone(milestoneId);
  await db.milestone.update({
    where: { id: milestoneId },
    data: { title: input.title, dueDate: input.dueDate },
  });
  return milestone.projectId;
}

/** Delete a milestone. Returns the owning project id. */
export async function deleteMilestone(milestoneId: string): Promise<string> {
  const milestone = await findMilestone(milestoneId);
  await db.milestone.delete({ where: { id: milestoneId } });
  return milestone.projectId;
}

/** Swap a milestone with its neighbour. Returns the owning project id. */
export async function moveMilestone(milestoneId: string, direction: "up" | "down"): Promise<string> {
  const milestone = await findMilestone(milestoneId);

  await db.$transaction(async (tx) => {
    const siblings = await tx.milestone.findMany({
      where: { projectId: milestone.projectId },
      orderBy: { order: "asc" },
      select: { id: true },
    });
    const from = siblings.findIndex((sibling) => sibling.id === milestoneId);
    const to = direction === "up" ? from - 1 : from + 1;
    if (from === -1 || to < 0 || to >= siblings.length) return;

    // Renumber the whole list so positions stay dense and unambiguous.
    const reordered = siblings.map((sibling) => sibling.id);
    [reordered[from], reordered[to]] = [reordered[to]!, reordered[from]!];
    await Promise.all(
      reordered.map((id, index) => tx.milestone.update({ where: { id }, data: { order: index + 1 } })),
    );
  });

  return milestone.projectId;
}

/**
 * Mark a milestone completed or reopen it, and record the change in the activity feed.
 * Returns the owning project id. Does nothing if the milestone is already in that state.
 */
export async function setMilestoneCompleted(
  actor: SessionUser,
  milestoneId: string,
  completed: boolean,
): Promise<string> {
  const milestone = await findMilestone(milestoneId);
  if ((milestone.completedAt !== null) === completed) return milestone.projectId;

  await db.$transaction([
    db.milestone.update({
      where: { id: milestoneId },
      data: { completedAt: completed ? new Date() : null },
    }),
    db.activity.create({
      data: {
        projectId: milestone.projectId,
        actorId: actor.id,
        type: completed ? "MILESTONE_COMPLETED" : "MILESTONE_REOPENED",
        message: completed
          ? `Milestone "${milestone.title}" completed`
          : `Milestone "${milestone.title}" reopened`,
      },
    }),
    // Touch the project so it moves to the top of "recently updated" lists.
    db.project.update({ where: { id: milestone.projectId }, data: { updatedAt: new Date() } }),
  ]);

  return milestone.projectId;
}
