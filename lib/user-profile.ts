export const USER_PROFILE_FIELDS = "name email createdAt updatedAt";

export function parseUserName(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid profile data.");
  const body = input as Record<string, unknown>;
  if (Object.keys(body).some((key) => key !== "name")) throw new Error("Only your name can be updated through this endpoint.");
  if (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 150) throw new Error("Name must contain 1–150 characters.");
  return { name: body.name.trim() };
}
