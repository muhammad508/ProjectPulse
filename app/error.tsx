"use client";

import { buttonClasses } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-slate-600">The request could not be completed. Please try again.</p>
      <button type="button" onClick={reset} className={buttonClasses("primary")}>
        Try again
      </button>
    </main>
  );
}
