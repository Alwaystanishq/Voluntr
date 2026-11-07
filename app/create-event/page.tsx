"use client";

import axios from "axios";
import { EVENT_CATEGORIES } from "@/types/event";
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
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState("");
  const [capacity, setCapacity] = useState("");
  const [deadline, setDeadline] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputClass = "w-full border border-gray-300 rounded-xl px-4 py-3 text-black bg-white";

  useEffect(() => {
    if (!session) return;

    if (session.user.role !== "ngo") {
      router.push("/explore");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    if (endDate && new Date(endDate) <= new Date(date)) { setError("End time must be after the start time."); return; }
    if (deadline && new Date(deadline) > new Date(date)) { setError("Registration must close on or before the event starts."); return; }
    setSaving(true);
    try {
      const res = await axios.post("/api/events", {
        title,
        description,
        date: new Date(date).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        location, category,
        requiredSkills: skills.split(",").map((skill) => skill.trim()).filter(Boolean),
        capacity: capacity ? Number(capacity) : null,
        registrationDeadline: deadline ? new Date(deadline).toISOString() : undefined,
        coverImage,
      });

      if (res.data.success) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.log(error);

      setError(axios.isAxiosError(error) ? error.response?.data?.message || "Failed to create event" : "Failed to create event");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 via-white to-blue-50 px-4 py-10">
        <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-xl border border-orange-100">
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
            Create Event
          </h1>

          <p className="text-center text-gray-600 mb-8">
            Organize and manage volunteer events.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
            <label htmlFor="title" className="block font-medium text-black">Event title</label>
            <input
              type="text"
              id="title"
              placeholder="Event Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-black placeholder:text-gray-500 outline-none focus:border-orange-400"
              required
            />

            <label htmlFor="description" className="block font-medium text-black">Description</label>
            <textarea
              id="description"
              placeholder="Event Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-black placeholder:text-gray-500 outline-none focus:border-orange-400 resize-none h-40"
              required
            />

            <label htmlFor="start" className="block font-medium text-black">Start date and time</label>
            <input
              id="start"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-black outline-none focus:border-orange-400"
              required
            />

            <p className="text-sm text-gray-600">Times use your device’s local timezone.</p>
            <label className="block font-medium text-black">End date and time (optional)
              <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
            </label>
            <label className="block font-medium text-black">Location or online meeting details
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Venue, address and city, or online meeting details" maxLength={2000} required className={inputClass} />
            </label>
            <label className="block font-medium text-black">Cause category
              <select value={category} onChange={(e) => setCategory(e.target.value)} required className={inputClass}>
                <option value="">Choose a cause</option>
                {EVENT_CATEGORIES.map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label className="block font-medium text-black">Required skills (optional)
              <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Teaching, first aid, photography" className={inputClass} />
              <span className="text-sm font-normal text-gray-600">Separate skills with commas. Leave blank if no experience is needed.</span>
            </label>
            <label className="block font-medium text-black">Volunteer capacity (optional)
              <input type="number" min="1" step="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Leave blank for unlimited places" className={inputClass} />
            </label>
            <label className="block font-medium text-black">Registration deadline (optional)
              <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClass} />
              <span className="text-sm font-normal text-gray-600">Defaults to the event start time.</span>
            </label>
            <label className="block font-medium text-black">Cover image URL (optional)
              <input type="url" pattern="https://.*" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://example.com/event.jpg" className={inputClass} />
            </label>
            <button
              disabled={saving || session?.user?.role !== "ngo"}
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition"
            >
              {saving ? "Creating…" : "Create Event"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
