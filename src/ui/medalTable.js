// Final medal standings, captured from results.santafe2026.org once the
// Games wrapped up. Static snapshot — not live data.
const STANDINGS = [
  { noc: 'BRA', name: 'Brasil', flag: '🇧🇷', gold: 122, silver: 107, bronze: 83 },
  { noc: 'ARG', name: 'Argentina', flag: '🇦🇷', gold: 81, silver: 87, bronze: 125 },
  { noc: 'COL', name: 'Colombia', flag: '🇨🇴', gold: 69, silver: 61, bronze: 62 },
  { noc: 'CHI', name: 'Chile', flag: '🇨🇱', gold: 49, silver: 58, bronze: 68 },
  { noc: 'VEN', name: 'Venezuela', flag: '🇻🇪', gold: 48, silver: 43, bronze: 55 },
  { noc: 'PER', name: 'Perú', flag: '🇵🇪', gold: 28, silver: 32, bronze: 39 },
  { noc: 'URU', name: 'Uruguay', flag: '🇺🇾', gold: 17, silver: 14, bronze: 23 },
  { noc: 'ECU', name: 'Ecuador', flag: '🇪🇨', gold: 16, silver: 27, bronze: 39 },
  { noc: 'PAR', name: 'Paraguay', flag: '🇵🇾', gold: 9, silver: 9, bronze: 19 },
  { noc: 'PAN', name: 'Panamá', flag: '🇵🇦', gold: 5, silver: 3, bronze: 8 },
  { noc: 'BOL', name: 'Bolivia', flag: '🇧🇴', gold: 3, silver: 4, bronze: 9 },
  { noc: 'CUW', name: 'Curazao', flag: '🇨🇼', gold: 1, silver: 0, bronze: 1 },
  { noc: 'ARU', name: 'Aruba', flag: '🇦🇼', gold: 0, silver: 3, bronze: 1 },
  { noc: 'GUY', name: 'Guyana', flag: '🇬🇾', gold: 0, silver: 0, bronze: 4 },
];

function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

export function renderMedalTable(container) {
  const section = document.createElement('section');
  section.className = 'medal-table-section';
  section.innerHTML = `
    <h2 class="medal-table-heading">🏆 Medallero final</h2>
    <div class="medal-table-scroll">
      <table class="medal-table">
        <thead>
          <tr>
            <th class="medal-col-rank">#</th>
            <th class="medal-col-noc">País</th>
            <th>🥇</th>
            <th>🥈</th>
            <th>🥉</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${STANDINGS.map(
            (row, i) => `
              <tr>
                <td class="medal-col-rank">${i + 1}</td>
                <td class="medal-col-noc">${row.flag} ${escapeHtml(row.name)}</td>
                <td>${row.gold}</td>
                <td>${row.silver}</td>
                <td>${row.bronze}</td>
                <td class="medal-col-total">${row.gold + row.silver + row.bronze}</td>
              </tr>
            `
          ).join('')}
        </tbody>
      </table>
    </div>
    <p class="medal-table-source">
      Fuente: <a href="https://results.santafe2026.org/#/medals/standings" target="_blank" rel="noopener">results.santafe2026.org</a>
    </p>
  `;
  container.appendChild(section);
}
