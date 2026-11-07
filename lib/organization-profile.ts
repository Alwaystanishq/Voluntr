export const PUBLIC_ORGANIZATION_FIELDS = "name description mission website logo location createdAt verificationStatus verifiedAt";
export const PRIVATE_ORGANIZATION_FIELDS = "email registrationNumber verificationDocument verificationNote verificationRequestedAt";

export function parseOrganizationProfile(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid profile data.");
  const body = input as Record<string, unknown>;
  const data: Record<string, string> = {};
  for (const [field, limit] of Object.entries({ name: 150, description: 5000, mission: 3000, website: 2000, logo: 2000, location: 300, registrationNumber: 200, verificationDocument: 2000 })) {
    if (body[field] === undefined) continue;
    if (typeof body[field] !== "string" || body[field].length > limit) throw new Error(`Invalid ${field} (maximum ${limit} characters).`);
    data[field] = body[field].trim();
  }
  if (data.name !== undefined && !data.name) throw new Error("Organization name is required.");
  for (const field of ["website", "logo", "verificationDocument"]) {
    if (!data[field]) continue;
    try { if (new URL(data[field]).protocol !== "https:") throw new Error(); }
    catch { throw new Error(`${field} must be a valid HTTPS URL.`); }
  }
  return data;
}
