import { getState, setState, subscribe } from '../state/appState.js';
import { dayMonthLabel } from '../domain/dateWindow.js';

export function mountWeekNav(container, weeks) {
  const nav = document.createElement('div');
  nav.className = 'week-nav';

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'btn btn-icon';
  prevBtn.textContent = '←';
  prevBtn.setAttribute('aria-label', 'Semana anterior');

  const label = document.createElement('div');
  label.className = 'week-label';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'btn btn-icon';
  nextBtn.textContent = '→';
  nextBtn.setAttribute('aria-label', 'Semana siguiente');

  const datePicker = document.createElement('input');
  datePicker.type = 'date';
  datePicker.min = weeks[0].start;
  datePicker.max = weeks[weeks.length - 1].end;

  prevBtn.addEventListener('click', () => {
    const idx = getState().currentWeekIndex;
    if (idx > 0) setState({ currentWeekIndex: idx - 1 });
  });
  nextBtn.addEventListener('click', () => {
    const idx = getState().currentWeekIndex;
    if (idx < weeks.length - 1) setState({ currentWeekIndex: idx + 1 });
  });
  datePicker.addEventListener('change', () => {
    if (!datePicker.value) return;
    const idx = weeks.findIndex((w) => datePicker.value >= w.start && datePicker.value <= w.end);
    setState({
      selectedDate: datePicker.value,
      currentWeekIndex: idx === -1 ? getState().currentWeekIndex : idx,
    });
  });

  function render(state) {
    const week = weeks[state.currentWeekIndex] ?? weeks[0];
    label.textContent = `${dayMonthLabel(week.start)} – ${dayMonthLabel(week.end)}`;
    prevBtn.disabled = state.currentWeekIndex <= 0;
    nextBtn.disabled = state.currentWeekIndex >= weeks.length - 1;
    if (state.selectedDate) datePicker.value = state.selectedDate;
  }

  render(getState());
  subscribe(render);

  nav.append(prevBtn, label, nextBtn, datePicker);
  container.appendChild(nav);
}
