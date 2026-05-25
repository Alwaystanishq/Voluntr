"use client";

import axios from "axios";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface EventType {
  _id: string;
  title: string;
  description: string;
  date: string;
}

export default function ExplorePage() {
  const { data: session } = useSession();

  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("/api/events");

        setEvents(res.data.events);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/",
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-black">Explore Events</h1>

            <p className="text-gray-600 mt-2">Welcome, {session?.user?.name}</p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 rounded-xl"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <h1 className="text-center text-2xl font-semibold text-black">
            Loading...
          </h1>
        ) : events.length === 0 ? (
          <h1 className="text-center text-2xl font-semibold text-black">
            No Events Found
          </h1>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link href={`/explore/${event._id}`} key={event._id}>
                <div className="bg-white p-6 rounded-2xl shadow-md border border-orange-100 hover:-translate-y-1 hover:shadow-xl transition cursor-pointer">
                  <h2 className="text-2xl font-bold text-black mb-3">
                    {event.title}
                  </h2>

                  <p className="text-gray-600 mb-4">{event.description}</p>

                  <p className="text-sm text-gray-500 mb-6">
                    {new Date(event.date).toDateString()}
                  </p>

                  <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg">
                    View Details
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
