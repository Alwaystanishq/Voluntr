"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { OrganizationProfile } from "@/types/organization";

type Review = OrganizationProfile & { updatedAt: string };
export default function OrganizationReviewQueue() {
  const [requests, setRequests] = useState<Review[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError("");
      try {
        const res = await axios.get("/api/admin/organizations", { signal: controller.signal });
        if (!controller.signal.aborted) setRequests(res.data.organizations);
      } catch { if (!controller.signal.aborted) setError("Could not load requests. Check your admin access and retry."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [revision]);

  async function review(organization: Review, status: "verified" | "rejected") {
    setBusy(organization._id); setError(""); setMessage("");
    try {
      const res = await axios.put(`/api/admin/organizations/${organization._id}`, { status, note: notes[organization._id] || "", version: organization.updatedAt });
      setRequests((previous) => previous.filter((item) => item._id !== organization._id));
      setMessage(res.data.message);
    } catch (error) { setError(axios.isAxiosError(error) ? error.response?.data?.message || "Could not review request." : "Could not review request."); }
    finally { setBusy(null); }
  }
  return <section>
    <button onClick={() => setRevision((value) => value + 1)} disabled={!!busy} className="mb-5 text-blue-700 underline">Refresh queue</button>
    {error && <p role="alert" className="mb-5 text-red-700">{error}</p>}
    {message && <p role="status" className="mb-5 text-green-700">{message}</p>}
    {loading ? <p role="status">Loading requests…</p> : requests.length === 0 ? <p className="rounded-xl bg-white p-8 text-gray-600">No pending requests.</p> : <div className="space-y-6">{requests.map((organization) => <article key={organization._id} className="rounded-2xl border border-orange-100 bg-white p-6">
      <Link href={`/organizations/${organization._id}`} className="text-xl font-bold text-blue-700 underline">{organization.name}</Link>
      <p className="mt-3 whitespace-pre-wrap text-gray-700">{organization.mission}</p>
      <p className="mt-3 text-gray-700">Registration number: {organization.registrationNumber}</p>
      <p className="mt-2 text-gray-700">Account email: {organization.email}</p>
      <div className="my-4 flex flex-wrap gap-5">{organization.website && <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Website ↗</a>}{organization.verificationDocument && <a href={organization.verificationDocument} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Supporting document ↗</a>}</div>
      <label className="block text-sm font-medium text-gray-800">Reviewer note (required when rejecting)<textarea maxLength={2000} value={notes[organization._id] || ""} onChange={(event) => setNotes((previous) => ({ ...previous, [organization._id]: event.target.value }))} className="mt-2 w-full rounded-xl border border-gray-300 p-3" /></label>
      <div className="mt-4 flex gap-3"><button disabled={!!busy} onClick={() => review(organization, "verified")} className="rounded-xl bg-green-700 px-5 py-2 text-white disabled:opacity-50">Approve verification</button><button disabled={!!busy || !notes[organization._id]?.trim()} onClick={() => review(organization, "rejected")} className="rounded-xl border border-red-300 px-5 py-2 text-red-700 disabled:opacity-50">Reject request</button></div>
    </article>)}</div>}
  </section>;
}
