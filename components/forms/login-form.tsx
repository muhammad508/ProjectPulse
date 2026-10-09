"use client";

import { loginAction } from "@/app/actions/auth";
import { buttonClasses } from "@/components/ui/button";
import { loginSchema } from "@/lib/validation/auth";
import { Field, fieldA11y, FormMessage, inputClasses } from "./fields";
import { useValidatedForm } from "./use-validated-form";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const form = useValidatedForm(loginSchema, loginAction);

  return (
    <form action={form.formAction} onSubmit={form.onSubmit} noValidate className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <FormMessage error={form.error} />

      <Field label="Email" htmlFor="email" errors={form.fieldErrors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={form.valueFor("email")}
          {...fieldA11y("email", form.fieldErrors.email)}
          className={inputClasses}
        />
      </Field>

      <Field label="Password" htmlFor="password" errors={form.fieldErrors.password}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          {...fieldA11y("password", form.fieldErrors.password)}
          className={inputClasses}
        />
      </Field>

      <button type="submit" disabled={form.pending} className={buttonClasses("primary", "w-full")}>
        {form.pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
