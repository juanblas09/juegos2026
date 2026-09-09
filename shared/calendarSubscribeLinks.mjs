// Builders for "subscribe to the whole calendar" links (as opposed to a single
// event) - the reader adds a live feed that auto-updates if ODESUR changes a
// schedule, instead of a one-time import that can go stale.

/** Google Calendar's "add by URL" shortcut - opens with the URL pre-filled. */
export function buildGoogleCalendarSubscribeUrl(icsUrl) {
  return `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(icsUrl)}`;
}

/** webcal:// is the scheme OSes/calendar apps (Apple Calendar, Outlook, etc.)
 * recognize to trigger a "subscribe to this calendar" flow. */
export function buildWebcalUrl(icsUrl) {
  return icsUrl.replace(/^https?:\/\//, 'webcal://');
}
