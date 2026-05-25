"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface EventType {
  _id: string;
  title: string;
  description: string;
  date: string;
}

export default function EventDetailsPage() {
  const params = useParams();

  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`/api/events/${params.id}`);

        setEvent(res.data.event);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

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
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50 px-6 py-10">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-orange-100">
        <h1 className="text-5xl font-bold text-black mb-6">{event.title}</h1>

        <p className="text-gray-700 text-lg leading-8 mb-8">
          {event.description}
        </p>

        <p className="text-gray-500 text-lg mb-10">
          {new Date(event.date).toDateString()}
        </p>

        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl text-lg font-semibold">
          Enroll Now
        </button>
      </div>
    </main>
  );
}
