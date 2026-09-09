// Builds a Google Maps search URL from a free-text address. No API key needed;
// this is the public `?api=1&query=` search form, which opens the native Maps
// app on mobile via universal link and a browser tab on desktop.
export function buildMapsUrl(address) {
  const query = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
