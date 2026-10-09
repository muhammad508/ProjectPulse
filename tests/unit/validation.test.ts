import { describe, expect, it } from "vitest";
import { loginSchema } from "@/lib/validation/auth";
import { milestoneSchema } from "@/lib/validation/milestone";
import { noteSchema } from "@/lib/validation/note";
import { projectSchema } from "@/lib/validation/project";

const validProject = {
  name: "Website redesign",
  description: "",
  status: "ACTIVE",
  clientId: "client-1",
  startDate: "2026-01-01",
  dueDate: "2026-03-01",
};

describe("loginSchema", () => {
  it("normalises the email", () => {
    const result = loginSchema.parse({ email: "  Casey@Example.COM ", password: "secret" });
    expect(result.email).toBe("casey@example.com");
  });

  it("rejects an invalid email and an empty password", () => {
    const result = loginSchema.safeParse({ email: "nope", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("projectSchema", () => {
  it("accepts a valid project and converts dates and empty text", () => {
    const project = projectSchema.parse(validProject);
    expect(project.description).toBeNull();
    expect(project.startDate).toEqual(new Date("2026-01-01T00:00:00.000Z"));
    expect(project.dueDate).toEqual(new Date("2026-03-01T00:00:00.000Z"));
  });

  it("treats empty dates as missing", () => {
    const project = projectSchema.parse({ ...validProject, startDate: "", dueDate: "" });
    expect(project.startDate).toBeNull();
    expect(project.dueDate).toBeNull();
  });

  it("requires a name", () => {
    expect(projectSchema.safeParse({ ...validProject, name: "   " }).success).toBe(false);
  });

  it("requires a client", () => {
    expect(projectSchema.safeParse({ ...validProject, clientId: "" }).success).toBe(false);
  });

  it("rejects unknown statuses", () => {
    expect(projectSchema.safeParse({ ...validProject, status: "DONE" }).success).toBe(false);
  });

  it("rejects impossible calendar dates", () => {
    expect(projectSchema.safeParse({ ...validProject, dueDate: "2026-02-30" }).success).toBe(false);
  });

  it("rejects a due date before the start date", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      startDate: "2026-03-01",
      dueDate: "2026-01-01",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.path).toEqual(["dueDate"]);
  });
});

describe("milestoneSchema", () => {
  it("accepts a title with an optional due date", () => {
    expect(milestoneSchema.parse({ title: " Launch ", dueDate: "" })).toEqual({
      title: "Launch",
      dueDate: null,
    });
  });

  it("rejects an empty or overlong title", () => {
    expect(milestoneSchema.safeParse({ title: "" }).success).toBe(false);
    expect(milestoneSchema.safeParse({ title: "x".repeat(161) }).success).toBe(false);
  });
});

describe("noteSchema", () => {
  it("rejects blank and overlong notes", () => {
    expect(noteSchema.safeParse({ message: "  " }).success).toBe(false);
    expect(noteSchema.safeParse({ message: "x".repeat(1001) }).success).toBe(false);
    expect(noteSchema.safeParse({ message: "Kick-off done" }).success).toBe(true);
  });
});
