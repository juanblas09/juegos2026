// Single import point for the build-time-generated data/events.json. Vite bundles
// this as a static JSON import (no runtime fetch), and this module builds the
// in-memory indices the UI needs once, at load, so filtering/rendering never has
// to re-scan the full event list.
import raw from '../../data/events.json';

function buildSearchBlob(event) {
  const teamNames = event.teams.map((t) => t.name).join(' ');
  return [event.sport, event.gender, teamNames, event.venueName, event.phase]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/** @type {Map<string, object[]>} date -> Fan Fest events that day */
function buildFanfestEventsByDate(fanfestEvents) {
  const byDate = new Map();
  for (const event of fanfestEvents) {
    if (!byDate.has(event.date)) byDate.set(event.date, []);
    byDate.get(event.date).push(event);
  }
  return byDate;
}

function buildIndices(data) {
  const events = data.events.map((event) => ({ ...event, searchBlob: buildSearchBlob(event) }));

  /** @type {Map<string, object[]>} date -> events that day */
  const eventsByDate = new Map();
  /** @type {Map<string, Map<string, object[]>>} sport -> date -> events */
  const eventsBySportAndDate = new Map();

  for (const event of events) {
    if (!eventsByDate.has(event.date)) eventsByDate.set(event.date, []);
    eventsByDate.get(event.date).push(event);

    if (!eventsBySportAndDate.has(event.sport)) eventsBySportAndDate.set(event.sport, new Map());
    const bySport = eventsBySportAndDate.get(event.sport);
    if (!bySport.has(event.date)) bySport.set(event.date, []);
    bySport.get(event.date).push(event);
  }

  return {
    generatedAt: data.generatedAt,
    windowStart: data.windowStart,
    windowEnd: data.windowEnd,
    sports: data.sports,
    venues: data.venues,
    events,
    eventsByDate,
    eventsBySportAndDate,
    fanfest: {
      ...data.fanfest,
      eventsByDate: buildFanfestEventsByDate(data.fanfest.events),
    },
  };
}

let cached = null;

/** Loads (and memoizes) the parsed event data + indices. */
export function loadEvents() {
  if (!cached) cached = buildIndices(raw);
  return cached;
}
