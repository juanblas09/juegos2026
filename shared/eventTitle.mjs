// Composes a nice, structured display title from a parsed SUMMARY, falling back
// to the always-safe `titleDisplay` when the sport wasn't cleanly parsed. Shared
// between the build-time pipeline (Google Calendar links, .ics export) and the UI
// (event cards), so both places render the exact same title.

/**
 * @param {import('./summaryParser.mjs').parseSummary extends (...a:any)=>infer R ? R : never} parsed
 */
export function composeEventTitle(parsed) {
  if (!parsed.parsed) return parsed.titleDisplay;

  const genderSuffix = parsed.gender ? ` ${parsed.gender}` : '';

  if (parsed.teams.length === 2) {
    const matchup = parsed.teams
      .map((t) => (t.flagEmoji ? `${t.flagEmoji} ${t.name}` : t.name))
      .join(' vs. ');
    return `${parsed.sport}${genderSuffix}: ${matchup}`;
  }

  if (parsed.phase) {
    return `${parsed.sport}${genderSuffix} — ${parsed.phase}`;
  }

  return `${parsed.sport}${genderSuffix}`;
}
