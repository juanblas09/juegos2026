// Renders the standalone "Fan Fest" section: a lightweight day-picker (local
// state only, no URL sync) over the festival's own date range, showing one
// day's lineup at a time as simple time+act chips. Deliberately doesn't reuse
// the sports grid/eventCard machinery - Fan Fest is a single-venue,
// single-track program, not a día × deporte matrix, and its ~80 short acts
// don't need per-event action buttons: one "cómo llegar" link covers the
// whole section instead of repeating Maps/Calendar/.ics buttons ~9 times a day.
import { dayMonthLabel, weekdayLabel, todayInArgentina, getDefaultDate, addDays } from '../domain/dateWindow.js';
import { renderSubscribeCalendar } from './subscribeCalendar.js';

function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

/**
 * @param {HTMLElement} container
 * @param {object} fanfest data.fanfest, as built by loadEvents.js
 * @param {{slug:string,name:string,url:string}} subscribeSource the ICS_SOURCES
 *   entry for this festival, so its own subscribe block can live inside this
 *   section instead of at the top of the page with the sports one.
 */
export function mountFanfest(container, fanfest, subscribeSource) {
  const { name, venueName, mapsUrl, windowStart, windowEnd, eventsByDate } = fanfest;
  const today = todayInArgentina(new Date());
  let currentDate = getDefaultDate(today, eventsByDate, windowStart, windowEnd);

  const section = document.createElement('section');
  section.className = 'fanfest-section';
  section.innerHTML = `
    <div class="fanfest-header">
      <h2>🎤 ${escapeHtml(name)}</h2>
      <p class="fanfest-venue">
        📍 ${escapeHtml(venueName)} ·
        <a class="fanfest-maps-link" href="${mapsUrl}" target="_blank" rel="noopener">Cómo llegar</a>
      </p>
    </div>
    <div class="fanfest-daypicker">
      <button type="button" class="btn btn-icon fanfest-prev" aria-label="Día anterior">←</button>
      <div class="fanfest-day-label"></div>
      <button type="button" class="btn btn-icon fanfest-next" aria-label="Día siguiente">→</button>
    </div>
    <ul class="fanfest-lineup"></ul>
    <div class="fanfest-subscribe-slot"></div>
  `;

  if (subscribeSource) {
    renderSubscribeCalendar(section.querySelector('.fanfest-subscribe-slot'), subscribeSource);
  }

  const dayLabel = section.querySelector('.fanfest-day-label');
  const prevBtn = section.querySelector('.fanfest-prev');
  const nextBtn = section.querySelector('.fanfest-next');
  const lineup = section.querySelector('.fanfest-lineup');

  function render() {
    dayLabel.textContent = `${weekdayLabel(currentDate)} ${dayMonthLabel(currentDate)}`;
    prevBtn.disabled = currentDate <= windowStart;
    nextBtn.disabled = currentDate >= windowEnd;

    const events = eventsByDate.get(currentDate) ?? [];
    lineup.innerHTML = '';

    if (events.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty-state';
      empty.textContent = 'Sin actividades este día.';
      lineup.appendChild(empty);
      return;
    }

    for (const event of events) {
      const item = document.createElement('li');
      item.className = 'fanfest-chip';
      item.innerHTML = `
        <span class="fanfest-chip-time">${event.startTimeLabel}</span>
        <span class="fanfest-chip-title">${escapeHtml(event.title)}</span>
      `;
      lineup.appendChild(item);
    }
  }

  prevBtn.addEventListener('click', () => {
    if (currentDate <= windowStart) return;
    currentDate = addDays(currentDate, -1);
    render();
  });
  nextBtn.addEventListener('click', () => {
    if (currentDate >= windowEnd) return;
    currentDate = addDays(currentDate, 1);
    render();
  });

  render();
  container.appendChild(section);
}
