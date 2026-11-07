"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";

type Enrollment = {
  status: "none" | "enrolled" | "waitlisted";
  position: number | null;
  enrolledCount: number;
  waitlistCount: number;
  capacity: number | null;
  registrationClosed: boolean;
  started: boolean;
};

export default function EnrollmentControls({ eventId, onChanged }: { eventId: string; onChanged?: () => void }) {
  const mutationVersion = useRef(0);
  const changing = useRef(false);
  const [state, setState] = useState<Enrollment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      if (changing.current) return;
      const version = mutationVersion.current;
      try {
        const res = await axios.get<Enrollment>(`/api/events/${eventId}/enroll`, { signal: controller.signal });
        if (!controller.signal.aborted && version === mutationVersion.current) { setState(res.data); setError(""); }
      } catch {
        if (!controller.signal.aborted && version === mutationVersion.current) setError("Could not refresh enrollment status. Please retry before making changes.");
      }
    }
    void load();
    const timer = window.setInterval(() => void load(), 30000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [eventId, revision]);

  async function change(action: "join" | "leave") {
    if (changing.current) return;
    changing.current = true;
    mutationVersion.current += 1;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = action === "join"
        ? await axios.post(`/api/events/${eventId}/enroll`)
        : await axios.delete(`/api/events/${eventId}/enroll`);
      setState(res.data);
      setMessage(res.data.message);
      onChanged?.();
    } catch (error) {
      setError(axios.isAxiosError(error) ? error.response?.data?.message || "Could not update enrollment." : "Could not update enrollment.");
    } finally { changing.current = false; setBusy(false); }
  }

  const full = state?.capacity != null && state.enrolledCount >= state.capacity;
  return <div className="w-full space-y-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-gray-800">
    {state ? <>
      <p className="font-semibold">{state.status === "enrolled" ? "You are enrolled" : state.status === "waitlisted" ? `Waitlist position: ${state.position}` : "Register for this event"}</p>
      <p className="text-sm">{state.enrolledCount}{state.capacity != null ? ` / ${state.capacity}` : ""} volunteers enrolled · {state.waitlistCount} waiting</p>
      {state.status === "waitlisted" && <p className="text-sm">You will be enrolled automatically when a spot opens before registration closes.</p>}
      {state.status === "none" ? <button disabled={busy || !!error || state.registrationClosed} onClick={() => change("join")} className="rounded-xl bg-blue-600 px-5 py-2 font-medium text-white disabled:opacity-50">
        {busy ? "Updating…" : state.registrationClosed ? "Registration closed" : full || state.waitlistCount > 0 ? "Join waitlist" : "Enroll now"}
      </button> : <button disabled={busy || !!error || (state.status === "enrolled" && state.started)} onClick={() => change("leave")} className="rounded-xl border border-red-300 bg-white px-5 py-2 font-medium text-red-700 disabled:opacity-50">
        {busy ? "Updating…" : state.status === "waitlisted" ? "Leave waitlist" : state.started ? "Event has started" : "Cancel enrollment"}
      </button>}
    </> : <p role="status">Loading enrollment…</p>}
    {message && <p role="status" className="text-sm text-blue-800">{message}</p>}
    {error && <div role="alert" className="text-sm text-red-700"><p>{error}</p><button onClick={() => setRevision((value) => value + 1)} className="mt-1 underline">Refresh status</button></div>}
  </div>;
}
