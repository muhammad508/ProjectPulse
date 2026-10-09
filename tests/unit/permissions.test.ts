import { describe, expect, it } from "vitest";
import { projectScope } from "@/lib/services/permissions";

const admin = { id: "admin-1", role: "ADMIN" } as const;
const client = { id: "client-1", role: "CLIENT" } as const;

describe("projectScope", () => {
  it("limits clients to their own, non-archived projects", () => {
    expect(projectScope(client)).toEqual({ clientId: "client-1", archivedAt: null });
  });

  it("never lets a client see archived projects, even when asked", () => {
    expect(projectScope(client, { includeArchived: true })).toEqual({
      clientId: "client-1",
      archivedAt: null,
    });
  });

  it("hides archived projects from admins by default", () => {
    expect(projectScope(admin)).toEqual({ archivedAt: null });
  });

  it("lets admins opt in to archived projects", () => {
    expect(projectScope(admin, { includeArchived: true })).toEqual({});
  });
});
