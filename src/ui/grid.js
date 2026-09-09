// Renders the día × deporte cross-grid for the currently-selected week, plus the
// day-detail drawer for whichever date is selected. Filters/search never hide
// grid cells (dims them instead), so the grid's shape stays stable on mobile.
import { getState, setState, subscribe } from '../state/appState.js';
import { applyFilters, isFilterActive } from '../domain/filtering.js';
import { weekdayLabel, dayMonthLabel, todayInArgentina } from '../domain/dateWindow.js';
import { renderEventCard } from './eventCard.js';

function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

export function mountGrid(gridContainer, drawerContainer, data, weeks) {
  const today = todayInArgentina(new Date());

  function renderWeek(state) {
    const week = weeks[state.currentWeekIndex] ?? weeks[0];
    const matchingIds = applyFilters(data.events, state.filters);
    const filterActive = isFilterActive(state.filters);

    const grid = document.createElement('div');
    grid.className = 'event-grid';

    // Header row
    grid.appendChild(document.createElement('div')).className = 'grid-head-cell';
    for (const date of week.dates) {
      const cell = document.createElement('div');
      cell.className = 'grid-head-cell' + (date === today ? ' is-today' : '');
      cell.innerHTML = `${dayMonthLabel(date)}<span class="weekday">${escapeHtml(weekdayLabel(date))}</span>`;
      grid.appendChild(cell);
    }

    // One row per sport
    for (const sport of data.sports) {
      const sportCell = document.createElement('div');
      sportCell.className = 'grid-sport-cell';
      sportCell.textContent = sport;
      grid.appendChild(sportCell);

      const bySportDate = data.eventsBySportAndDate.get(sport);

      for (const date of week.dates) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        const events = bySportDate?.get(date) ?? [];

        if (events.length > 0) {
          const hasMatch = !filterActive || events.some((e) => matchingIds.has(e.id));
          if (!hasMatch) cell.classList.add('is-dimmed');

          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'grid-cell-btn' + (date === state.selectedDate ? ' is-selected' : '');
          btn.innerHTML = `<span class="count-badge">${events.length}</span>`;
          btn.setAttribute(
            'aria-label',
            `${sport}, ${dayMonthLabel(date)}: ${events.length} actividad(es)`
          );
          btn.addEventListener('click', () => setState({ selectedDate: date }));
          cell.appendChild(btn);
        }

        grid.appendChild(cell);
      }
    }

    gridContainer.replaceChildren(grid);
  }

  function renderDrawer(state) {
    const events = (data.eventsByDate.get(state.selectedDate) ?? [])
      .slice()
      .sort((a, b) => a.startTimeLabel.localeCompare(b.startTimeLabel));

    const matchingIds = applyFilters(data.events, state.filters);
    const filterActive = isFilterActive(state.filters);

    const drawer = document.createElement('div');
    drawer.className = 'detail-drawer';

    const heading = document.createElement('div');
    heading.className = 'drawer-heading';
    heading.innerHTML = `<h2>${escapeHtml(dayMonthLabel(state.selectedDate))} <span class="weekday">${escapeHtml(
      weekdayLabel(state.selectedDate)
    )}</span></h2>`;
    drawer.appendChild(heading);

    if (events.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'No hay actividades programadas para este día.';
      drawer.appendChild(empty);
    } else {
      for (const event of events) {
        const card = renderEventCard(event);
        if (filterActive && !matchingIds.has(event.id)) card.style.opacity = '0.4';
        drawer.appendChild(card);
      }
    }

    drawerContainer.replaceChildren(drawer);
  }

  function renderAll(state) {
    renderWeek(state);
    if (state.selectedDate) renderDrawer(state);
    else drawerContainer.replaceChildren();
  }

  renderAll(getState());
  subscribe(renderAll);
}
