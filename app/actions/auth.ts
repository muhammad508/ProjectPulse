"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { safeCallbackUrl } from "@/lib/redirect";
import { loginSchema } from "@/lib/validation/auth";
import { formDataToObject, toFieldErrors, type FormState } from "@/lib/validation/form";

export async function loginAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const redirectTo = safeCallbackUrl(formData.get("callbackUrl")?.toString());

  try {
    // On success this throws a redirect, which must propagate to Next.js.
    await signIn("credentials", { ...parsed.data, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Incorrect email or password", values: { email: parsed.data.email } };
    }
    throw error;
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
