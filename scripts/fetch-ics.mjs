// Downloads the raw .ics text from a public Google Calendar feed. Node-first,
// no dependencies beyond the global fetch() (Node 18+).
//
// These feeds have no Access-Control-Allow-Origin header, so this can only
// ever be called from a build-time/server context (this script, run by the
// GitHub Action), never from browser JS.

/**
 * @param {string} url
 * @returns {Promise<string>} raw .ics text
 */
export async function fetchIcs(url) {
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
