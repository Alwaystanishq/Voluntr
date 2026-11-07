import type { EventDetails } from "@/types/event";

export function groupVolunteerEvents<T extends EventDetails>(events: T[], now = new Date()) {
  const upcoming: T[] = [];
  const past: T[] = [];
  for (const event of events) {
    const end = new Date(event.endDate || event.date);
    (end >= now ? upcoming : past).push(event);
  }
  upcoming.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  past.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  return { upcoming, past };
}

export function eventCalendar(event: EventDetails, now = new Date()) {
  const escape = (text: string) => text.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
  const stamp = (date: string | Date) => new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  // RFC 5545 content lines are folded at 75 UTF-8 octets, including continuation whitespace.
  const fold = (line: string) => {
    let result = "";
    let bytes = 0;
    for (const character of line) {
      const size = new TextEncoder().encode(character).length;
      if (bytes + size > 75) { result += "\r\n "; bytes = 1; }
      result += character;
      bytes += size;
    }
    return result;
  };
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Voluntr//Volunteer Events//EN", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT", `UID:${escape(event._id)}@voluntr`, `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(event.date)}`,
    ...(event.endDate ? [`DTEND:${stamp(event.endDate)}`] : []),
    `SUMMARY:${escape(event.title)}`, `DESCRIPTION:${escape(event.description || "")}`,
    `LOCATION:${escape(event.location || "")}`, "END:VEVENT", "END:VCALENDAR",
  ].map(fold).join("\r\n") + "\r\n";
}
