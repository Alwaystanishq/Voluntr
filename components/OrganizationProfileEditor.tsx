"use client";

import axios from "axios";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { VerificationBadge } from "@/components/OrganizationIdentity";
import type { OrganizationProfile } from "@/types/organization";

export default function OrganizationProfileEditor({ initial, onSaved }: { initial: OrganizationProfile; onSaved?: (profile: OrganizationProfile) => void }) {
  const [profile, setProfile] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);
  const inputClass = "mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black";

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true); setError(""); setMessage("");
    try {
      const res = await axios.put(`/api/organizations/${profile._id}`, values);
      setProfile(res.data.updatedOrganization);
      onSaved?.(res.data.updatedOrganization);
      setDirty(false);
      setMessage("Profile saved.");
    } catch (error) { setError(axios.isAxiosError(error) ? error.response?.data?.message || "Could not save profile." : "Could not save profile."); }
    finally { setBusy(false); }
  }

  async function requestReview() {
    setBusy(true); setError(""); setMessage("");
    try {
      const res = await axios.post(`/api/organizations/${profile._id}/verification`);
      setProfile((previous) => ({ ...previous, verificationStatus: "pending", verificationNote: "" }));
      setMessage(res.data.message);
    } catch (error) { setError(axios.isAxiosError(error) ? error.response?.data?.message || "Could not request review." : "Could not request review."); }
    finally { setBusy(false); }
  }

  return <section className="mt-8 border-t border-orange-100 pt-8">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-2xl font-bold text-black">NGO trust profile</h2>
      <Link href={`/organizations/${profile._id}`} className="text-blue-700 underline">View public profile</Link>
    </div>
    <div className="mb-5"><VerificationBadge status={profile.verificationStatus} /></div>
    {profile.verificationNote && <p className="mb-4 rounded-xl bg-blue-50 p-4 text-gray-700">Reviewer note: {profile.verificationNote}</p>}
    {error && <p role="alert" className="mb-4 text-red-700">{error}</p>}
    {message && <p role="status" className="mb-4 text-green-700">{message}</p>}
    <form onSubmit={save} onChange={() => setDirty(true)} className="space-y-4">
      <fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
        <label className="block text-sm font-medium text-gray-800">Organization name<input name="name" defaultValue={profile.name} maxLength={150} required className={inputClass} /></label>
        <label className="block text-sm font-medium text-gray-800">About your NGO<textarea name="description" defaultValue={profile.description} maxLength={5000} rows={3} className={inputClass} /></label>
        <label className="block text-sm font-medium text-gray-800">Mission<textarea name="mission" defaultValue={profile.mission} maxLength={3000} rows={3} className={inputClass} /></label>
        <label className="block text-sm font-medium text-gray-800">Location<input name="location" defaultValue={profile.location} maxLength={300} className={inputClass} /></label>
        <label className="block text-sm font-medium text-gray-800">Website URL<input type="url" pattern="https://.*" name="website" defaultValue={profile.website} maxLength={2000} placeholder="https://your-ngo.org" className={inputClass} /></label>
        <label className="block text-sm font-medium text-gray-800">Logo URL<input type="url" pattern="https://.*" name="logo" defaultValue={profile.logo} maxLength={2000} placeholder="https://your-ngo.org/logo.png" className={inputClass} /></label>
        <h3 className="pt-3 text-lg font-semibold text-black">Verification evidence</h3>
        <p className="text-sm text-gray-600">Registration details and supporting links are shared only with your account and authorized reviewers. Changing your name, website, registration number or evidence resets verification.</p>
        <label className="block text-sm font-medium text-gray-800">Registration number<input name="registrationNumber" defaultValue={profile.registrationNumber} maxLength={200} className={inputClass} /></label>
        <label className="block text-sm font-medium text-gray-800">Supporting document URL<input type="url" pattern="https://.*" name="verificationDocument" defaultValue={profile.verificationDocument} maxLength={2000} placeholder="https://…" className={inputClass} /></label>
        <p className="text-sm text-gray-600">Provide an HTTPS link your reviewer can access. Save your changes before requesting verification.</p>
        <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white">{busy ? "Saving…" : "Save profile"}</button>
      </fieldset>
    </form>
    <button type="button" disabled={busy || dirty || profile.verificationStatus === "pending" || profile.verificationStatus === "verified"} onClick={requestReview} className="mt-4 rounded-xl border border-blue-300 px-5 py-3 font-medium text-blue-700 disabled:opacity-50">{profile.verificationStatus === "pending" ? "Awaiting review" : profile.verificationStatus === "verified" ? "Profile verified" : "Request verification"}</button>
  </section>;
}
