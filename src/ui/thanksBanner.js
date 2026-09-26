// Closing "thank you" card shown once the Games are over, ahead of the
// generic ended-banner. Purely celebratory, no interactive state.
export function renderThanksBanner(container) {
  const banner = document.createElement('div');
  banner.className = 'banner banner-thanks';
  banner.innerHTML = `
    <span class="banner-thanks-emoji" aria-hidden="true">🎉</span>
    <div>
      <strong>¡Gracias por acompañarnos!</strong>
      <p>Gracias a todos los que usaron esta grilla para seguir los Juegos ODESUR Santa Fe 2026: a quienes armaron sus días con ella, a quienes la compartieron y a quienes llegaron a las canchas gracias a ella. ¡Fue un gusto acompañarlos!</p>
    </div>
  `;
  container.appendChild(banner);
}
