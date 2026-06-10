"use client";

import axios from "axios";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { data: session } = useSession();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id || !session?.user?.role) return;

    const fetchProfile = async () => {
      try {
        const endpoint =
          session.user.role === "ngo"
            ? `/api/organizations/${session.user.id}`
            : `/api/users/${session.user.id}`;

        const res = await axios.get(endpoint);

        if (session.user.role === "ngo") {
          setProfile({
            ...res.data.organization,
            events: res.data.events,
          });
        } else {
          setProfile({
            ...res.data.user,
            enrolledEvents: res.data.enrolledEvents,
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h1 className="text-3xl font-bold text-black">Loading...</h1>
      </main>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50 px-6 py-10">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-orange-100">
          <h1 className="text-4xl font-bold text-black mb-6">My Profile</h1>

          <div className="space-y-3 mb-8">
            <p className="text-lg text-black">
              <span className="font-semibold">Name:</span> {profile?.name}
            </p>

            <p className="text-lg text-black">
              <span className="font-semibold">Email:</span> {profile?.email}
            </p>

            {session?.user?.role === "ngo" && (
              <p className="text-lg text-black">
                <span className="font-semibold">Description:</span>{" "}
                {profile?.description || "No description"}
              </p>
            )}
          </div>

          {session?.user?.role === "ngo" ? (
            <>
              <h2 className="text-2xl font-bold text-black mb-4">
                Created Events ({profile?.events?.length || 0})
              </h2>

              {profile?.events?.length === 0 ? (
                <p className="text-gray-600">No events created yet.</p>
              ) : (
                <div className="space-y-4">
                  {profile.events.map((event: any) => (
                    <div
                      key={event._id}
                      className="border border-orange-100 rounded-xl p-4"
                    >
                      <h3 className="text-xl font-semibold text-black">
                        {event.title}
                      </h3>

                      <p className="text-gray-600 mt-2">{event.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-black mb-4">
                Enrolled Events ({profile?.enrolledEvents?.length || 0})
              </h2>

              {profile?.enrolledEvents?.length === 0 ? (
                <p className="text-gray-600">
                  You haven't enrolled in any events yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {profile.enrolledEvents.map((event: any) => (
                    <div
                      key={event._id}
                      className="border border-orange-100 rounded-xl p-4"
                    >
                      <h3 className="text-xl font-semibold text-black">
                        {event.title}
                      </h3>

                      <p className="text-gray-600 mt-2">{event.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
