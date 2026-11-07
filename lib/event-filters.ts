import { EVENT_CATEGORIES } from "@/types/event";

export function literalPattern(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseEventFilters(params: URLSearchParams, now = new Date()) {
  const q = (params.get("q") || "").trim();
  const location = (params.get("location") || "").trim();
  const category = params.get("category") || "";
  if (q.length > 200 || location.length > 200) throw new Error("Search and location must be under 200 characters.");
  if (category && !EVENT_CATEGORIES.includes(category as typeof EVENT_CATEGORIES[number])) throw new Error("Invalid cause category.");
  const page = Number(params.get("page") || 1);
  if (!Number.isSafeInteger(page) || page < 1 || page > 10000) throw new Error("Invalid page number.");
  const scope = params.get("scope") || "upcoming";
  if (!["upcoming", "all", "past"].includes(scope)) throw new Error("Invalid event period.");
  const sort = params.get("sort") || "soonest";
  if (!["soonest", "newest"].includes(sort)) throw new Error("Invalid sort order.");
  const available = params.get("available") || "false";
  if (!["true", "false"].includes(available)) throw new Error("Invalid availability filter.");
  const from = params.get("from") ? new Date(params.get("from")!) : null;
  const to = params.get("to") ? new Date(params.get("to")!) : null;
  if ((from && !Number.isFinite(from.getTime())) || (to && !Number.isFinite(to.getTime()))) throw new Error("Invalid date range.");
  if (from && to && from >= to) throw new Error("End date must be on or after start date.");

  const conditions: Record<string, unknown>[] = [];
  if (scope === "upcoming" || available === "true") conditions.push({ date: { $gt: now } });
  if (scope === "past") conditions.push({ date: { $lte: now } });
  if (from) conditions.push({ date: { $gte: from } });
  if (to) conditions.push({ date: { $lt: to } });
  if (category) conditions.push({ category });
  if (location) conditions.push({ location: { $regex: literalPattern(location), $options: "i" } });
  if (available === "true") {
    conditions.push({ $or: [{ registrationDeadline: null }, { registrationDeadline: { $gt: now } }] });
    conditions.push({ $expr: { $or: [
      { $eq: [{ $ifNull: ["$capacity", null] }, null] },
      { $lt: [{ $size: { $ifNull: ["$enrolledUsers", []] } }, "$capacity"] },
    ] } });
  }
  return { q, page, sort, conditions, pageSize: 12 };
}
