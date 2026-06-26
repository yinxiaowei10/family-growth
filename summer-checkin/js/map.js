function renderMapPage() {
  const container = document.getElementById('map-container');
  if (!container) return;

  const records = getRecords();
  const today = getToday();
  const currentWeek = getWeekNumber(today);

  const width = 1000;
  const height = 720;

  const nodes = [
    { week: 1, label: '出发', reward: '适应期小奖励', x: 80, y: 620, emoji: '🚀', color: '#87CEEB' },
    { week: 2, label: '第一站', reward: '选一部电影', x: 220, y: 500, emoji: '🏕️', color: '#98D98E' },
    { week: 3, label: '小河旁', reward: '户外野餐', x: 380, y: 580, emoji: '🌊', color: '#87CEEB' },
    { week: 4, label: '半山腰', reward: '小玩具一个', x: 520, y: 420, emoji: '⛰️', color: '#DDA0DD' },
    { week: 5, label: '森林里', reward: '书店任选一本书', x: 680, y: 500, emoji: '🌲', color: '#98D98E' },
    { week: 6, label: '湖边', reward: '冰淇淋日', x: 800, y: 340, emoji: '🏖️', color: '#FFB347' },
    { week: 7, label: '山顶', reward: '周末短途游', x: 660, y: 220, emoji: '🏔️', color: '#DDA0DD' },
    { week: 8, label: '终点', reward: '暑假大奖', x: 420, y: 120, emoji: '🏆', color: '#FFE082' }
  ];

  function segmentPath(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const cp1 = { x: a.x + dx * 0.4, y: a.y + dy * 0.1 };
    const cp2 = { x: b.x - dx * 0.4, y: b.y - dy * 0.1 };
    return `M ${a.x} ${a.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${b.x} ${b.y}`;
  }

  const completedColor = '#FFD700';
  const currentColor = '#FF8C00';
  const lockedColor = '#A0AEC0';

  let pathsHtml = '';
  for (let i = 0; i < nodes.length - 1; i++) {
    const targetWeek = nodes[i + 1].week;
    let status = 'locked';
    if (targetWeek < currentWeek) status = 'completed';
    else if (targetWeek === currentWeek) status = 'current';

    const d = segmentPath(nodes[i], nodes[i + 1]);
    const stroke = status === 'completed' ? completedColor : status === 'current' ? currentColor : lockedColor;
    const dash = status === 'locked' ? '10,10' : 'none';
    const width = status === 'current' ? 14 : 10;
    const animation = status === 'current' ? `<animate attributeName="stroke-dashoffset" from="100" to="0" dur="1.5s" repeatCount="indefinite" />` : '';

    pathsHtml += `
      <path d="${d}" stroke="${stroke}" stroke-width="${width}" fill="none" stroke-linecap="round" stroke-dasharray="${dash}" class="map-segment map-segment-${status}">
        ${animation}
      </path>
    `;
  }

  const nodesHtml = nodes.map((node) => {
    let status = 'locked';
    if (node.week < currentWeek) status = 'completed';
    else if (node.week === currentWeek) status = 'current';

    const isLocked = status === 'locked';
    const isCurrent = status === 'current';
    const isCompleted = status === 'completed';

    const halo = isCurrent ? `
      <circle cx="${node.x}" cy="${node.y}" r="42" fill="none" stroke="#FF8C00" stroke-width="3" opacity="0.6">
        <animate attributeName="r" values="38;48;38" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
      </circle>
    ` : '';

    const check = isCompleted ? `
      <g transform="translate(${node.x + 22}, ${node.y - 22})">
        <circle r="14" fill="#98D98E" stroke="#2C2C2C" stroke-width="2" />
        <text y="5" text-anchor="middle" font-size="14" fill="#fff">✓</text>
      </g>
    ` : '';

    const lock = isLocked ? `
      <g transform="translate(${node.x}, ${node.y})">
        <circle r="26" fill="#E2E8F0" stroke="#A0AEC0" stroke-width="3" />
        <text y="6" text-anchor="middle" font-size="20" fill="#718096">🔒</text>
      </g>
    ` : `
      <g class="map-node-group" data-week="${node.week}" style="cursor: pointer;">
        <circle cx="${node.x}" cy="${node.y}" r="34" fill="url(#nodeGradient-${node.week})" stroke="#2C2C2C" stroke-width="3" />
        <text x="${node.x}" y="${node.y + 10}" text-anchor="middle" font-size="32">${node.emoji}</text>
      </g>
    `;

    const labelY = node.y + 55;
    const labelColor = isLocked ? '#A0AEC0' : '#fff';

    return `
      <g class="map-node map-node-${status}" data-week="${node.week}" style="cursor: ${isLocked ? 'default' : 'pointer'};">
        ${halo}
        ${lock}
        ${check}
        <text x="${node.x}" y="${labelY}" text-anchor="middle" font-size="16" font-weight="bold" fill="${labelColor}" class="map-node-label">${node.label}</text>
        <text x="${node.x}" y="${labelY + 20}" text-anchor="middle" font-size="12" fill="${labelColor}" opacity="0.9">第${node.week}周</text>
      </g>
    `;
  }).join('');

  const defs = `
    <defs>
      <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1a2a6c" />
        <stop offset="50%" stop-color="#2d388a" />
        <stop offset="100%" stop-color="#00b4d8" />
      </linearGradient>
      <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="60%" stop-color="#1e3a8a" />
        <stop offset="100%" stop-color="#38bdf8" />
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      ${nodes.map((n) => `
        <radialGradient id="nodeGradient-${n.week}" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#fff" />
          <stop offset="100%" stop-color="${n.color}" />
        </radialGradient>
      `).join('')}
    </defs>
  `;

  const decorations = `
    <g class="map-decorations" pointer-events="none">
      <circle cx="120" cy="120" r="40" fill="#fff" opacity="0.08">
        <animate attributeName="cy" values="120;100;120" dur="6s" repeatCount="indefinite" />
      </circle>
      <circle cx="850" cy="180" r="60" fill="#fff" opacity="0.06">
        <animate attributeName="cy" values="180;160;180" dur="8s" repeatCount="indefinite" />
      </circle>
      <circle cx="500" cy="60" r="25" fill="#fff" opacity="0.1">
        <animate attributeName="cy" values="60;50;60" dur="5s" repeatCount="indefinite" />
      </circle>
      <text x="180" y="200" font-size="24" opacity="0.25">☁️</text>
      <text x="750" y="120" font-size="32" opacity="0.2">☁️</text>
      <text x="320" y="250" font-size="20" opacity="0.3">✨</text>
      <text x="620" y="320" font-size="18" opacity="0.25">✨</text>
      <text x="900" y="600" font-size="28" opacity="0.15">🌊</text>
    </g>
  `;

  container.innerHTML = `
    <div class="game-map-wrapper">
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" class="game-map">
        ${defs}
        <rect width="${width}" height="${height}" fill="url(#skyGradient)" />
        <ellipse cx="${width / 2}" cy="${height - 60}" rx="${width * 0.55}" ry="120" fill="url(#oceanGradient)" opacity="0.6" />
        ${decorations}
        ${pathsHtml}
        ${nodesHtml}
      </svg>
    </div>
  `;

  const infoPanel = document.getElementById('map-info');
  if (infoPanel) {
    const currentNode = MAP_NODES[currentWeek - 1];
    infoPanel.innerHTML = `
      <div class="map-info-card">
        <div class="map-info-week">本周目标 · 第${currentWeek}周 · ${currentNode.label}</div>
        <div class="map-info-reward">🎁 奖励：${currentNode.reward}</div>
        <div class="map-info-date">${today}</div>
      </div>
    `;
  }

  container.querySelectorAll('.map-node-group, .map-node').forEach((group) => {
    group.addEventListener('click', () => {
      const week = parseInt(group.closest('.map-node')?.dataset.week || group.dataset.week, 10);
      if (!week) return;
      const nodeData = MAP_NODES[week - 1];
      if (infoPanel) {
        infoPanel.innerHTML = `
          <div class="map-info-card">
            <div class="map-info-week">第${week}周 · ${nodeData.label}</div>
            <div class="map-info-reward">🎁 奖励：${nodeData.reward}</div>
            <div class="map-info-status">${week <= currentWeek ? '已解锁 🌟' : '还没到达，继续加油！🔒'}</div>
          </div>
        `;
      }
    });
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderMapPage };
}
