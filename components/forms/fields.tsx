import type { ReactNode } from "react";

export const inputClasses =
  "block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm " +
  "placeholder:text-slate-400 focus:border-indigo-600 focus:outline-1 focus:outline-indigo-600 " +
  "aria-[invalid=true]:border-red-500";

/** Accessibility attributes that tie an input to its validation message (see `Field`). */
export function fieldA11y(id: string, errors: string[] | undefined) {
  const invalid = Boolean(errors?.length);
  return { "aria-invalid": invalid, "aria-describedby": invalid ? `${id}-error` : undefined };
}

type FieldProps = {
  label: string;
  htmlFor: string;
  errors?: string[];
  children: ReactNode;
};

/** Label, control and validation message for one form field. */
export function Field({ label, htmlFor, errors, children }: FieldProps) {
  const message = errors?.[0];
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {message && (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1 text-xs text-red-600">
          {message}
        </p>
      )}
    </div>
  );
}

/** Banner for form-level errors and confirmations. */
export function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (error) {
    return (
      <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
        {success}
      </p>
    );
  }
  return null;
}
