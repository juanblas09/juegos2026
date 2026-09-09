// Pure date-window logic: countdown/today/ended phase, default-date selection,
// and week chunking. Every function here takes any "now" it needs as a plain
// parameter (never calls `new Date()` internally), so it's trivially testable
// with fixed dates and has no hidden dependency on the system clock.

const DAY_MS = 24 * 60 * 60 * 1000;
const ARG_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Argentina/Buenos_Aires',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Today's calendar date (YYYY-MM-DD) in Argentina local time, for a given instant. */
export function todayInArgentina(now = new Date()) {
  return ARG_DATE_FORMATTER.format(now);
}

function toUtcMidnight(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtcMidnight(ms) {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Adds `n` days (can be negative) to a YYYY-MM-DD calendar-date string. */
export function addDays(dateStr, n) {
  return fromUtcMidnight(toUtcMidnight(dateStr) + n * DAY_MS);
}

/** Whole days between two YYYY-MM-DD strings (b - a). */
export function daysBetween(a, b) {
  return Math.round((toUtcMidnight(b) - toUtcMidnight(a)) / DAY_MS);
}

/**
 * @param {string} todayStr YYYY-MM-DD (Argentina local)
 * @returns {'before'|'during'|'after'}
 */
export function getPhase(todayStr, windowStart, windowEnd) {
  if (todayStr < windowStart) return 'before';
  if (todayStr > windowEnd) return 'after';
  return 'during';
}

/**
 * Finds the best "default" date to land on: today if it has events, otherwise
 * the closest date (scanning forward first, then backward) that does, clamped
 * to the event window.
 */
export function getDefaultDate(todayStr, eventsByDate, windowStart, windowEnd) {
  const clamped = todayStr < windowStart ? windowStart : todayStr > windowEnd ? windowEnd : todayStr;

  if (eventsByDate.has(clamped)) return clamped;

  let forward = clamped;
  while (forward < windowEnd) {
    forward = addDays(forward, 1);
    if (eventsByDate.has(forward)) return forward;
  }

  let backward = clamped;
  while (backward > windowStart) {
    backward = addDays(backward, -1);
    if (eventsByDate.has(backward)) return backward;
  }

  return clamped;
}

/**
 * Chunks [windowStart, windowEnd] into 7-day weeks starting at windowStart.
 * @returns {{start: string, end: string, dates: string[]}[]}
 */
export function buildWeeks(windowStart, windowEnd) {
  const weeks = [];
  let cursor = windowStart;
  while (cursor <= windowEnd) {
    const dates = Array.from({ length: 7 }, (_, i) => addDays(cursor, i));
    weeks.push({ start: dates[0], end: dates[dates.length - 1], dates });
    cursor = addDays(cursor, 7);
  }
  return weeks;
}

/** Index of the week (in `weeks`) that contains `dateStr`, clamped to range. */
export function findWeekIndexForDate(weeks, dateStr) {
  const idx = weeks.findIndex((w) => dateStr >= w.start && dateStr <= w.end);
  if (idx !== -1) return idx;
  return dateStr < weeks[0].start ? 0 : weeks.length - 1;
}

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat('es-AR', { weekday: 'short', timeZone: 'UTC' });
const DAY_MONTH_FORMATTER = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

/** Short weekday label ("lun.", "mar.", ...) for a YYYY-MM-DD date string. */
export function weekdayLabel(dateStr) {
  return WEEKDAY_FORMATTER.format(new Date(`${dateStr}T00:00:00Z`));
}

/** "13 sep." style label for a YYYY-MM-DD date string. */
export function dayMonthLabel(dateStr) {
  return DAY_MONTH_FORMATTER.format(new Date(`${dateStr}T00:00:00Z`));
}
