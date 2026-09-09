// "Sumate a toda la agenda": subscribe links for the FULL calendar (not a single
// event) - Google Calendar's add-by-URL shortcut, a webcal:// link for
// Apple/Outlook/etc., and a plain copy-link fallback for anything else.
import { ICS_URL } from '../../shared/icsSource.mjs';
import { buildGoogleCalendarSubscribeUrl, buildWebcalUrl } from '../../shared/calendarSubscribeLinks.mjs';

export function renderSubscribeCalendar(container) {
  const panel = document.createElement('div');
  panel.className = 'banner banner-subscribe';
  panel.innerHTML = `
    <strong>📆 Sumate a toda la agenda</strong>
    <p>Suscribite al calendario completo y recibí automáticamente cualquier cambio de horario.</p>
    <div class="event-actions"></div>
  `;
  const actions = panel.querySelector('.event-actions');

  const gcalLink = document.createElement('a');
  gcalLink.className = 'btn btn-accent';
  gcalLink.href = buildGoogleCalendarSubscribeUrl(ICS_URL);
  gcalLink.target = '_blank';
  gcalLink.rel = 'noopener';
  gcalLink.textContent = '📅 Google Calendar';
  actions.appendChild(gcalLink);

  const webcalLink = document.createElement('a');
  webcalLink.className = 'btn';
  webcalLink.href = buildWebcalUrl(ICS_URL);
  webcalLink.textContent = '🍎 Apple / Outlook';
  actions.appendChild(webcalLink);

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'btn';
  copyBtn.textContent = '🔗 Copiar link del calendario';
  copyBtn.addEventListener('click', async () => {
    await navigator.clipboard?.writeText(ICS_URL);
    copyBtn.textContent = '✅ Copiado';
    setTimeout(() => {
      copyBtn.textContent = '🔗 Copiar link del calendario';
    }, 2000);
  });
  actions.appendChild(copyBtn);

  container.appendChild(panel);
}
