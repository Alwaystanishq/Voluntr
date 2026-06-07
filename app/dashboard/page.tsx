"use client";

import axios from "axios";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { signOut, useSession } from "next-auth/react";

import { useEffect, useState } from "react";

interface EventType {
  _id: string;
  title: string;
  description: string;
  date: string;
  enrolledUsers: string[];
}

interface OrganizationType {
  _id: string;
  name: string;
  email: string;
  events: EventType[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [organization, setOrganization] = useState<OrganizationType | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    if (session.user.role !== "ngo") {
      router.push("/explore");
    }
  }, [session, router]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchOrganization = async () => {
      try {
        const res = await axios.get(`/api/organizations/${session.user.id}`);

        setOrganization(res.data.organization);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [session]);

  const handleDelete = async (eventId: string) => {
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

      alert("Failed to delete event");
    }
  };

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/",
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 via-white to-blue-50">
        <h1 className="text-3xl font-bold text-black">Loading...</h1>
      </main>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50 px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-bold text-black">NGO Dashboard</h1>

              <p className="text-gray-600 mt-2">
                Welcome, {organization?.name}
              </p>
            </div>

            <div className="flex gap-4">
              <Link href="/create-event">
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-xl">
                  Create Event
                </button>
              </Link>

              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 rounded-xl"
              >
                Logout
              </button>
            </div>
          </div>

          {!organization?.events || organization.events.length === 0 ? (
            <h1 className="text-center text-2xl font-semibold text-black">
              No Events Created
            </h1>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {organization.events.map((event) => (
                <div
                  key={event._id}
                  className="bg-white p-6 rounded-2xl shadow-md border border-orange-100"
                >
                  <h2 className="text-2xl font-bold text-black mb-3">
                    {event.title}
                  </h2>

                  <p className="text-gray-600 mb-4">{event.description}</p>

                  <p className="text-sm text-gray-500 mb-4">
                    {new Date(event.date).toDateString()}
                  </p>

                  <p className="text-sm font-semibold text-black mb-6">
                    Enrolled Users: {event.enrolledUsers.length}
                  </p>

                  <button
                    onClick={() => handleDelete(event._id)}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 rounded-lg"
                  >
                    Delete
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
