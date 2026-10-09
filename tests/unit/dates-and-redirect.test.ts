import { describe, expect, it } from "vitest";
import { addDaysUtc, formatDate, isOverdue, startOfDayUtc, toDateInputValue } from "@/lib/dates";
import { safeCallbackUrl } from "@/lib/redirect";

const now = new Date("2026-10-08T15:30:00.000Z");

describe("dates", () => {
  it("formats calendar dates in UTC", () => {
    expect(formatDate(new Date("2026-11-01T00:00:00.000Z"))).toBe("1 Nov 2026");
    expect(formatDate(null)).toBe("—");
  });

  it("round-trips a date through an <input type=date> value", () => {
    expect(toDateInputValue(new Date("2026-11-01T00:00:00.000Z"))).toBe("2026-11-01");
    expect(toDateInputValue(null)).toBe("");
  });

  it("computes day boundaries in UTC", () => {
    expect(startOfDayUtc(now)).toEqual(new Date("2026-10-08T00:00:00.000Z"));
    expect(addDaysUtc(now, 14)).toEqual(new Date("2026-10-22T00:00:00.000Z"));
  });

  it("treats today as not overdue and yesterday as overdue", () => {
    expect(isOverdue(new Date("2026-10-08T00:00:00.000Z"), now)).toBe(false);
    expect(isOverdue(new Date("2026-10-07T00:00:00.000Z"), now)).toBe(true);
  });
});

describe("safeCallbackUrl", () => {
  it("keeps in-app paths", () => {
    expect(safeCallbackUrl("/projects/abc?x=1")).toBe("/projects/abc?x=1");
  });

  it.each([undefined, null, "", "projects", "https://evil.example", "//evil.example", "/\\evil.example"])(
    "falls back to / for %j",
    (value) => {
      expect(safeCallbackUrl(value)).toBe("/");
    },
  );
});
