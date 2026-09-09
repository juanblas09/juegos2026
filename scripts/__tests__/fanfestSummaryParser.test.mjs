import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFanfestSummary } from '../../shared/fanfestSummaryParser.mjs';

test('plain act name with stage suffix', () => {
  const r = parseFanfestSummary('Santiago Motorizado - Fan Fest Escenario 1');
  assert.equal(r.title, 'Santiago Motorizado');
  assert.equal(r.stage, 'Escenario 1');
});

test('generic "DJ" filler entry', () => {
  const r = parseFanfestSummary('DJ - Fan Fest Escenario 1');
  assert.equal(r.title, 'DJ');
  assert.equal(r.stage, 'Escenario 1');
});

test('tentative act keeps the "(a confirmar)" marker in the title', () => {
  const r = parseFanfestSummary('Primavera Rock (a confirmar) - Fan Fest Escenario 1');
  assert.equal(r.title, 'Primavera Rock (a confirmar)');
  assert.equal(r.stage, 'Escenario 1');
});

test('act name that itself contains a dash is not split on the wrong one', () => {
  const r = parseFanfestSummary('DJ - Set Doble - Fan Fest Escenario 1');
  assert.equal(r.title, 'DJ - Set Doble');
  assert.equal(r.stage, 'Escenario 1');
});

test('summary that does not match the expected shape degrades to raw text', () => {
  const r = parseFanfestSummary('Algo inesperado sin el sufijo');
  assert.equal(r.title, 'Algo inesperado sin el sufijo');
  assert.equal(r.stage, null);
});

test('non-string input never throws', () => {
  const r = parseFanfestSummary(undefined);
  assert.equal(r.title, '');
  assert.equal(r.stage, null);
});
