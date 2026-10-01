const marketDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const formatMultiple = (value: number | null | undefined) =>
  value == null || !Number.isFinite(value) ? "--" : `${value.toFixed(2)}x`;

export function formatUpdatedAt(value: string | undefined): string {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatClosingDate(value: string | null | undefined): string {
  if (!value) return "--";
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function isClosingToday(
  value: string | null,
  now = new Date(),
): boolean {
  if (!value) return false;
  const parts = marketDate.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value;
  return value === `${part("year")}-${part("month")}-${part("day")}`;
}
