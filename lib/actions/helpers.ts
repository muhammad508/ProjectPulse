import { ServiceError } from "@/lib/errors";
import { textValues, type FormState } from "@/lib/validation/form";

/**
 * Turn a thrown error into form state.
 *
 * `ServiceError`s carry user-facing messages and are returned to the form; anything else
 * is unexpected and is re-thrown so it reaches the error boundary and the server logs.
 */
export function toFormFailure(error: unknown, formData: FormData): FormState {
  if (error instanceof ServiceError) {
    return { error: error.message, values: textValues(formData) };
  }
  throw error;
}
