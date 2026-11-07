import { EVENT_CATEGORIES } from "@/types/event";

const fields = ["title", "description", "date", "endDate", "location", "category", "requiredSkills", "capacity", "registrationDeadline", "coverImage"] as const;

export function parseEvent(input: unknown, existing: Record<string, unknown> = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid event data.");
  const body = input as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  for (const field of fields) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  const merged = { ...existing, ...data };
  for (const field of ["title", "description", "location", "category", "coverImage"]) {
    const value = merged[field];
    if (value != null && (typeof value !== "string" || value.length > (field === "description" ? 10000 : 2000))) throw new Error(`Invalid ${field}.`);
    if (typeof data[field] === "string") data[field] = data[field].trim();
  }
  if (typeof merged.title !== "string" || !merged.title.trim()) throw new Error("Event title is required.");
  const dateValue = (value: unknown) => value instanceof Date ? value.getTime() : typeof value === "string" ? Date.parse(value) : NaN;
  const start = dateValue(merged.date);
  if (!Number.isFinite(start)) throw new Error("A valid start date and time is required.");
  if (merged.endDate && (!Number.isFinite(dateValue(merged.endDate)) || dateValue(merged.endDate) <= start)) throw new Error("End time must be after the start time.");
  if (merged.registrationDeadline && (!Number.isFinite(dateValue(merged.registrationDeadline)) || dateValue(merged.registrationDeadline) > start)) throw new Error("Registration deadline must be on or before the start time.");
  if (merged.category && !EVENT_CATEGORIES.includes(merged.category as typeof EVENT_CATEGORIES[number])) throw new Error("Choose a valid cause category.");
  if (merged.capacity != null && (!Number.isSafeInteger(merged.capacity) || Number(merged.capacity) < 1)) throw new Error("Capacity must be a positive whole number.");
  if (merged.requiredSkills != null && (!Array.isArray(merged.requiredSkills) || merged.requiredSkills.length > 20 || merged.requiredSkills.some((skill: unknown) => typeof skill !== "string" || !skill.trim() || skill.length > 100))) throw new Error("Enter up to 20 skills, each under 100 characters.");
  if (merged.coverImage) {
    try {
      if (new URL(String(merged.coverImage)).protocol !== "https:") throw new Error();
    } catch { throw new Error("Cover image must be a valid HTTPS URL."); }
  }
  return data;
}
