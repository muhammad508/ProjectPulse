import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Role } from "@/lib/constants";
import { db } from "@/lib/db";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

/**
 * The signed-in user, loaded fresh from the database.
 *
 * The session cookie only proves who signed in; role and existence are re-checked on
 * every request so a deleted or demoted user loses access immediately. Cached per
 * request, so calling it repeatedly costs one query.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  return db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });
});

/** Require a signed-in user; otherwise redirect to the login page. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Require an admin; clients are sent back to the dashboard. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}
