function renderBadgesPage() {
  const container = document.getElementById('badges-container');
  if (!container) return;

  const records = getRecords();
  const childSelector = document.getElementById('badge-child-select');
  let childId = childSelector ? childSelector.value : 'tongtong';

  if (childSelector) {
    childSelector.addEventListener('change', () => {
      renderBadgesForChild(childSelector.value, records, container);
    });
  }

  renderBadgesForChild(childId, records, container);
}

function renderBadgesForChild(childId, records, container) {
  const child = CHILDREN[childId];
  const html = BADGES.map((badge) => {
    const unlocked = badge.condition(records, childId);
    return `
      <div class="badge-item ${unlocked ? '' : 'locked'}">
        <div class="badge-icon">${badge.icon}</div>
        <div class="badge-name">${badge.name}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="child-header mb-2">
      <img src="${child.avatar}" alt="${child.name}" onerror="this.style.display='none'">
      <div class="child-info">
        <div class="child-name">${child.name} 的徽章墙</div>
      </div>
    </div>
    <div class="badge-grid">${html}</div>
  `;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderBadgesPage };
}
