import { loadEvents } from './data/loadEvents.js';
import { setState } from './state/appState.js';
import { readInitialUrlState, startUrlSync } from './state/urlState.js';
import { getPhase, getDefaultDate, buildWeeks, findWeekIndexForDate, todayInArgentina } from './domain/dateWindow.js';
import { initTheme, renderThemeToggle } from './ui/themeToggle.js';
import { renderCountdown } from './ui/countdown.js';
import { renderEndedBanner } from './ui/endedBanner.js';
import { mountFilters } from './ui/filters.js';
import { mountWeekNav } from './ui/weekNav.js';
import { mountGrid } from './ui/grid.js';
import { renderSubscribeCalendar } from './ui/subscribeCalendar.js';
import { mountFanfest } from './ui/fanfest.js';
import { getIcsSource } from '../shared/icsSource.mjs';

function buildLayout(root) {
  root.innerHTML = `
    <div class="page">
      <header class="site-header">
        <div>
          <h1>🏅 Grilla ODESUR Santa Fe 2026</h1>
          <p class="subtitle">Actividades de los Juegos Suramericanos en la ciudad de Santa Fe</p>
        </div>
        <div class="header-actions"></div>
      </header>
      <div class="banners"></div>
      <div class="subscribe-slot"></div>
      <div class="filters-slot"></div>
      <div class="week-nav-slot"></div>
      <div class="grid-scroll grid-slot"></div>
      <div class="drawer-slot"></div>
      <div class="fanfest-slot"></div>
    </div>
  `;
  return {
    headerActions: root.querySelector('.header-actions'),
    banners: root.querySelector('.banners'),
    subscribeSlot: root.querySelector('.subscribe-slot'),
    filtersSlot: root.querySelector('.filters-slot'),
    weekNavSlot: root.querySelector('.week-nav-slot'),
    gridSlot: root.querySelector('.grid-slot'),
    drawerSlot: root.querySelector('.drawer-slot'),
    fanfestSlot: root.querySelector('.fanfest-slot'),
  };
}

function main() {
  const root = document.getElementById('app');
  const data = loadEvents();
  const slots = buildLayout(root);

  initTheme();
  renderThemeToggle(slots.headerActions);

  const now = new Date();
  const today = todayInArgentina(now);
  const phase = getPhase(today, data.windowStart, data.windowEnd);

  if (phase === 'before') {
    renderCountdown(slots.banners, { windowStart: data.windowStart });
  } else if (phase === 'after') {
    renderEndedBanner(slots.banners);
  }

  const weeks = buildWeeks(data.windowStart, data.windowEnd);
  const defaultDate = getDefaultDate(today, data.eventsByDate, data.windowStart, data.windowEnd);
  const initialFromUrl = readInitialUrlState({
    windowStart: data.windowStart,
    windowEnd: data.windowEnd,
    sports: data.sports,
  });

  const initialSelectedDate = initialFromUrl.selectedDate ?? defaultDate;
  setState({
    selectedDate: initialSelectedDate,
    currentWeekIndex: findWeekIndexForDate(weeks, initialSelectedDate),
    ...(initialFromUrl.filters ? { filters: initialFromUrl.filters } : {}),
  });

  renderSubscribeCalendar(slots.subscribeSlot, getIcsSource('odesur'));
  mountFilters(slots.filtersSlot, data);
  mountWeekNav(slots.weekNavSlot, weeks);
  mountGrid(slots.gridSlot, slots.drawerSlot, data, weeks);
  mountFanfest(slots.fanfestSlot, data.fanfest, getIcsSource('fanfest'));

  startUrlSync();
}

main();
