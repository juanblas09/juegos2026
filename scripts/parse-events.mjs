#!/usr/bin/env node
// Orchestrates the whole data pipeline: download (or read a local fixture),
// parse with node-ical, transform each VEVENT into the shape the static site
// consumes, and write data/events.json. Runs as a plain Node script (not a Vite
// plugin) so `vite dev`/`vite build` never need network access, and so this can
// be run standalone locally or via `workflow_dispatch` in CI.
//
// Usage:
//   node scripts/parse-events.mjs            # fetch the real live .ics
//   node scripts/parse-events.mjs --fixture  # use scripts/__fixtures__/sample.ics (offline)

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import ical from 'node-ical';

import { fetchIcs } from './fetch-ics.mjs';
import { parseSummary } from '../shared/summaryParser.mjs';
import { composeEventTitle } from '../shared/eventTitle.mjs';
import { buildMapsUrl } from '../shared/mapsLink.mjs';
import { buildGoogleCalendarUrl } from '../shared/googleCalendarLink.mjs';
import { buildSingleEventIcs } from '../shared/icsFile.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT, 'data', 'events.json');
const FIXTURE_PATH = path.join(ROOT, 'scripts', '__fixtures__', 'sample.ics');
const TIME_ZONE = 'America/Argentina/Buenos_Aires';
const TZ_OFFSET = '-03:00'; // fixed offset, no DST in Argentina

// "Paraná"/"Parana" is the one known venue outside the city of Santa Fe proper
// (confirmed with the calendar owner) - flagged for display, never filtered out.
const OUT_OF_CITY_RE = /paran[aá]/i;

function partsToMap(parts) {
  const map = {};
  for (const part of parts) map[part.type] = part.value;
  return map;
}

const dateTimeFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

/** Converts a UTC Date into Argentina-local date/time fields, using the IANA zone
 * (rather than hand-rolled offset math) so the conversion is self-documenting. */
function toArgentinaParts(utcDate) {
  const p = partsToMap(dateTimeFormatter.formatToParts(utcDate));
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    time: `${p.hour}:${p.minute}`,
    iso: `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}${TZ_OFFSET}`,
  };
}

function splitLocation(location) {
  const text = (location ?? '').trim();
  const commaIndex = text.indexOf(',');
  if (commaIndex === -1) return { venueName: text, venueAddress: text };
  return {
    venueName: text.slice(0, commaIndex).trim(),
    venueAddress: text.slice(commaIndex + 1).trim(),
  };
}

function fallbackId(summary, start) {
  return crypto
    .createHash('sha1')
    .update(`${summary}|${start?.toISOString?.() ?? String(start)}`)
    .digest('hex')
    .slice(0, 16);
}

function transformEvent(vevent, generatedAt) {
  const summaryRaw = vevent.summary ?? '';
  const location = vevent.location ?? '';
  const description = (vevent.description ?? '').trim();
  const start = vevent.start;
  const end = vevent.end ?? vevent.start;

  const parsed = parseSummary(summaryRaw);
  const titleComposed = composeEventTitle(parsed);
  const { venueName, venueAddress } = splitLocation(location);
  const startParts = toArgentinaParts(start);
  const endParts = toArgentinaParts(end);
  const uid = vevent.uid && String(vevent.uid).trim() ? String(vevent.uid).trim() : null;
  const id = uid ?? fallbackId(summaryRaw, start);

  return {
    id,
    uid,
    date: startParts.date,
    startLocal: startParts.iso,
    endLocal: endParts.iso,
    startTimeLabel: startParts.time,
    endTimeLabel: endParts.time,
    sport: parsed.sport,
    sportRaw: summaryRaw,
    gender: parsed.gender,
    teams: parsed.teams,
    phase: parsed.phase,
    titleDisplay: parsed.titleDisplay,
    titleComposed,
    parsed: parsed.parsed,
    venueName,
    venueAddress,
    isOutOfCity: OUT_OF_CITY_RE.test(location),
    description,
    mapsUrl: buildMapsUrl(location),
    gcalUrl: buildGoogleCalendarUrl({ summary: titleComposed, description, location, start, end }),
    icsContent: buildSingleEventIcs({
      uid: id,
      summary: titleComposed,
      description,
      location,
      start,
      end,
      dtstamp: generatedAt,
    }),
  };
}

async function loadRawIcs({ useFixture }) {
  if (useFixture) {
    return fs.readFile(FIXTURE_PATH, 'utf8');
  }
  return fetchIcs();
}

async function main() {
  const useFixture = process.argv.includes('--fixture');
  const generatedAt = new Date();

  const rawIcs = await loadRawIcs({ useFixture });
  const parsedIcal = await ical.async.parseICS(rawIcs);
  const vevents = Object.values(parsedIcal).filter((entry) => entry.type === 'VEVENT');

  if (vevents.length === 0) {
    throw new Error('El .ics no contiene ningún VEVENT - abortando para no pisar datos válidos.');
  }

  const events = vevents
    .map((vevent) => transformEvent(vevent, generatedAt))
    .sort((a, b) => a.startLocal.localeCompare(b.startLocal));

  const sports = [...new Set(events.map((e) => e.sport))].sort((a, b) => a.localeCompare(b, 'es'));

  const venueMap = new Map();
  for (const e of events) {
    if (!venueMap.has(e.venueName)) {
      venueMap.set(e.venueName, {
        name: e.venueName,
        address: e.venueAddress,
        mapsUrl: e.mapsUrl,
        isOutOfCity: e.isOutOfCity,
      });
    }
  }
  const venues = [...venueMap.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'));

  const dates = events.map((e) => e.date).sort();
  const windowStart = dates[0];
  const windowEnd = dates[dates.length - 1];

  const output = {
    generatedAt: generatedAt.toISOString(),
    windowStart,
    windowEnd,
    sports,
    venues,
    events,
  };

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

  const parsedCount = events.filter((e) => e.parsed).length;
  const outOfCityCount = events.filter((e) => e.isOutOfCity).length;
  console.log(
    `OK: ${events.length} eventos escritos en ${path.relative(ROOT, OUTPUT_PATH)}\n` +
      `  parseados correctamente: ${parsedCount}/${events.length}\n` +
      `  fallback (sin parsear):  ${events.length - parsedCount}/${events.length}\n` +
      `  fuera de la ciudad:      ${outOfCityCount}\n` +
      `  ventana: ${windowStart} .. ${windowEnd}\n` +
      `  deportes distintos:      ${sports.length}\n` +
      `  sedes distintas:         ${venues.length}`
  );
}

main().catch((err) => {
  console.error('ERROR en parse-events.mjs:', err.message);
  process.exit(1);
});
