import { db } from "@/lib/db";
import { ServiceError } from "@/lib/errors";
import type { SessionUser } from "@/lib/session";

/** Add a free-text note to a project's activity feed. */
export async function addNote(actor: SessionUser, projectId: string, message: string) {
  const project = await db.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!project) throw new ServiceError("Project not found");

  await db.$transaction([
    db.activity.create({ data: { projectId, actorId: actor.id, type: "NOTE_ADDED", message } }),
    db.project.update({ where: { id: projectId }, data: { updatedAt: new Date() } }),
  ]);
}
