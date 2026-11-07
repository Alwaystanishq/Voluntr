"use client";

import { useState } from "react";
import type { VerificationStatus } from "@/types/organization";

export function VerificationBadge({ status }: { status?: VerificationStatus }) {
  const verified = status === "verified";
  return <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${verified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>{verified ? "✓ Verified NGO" : status === "pending" ? "Verification pending" : "Not verified"}</span>;
}

export function OrganizationLogo({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-3xl font-bold text-orange-700" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={`${name} logo`} referrerPolicy="no-referrer" onError={() => setFailed(true)} className="h-20 w-20 shrink-0 rounded-2xl border border-gray-100 bg-white object-contain" />;
}
