"use client";

import axios from "axios";
import { useEffect, useState } from "react";

export default function SaveEventButton({ eventId, initialSaved, onRemoved }: {
  eventId: string; initialSaved?: boolean; onRemoved?: () => void;
}) {
  const [saved, setSaved] = useState(initialSaved ?? false);
  const [loading, setLoading] = useState(initialSaved === undefined);
  const [ready, setReady] = useState(initialSaved !== undefined);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (initialSaved !== undefined) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`/api/events/${eventId}/save`, { signal: controller.signal });
        if (!controller.signal.aborted) { setSaved(res.data.saved); setReady(true); }
      } catch {
        if (!controller.signal.aborted) setError("Could not load saved status.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [eventId, initialSaved, retry]);

  async function toggle() {
    if (!ready) { setRetry((value) => value + 1); return; }
    setLoading(true);
    setError("");
    try {
      const res = saved
        ? await axios.delete(`/api/events/${eventId}/save`)
        : await axios.put(`/api/events/${eventId}/save`);
      setSaved(res.data.saved);
      if (!res.data.saved) onRemoved?.();
    } catch {
      setError("Could not update saved event. Please try again.");
    } finally { setLoading(false); }
  }

  return <div>
    <button type="button" onClick={toggle} disabled={loading} aria-pressed={saved} className="rounded-xl border border-blue-300 bg-white px-5 py-2 font-medium text-blue-700 disabled:opacity-50">
      {loading ? "Loading…" : !ready ? "Retry saved status" : saved ? "Remove from saved" : "Save opportunity"}
    </button>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
  </div>;
}
