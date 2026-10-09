import { z } from "zod";

/**
 * Optional calendar date from an `<input type="date">`.
 * "" or a missing value becomes `null`; "YYYY-MM-DD" becomes a Date at UTC midnight.
 */
export const optionalDate = z
  .union([z.literal(""), z.iso.date("Enter a valid date")])
  .optional()
  .transform((value) => (value ? new Date(`${value}T00:00:00.000Z`) : null));

/** Optional trimmed text; empty input becomes `null`. */
export function optionalText(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength, `Must be at most ${maxLength} characters`)
    .optional()
    .transform((value) => (value ? value : null));
}

/** A required, non-empty identifier (hidden form fields and selects). */
export const requiredId = z.string().min(1, "This field is required");
