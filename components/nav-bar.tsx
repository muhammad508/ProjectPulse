import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { buttonClasses } from "@/components/ui/button";
import type { SessionUser } from "@/lib/session";

export function NavBar({ user }: { user: SessionUser }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <nav aria-label="Main" className="flex items-center gap-5">
          <Link href="/" className="text-lg font-semibold text-indigo-700">
            ProjectPulse
          </Link>
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
            Dashboard
          </Link>
          <Link href="/projects" className="text-sm text-slate-600 hover:text-slate-900">
            Projects
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">
            {user.name}
            <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs uppercase tracking-wide text-slate-500">
              {user.role.toLowerCase()}
            </span>
          </span>
          <form action={logoutAction}>
            <button type="submit" className={buttonClasses("secondary")}>
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
