"use client";

import { addNoteAction } from "@/app/actions/notes";
import { buttonClasses } from "@/components/ui/button";
import { addNoteSchema } from "@/lib/validation/note";
import { Field, fieldA11y, FormMessage, inputClasses } from "./fields";
import { useValidatedForm } from "./use-validated-form";

export function NoteForm({ projectId }: { projectId: string }) {
  const form = useValidatedForm(addNoteSchema, addNoteAction);

  return (
    <form action={form.formAction} onSubmit={form.onSubmit} noValidate className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />
      <FormMessage error={form.error} />
      <Field label="Add a note" htmlFor="note-message" errors={form.fieldErrors.message}>
        <textarea
          id="note-message"
          name="message"
          rows={3}
          maxLength={1000}
          defaultValue={form.valueFor("message")}
          {...fieldA11y("note-message", form.fieldErrors.message)}
          className={inputClasses}
        />
      </Field>
      <button type="submit" disabled={form.pending} className={buttonClasses("secondary")}>
        Post note
      </button>
    </form>
  );
}
