import { toIcsUtc } from './icsFile.mjs';

/**
 * Builds a "Add to Google Calendar" template URL (no API key/auth needed).
 * @param {{summary:string, description:string, location:string, start:Date, end:Date}} event
 */
export function buildGoogleCalendarUrl({ summary, description, location, start, end }) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: summary,
    dates: `${toIcsUtc(start)}/${toIcsUtc(end)}`,
    details: description,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
