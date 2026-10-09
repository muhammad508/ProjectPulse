"use server";

import { revalidatePath } from "next/cache";
import { toFormFailure } from "@/lib/actions/helpers";
import { ServiceError } from "@/lib/errors";
import {
  addMilestone,
  deleteMilestone,
  moveMilestone,
  setMilestoneCompleted,
  updateMilestone,
} from "@/lib/services/milestones";
import { requireAdmin } from "@/lib/session";
import { formDataToObject, textValues, toFieldErrors, type FormState } from "@/lib/validation/form";
import {
  addMilestoneSchema,
  milestoneIdSchema,
  moveMilestoneSchema,
  toggleMilestoneSchema,
  updateMilestoneSchema,
} from "@/lib/validation/milestone";

export async function addMilestoneAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = addMilestoneSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error), values: textValues(formData) };
  }

  try {
    await addMilestone(parsed.data.projectId, parsed.data);
  } catch (error) {
    return toFormFailure(error, formData);
  }

  revalidatePath("/", "layout");
  // Empty values so the form clears itself for the next milestone.
  return { success: "Milestone added", values: {} };
}

export async function updateMilestoneAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = updateMilestoneSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error), values: textValues(formData) };
  }

  try {
    await updateMilestone(parsed.data.milestoneId, parsed.data);
  } catch (error) {
    return toFormFailure(error, formData);
  }

  revalidatePath("/", "layout");
  return { success: "Saved", values: textValues(formData) };
}

export async function deleteMilestoneAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = milestoneIdSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new ServiceError("Invalid request");

  await deleteMilestone(parsed.data.milestoneId);
  revalidatePath("/", "layout");
}

/**
 * Move a milestone up or down. The direction is bound by the caller
 * (`moveMilestoneAction.bind(null, "up")`) because a button with a function `formAction`
 * cannot also submit its own name/value pair. Bound arguments come from the client, so
 * they are validated like any other input.
 */
export async function moveMilestoneAction(direction: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = moveMilestoneSchema.safeParse({ ...formDataToObject(formData), direction });
  if (!parsed.success) throw new ServiceError("Invalid request");

  await moveMilestone(parsed.data.milestoneId, parsed.data.direction);
  revalidatePath("/", "layout");
}

export async function toggleMilestoneAction(formData: FormData): Promise<void> {
  const actor = await requireAdmin();

  const parsed = toggleMilestoneSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) throw new ServiceError("Invalid request");

  await setMilestoneCompleted(actor, parsed.data.milestoneId, parsed.data.completed);
  revalidatePath("/", "layout");
}
