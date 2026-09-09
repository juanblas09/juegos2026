// Registry of the public .ics calendar sources the pipeline pulls from. Each
// source is fetched and parsed independently, then tagged with its `slug` so
// downstream code can tell which UI section an event belongs to (the deportes
// grid vs. the Fan Fest section) - see scripts/parse-events.mjs.
export const ICS_SOURCES = [
  {
    slug: 'odesur',
    name: 'Grilla ODESUR',
    url: 'https://calendar.google.com/calendar/ical/83c9b716438a58b7f8aeef7d624eb33e23533ca34c896adf0bb3fded075c8757%40group.calendar.google.com/public/basic.ics',
  },
  {
    slug: 'fanfest',
    name: 'Fan Fest',
    url: 'https://calendar.google.com/calendar/ical/241b34acbd04f429350baf3da47d32aeecbd3e80973dd91ca7aa9b1f6dd11610%40group.calendar.google.com/public/basic.ics',
  },
];

/** @returns {{slug: string, name: string, url: string}} */
export function getIcsSource(slug) {
  const source = ICS_SOURCES.find((s) => s.slug === slug);
  if (!source) throw new Error(`Fuente ICS desconocida: "${slug}"`);
  return source;
}
