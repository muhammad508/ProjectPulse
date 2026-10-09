import type { ReactNode } from "react";
import { NavBar } from "@/components/nav-bar";
import { requireUser } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <>
      <NavBar user={user} />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </>
  );
}
