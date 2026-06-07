"use client";

import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function CreateEventPage() {
  const router = useRouter();

  const { data: session } = useSession();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (!session) return;

    if (session.user.role !== "ngo") {
      router.push("/explore");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/events", {
        title,
        description,
        date,
        organization: session?.user?.id,
      });

      if (res.data.success) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.log(error);

      alert("Failed to create event");
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 via-white to-blue-50 px-4">
        <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-xl border border-orange-100">
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
            Create Event
          </h1>

          <p className="text-center text-gray-600 mb-8">
            Organize and manage volunteer events.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              placeholder="Event Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-black placeholder:text-gray-500 outline-none focus:border-orange-400"
              required
            />

            <textarea
              placeholder="Event Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-black placeholder:text-gray-500 outline-none focus:border-orange-400 resize-none h-40"
              required
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-black outline-none focus:border-orange-400"
              required
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition"
            >
              Create Event
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
