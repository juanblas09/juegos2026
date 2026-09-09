// Post-event "games have ended" banner. The grid stays fully mounted/navigable
// underneath, exactly as in the 'during' phase - this just adds context.
export function renderEndedBanner(container) {
  const banner = document.createElement('div');
  banner.className = 'banner banner-ended';
  banner.innerHTML = `
    <strong>Los Juegos ODESUR Santa Fe 2026 ya terminaron.</strong>
    Podés seguir consultando la grilla completa de actividades más abajo.
  `;
  container.appendChild(banner);
}
