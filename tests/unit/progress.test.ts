import { describe, expect, it } from "vitest";
import { calculateProgress } from "@/lib/services/progress";

const done = { completedAt: new Date("2026-01-01") };
const open = { completedAt: null };

describe("calculateProgress", () => {
  it("is 0 for a project without milestones", () => {
    expect(calculateProgress([])).toBe(0);
  });

  it("is 0 when nothing is completed", () => {
    expect(calculateProgress([open, open])).toBe(0);
  });

  it("is 100 when everything is completed", () => {
    expect(calculateProgress([done, done, done])).toBe(100);
  });

  it("is the rounded share of completed milestones", () => {
    expect(calculateProgress([done, open])).toBe(50);
    expect(calculateProgress([done, open, open])).toBe(33);
    expect(calculateProgress([done, done, open])).toBe(67);
  });
});
