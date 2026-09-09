// Deep-linking via query params: ?fecha=2026-10-05&deporte=Hockey
// Uses history.replaceState (never pushState) so filter/date tweaks don't flood
// the browser's back-history - the back button should leave the page, not undo
// each click.
import { getState, subscribe } from './appState.js';

const DATE_PARAM = 'fecha';
const SPORT_PARAM = 'deporte';

/**
 * Reads the initial state from the current URL, validated against the known
 * event window/sport list. Returns a partial state object to seed appState with
 * (may be empty if there's no valid deep link).
 */
export function readInitialUrlState({ windowStart, windowEnd, sports }) {
  const params = new URLSearchParams(window.location.search);
  const partial = {};

  const fecha = params.get(DATE_PARAM);
  if (fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha) && fecha >= windowStart && fecha <= windowEnd) {
    partial.selectedDate = fecha;
  }

  const deporte = params.get(SPORT_PARAM);
  if (deporte && sports.includes(deporte)) {
    partial.filters = { sport: deporte, venue: null, query: '' };
  }

  return partial;
}

/** Starts syncing appState -> the URL's query string (one-way, no polling). */
export function startUrlSync() {
  subscribe((state) => {
    const params = new URLSearchParams(window.location.search);

    if (state.selectedDate) params.set(DATE_PARAM, state.selectedDate);
    else params.delete(DATE_PARAM);

    if (state.filters.sport) params.set(SPORT_PARAM, state.filters.sport);
    else params.delete(SPORT_PARAM);

    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
    window.history.replaceState(null, '', url);
  });
}

/** Builds a shareable absolute URL for a given date (used by the "share" action). */
export function buildShareUrl(dateStr) {
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set(DATE_PARAM, dateStr);
  const currentSport = getState().filters.sport;
  if (currentSport) url.searchParams.set(SPORT_PARAM, currentSport);
  return url.toString();
}
