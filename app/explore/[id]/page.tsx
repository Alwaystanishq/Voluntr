"use client";

import axios from "axios";
import { EventCover, EventInformation } from "@/components/EventInformation";
import type { EventDetails } from "@/types/event";
import Navbar from "@/components/Navbar";
import SaveEventButton from "@/components/SaveEventButton";
import EnrollmentControls from "@/components/EnrollmentControls";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

interface EventType extends EventDetails {
  _id: string;
  title: string;
  description: string;
  date: string;
  enrolledUsers: {
    _id: string;
  }[];
}

export default function EventDetailsPage() {
  const params = useParams();

  const { data: session } = useSession();

  const [event, setEvent] = useState<EventType | null>(null);

  const [loading, setLoading] = useState(true);

  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`/api/events/${params.id}`);

        const fetchedEvent = res.data.event;

        setEvent(fetchedEvent);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchEvent();
    }
  }, [params.id, session, revision]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 via-white to-blue-50">
        <h1 className="text-3xl font-bold text-black">Loading...</h1>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 via-white to-blue-50">
        <h1 className="text-3xl font-bold text-black">Event Not Found</h1>
      </main>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50 px-6 py-10">
        <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-orange-100">
          <EventCover src={event.coverImage} title={event.title} />
          <h1 className="text-5xl font-bold text-black mb-6">{event.title}</h1>

          <p className="text-gray-700 text-lg leading-8 mb-8">
            {event.description}
          </p>

          <EventInformation event={event} />

          <p className="text-black font-semibold mb-8">
            Volunteers Enrolled: {event.enrolledUsers.length}
          </p>

          {session?.user?.role === "user" ? (
            <div className="flex flex-wrap items-start gap-3">
              <SaveEventButton eventId={event._id} />
              <EnrollmentControls key={event._id} eventId={event._id} onChanged={() => setRevision((value) => value + 1)} />
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-700 font-semibold">
                Total Volunteers Enrolled: {event.enrolledUsers.length}
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
