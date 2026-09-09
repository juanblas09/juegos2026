// Builds a standalone single-event .ics file content string, ready to be wrapped
// in a Blob and downloaded client-side (no per-click computation needed - this
// runs once at build time in scripts/parse-events.mjs).

function pad(n) {
  return String(n).padStart(2, '0');
}

/** Formats a JS Date as an ICS UTC timestamp: YYYYMMDDTHHMMSSZ */
export function toIcsUtc(date) {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

/** Escapes text per RFC 5545 (§3.3.11): backslash, comma, semicolon, newline. */
export function escapeIcsText(text) {
  return String(text ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * @param {{uid:string, summary:string, description:string, location:string, start:Date, end:Date, dtstamp:Date}} event
 * @returns {string} full VCALENDAR text for a single VEVENT
 */
export function buildSingleEventIcs({ uid, summary, description, location, start, end, dtstamp }) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ODESUR Santa Fe 2026//grilla//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toIcsUtc(dtstamp)}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}
