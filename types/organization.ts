import type { EventDetails } from "@/types/event";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";
export interface OrganizationProfile {
  _id: string;
  name: string;
  description?: string;
  mission?: string;
  website?: string;
  logo?: string;
  location?: string;
  createdAt?: string;
  verificationStatus?: VerificationStatus;
  verifiedAt?: string;
  email?: string;
  registrationNumber?: string;
  verificationDocument?: string;
  verificationNote?: string;
  events?: EventDetails[];
}
