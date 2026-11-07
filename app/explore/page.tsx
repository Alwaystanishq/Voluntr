"use client";

import axios from "axios";
import { EventCover, EventInformation } from "@/components/EventInformation";
import { EVENT_CATEGORIES, type EventDetails } from "@/types/event";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import Navbar from "@/components/Navbar";
import { VerificationBadge } from "@/components/OrganizationIdentity";
import type { VerificationStatus } from "@/types/organization";

interface EventType extends EventDetails {
  organization?: { name: string; verificationStatus?: VerificationStatus } | null;
}

export default function ExplorePage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [request, setRequest] = useState({ query: "", page: 1, revision: 0 });
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0, pageSize: 12 });
  const inputClass = "mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-black";

  useEffect(() => {
    const controller = new AbortController();
    const fetchEvents = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams(request.query);
        if (!request.query && request.revision === 0) {
          const category = new URLSearchParams(window.location.search).get("category");
          if (category && (EVENT_CATEGORIES as readonly string[]).includes(category)) params.set("category", category);
        }
        params.set("page", String(request.page));
        const res = await axios.get(`/api/events?${params}`, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setEvents(res.data.events);
        setPagination(res.data.pagination);
      } catch (error) {
        if (controller.signal.aborted) return;
        setError(axios.isAxiosError(error) ? error.response?.data?.message || "Could not load events. Please try again." : "Could not load events. Please try again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void fetchEvents();
    return () => controller.abort();
  }, [request]);

  useEffect(() => {
    const category = new URLSearchParams(window.location.search).get("category");
    const select = document.querySelector<HTMLSelectElement>('select[name="category"]');
    if (select && category && (EVENT_CATEGORIES as readonly string[]).includes(category)) select.value = category;
  }, []);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of form.entries()) {
      if (typeof value === "string" && value.trim()) params.set(key, value.trim());
    }
    const from = String(form.get("from") || "");
    const to = String(form.get("to") || "");
    if (from && to && from > to) {
      setFormError("End date must be on or after start date.");
      return;
    }
    // Convert local calendar boundaries to UTC; the end boundary is exclusive.
    if (from) params.set("from", new Date(`${from}T00:00:00`).toISOString());
    if (to) {
      const end = new Date(`${to}T00:00:00`);
      end.setDate(end.getDate() + 1);
      params.set("to", end.toISOString());
    }
    setFormError("");
    setLoading(true);
    setRequest((prev) => ({ query: params.toString(), page: 1, revision: prev.revision + 1 }));
  }

  function changePage(page: number) {
    setLoading(true);
    setRequest((prev) => ({ ...prev, page }));
  }

  return (
    <>
      <Navbar />
      <main className="explore-main min-h-screen px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="explore-intro"><p className="eyebrow mb-3">FIND YOUR NEXT MEANINGFUL MOMENT</p><h1 className="text-4xl font-bold">A little time. A lasting difference.</h1></div>
          <p className="mt-2 mb-8 text-gray-600">Find your people, follow your cause, and make room for a little good.</p>

          <form onSubmit={applyFilters} onReset={() => {
            setFormError("");
            setLoading(true);
            setRequest((prev) => ({ query: "", page: 1, revision: prev.revision + 1 }));
          }} className="explore-form mb-8 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm font-medium text-gray-800">Search
                <input type="search" name="q" maxLength={200} placeholder="Event title or NGO" className={inputClass} />
              </label>
              <label className="text-sm font-medium text-gray-800">Location
                <input name="location" maxLength={200} placeholder="City, venue, or online" className={inputClass} />
              </label>
              <label className="text-sm font-medium text-gray-800">Cause
                <select name="category" className={inputClass}>
                  <option value="">All causes</option>
                  {EVENT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium text-gray-800">Event period
                <select name="scope" defaultValue="upcoming" className={inputClass}>
                  <option value="upcoming">Upcoming events</option>
                  <option value="all">All events</option>
                  <option value="past">Past events</option>
                </select>
              </label>
              <label className="text-sm font-medium text-gray-800">From date
                <input type="date" name="from" className={inputClass} />
              </label>
              <label className="text-sm font-medium text-gray-800">Through date
                <input type="date" name="to" className={inputClass} />
              </label>
              <label className="text-sm font-medium text-gray-800">Sort by
                <select name="sort" defaultValue="soonest" className={inputClass}>
                  <option value="soonest">Soonest first</option>
                  <option value="newest">Recently added</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <input type="checkbox" name="available" value="true" className="h-4 w-4" /> Open registration with spots available
              </label>
            </div>
            {formError && <p role="alert" className="mt-3 text-red-700">{formError}</p>}
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="submit" className="explore-submit rounded-xl bg-blue-600 px-5 py-2 font-medium text-white">Search events</button>
              <button type="reset" className="rounded-xl border border-gray-300 px-5 py-2 text-gray-700">Reset filters</button>
            </div>
          </form>

          <section aria-label="Event results" aria-busy={loading}>
            {loading ? <div role="status"><span className="sr-only">Loading events…</span><div className="loading-grid" aria-hidden="true">{[1, 2, 3].map(item => <div className="loading-card" key={item} />)}</div></div>
              : error ? <div role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
                <p>{error}</p>
                <button onClick={() => setRequest((prev) => ({ ...prev, revision: prev.revision + 1 }))} className="mt-3 underline">Try again</button>
              </div>
              : <>
                <p role="status" className="mb-5 text-gray-600">{pagination.total} {pagination.total === 1 ? "event" : "events"} found</p>
                {events.length === 0 ? <div className="rounded-2xl border border-orange-100 bg-white p-10 text-center">
                  <h2 className="text-xl font-semibold text-black">No matching events</h2>
                  <p className="mt-2 text-gray-600">Try a broader search, another date range, or reset the filters.</p>
                </div> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((event) => <Link href={`/explore/${event._id}`} key={event._id} className="event-card rounded-2xl border border-orange-100 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
                    <EventCover src={event.coverImage} title={event.title} />
                    <h2 className="mb-2 text-2xl font-bold text-black">{event.title}</h2>
                    {event.organization?.name && <div className="mb-3 space-y-2"><p className="text-sm font-medium text-blue-700">By {event.organization.name}</p><VerificationBadge status={event.organization.verificationStatus} /></div>}
                    <p className="mb-4 line-clamp-3 text-gray-600">{event.description}</p>
                    <EventInformation event={event} compact />
                    <span className="event-details-link block rounded-lg bg-blue-600 py-2 text-center text-white">View details</span>
                  </Link>)}
                </div>}
                {pagination.totalPages > 1 && <nav aria-label="Results pagination" className="mt-8 flex items-center justify-center gap-4 text-gray-800">
                  <button disabled={request.page <= 1} onClick={() => changePage(request.page - 1)} className="rounded-xl border bg-white px-4 py-2 disabled:opacity-40">Previous</button>
                  <span>Page {request.page} of {pagination.totalPages}</span>
                  <button disabled={request.page >= pagination.totalPages} onClick={() => changePage(request.page + 1)} className="rounded-xl border bg-white px-4 py-2 disabled:opacity-40">Next</button>
                </nav>}
              </>}
          </section>
        </div>
      </main>
    </>
  );
}
