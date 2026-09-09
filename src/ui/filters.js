import { getState, setState, subscribe } from '../state/appState.js';
import { debounce } from '../lib/domUtil.js';

export function mountFilters(container, data) {
  const bar = document.createElement('div');
  bar.className = 'filters-bar';

  const sportSelect = document.createElement('select');
  sportSelect.setAttribute('aria-label', 'Filtrar por deporte');
  sportSelect.innerHTML =
    '<option value="">Todos los deportes</option>' +
    data.sports.map((s) => `<option value="${s}">${s}</option>`).join('');

  const venueSelect = document.createElement('select');
  venueSelect.setAttribute('aria-label', 'Filtrar por sede');
  venueSelect.innerHTML =
    '<option value="">Todas las sedes</option>' +
    data.venues.map((v) => `<option value="${v.name}">${v.name}</option>`).join('');

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'Buscar equipo, deporte, sede…';
  searchInput.setAttribute('aria-label', 'Buscar');

  sportSelect.addEventListener('change', () => {
    setState({ filters: { ...getState().filters, sport: sportSelect.value || null } });
  });
  venueSelect.addEventListener('change', () => {
    setState({ filters: { ...getState().filters, venue: venueSelect.value || null } });
  });
  const onSearch = debounce(() => {
    setState({ filters: { ...getState().filters, query: searchInput.value } });
  }, 200);
  searchInput.addEventListener('input', onSearch);

  function render(state) {
    sportSelect.value = state.filters.sport ?? '';
    venueSelect.value = state.filters.venue ?? '';
    if (document.activeElement !== searchInput) searchInput.value = state.filters.query ?? '';
  }
  render(getState());
  subscribe(render);

  bar.append(searchInput, sportSelect, venueSelect);
  container.appendChild(bar);
}
