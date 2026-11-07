"use client";

import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { OrganizationLogo, VerificationBadge } from "@/components/OrganizationIdentity";
import { EventCover, EventInformation } from "@/components/EventInformation";
import { groupVolunteerEvents } from "@/lib/volunteer-events";
import type { OrganizationProfile } from "@/types/organization";

export default function OrganizationPage() {
  const { id } = useParams<{ id: string }>();
  const [organization, setOrganization] = useState<OrganizationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [showPast, setShowPast] = useState(false);
  const [now] = useState(() => new Date());
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError("");
      try {
        const res = await axios.get(`/api/organizations/${id}`, { signal: controller.signal });
        if (!controller.signal.aborted) setOrganization(res.data.organization);
      } catch (error) {
        if (!controller.signal.aborted) setError(axios.isAxiosError(error) && [400, 404].includes(error.response?.status || 0) ? "Organization not found." : "Could not load this profile. Please try again.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [id, revision]);
  const events = groupVolunteerEvents(organization?.events || [], now);
  const visible = showPast ? events.past : events.upcoming;

  return <><Navbar /><main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50 px-4 py-10 sm:px-6"><div className="mx-auto max-w-6xl">
    {loading ? <p role="status" className="py-12 text-center text-gray-700">Loading NGO profile…</p> : error ? <div role="alert" className="rounded-xl bg-red-50 p-5 text-red-700"><p>{error}</p><button onClick={() => setRevision((value) => value + 1)} className="mt-3 underline">Try again</button></div> : organization && <>
      <section className="mb-8 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-10">
        <div className="flex flex-wrap items-center gap-5">
          <OrganizationLogo key={organization.logo} src={organization.logo} name={organization.name} />
          <div><h1 className="mb-3 text-3xl font-bold text-black sm:text-4xl">{organization.name}</h1><VerificationBadge status={organization.verificationStatus} /></div>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-600">
          {organization.location && <p>{organization.location}</p>}
          {organization.createdAt && <p>On Voluntr since {new Date(organization.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>}
          {organization.website && <a href={organization.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 underline">Visit website ↗</a>}
        </div>
        <p className="mt-5 text-sm text-gray-600">{organization.verificationStatus === "verified" ? "Registration evidence has been reviewed by a Voluntr administrator." : "This NGO has not completed Voluntr’s verification review."}</p>
        <h2 className="mb-2 mt-8 text-xl font-bold text-black">Our mission</h2>
        <p className="whitespace-pre-wrap break-words text-gray-700">{organization.mission || "This NGO has not added its mission yet."}</p>
        {organization.description && <><h2 className="mb-2 mt-6 text-xl font-bold text-black">About us</h2><p className="whitespace-pre-wrap break-words text-gray-700">{organization.description}</p></>}
      </section>
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-orange-100 bg-white p-5"><p className="text-3xl font-bold text-blue-700">{events.upcoming.length}</p><p className="text-gray-600">Upcoming & ongoing events</p></div>
        <div className="rounded-2xl border border-orange-100 bg-white p-5"><p className="text-3xl font-bold text-orange-600">{events.past.length}</p><p className="text-gray-600">Past events</p></div>
      </div>
      <div role="group" aria-label="Event history" className="mb-6 flex flex-wrap gap-3">{[false, true].map((past) => <button key={String(past)} onClick={() => setShowPast(past)} aria-pressed={showPast === past} className={`rounded-xl px-5 py-2 ${showPast === past ? "bg-blue-600 text-white" : "border bg-white text-gray-700"}`}>{past ? "Past events" : "Upcoming & ongoing"}</button>)}</div>
      <h2 className="mb-5 text-2xl font-bold text-black">{showPast ? "Past events" : "Upcoming & ongoing events"}</h2>
      {visible.length === 0 ? <p className="rounded-2xl bg-white p-8 text-center text-gray-600">No {showPast ? "past" : "upcoming"} events yet.</p> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{visible.map((event) => <Link key={event._id} href={`/explore/${event._id}`} className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm transition hover:shadow-lg"><EventCover src={event.coverImage} title={event.title} /><h3 className="mb-3 text-xl font-bold text-black">{event.title}</h3><p className="mb-4 line-clamp-3 text-gray-600">{event.description}</p><EventInformation event={event} compact /><span className="font-medium text-blue-700">View event →</span></Link>)}</div>}
    </>}
  </div></main></>;
}
