"use client";

import { useActionState, useState, type FormEvent } from "react";
import type { z } from "zod";
import { formDataToObject, toFieldErrors, type FieldErrors, type FormState } from "@/lib/validation/form";

type FormAction = (previous: FormState, formData: FormData) => Promise<FormState>;

/**
 * Wires a form to a server action and validates it with the same Zod schema first.
 *
 * Invalid input is rejected in the browser for instant feedback; valid input is sent to
 * the server action, which validates again (the client is never trusted). A submit
 * button marked `data-skip-validation` (e.g. "Delete") bypasses the client check.
 */
export function useValidatedForm(schema: z.ZodType, action: FormAction) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    if (submitter?.hasAttribute("data-skip-validation")) return;

    const result = schema.safeParse(formDataToObject(new FormData(event.currentTarget)));
    if (result.success) {
      setClientErrors({});
    } else {
      event.preventDefault();
      setClientErrors(toFieldErrors(result.error));
    }
  }

  const fieldErrors: FieldErrors = { ...state?.fieldErrors, ...clientErrors };

  /** Value to prefill a field with: what the user last submitted, else `fallback`. */
  function valueFor(name: string, fallback = ""): string {
    return state?.values?.[name] ?? fallback;
  }

  return {
    formAction,
    onSubmit,
    pending,
    fieldErrors,
    error: state?.error,
    success: state?.success,
    valueFor,
  };
}
