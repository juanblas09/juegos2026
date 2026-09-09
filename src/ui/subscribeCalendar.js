// "Sumate a toda la agenda": subscribe links for a FULL calendar source (not a
// single event) - Google Calendar's add-by-URL shortcut, a webcal:// link for
// Apple/Outlook/etc., and a plain copy-link fallback for anything else.
// Takes one entry from ICS_SOURCES (see shared/icsSource.mjs) at a time, so
// each source's callers can place its subscribe block wherever it belongs in
// the page - a static site can't merge two live Google Calendars into one
// subscribable feed, so there's no single unified block to render.
import { buildGoogleCalendarSubscribeUrl, buildWebcalUrl } from '../../shared/calendarSubscribeLinks.mjs';

function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

export function renderSubscribeCalendar(container, source) {
  const panel = document.createElement('div');
  panel.className = 'banner banner-subscribe';
  panel.innerHTML = `
    <strong>📆 Sumate a la agenda: ${escapeHtml(source.name)}</strong>
    <p>Suscribite al calendario completo y recibí automáticamente cualquier cambio de horario.</p>
    <div class="event-actions"></div>
  `;
  const actions = panel.querySelector('.event-actions');

  const gcalLink = document.createElement('a');
  gcalLink.className = 'btn btn-accent';
  gcalLink.href = buildGoogleCalendarSubscribeUrl(source.url);
  gcalLink.target = '_blank';
  gcalLink.rel = 'noopener';
  gcalLink.textContent = '📅 Google Calendar';
  actions.appendChild(gcalLink);

  const webcalLink = document.createElement('a');
  webcalLink.className = 'btn';
  webcalLink.href = buildWebcalUrl(source.url);
  webcalLink.textContent = '🍎 Apple / Outlook';
  actions.appendChild(webcalLink);

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'btn';
  copyBtn.textContent = '🔗 Copiar link del calendario';
  copyBtn.addEventListener('click', async () => {
    await navigator.clipboard?.writeText(source.url);
    copyBtn.textContent = '✅ Copiado';
    setTimeout(() => {
      copyBtn.textContent = '🔗 Copiar link del calendario';
    }, 2000);
  });
  actions.appendChild(copyBtn);

  container.appendChild(panel);
}
