// "Agregar a mi calendario" - the .ics content and Google Calendar URL are both
// precomputed at build time (scripts/parse-events.mjs); this module only handles
// the client-side bits that truly need to run in the browser: wrapping the
// precomputed .ics text in a Blob and triggering a download.

/** Standard vanilla-JS file-download idiom: Blob -> object URL -> click -> revoke. */
export function downloadIcs(event) {
  const blob = new Blob([event.icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.sport.replace(/\s+/g, '-').toLowerCase()}-${event.date}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
