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
  const points = calculatePoints(records, childId);
  const unlockedCount = BADGES.filter((b) => b.condition(records, childId)).length;

  const html = BADGES.map((badge) => {
    const unlocked = badge.condition(records, childId);
    const progress = badge.progress ? badge.progress(records, childId) : { current: unlocked ? 1 : 0, total: 1 };
    const percent = progress.total > 0 ? Math.min(100, Math.round((progress.current / progress.total) * 100)) : 0;

    return `
      <div class="badge-item ${unlocked ? '' : 'locked'}">
        <div class="badge-icon">${badge.icon}</div>
        <div class="badge-name">${badge.name}</div>
        <div class="badge-progress-bar">
          <div class="badge-progress-fill" style="width: ${percent}%"></div>
        </div>
        <div class="badge-progress-text">${progress.current}/${progress.total}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="child-header mb-2">
      <img src="${child.avatar}" alt="${child.name}" onerror="this.style.display='none'">
      <div class="child-info">
        <div class="child-name">${child.name} 的徽章墙</div>
        <div class="child-meta">🏆 已解锁 ${unlockedCount}/${BADGES.length} · ⭐ 成长积分 ${points}</div>
      </div>
    </div>
    <div class="badge-grid">${html}</div>
  `;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderBadgesPage };
}
