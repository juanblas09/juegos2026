import { downloadIcs } from './calendarExport.js';
import { buildShareUrl } from '../state/urlState.js';

function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

/** Renders a single event's detail card. Returns the DOM node. */
export function renderEventCard(event) {
  const card = document.createElement('article');
  card.className = 'event-card';

  const title = event.parsed ? event.titleComposed : event.titleDisplay;

  card.innerHTML = `
    <div class="event-time">${event.startTimeLabel} – ${event.endTimeLabel}</div>
    <h3 class="event-title">${escapeHtml(title)}</h3>
    <p class="event-meta">
      📍 ${escapeHtml(event.venueName)}
      ${event.isOutOfCity ? '<span class="badge-out-of-city">· fuera de la ciudad</span>' : ''}
    </p>
    ${event.description ? `<p class="event-description">${escapeHtml(event.description)}</p>` : ''}
    <div class="event-actions"></div>
  `;

  const actions = card.querySelector('.event-actions');

  const mapsLink = document.createElement('a');
  mapsLink.className = 'btn';
  mapsLink.href = event.mapsUrl;
  mapsLink.target = '_blank';
  mapsLink.rel = 'noopener';
  mapsLink.textContent = '🧭 Cómo llegar';
  actions.appendChild(mapsLink);

  const gcalLink = document.createElement('a');
  gcalLink.className = 'btn';
  gcalLink.href = event.gcalUrl;
  gcalLink.target = '_blank';
  gcalLink.rel = 'noopener';
  gcalLink.textContent = '📅 Google Calendar';
  actions.appendChild(gcalLink);

  const icsButton = document.createElement('button');
  icsButton.type = 'button';
  icsButton.className = 'btn';
  icsButton.textContent = '⬇️ Descargar .ics';
  icsButton.addEventListener('click', () => downloadIcs(event));
  actions.appendChild(icsButton);

  const shareButton = document.createElement('button');
  shareButton.type = 'button';
  shareButton.className = 'btn';
  shareButton.textContent = '🔗 Compartir este día';
  shareButton.addEventListener('click', async () => {
    const url = buildShareUrl(event.date);
    if (navigator.share) {
      try {
        await navigator.share({ url, title: 'Grilla ODESUR Santa Fe 2026' });
        return;
      } catch {
        /* user cancelled the native share sheet, fall through to clipboard */
      }
    }
    await navigator.clipboard?.writeText(url);
    shareButton.textContent = '✅ Link copiado';
    setTimeout(() => {
      shareButton.textContent = '🔗 Compartir este día';
    }, 2000);
  });
  actions.appendChild(shareButton);

  return card;
}
