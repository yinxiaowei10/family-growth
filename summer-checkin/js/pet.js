let currentPetChild = 'tongtong';

function renderPetPage() {
  initTaskLibrary();
  const activeTab = document.querySelector('.tab.active');
  currentPetChild = activeTab?.dataset.child || 'tongtong';

  const pet = getPet(currentPetChild);
  const records = getRecords();
  const totalFood = calculatePetFood(records, currentPetChild);
  const availableFood = Math.max(0, totalFood - (pet.totalFed || 0));

  document.getElementById('pet-emoji').textContent = pet.emoji;
  document.getElementById('pet-name').textContent = pet.name;
  document.getElementById('pet-stage').textContent = `${getPetStageLabel(pet.stage)}阶段`;
  document.getElementById('level-badge').textContent = `Lv.${pet.level}`;

  const xpNeeded = pet.level * 20;
  const xpPercent = Math.min(100, Math.round((pet.xp / xpNeeded) * 100));
  document.getElementById('xp-fill').style.width = `${xpPercent}%`;
  document.getElementById('xp-text').textContent = `${pet.xp} / ${xpNeeded} XP`;

  document.getElementById('food-value').textContent = availableFood;
  document.getElementById('total-food-value').textContent = totalFood;

  const feedBtn = document.getElementById('feed-btn');
  feedBtn.disabled = availableFood < 10;
  feedBtn.textContent = availableFood >= 10 ? `🌾 喂宠物（-10 粮）` : '宠物粮不足';

  renderGrowthLog(pet);
}

function renderGrowthLog(pet) {
  const container = document.getElementById('growth-log');
  const logs = pet.logs || [];
  if (logs.length === 0) {
    container.innerHTML = `<div class="growth-log-item">还没有成长记录，快去喂宠物吧~</div>`;
    return;
  }
  container.innerHTML = logs.slice().reverse().map((log) => `
    <div class="growth-log-item">${log}</div>
  `).join('');
}

function handleFeed() {
  const result = feedPet(currentPetChild);
  if (!result.success) {
    alert(result.message);
    return;
  }

  const pet = result.pet;
  addPetLog(pet, `喂了宠物，获得 10 经验`);
  if (result.leveledUp) {
    addPetLog(pet, `✨ 升到了 Lv.${pet.level}！`);
  }
  if (result.evolved) {
    addPetLog(pet, `🎉 进化成 ${getPetStageLabel(pet.stage)} 形态 ${pet.emoji}`);
  }

  // 重新保存宠物日志
  const pets = getPetData();
  pets[currentPetChild] = pet;
  savePetData(pets);

  renderPetPage();

  if (result.leveledUp || result.evolved) {
    showLevelUpOverlay(pet, result.evolved);
  }
}

function addPetLog(pet, message) {
  if (!pet.logs) pet.logs = [];
  const time = new Date().toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  pet.logs.push(`${time} · ${message}`);
  if (pet.logs.length > 30) pet.logs.shift();
}

function showLevelUpOverlay(pet, evolved) {
  const overlay = document.createElement('div');
  overlay.className = 'level-up-overlay';
  overlay.innerHTML = `
    <div class="level-up-content">
      <div class="level-up-emoji">${pet.emoji}</div>
      <div style="font-family: var(--font-hand); font-size: 1.6rem; font-weight: bold; margin-bottom: 8px;">
        ${evolved ? '宠物进化了！' : '升级啦！'}
      </div>
      <div style="color: var(--muted-color); margin-bottom: 16px;">
        ${pet.name} 现在是 Lv.${pet.level} · ${getPetStageLabel(pet.stage)}阶段
      </div>
      <button class="btn btn-primary" onclick="this.closest('.level-up-overlay').remove()">太棒了</button>
    </div>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    if (document.body.contains(overlay)) overlay.remove();
  }, 4000);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderPetPage };
}
