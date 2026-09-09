// Pre-event countdown banner. Refreshed every minute (not per-second - a
// countdown to an event weeks away doesn't need second-level precision).
import { daysBetween, todayInArgentina } from '../domain/dateWindow.js';

const REFRESH_MS = 60_000;

export function renderCountdown(container, { windowStart }) {
  const banner = document.createElement('div');
  banner.className = 'banner banner-countdown';

  function update() {
    const days = daysBetween(todayInArgentina(new Date()), windowStart);
    banner.innerHTML = `
      <div class="countdown-value">${Math.max(days, 0)} día${days === 1 ? '' : 's'}</div>
      <div>faltan para que arranquen los Juegos ODESUR Santa Fe 2026.</div>
    `;
  }

  update();
  const intervalId = setInterval(update, REFRESH_MS);
  container.appendChild(banner);
  return () => clearInterval(intervalId);
}
