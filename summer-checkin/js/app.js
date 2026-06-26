document.addEventListener('DOMContentLoaded', () => {
  initTaskLibrary();
  initServiceWorker();
  initNavigation();
  renderPortalSnapshot();
});

function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => {
        console.log('Service Worker 注册成功', reg.scope);
      })
      .catch((err) => {
        console.error('Service Worker 注册失败', err);
      });
  }
}

function initNavigation() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-bar a');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

function renderPortalSnapshot() {
  const container = document.getElementById('today-snapshot');
  if (!container) return;

  const today = getToday();
  const records = getRecords();
  const grid = container.querySelector('.snapshot-grid');
  if (!grid) return;

  grid.innerHTML = Object.values(CHILDREN)
    .map((child) => {
      const tasks = TASKS[child.id].filter((t) => !t.optional);
      const dayRecord = records[today]?.[child.id] || {};
      const done = tasks.filter((t) => dayRecord[t.id]).length;
      const total = tasks.length;
      const percent = total > 0 ? Math.round((done / total) * 100) : 0;

      return `
        <div class="snapshot-card ${child.theme}">
          <img src="${child.avatar}" alt="${child.name}" onerror="this.style.display='none'">
          <div class="snapshot-info">
            <div class="snapshot-name">${child.name}</div>
            <div class="snapshot-bar"><div class="snapshot-fill" style="width: ${percent}%"></div></div>
            <div class="snapshot-text">${done}/${total} 完成 · ${percent}%</div>
          </div>
        </div>
      `;
    })
    .join('');
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getToday() {
  return formatDate(new Date());
}

function getWeekNumber(dateStr) {
  const start = new Date(SUMMER_START);
  const current = new Date(dateStr);
  const diffTime = current - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(TOTAL_WEEKS, Math.floor(diffDays / 7) + 1));
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatDate,
    getToday,
    getWeekNumber,
    downloadFile
  };
}
