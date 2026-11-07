"use client";

import { useState } from "react";
import type { EventDetails } from "@/types/event";

export function EventCover({ src, title }: { src?: string; title: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  // User-provided HTTPS images are displayed directly; no remote image optimizer configuration is needed.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={`Cover for ${title}`} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="mb-5 aspect-video w-full rounded-xl object-cover" />;
}

export function EventInformation({ event, compact = false }: { event: EventDetails; compact?: boolean }) {
  return <div className="space-y-3 text-gray-700 mb-6">
    {event.category && <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">{event.category}</span>}
    <p><span className="font-semibold">When:</span> {new Date(event.date).toLocaleString()}{event.endDate && ` – ${new Date(event.endDate).toLocaleString()}`}</p>
    {event.location && <p className="whitespace-pre-wrap break-words"><span className="font-semibold">Where:</span> {event.location}</p>}
    {event.capacity != null && <p><span className="font-semibold">Capacity:</span> {event.capacity} volunteers</p>}
    {!compact && <>
      {event.registrationDeadline && <p><span className="font-semibold">Register by:</span> {new Date(event.registrationDeadline).toLocaleString()}</p>}
      <p><span className="font-semibold">Skills:</span> {event.requiredSkills?.length ? event.requiredSkills.join(", ") : "No specific experience required"}</p>
    </>}
  </div>;
}
