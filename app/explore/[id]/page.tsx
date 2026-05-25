"use client";

import axios from "axios";

import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

interface EventType {
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

  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`/api/events/${params.id}`);

        const fetchedEvent = res.data.event;

        setEvent(fetchedEvent);

        const alreadyEnrolled = fetchedEvent.enrolledUsers.some(
          (user: { _id: string }) => user._id === session?.user?.id,
        );

        setEnrolled(alreadyEnrolled);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchEvent();
    }
  }, [params.id, session]);

  const handleEnroll = async () => {
    try {
      const res = await axios.post(`/api/events/${params.id}/enroll`, {
        userId: session?.user?.id,
      });

      if (res.data.success) {
        setEnrolled(true);
      }

      alert(res.data.message);
    } catch (error) {
      console.log(error);

      alert("Enrollment failed");
    }
  };

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
          <h1 className="text-5xl font-bold text-black mb-6">{event.title}</h1>

          <p className="text-gray-700 text-lg leading-8 mb-8">
            {event.description}
          </p>

          <p className="text-gray-500 text-lg mb-10">
            {new Date(event.date).toDateString()}
          </p>

          <button
            onClick={handleEnroll}
            disabled={enrolled}
            className={`px-8 py-3 rounded-xl text-lg font-semibold text-white ${
              enrolled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-red-500"
            }`}
          >
            {enrolled ? "Enrolled" : "Enroll Now"}
          </button>
        </div>
      </main>
    </>
  );
}
