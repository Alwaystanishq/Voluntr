"use client";

import axios from "axios";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { EventCover, EventInformation } from "@/components/EventInformation";
import SaveEventButton from "@/components/SaveEventButton";
import EnrollmentControls from "@/components/EnrollmentControls";
import { eventCalendar } from "@/lib/volunteer-events";
import type { EventDetails } from "@/types/event";

type VolunteerEvent = EventDetails & { organization?: { name: string } | null };
type Dashboard = { upcoming: VolunteerEvent[]; past: VolunteerEvent[]; saved: VolunteerEvent[]; waitlisted: VolunteerEvent[] };
type View = keyof Dashboard;
const labels: Record<View, string> = { upcoming: "Upcoming & ongoing", past: "Past events", saved: "Saved opportunities", waitlisted: "Waitlist" };

function downloadCalendar(event: VolunteerEvent) {
  const url = URL.createObjectURL(new Blob([eventCalendar(event)], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `voluntr-${event._id}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function VolunteerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [view, setView] = useState<View>("upcoming");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/user/login");
    else if (session?.user.role === "ngo") router.replace("/dashboard");
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user.role !== "user") return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get<Dashboard>("/api/volunteer/dashboard", { signal: controller.signal });
        if (!controller.signal.aborted) setData(res.data);
      } catch (error) {
        if (!controller.signal.aborted) setError(axios.isAxiosError(error) ? error.response?.data?.message || "Could not load your dashboard." : "Could not load your dashboard.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [session?.user.id, session?.user.role, revision]);

  return <>
    <Navbar />
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-black sm:text-4xl">Volunteer Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome, {session?.user.name}. Keep track of your volunteering journey.</p>
          </div>
          <Link href="/explore" className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white">Find opportunities</Link>
        </div>
        <button onClick={() => setRevision((value) => value + 1)} disabled={loading} className="mb-6 text-sm font-medium text-blue-700 underline disabled:opacity-50">Refresh dashboard</button>
        {loading || session?.user.role !== "user" ? <p role="status" className="py-12 text-center text-gray-700">Loading your dashboard…</p>
          : error ? <div role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
            <p>{error}</p>
            <button onClick={() => setRevision((value) => value + 1)} className="mt-3 underline">Try again</button>
          </div>
          : data && <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.keys(labels) as View[]).map((key) => <div key={key} className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                <p className="text-3xl font-bold text-blue-700">{data[key].length}</p>
                <p className="mt-2 text-gray-600">{labels[key]}</p>
              </div>)}
            </div>
            {data.upcoming[0] && <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-blue-900">
              <p className="text-sm font-semibold">Your next commitment</p>
              <Link href={`/explore/${data.upcoming[0]._id}`} className="mt-1 block text-xl font-bold underline">{data.upcoming[0].title}</Link>
              <p className="mt-2">{new Date(data.upcoming[0].date).toLocaleString()}{data.upcoming[0].location && ` · ${data.upcoming[0].location}`}</p>
            </div>}
            <div className="mb-6 flex flex-wrap gap-3" role="group" aria-label="Choose event list">
              {(Object.keys(labels) as View[]).map((key) => <button key={key} onClick={() => setView(key)} aria-pressed={view === key} className={`rounded-xl px-4 py-2 font-medium ${view === key ? "bg-blue-600 text-white" : "border border-gray-200 bg-white text-gray-700"}`}>{labels[key]} ({data[key].length})</button>)}
            </div>
            <h2 className="mb-2 text-2xl font-bold text-black">{labels[view]}</h2>
            <p className="mb-6 text-sm text-gray-600">{view === "past" ? "Your previous enrollments. Attendance and volunteer hours have not been verified." : view === "saved" ? "Saved events are bookmarks. Open an event to check availability and enroll." : view === "waitlisted" ? "Your place is not confirmed yet. Spots are offered in waitlist order while registration is open." : "Events you have enrolled in, including any currently in progress."}</p>
            {data[view].length === 0 ? <div className="rounded-2xl border border-orange-100 bg-white p-10 text-center">
              <p className="mb-4 text-gray-600">{view === "upcoming" ? "No upcoming commitments yet." : view === "past" ? "No past enrollments yet." : view === "waitlisted" ? "You are not waiting for any events." : "No saved opportunities yet. Use Save opportunity on an event page."}</p>
              <Link href="/explore" className="font-medium text-blue-700 underline">Explore events</Link>
            </div> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data[view].map((event) => <article key={`${view}-${event._id}`} className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                <EventCover src={event.coverImage} title={event.title} />
                <Link href={`/explore/${event._id}`} className="text-2xl font-bold text-black hover:underline">{event.title}</Link>
                {event.organization?.name && <p className="mt-2 text-sm text-blue-700">By {event.organization.name}</p>}
                <p className="my-4 line-clamp-3 text-gray-600">{event.description}</p>
                <EventInformation event={event} compact />
                <div className="flex flex-wrap items-start gap-3">
                  <Link href={`/explore/${event._id}`} className="rounded-xl bg-blue-600 px-5 py-2 font-medium text-white">View event</Link>
                  {view === "upcoming" && <button onClick={() => downloadCalendar(event)} className="rounded-xl border border-gray-300 px-5 py-2 text-gray-700">Add to calendar</button>}
                  {(view === "upcoming" || view === "waitlisted") && <EnrollmentControls eventId={event._id} onChanged={() => setRevision((value) => value + 1)} />}
                  {view === "saved" && <SaveEventButton eventId={event._id} initialSaved onRemoved={() => setData((previous) => previous ? { ...previous, saved: previous.saved.filter((item) => item._id !== event._id) } : previous)} />}
                </div>
              </article>)}
            </div>}
          </>}
      </div>
    </main>
  </>;
}
