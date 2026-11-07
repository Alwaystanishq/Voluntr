"use client";

import axios from "axios";
import { EventCover, EventInformation } from "@/components/EventInformation";
import type { EventDetails } from "@/types/event";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

import { useEffect, useState } from "react";

interface EventType extends EventDetails {
  _id: string;
  title: string;
  description: string;
  date: string;
  enrolledUsers: string[];
  waitlistCount?: number;
}

interface OrganizationType {
  _id: string;
  name: string;
  email: string;
  events: EventType[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [organization, setOrganization] = useState<OrganizationType | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/ngo/login");
    if (!session) return;

    if (session.user.role !== "ngo") {
      router.replace("/volunteer/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (!session?.user?.id || session.user.role !== "ngo") return;

    const fetchOrganization = async () => {
      try {
        const res = await axios.get(`/api/organizations/${session.user.id}`);

        setOrganization(res.data.organization);
      } catch (error) {
        console.log(error);
        setError("Could not load your dashboard. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [session]);

  const handleDelete = async (eventId: string) => {
    if (!window.confirm("Delete this event? This cannot be undone.")) return;
    setDeleting(eventId);
    setError("");
    try {
      const res = await axios.delete(`/api/events/${eventId}`);

      if (res.data.success) {
        setOrganization((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            events: prev.events.filter((event) => event._id !== eventId),
          };
        });
      }
    } catch (error) {
      console.log(error);

      setError("Could not delete the event. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <><Navbar /><main id="main-content" className="workspace page-container"><p className="eyebrow mb-6">YOUR COMMUNITY, IN MOTION</p><div role="status"><span className="sr-only">Loading your dashboard…</span><div className="loading-grid" aria-hidden="true">{[1,2,3].map(item => <div className="loading-card" key={item} />)}</div></div></main></>;

  return (
    <>
      <Navbar />

      <main className="workspace dashboard-workspace page-container">
        <div className="max-w-7xl mx-auto">
          <div className="workspace-heading">
            <div>
              <p className="eyebrow">YOUR COMMUNITY, IN MOTION</p><h1>Make good happen<span>.</span></h1>

              <p className="text-gray-600 mt-2">
                Welcome, {organization?.name}
              </p>
            </div>

            <div className="flex flex-wrap gap-3"><Link href="/profile" className="button button-outline">Organization profile ↗</Link><Link href="/create-event" className="button button-primary">Create an event +</Link></div>
          </div>
          {error && <p role="alert" className="workspace-error mb-6">{error}</p>}
          {organization && <div className="organization-stats"><div className="workspace-stat"><p className="stat-number">{organization.events?.length || 0}</p><p>Events created</p></div><div className="workspace-stat"><p className="stat-number">{(organization.events || []).reduce((total, event) => total + event.enrolledUsers.length, 0)}</p><p>Total enrollments</p></div><div className="workspace-stat"><p className="stat-number">{(organization.events || []).reduce((total, event) => total + (event.waitlistCount || 0), 0)}</p><p>Waitlist entries</p></div></div>}
          <div className="panel-heading"><div><p className="eyebrow">PURPOSE INTO ACTION</p><h2>Your events</h2></div></div>

          {!organization?.events || organization.events.length === 0 ? (
            <div className="workspace-empty"><span aria-hidden="true">↟</span><h3>Every movement starts with one event.</h3><p>Create an opportunity and invite your community to make a difference.</p><Link href="/create-event" className="button button-primary">Create your first event ↗</Link></div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {organization.events.map((event) => (
                <div
                  key={event._id}
                  className="workspace-event"
                >
                  <EventCover src={event.coverImage} title={event.title} />
                  <h2 className="text-2xl font-bold text-black mb-3">
                    {event.title}
                  </h2>

                  <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>

                  <EventInformation event={event} compact />

                  <p className="text-sm font-semibold text-black mb-6">
                    Enrolled: {event.enrolledUsers.length}{event.capacity != null ? ` / ${event.capacity}` : ""} · Waitlist: {event.waitlistCount || 0}
                  </p>

                  <Link href={`/explore/${event._id}`} className="mb-3 block text-center font-medium text-blue-700 underline">View event</Link>
                  <button
                    disabled={deleting !== null}
                    onClick={() => handleDelete(event._id)}
                    className="delete-event"
                  >
                    {deleting === event._id ? "Deleting…" : "Delete event"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
