// Dark mode: follows the system preference by default, with a manual toggle
// persisted in localStorage. Once the user toggles manually, system-preference
// changes no longer override their choice (tracked via a separate flag) - a
// small but important UX-correctness detail.
import { getState, setState, subscribe } from '../state/appState.js';

const STORAGE_KEY = 'theme';
const MANUAL_KEY = 'themeManuallySet';

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function initTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  const theme = stored ?? (systemPrefersDark() ? 'dark' : 'light');
  setState({ theme });
  applyTheme(theme);

  subscribe((state) => applyTheme(state.theme));

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (localStorage.getItem(MANUAL_KEY) === '1') return; // user has an explicit choice, don't override
    const nextTheme = e.matches ? 'dark' : 'light';
    setState({ theme: nextTheme });
  });
}

export function toggleTheme() {
  const next = getState().theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(STORAGE_KEY, next);
  localStorage.setItem(MANUAL_KEY, '1');
  setState({ theme: next });
}

export function renderThemeToggle(container) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-icon';
  button.setAttribute('aria-label', 'Cambiar tema claro/oscuro');

  function updateLabel(state) {
    button.textContent = state.theme === 'dark' ? '☀️' : '🌙';
  }
  updateLabel(getState());
  subscribe(updateLabel);

  button.addEventListener('click', toggleTheme);
  container.appendChild(button);
}
