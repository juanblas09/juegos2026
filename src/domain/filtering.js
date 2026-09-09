// Pure filtering: given the full event list and the current filter selections,
// returns the Set of ids that match. The grid only uses this to decide whether a
// cell is dimmed or not - it never removes cells - so the grid's shape stays
// stable while filtering (important for a dense mobile grid).

/**
 * @param {object[]} events
 * @param {{sport: string|null, venue: string|null, query: string}} filters
 * @returns {Set<string>} matching event ids
 */
export function applyFilters(events, filters) {
  const { sport, venue, query } = filters;
  const q = (query ?? '').trim().toLowerCase();

  const matching = new Set();
  for (const event of events) {
    if (sport && event.sport !== sport) continue;
    if (venue && event.venueName !== venue) continue;
    if (q && !event.searchBlob.includes(q)) continue;
    matching.add(event.id);
  }
  return matching;
}

export function isFilterActive(filters) {
  return Boolean(filters.sport || filters.venue || (filters.query && filters.query.trim()));
}
