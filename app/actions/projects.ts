"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toFormFailure } from "@/lib/actions/helpers";
import { ServiceError } from "@/lib/errors";
import { createProject, setProjectArchived, updateProject } from "@/lib/services/projects";
import { requireAdmin } from "@/lib/session";
import { formDataToObject, textValues, toFieldErrors, type FormState } from "@/lib/validation/form";
import { archiveSchema, projectIdSchema, projectSchema } from "@/lib/validation/project";

export async function createProjectAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireAdmin();

  const parsed = projectSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error), values: textValues(formData) };
  }

  let projectId: string;
  try {
    projectId = (await createProject(actor, parsed.data)).id;
  } catch (error) {
    return toFormFailure(error, formData);
  }

  revalidatePath("/", "layout");
  // Milestones are added on the edit page.
  redirect(`/projects/${projectId}/edit`);
}

export async function updateProjectAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireAdmin();
  const raw = formDataToObject(formData);

  const parsedId = projectIdSchema.safeParse(raw);
  if (!parsedId.success) throw new ServiceError("Invalid request");

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error), values: textValues(formData) };
  }

  try {
    await updateProject(actor, parsedId.data.projectId, parsed.data);
  } catch (error) {
    return toFormFailure(error, formData);
  }

  revalidatePath("/", "layout");
  return { success: "Project saved", values: textValues(formData) };
}

export async function setArchivedAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = archiveSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new ServiceError("Invalid request");

  await setProjectArchived(parsed.data.projectId, parsed.data.archived);
  revalidatePath("/", "layout");
}
