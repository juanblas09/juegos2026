// Minimal pub-sub store - no framework, no Redux. Every UI module subscribes to
// the slices it cares about and re-renders only its own DOM subtree; that's the
// entire "state management" this app needs given its modest interactivity.

const listeners = new Set();

/** @type {{
 *   selectedDate: string,
 *   currentWeekIndex: number,
 *   filters: { sport: string|null, venue: string|null, query: string },
 *   theme: 'light'|'dark',
 * }} */
let state = {
  selectedDate: null,
  currentWeekIndex: 0,
  filters: { sport: null, venue: null, query: '' },
  theme: 'light',
};

export function getState() {
  return state;
}

/** Shallow-merges `partial` into state and notifies subscribers. */
export function setState(partial) {
  state = { ...state, ...partial };
  for (const listener of listeners) listener(state);
}

/** @param {(state: typeof state) => void} listener */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
