// Downloads the raw .ics text from the public ODESUR Santa Fe 2026 Google Calendar
// feed. Node-first, no dependencies beyond the global fetch() (Node 18+).
//
// The feed has no Access-Control-Allow-Origin header, so this can only ever be
// called from a build-time/server context (this script, run by the GitHub Action),
// never from browser JS.

export const ICS_URL =
  'https://calendar.google.com/calendar/ical/83c9b716438a58b7f8aeef7d624eb33e23533ca34c896adf0bb3fded075c8757%40group.calendar.google.com/public/basic.ics';

/**
 * @param {string} [url]
 * @returns {Promise<string>} raw .ics text
 */
export async function fetchIcs(url = ICS_URL) {
  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new Error(`No se pudo conectar a ${url}: ${err.message}`);
  }

  if (!response.ok) {
    throw new Error(`Respuesta HTTP ${response.status} al descargar ${url}`);
  }

  const text = await response.text();

  if (text.length < 1000 || !text.includes('BEGIN:VCALENDAR')) {
    throw new Error(
      `El contenido descargado de ${url} no parece un .ics válido (largo=${text.length})`
    );
  }

  return text;
}
