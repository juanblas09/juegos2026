// Parses the free-text SUMMARY field of the Fan Fest Santa Fe 2026 calendar,
// which follows a much simpler shape than the ODESUR sports calendar (see
// shared/summaryParser.mjs): "<Acto> - Fan Fest <Escenario>", identically on
// every single entry (verified against the live feed - 84/84 events match).
// Degrades gracefully: a SUMMARY that doesn't match the expected shape is
// returned as-is with a null `stage`, never a throw.
//
// Observed shapes (see scripts/__fixtures__/fanfest-sample.ics):
//   "Santiago Motorizado - Fan Fest Escenario 1"
//   "DJ - Fan Fest Escenario 1"
//   "Primavera Rock (a confirmar) - Fan Fest Escenario 1"
//
// The trailing "- Fan Fest <Escenario>" is stripped from `title` because it's
// pure boilerplate repeated on every event (not per-act info) - the section
// heading and a single "cómo llegar" link already carry that context once,
// so repeating it on all ~80 rows would just be noise.

const SUMMARY_RE = /^(.*?)\s*-\s*Fan Fest\s+(.+?)\s*$/;

/**
 * @param {string} summary raw SUMMARY value
 * @returns {{ title: string, stage: string|null }}
 */
export function parseFanfestSummary(summary) {
  const raw = typeof summary === 'string' ? summary.trim() : '';
  const match = raw.match(SUMMARY_RE);
  if (!match) return { title: raw, stage: null };

  const title = match[1].trim();
  const stage = match[2].trim();
  return {
    title: title.length > 0 ? title : raw,
    stage: stage.length > 0 ? stage : null,
  };
}
