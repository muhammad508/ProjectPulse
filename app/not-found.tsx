import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-slate-600">It may have been moved, archived, or you may not have access to it.</p>
      <Link href="/" className={buttonClasses("primary")}>
        Back to dashboard
      </Link>
    </main>
  );
}
