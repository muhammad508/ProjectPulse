import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { safeCallbackUrl } from "@/lib/redirect";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  // A visitor who is already signed in has no reason to see the form.
  if (await getCurrentUser()) redirect("/");

  const { callbackUrl } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-1 text-center text-2xl font-semibold text-indigo-700">ProjectPulse</h1>
      <p className="mb-6 text-center text-sm text-slate-600">Sign in to follow your projects.</p>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <LoginForm callbackUrl={safeCallbackUrl(callbackUrl)} />
      </div>
    </main>
  );
}
