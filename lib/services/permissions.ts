import type { Prisma } from "@prisma/client";
import type { Role } from "@/lib/constants";

type Viewer = { id: string; role: Role };

/**
 * The `where` clause that limits project queries to what `viewer` may see.
 *
 * Every project query goes through this function, so access control lives in the data
 * layer: a client can never load another client's project, even by guessing its id.
 *
 * - Admins see every project; archived ones only when `includeArchived` is set.
 * - Clients see only their own projects and never archived ones.
 */
export function projectScope(
  viewer: Viewer,
  options: { includeArchived?: boolean } = {},
): Prisma.ProjectWhereInput {
  if (viewer.role === "ADMIN") {
    return options.includeArchived ? {} : { archivedAt: null };
  }
  return { clientId: viewer.id, archivedAt: null };
}
