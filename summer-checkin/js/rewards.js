const DEFAULT_REWARDS = [
  { id: 'ice-cream', icon: '🍦', name: '冰淇淋', cost: 50 },
  { id: 'movie', icon: '🎬', name: '看一部电影', cost: 100 },
  { id: 'park', icon: '🎠', name: '去游乐园', cost: 200 },
  { id: 'book', icon: '📚', name: '买一本书', cost: 150 },
  { id: 'game', icon: '🎮', name: '游戏时间', cost: 80 },
  { id: 'trip', icon: '🏕️', name: '周末短途游', cost: 500 }
];

let currentChildId = 'tongtong';

function initRewardsPage() {
  initTaskLibrary();
  seedDefaultRewards();
  renderRewards();
  renderRedemptions();
  updatePointsDisplay();

  document.getElementById('reward-form').addEventListener('submit', (e) => {
    e.preventDefault();
    addNewReward();
  });

  document.getElementById('seed-rewards').addEventListener('click', () => {
    if (confirm('确定要添加默认奖励吗？已有奖励不会被覆盖。')) {
      seedDefaultRewards(true);
      renderRewards();
    }
  });
}

function seedDefaultRewards(force = false) {
  const rewards = getRewards();
  if (!force && rewards.length > 0) return;

  const existingIds = new Set(rewards.map((r) => r.id));
  for (const reward of DEFAULT_REWARDS) {
    if (!existingIds.has(reward.id)) {
      rewards.push({ ...reward, id: reward.id + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,5) });
    }
  }
  saveRewards(rewards);
}

function addNewReward() {
  const icon = document.getElementById('reward-icon').value.trim() || '🎁';
  const name = document.getElementById('reward-name').value.trim();
  const cost = parseInt(document.getElementById('reward-cost').value, 10);

  if (!name || !cost || cost < 1) {
    alert('请填写完整的奖励信息');
    return;
  }

  const rewards = getRewards();
  rewards.push({
    id: 'reward_' + Date.now(),
    icon,
    name,
    cost
  });
  saveRewards(rewards);

  document.getElementById('reward-form').reset();
  document.getElementById('reward-icon').value = '🎁';
  renderRewards();

  // 切换到兑换面板
  document.querySelector('.reward-tabs .tab[data-tab="shop"]').click();
}

function deleteReward(rewardId) {
  if (!confirm('确定要删除这个奖励吗？')) return;
  const rewards = getRewards().filter((r) => r.id !== rewardId);
  saveRewards(rewards);
  renderRewards();
}

function renderRewards() {
  const container = document.getElementById('reward-list');
  const rewards = getRewards();
  const points = calculatePoints(getRecords(), currentChildId);

  if (rewards.length === 0) {
    container.innerHTML = `<div class="empty-rewards">
      还没有奖励，去「管理」标签添加吧！
    </div>`;
    return;
  }

  container.innerHTML = rewards.map((reward) => {
    const affordable = points >= reward.cost;
    return `
      <div class="reward-card">
        <div class="reward-icon">${reward.icon}</div>
        <div class="reward-name">${reward.name}</div>
        <div class="reward-cost">⭐ ${reward.cost} 积分</div>
        <div class="reward-actions">
          <button type="button" class="btn btn-small ${affordable ? 'btn-primary' : ''}"
                  onclick="handleRedeem('${reward.id}', ${reward.cost}, '${reward.name.replace(/'/g, '\\\'')}', '${reward.icon}')"
                  ${affordable ? '' : 'disabled'}>
            ${affordable ? '兑换' : '积分不足'}
          </button>
          <button type="button" class="btn btn-small btn-danger" onclick="deleteReward('${reward.id}')">删除</button>
        </div>
      </div>
    `;
  }).join('');
}

function handleRedeem(rewardId, cost, rewardName, rewardIcon) {
  if (!confirm(`确定要用 ${cost} 积分兑换「${rewardIcon} ${rewardName}」吗？`)) return;

  const result = redeemReward(currentChildId, rewardId, cost, rewardName);
  if (result.success) {
    showRedeemSuccess(rewardIcon, rewardName, cost);
    renderRewards();
    renderRedemptions();
    updatePointsDisplay();
  } else {
    alert(result.message);
  }
}

function showRedeemSuccess(icon, name, cost) {
  const overlay = document.createElement('div');
  overlay.className = 'redeem-success';
  overlay.innerHTML = `
    <div style="font-size: 3rem; margin-bottom: 8px;">${icon}</div>
    <div style="font-family: var(--font-hand); font-size: 1.4rem; font-weight: bold; margin-bottom: 8px;">兑换成功！</div>
    <div style="color: var(--muted-color);">你兑换了「${name}」</div>
    <div style="color: var(--accent-orange); font-weight: bold; margin: 8px 0;">花费 ${cost} 积分</div>
    <button class="btn btn-primary" onclick="this.closest('.redeem-success').remove()">太棒了</button>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    if (document.body.contains(overlay)) overlay.remove();
  }, 3000);
}

function renderRedemptions() {
  const container = document.getElementById('redemption-list');
  const redemptions = getRedemptions().filter((r) => r.childId === currentChildId);

  if (redemptions.length === 0) {
    container.innerHTML = `<div class="empty-rewards">还没有兑换记录</div>`;
    return;
  }

  container.innerHTML = redemptions.map((r) => `
    <div class="redemption-item">
      <span>${r.rewardIcon || '🎁'} ${r.rewardName}</span>
      <span style="color: var(--accent-orange); font-weight: bold;">-${r.cost} ⭐</span>
    </div>
  `).join('');
}

function updatePointsDisplay() {
  const points = calculatePoints(getRecords(), currentChildId);
  document.getElementById('current-points').textContent = points;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initRewardsPage };
}
