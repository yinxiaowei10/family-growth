document.addEventListener('DOMContentLoaded', () => {
  initServiceWorker();
  initNavigation();
});

function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/summer-checkin/sw.js')
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
