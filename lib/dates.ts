/**
 * Date helpers. Project and milestone dates are calendar dates without a time, stored
 * at UTC midnight, so every helper here works in UTC to avoid off-by-one-day shifts.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

/** Format a calendar date, e.g. "1 Nov 2026". Returns an em dash for missing values. */
export function formatDate(date: Date | null | undefined): string {
  return date ? dateFormatter.format(date) : "—";
}

/** Format a timestamp in UTC, e.g. "1 Nov 2026, 14:30". */
export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

/** Value for an `<input type="date">` (YYYY-MM-DD), or an empty string. */
export function toDateInputValue(date: Date | null | undefined): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

/** Midnight (UTC) of the day containing `now`. */
export function startOfDayUtc(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** The calendar date `days` days after the day containing `now`, at UTC midnight. */
export function addDaysUtc(now: Date, days: number): Date {
  return new Date(startOfDayUtc(now).getTime() + days * MS_PER_DAY);
}

/** True if the calendar date is before today. */
export function isOverdue(dueDate: Date, now: Date): boolean {
  return dueDate.getTime() < startOfDayUtc(now).getTime();
}
