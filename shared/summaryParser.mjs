// Parses the free-text SUMMARY field of ODESUR Santa Fe 2026 calendar events into
// structured data: sport, gender, teams (with flag emoji), and phase/round text.
//
// The source calendar has no CATEGORIES/URL fields, so this is the only way to get
// structured data out of it. The format is emoji-prefixed but NOT perfectly uniform
// (see scripts/__fixtures__/sample.ics for real examples), so every stage here is
// designed to degrade gracefully: a string that doesn't match any expected shape
// still produces a usable `titleDisplay` and a `parsed: false` flag, never a throw.
//
// Observed shapes (see scripts/__tests__/summaryParser.test.mjs for the exact cases):
//   "⛵ Vela — Competencias"
//   "🎯🏅 Tiro Deportivo — 50m Rifle 3 Posiciones Masculino (Clasificación y Final)"
//   "🎳 Bochas — Petanca, 1ª Fase Clasificatoria (Grupo A: 1 vs. 2 — Grupo B: 4 vs. 5)"
//   "🏑 Hockey Femenino: 🇦🇷 Las Leonas vs. 🇵🇪 Perú"
//   "🏑🥇 Hockey Femenino — Final (Oro): 1° vs. 2° lugar"   (medal round, no real teams yet)

const GENDER_COMBINED_RE = /\b(femenino\s+y\s+masculino|masculino\s+y\s+femenino)\b/i;
const GENDER_FEMENINO_RE = /\bfemenino\b/i;
const GENDER_MASCULINO_RE = /\bmasculino\b/i;
const GENDER_MIXED_RE = /\b(mixtos?|ambos)\b/i;

// Any run of leading non-letter/non-digit characters (emoji, variation selectors,
// ZWJ, whitespace). Sport names always start with a letter, so this is a safe,
// enumeration-free way to strip leading decorative icons without a maintained
// emoji-range table.
const LEADING_NON_TEXT_RE = /^[^\p{L}\p{N}]+/u;

// Em dash, en dash, or " - " used as the sport/phase separator. Matched once
// (first occurrence only) so a second dash later in the phase text is left intact.
const DASH_SPLIT_RE = /\s[—–-]\s/u;

const VS_SPLIT_RE = /\s+vs\.?\s+/i;

// Two regional-indicator symbols in a row = a flag emoji (e.g. 🇦🇷). Used to decide
// whether a "X: A vs. B" clause is a real team matchup (has flags) or a placeholder
// like "1° vs. 2° lugar" / "Grupo A: 1 vs. 2" (no flags) that should stay as text.
const FLAG_PAIR_RE = /\p{Regional_Indicator}{2}/u;
const LEADING_FLAG_RE = /^(\p{Regional_Indicator}{2})\s*(.*)$/u;

function hasFlag(text) {
  return FLAG_PAIR_RE.test(text);
}

/**
 * Finds a gender marker in `text` without modifying it.
 * @returns {'Femenino'|'Masculino'|'Mixto'|null}
 */
function detectGender(text) {
  if (!text) return null;
  if (GENDER_COMBINED_RE.test(text)) return 'Mixto';
  if (GENDER_FEMENINO_RE.test(text)) return 'Femenino';
  if (GENDER_MASCULINO_RE.test(text)) return 'Masculino';
  if (GENDER_MIXED_RE.test(text)) return 'Mixto';
  return null;
}

/**
 * Detects AND strips a standalone gender word from `text` (used to clean the
 * sport name out of e.g. "Balonmano Masculino" -> "Balonmano").
 * @returns {{ clean: string, gender: string|null }}
 */
function stripGender(text) {
  const gender = detectGender(text);
  if (!gender) return { clean: text.trim(), gender: null };
  const clean = text
    .replace(GENDER_COMBINED_RE, ' ')
    .replace(GENDER_FEMENINO_RE, ' ')
    .replace(GENDER_MASCULINO_RE, ' ')
    .replace(GENDER_MIXED_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { clean, gender };
}

function stripLeadingEmoji(summary) {
  return summary.replace(LEADING_NON_TEXT_RE, '').trim();
}

function normalizeSportName(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[,:;\s]+$/, '')
    .trim();
}

/** Splits a flagged "vs." clause into team entries. */
function parseTeams(teamsText) {
  return teamsText
    .split(VS_SPLIT_RE)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const match = chunk.match(LEADING_FLAG_RE);
      if (match) {
        return { flagEmoji: match[1], name: normalizeSportName(match[2]) };
      }
      return { flagEmoji: null, name: normalizeSportName(chunk) };
    })
    .filter((team) => team.name.length > 0);
}

/**
 * Parses one calendar SUMMARY string into structured event data.
 * Never throws. Always returns a usable `titleDisplay`.
 *
 * @param {string} summary raw SUMMARY value (already unfolded/unescaped by node-ical)
 * @returns {{
 *   sport: string,
 *   gender: 'Femenino'|'Masculino'|'Mixto'|null,
 *   teams: {flagEmoji: string|null, name: string}[],
 *   phase: string|null,
 *   titleDisplay: string,
 *   parsed: boolean,
 * }}
 */
export function parseSummary(summary) {
  const raw = typeof summary === 'string' ? summary : '';
  const coreText = stripLeadingEmoji(raw);
  const titleDisplay = coreText.length > 0 ? coreText : raw.trim();

  if (!coreText) {
    return { sport: titleDisplay, gender: null, teams: [], phase: null, titleDisplay, parsed: false };
  }

  // Stage 1: does this look like "<meta>: <TeamA flag> vs. <TeamB flag>"?
  let metaText = coreText;
  let teamsText = null;
  const colonIndex = coreText.indexOf(':');
  if (colonIndex !== -1) {
    const candidate = coreText.slice(colonIndex + 1).trim();
    if (hasFlag(candidate) && VS_SPLIT_RE.test(candidate)) {
      metaText = coreText.slice(0, colonIndex).trim();
      teamsText = candidate;
    }
  }

  // Stage 2: split the "meta" portion into sport + phase on the first dash.
  const dashMatch = metaText.match(DASH_SPLIT_RE);
  let sportPart = metaText;
  let phasePart = null;
  if (dashMatch) {
    const idx = dashMatch.index;
    sportPart = metaText.slice(0, idx);
    phasePart = metaText.slice(idx + dashMatch[0].length).trim() || null;
  }

  // Stage 3: gender - prefer a marker attached directly to the sport name, then
  // fall back to scanning (without stripping) the phase text and the teams text.
  const { clean: sportClean, gender: sportGender } = stripGender(sportPart);
  const gender = sportGender ?? detectGender(phasePart) ?? detectGender(teamsText);

  const sport = normalizeSportName(sportClean);
  const parsed = sport.length >= 2;

  // Stage 4: teams (only when Stage 1 found a flagged "vs." clause).
  const teams = teamsText ? parseTeams(teamsText) : [];

  return {
    sport: parsed ? sport : titleDisplay,
    gender,
    teams,
    phase: phasePart,
    titleDisplay,
    parsed,
  };
}
