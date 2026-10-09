import { z } from "zod";

/** Per-field validation messages, keyed by field name. */
export type FieldErrors = Record<string, string[] | undefined>;

/** Result of a form submission, returned by server actions and rendered by the forms. */
export type FormState =
  | {
      /** A message about the form as a whole (e.g. a business-rule failure). */
      error?: string;
      /** Confirmation shown after a successful submission that stays on the page. */
      success?: string;
      fieldErrors?: FieldErrors;
      /** Submitted values, echoed back so the form can refill itself after an error. */
      values?: Record<string, string>;
    }
  | undefined;

/** Convert submitted form data into a plain object suitable for Zod. */
export function formDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

/** Extract per-field messages from a failed Zod parse. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  return z.flattenError(error).fieldErrors;
}

/** Keep only the text values of a submission, for echoing back to the form. */
export function textValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION")) values[key] = value;
  }
  return values;
}
