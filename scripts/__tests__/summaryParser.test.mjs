import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSummary } from '../../shared/summaryParser.mjs';

test('simple sport with no gender, no teams ("Vela — Competencias")', () => {
  const r = parseSummary('⛵ Vela — Competencias');
  assert.equal(r.sport, 'Vela');
  assert.equal(r.gender, null);
  assert.deepEqual(r.teams, []);
  assert.equal(r.phase, 'Competencias');
  assert.equal(r.parsed, true);
});

test('sport with gender inside a parenthetical phase (Tiro Deportivo)', () => {
  const r = parseSummary(
    '🎯🏅 Tiro Deportivo — 50m Rifle 3 Posiciones Masculino (Clasificación y Final)'
  );
  assert.equal(r.sport, 'Tiro Deportivo');
  assert.equal(r.gender, 'Masculino');
  assert.deepEqual(r.teams, []);
  assert.equal(r.phase, '50m Rifle 3 Posiciones Masculino (Clasificación y Final)');
  assert.equal(r.parsed, true);
});

test('Bochas: subdiscipline+comma+nested numeric "vs." must NOT be parsed as teams', () => {
  const r = parseSummary(
    '🎳 Bochas — Petanca, 1ª Fase Clasificatoria (Grupo A: 1 vs. 2 — Grupo B: 4 vs. 5)'
  );
  assert.equal(r.sport, 'Bochas');
  assert.equal(r.gender, null);
  assert.deepEqual(r.teams, []); // no flag emoji present -> not real teams
  assert.equal(r.phase, 'Petanca, 1ª Fase Clasificatoria (Grupo A: 1 vs. 2 — Grupo B: 4 vs. 5)');
  assert.equal(r.parsed, true);
});

test('Bochas: second dash in phase text is kept intact (only first dash splits)', () => {
  const r = parseSummary('🎳 Bochas — Volo Progresivo, Final — Tiro Deportivo Masculino');
  assert.equal(r.sport, 'Bochas');
  assert.equal(r.gender, 'Masculino'); // found via non-destructive phase scan
  assert.equal(r.phase, 'Volo Progresivo, Final — Tiro Deportivo Masculino');
  assert.equal(r.parsed, true);
});

test('sport with no dash at all ("Atletismo — Sesión Mañana")', () => {
  const r = parseSummary('🏃 Atletismo — Sesión Mañana');
  assert.equal(r.sport, 'Atletismo');
  assert.equal(r.phase, 'Sesión Mañana');
  assert.equal(r.gender, null);
});

test('"Mixtos" (plural) is recognized as Mixto', () => {
  const r = parseSummary('🏊 Triatlón — Competencia Relevos Mixtos');
  assert.equal(r.sport, 'Triatlón');
  assert.equal(r.gender, 'Mixto');
  assert.equal(r.phase, 'Competencia Relevos Mixtos');
});

test('"Femenino y Masculino" combined phrase maps to Mixto, not Femenino', () => {
  const r = parseSummary('🏊🏅 Aguas Abiertas — 10 km (Femenino y Masculino)');
  assert.equal(r.sport, 'Aguas Abiertas');
  assert.equal(r.gender, 'Mixto');
});

test('"(Ambos)" maps to Mixto', () => {
  const r = parseSummary('🎿 Esquí Náutico y Wakeboard — Premiación Overall (Ambos)');
  assert.equal(r.sport, 'Esquí Náutico y Wakeboard');
  assert.equal(r.gender, 'Mixto');
});

test('teams with flags and gender attached to sport name via colon (Hockey)', () => {
  const r = parseSummary('🏑 Hockey Femenino: 🇦🇷 Las Leonas vs. 🇵🇪 Perú');
  assert.equal(r.sport, 'Hockey');
  assert.equal(r.gender, 'Femenino');
  assert.equal(r.phase, null);
  assert.deepEqual(r.teams, [
    { flagEmoji: '🇦🇷', name: 'Las Leonas' },
    { flagEmoji: '🇵🇪', name: 'Perú' },
  ]);
  assert.equal(r.parsed, true);
});

test('teams with flags, Masculino (Balonmano)', () => {
  const r = parseSummary('🤾 Balonmano Masculino: 🇵🇪 Perú vs. 🇺🇾 Uruguay');
  assert.equal(r.sport, 'Balonmano');
  assert.equal(r.gender, 'Masculino');
  assert.deepEqual(r.teams, [
    { flagEmoji: '🇵🇪', name: 'Perú' },
    { flagEmoji: '🇺🇾', name: 'Uruguay' },
  ]);
});

test('medal round with rank placeholders and NO flags: not treated as teams', () => {
  const r = parseSummary('🏑🥇 Hockey Femenino — Final (Oro): 1° vs. 2° lugar');
  assert.equal(r.sport, 'Hockey');
  assert.equal(r.gender, 'Femenino');
  assert.equal(r.phase, 'Final (Oro): 1° vs. 2° lugar');
  assert.deepEqual(r.teams, []);
  assert.equal(r.parsed, true);
});

test('medal round, Bronce, ordinal Spanish placeholders (Softbol)', () => {
  const r = parseSummary('🥎🥉 Softbol Femenino — Medalla de Bronce: 4to vs. 3ro');
  assert.equal(r.sport, 'Softbol');
  assert.equal(r.gender, 'Femenino');
  assert.equal(r.phase, 'Medalla de Bronce: 4to vs. 3ro');
  assert.deepEqual(r.teams, []);
});

test('single sport, no gender, no phase ("Billar Carambola — Competencias")', () => {
  const r = parseSummary('🎱 Billar Carambola — Competencias');
  assert.equal(r.sport, 'Billar Carambola');
  assert.equal(r.phase, 'Competencias');
});

test('gender alone in parens, no "y" combo (Escalada, Femenino only)', () => {
  const r = parseSummary('🧗 Escalada — Clasificatoria Bloque (Femenino)');
  assert.equal(r.sport, 'Escalada');
  assert.equal(r.gender, 'Femenino');
  assert.equal(r.phase, 'Clasificatoria Bloque (Femenino)');
});

test('empty/garbage input never throws and always yields a safe titleDisplay', () => {
  assert.doesNotThrow(() => parseSummary(''));
  assert.doesNotThrow(() => parseSummary(undefined));
  assert.doesNotThrow(() => parseSummary('🎉🎊🎈'));
  const empty = parseSummary('');
  assert.equal(empty.titleDisplay, '');
  assert.equal(empty.parsed, false);
  // A string that's entirely decorative emoji has no letters to keep, so the
  // fallback shows the original raw text rather than an empty display.
  const onlyEmoji = parseSummary('🎉🎊🎈');
  assert.equal(onlyEmoji.parsed, false);
  assert.equal(onlyEmoji.titleDisplay, '🎉🎊🎈');
  assert.equal(onlyEmoji.titleDisplay, onlyEmoji.sport); // fallback uses titleDisplay as sport too
});
