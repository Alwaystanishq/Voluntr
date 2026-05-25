"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

export default function EditEventPage() {
  const params = useParams();

  const router = useRouter();

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`/api/events/${params.id}`);

        const event = res.data.event;

        setTitle(event.title);

        setDescription(event.description);

        setDate(new Date(event.date).toISOString().split("T")[0]);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await axios.put(`/api/events/${params.id}`, {
        title,
        description,
        date,
      });

      if (res.data.success) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.log(error);

      alert("Failed to update event");
    }
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
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 via-white to-blue-50 px-4">
        <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-xl border border-orange-100">
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
            Edit Event
          </h1>

          <p className="text-center text-gray-600 mb-8">
            Update your event details.
          </p>

          <form onSubmit={handleUpdate} className="space-y-5">
            <input
              type="text"
              placeholder="Event Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-orange-400 placeholder:text-black"
              required
            />

            <textarea
              placeholder="Event Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-orange-400 placeholder:text-black resize-none h-40"
              required
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-orange-400 text-black"
              required
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition"
            >
              Update Event
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
