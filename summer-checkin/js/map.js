function renderMapPage() {
  const container = document.getElementById('map-container');
  if (!container) return;

  const records = getRecords();
  const today = getToday();
  const currentWeek = getWeekNumber(today);

  let html = '<div class="map-track">';
  MAP_NODES.forEach((node, index) => {
    const week = index + 1;
    let status = 'locked';
    if (week < currentWeek) status = 'completed';
    else if (week === currentWeek) status = 'current';

    const icons = ['🚀', '🏕️', '🌊', '⛰️', '🌲', '🏖️', '🏔️', '🏆'];

    html += `
      <div class="map-node ${status}" data-week="${week}">
        <div class="map-node-dot">${status === 'completed' ? '✓' : icons[index]}</div>
        <div class="map-node-label">${node.label}<br>第${week}周</div>
      </div>
    `;
  });
  html += '</div>';

  container.innerHTML = html;

  const currentNode = container.querySelector('.map-node.current');
  if (currentNode) {
    setTimeout(() => {
      currentNode.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }, 100);
  }

  const infoPanel = document.getElementById('map-info');
  if (infoPanel) {
    const currentNode = MAP_NODES[currentWeek - 1];
    infoPanel.innerHTML = `
      <h3>本周目标：第${currentWeek}周 · ${currentNode.label}</h3>
      <p>本周奖励：${currentNode.reward}</p>
      <p>当前日期：${today}</p>
    `;
  }

  container.querySelectorAll('.map-node').forEach((node) => {
    node.addEventListener('click', () => {
      const week = parseInt(node.dataset.week, 10);
      const nodeData = MAP_NODES[week - 1];
      if (infoPanel) {
        infoPanel.innerHTML = `
          <h3>第${week}周 · ${nodeData.label}</h3>
          <p>奖励：${nodeData.reward}</p>
          <p>${week <= currentWeek ? '已解锁' : '还未到哦，继续加油！'}</p>
        `;
      }
    });
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderMapPage };
}
