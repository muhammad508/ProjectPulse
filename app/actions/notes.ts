"use server";

import { revalidatePath } from "next/cache";
import { toFormFailure } from "@/lib/actions/helpers";
import { addNote } from "@/lib/services/notes";
import { requireAdmin } from "@/lib/session";
import { formDataToObject, textValues, toFieldErrors, type FormState } from "@/lib/validation/form";
import { addNoteSchema } from "@/lib/validation/note";

export async function addNoteAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireAdmin();

  const parsed = addNoteSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error), values: textValues(formData) };
  }

  try {
    await addNote(actor, parsed.data.projectId, parsed.data.message);
  } catch (error) {
    return toFormFailure(error, formData);
  }

  revalidatePath("/", "layout");
  return { success: "Note added", values: {} };
}
