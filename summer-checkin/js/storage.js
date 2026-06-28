const STORAGE_KEY = 'summerCheckinRecords';
const SETTINGS_KEY = 'summerCheckinSettings';
const TASK_LIBRARY_KEY = 'summerCheckinTaskLibrary';
const PLANS_KEY = 'summerCheckinPlans';
const REWARDS_KEY = 'summerCheckinRewards';
const REDEMPTIONS_KEY = 'summerCheckinRedemptions';
const PET_KEY = 'summerCheckinPets';

function getRecords() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('读取打卡数据失败', e);
    return {};
  }
}

function saveRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('保存打卡数据失败', e);
  }
}

function normalizeDayRecord(raw, childId) {
  const normalized = {};
  for (const taskId in raw) {
    if (taskId === 'updatedAt') continue;
    const val = raw[taskId];
    if (val === true) {
      const task = TASKS[childId]?.find((t) => t.id === taskId);
      normalized[taskId] = {
        completed: true,
        guessedMinutes: task?.estimatedMinutes ?? 0,
        actualMinutes: task?.estimatedMinutes ?? 0,
        completedAt: null
      };
    } else if (val && typeof val === 'object') {
      const task = TASKS[childId]?.find((t) => t.id === taskId);
      normalized[taskId] = {
        completed: !!val.completed,
        guessedMinutes: val.guessedMinutes ?? task?.estimatedMinutes ?? 0,
        actualMinutes: val.actualMinutes ?? task?.estimatedMinutes ?? 0,
        completedAt: val.completedAt || null
      };
    }
  }
  return normalized;
}

function getDayRecord(date, childId) {
  const records = getRecords();
  const raw = records[date]?.[childId] || {};
  return normalizeDayRecord(raw, childId);
}

function setTaskDone(date, childId, taskId, done, actualMinutes = null, guessedMinutes = null) {
  const records = getRecords();
  if (!records[date]) {
    records[date] = {};
  }
  if (!records[date][childId]) {
    records[date][childId] = {};
  }
  if (done) {
    const task = TASKS[childId]?.find((t) => t.id === taskId);
    const existing = records[date][childId][taskId];
    records[date][childId][taskId] = {
      completed: true,
      guessedMinutes: guessedMinutes ?? existing?.guessedMinutes ?? task?.estimatedMinutes ?? 0,
      actualMinutes: actualMinutes ?? task?.estimatedMinutes ?? 0,
      completedAt: new Date().toISOString()
    };
  } else {
    delete records[date][childId][taskId];
  }
  saveRecords(records);
}

function setTaskGuess(date, childId, taskId, guessedMinutes) {
  const records = getRecords();
  if (!records[date]) {
    records[date] = {};
  }
  if (!records[date][childId]) {
    records[date][childId] = {};
  }
  const task = TASKS[childId]?.find((t) => t.id === taskId);
  const existing = records[date][childId][taskId];
  records[date][childId][taskId] = {
    completed: existing?.completed || false,
    guessedMinutes: guessedMinutes ?? task?.estimatedMinutes ?? 0,
    actualMinutes: existing?.actualMinutes ?? task?.estimatedMinutes ?? 0,
    completedAt: existing?.completedAt || null
  };
  saveRecords(records);
}

function getSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('保存设置失败', e);
  }
}

function getTaskLibrary() {
  try {
    const data = localStorage.getItem(TASK_LIBRARY_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('读取任务库失败', e);
  }

  const seeded = JSON.parse(JSON.stringify(DEFAULT_TASKS));
  saveTaskLibrary(seeded);
  return seeded;
}

function saveTaskLibrary(library) {
  try {
    localStorage.setItem(TASK_LIBRARY_KEY, JSON.stringify(library));
    applyTaskLibrary(library);
  } catch (e) {
    console.error('保存任务库失败', e);
  }
}

function applyTaskLibrary(library) {
  for (const childId in library) {
    TASKS[childId] = JSON.parse(JSON.stringify(library[childId]));
  }
}

function initTaskLibrary() {
  applyTaskLibrary(getTaskLibrary());
}

function getPlans() {
  try {
    const data = localStorage.getItem(PLANS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('读取计划失败', e);
    return {};
  }
}

function savePlans(plans) {
  try {
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  } catch (e) {
    console.error('保存计划失败', e);
  }
}

const EMPTY_PLAN = { morning: [], noon: [], afternoon: [], evening: [] };

function getPlan(date, childId) {
  const plans = getPlans();
  const plan = plans[date]?.[childId];
  if (plan && typeof plan === 'object' && !Array.isArray(plan)) {
    return { ...EMPTY_PLAN, ...plan };
  }
  if (Array.isArray(plan) && plan.length > 0) {
    return { ...EMPTY_PLAN, morning: plan };
  }
  return { ...EMPTY_PLAN, morning: TASKS[childId]?.map((t) => t.id) || [] };
}

function savePlan(date, childId, planObj) {
  const plans = getPlans();
  if (!plans[date]) {
    plans[date] = {};
  }
  plans[date][childId] = { ...EMPTY_PLAN, ...planObj };
  savePlans(plans);
}

function exportRecords() {
  return {
    records: getRecords(),
    plans: getPlans(),
    library: getTaskLibrary()
  };
}

function exportRecordsToCSV() {
  const records = getRecords();
  const rows = [];
  rows.push(['日期', '孩子', '任务ID', '任务名称', '是否完成', '实际用时(分钟)', '更新时间'].join(','));

  for (const date in records) {
    for (const childId in records[date]) {
      const dayRecord = records[date][childId];
      for (const taskId in dayRecord) {
        if (taskId === 'updatedAt') continue;
        const entry = dayRecord[taskId];
        const completed = typeof entry === 'object' ? !!entry.completed : !!entry;
        const actualMinutes = typeof entry === 'object' ? entry.actualMinutes : '';
        const child = CHILDREN[childId];
        const task = TASKS[childId]?.find((t) => t.id === taskId);
        rows.push([
          date,
          child?.name || childId,
          taskId,
          task?.text || taskId,
          completed ? '是' : '否',
          actualMinutes ?? '',
          entry.completedAt || entry.updatedAt || ''
        ].join(','));
      }
    }
  }

  return rows.join('\n');
}

function importRecords(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.records) {
      saveRecords(data.records);
    } else if (data && Object.keys(data).length > 0 && !data.library && !data.plans) {
      // 兼容旧格式：直接是 records 对象
      saveRecords(data);
    }
    if (data.plans) {
      savePlans(data.plans);
    }
    if (data.library) {
      saveTaskLibrary(data.library);
    }
    return true;
  } catch (e) {
    console.error('导入失败', e);
    return false;
  }
}

function clearAllRecords() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PLANS_KEY);
  localStorage.removeItem(REDEMPTIONS_KEY);
}

function getRewards() {
  try {
    const data = localStorage.getItem(REWARDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('读取心愿奖励失败', e);
    return [];
  }
}

function saveRewards(rewards) {
  try {
    localStorage.setItem(REWARDS_KEY, JSON.stringify(rewards));
  } catch (e) {
    console.error('保存心愿奖励失败', e);
  }
}

function getRedemptions() {
  try {
    const data = localStorage.getItem(REDEMPTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('读取兑换记录失败', e);
    return [];
  }
}

function saveRedemptions(redemptions) {
  try {
    localStorage.setItem(REDEMPTIONS_KEY, JSON.stringify(redemptions));
  } catch (e) {
    console.error('保存兑换记录失败', e);
  }
}

function redeemReward(childId, rewardId, cost, rewardName, rewardIcon = '🎁') {
  const records = getRecords();
  const allRedemptions = getRedemptions();
  const childRedemptions = allRedemptions.filter((r) => r.childId === childId);
  const totalSpent = childRedemptions.reduce((sum, r) => sum + (r.cost || 0), 0);
  let earned = 0;
  for (const date in records) {
    const dayRecord = records[date]?.[childId];
    if (!dayRecord) continue;
    for (const taskId in dayRecord) {
      if (taskId === 'updatedAt' || taskId.startsWith('__redeem_')) continue;
      const task = TASKS[childId]?.find((t) => t.id === taskId);
      if (!task) continue;
      const entry = dayRecord[taskId];
      const completed = typeof entry === 'object' ? entry.completed : !!entry;
      if (!completed) continue;
      earned += 10;
      const actual = typeof entry === 'object' ? entry.actualMinutes : task.estimatedMinutes;
      const saved = task.estimatedMinutes - actual;
      if (saved >= 5) earned += 5;
      else if (saved >= -2) earned += 2;
    }
  }
  earned += Math.floor((typeof getMaxStreak === 'function' ? getMaxStreak(records, childId) : 0) / 3) * 20;
  const points = Math.max(0, earned - totalSpent);
  if (points < cost) {
    return { success: false, message: '积分不足' };
  }

  const today = new Date().toISOString().slice(0, 10);
  if (!records[today]) records[today] = {};
  if (!records[today][childId]) records[today][childId] = {};
  records[today][childId][`__redeem_${Date.now()}`] = {
    completed: true,
    guessedMinutes: 0,
    actualMinutes: 0,
    completedAt: new Date().toISOString(),
    rewardId,
    rewardName,
    rewardIcon,
    cost
  };
  saveRecords(records);

  const redemptions = getRedemptions();
  redemptions.unshift({
    childId,
    rewardId,
    rewardName,
    rewardIcon,
    cost,
    redeemedAt: new Date().toISOString()
  });
  saveRedemptions(redemptions);

  return { success: true };
}

function getPetData() {
  try {
    const data = localStorage.getItem(PET_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('读取宠物数据失败', e);
    return {};
  }
}

function savePetData(pets) {
  try {
    localStorage.setItem(PET_KEY, JSON.stringify(pets));
  } catch (e) {
    console.error('保存宠物数据失败', e);
  }
}

function getPet(childId) {
  const pets = getPetData();
  if (pets[childId]) return pets[childId];

  const defaultPets = {
    tongtong: { id: 'tongtong', name: '泡泡龙', emoji: '🥚', level: 1, xp: 0, food: 0, stage: 'egg' },
    songsong: { id: 'songsong', name: '团团兽', emoji: '🥚', level: 1, xp: 0, food: 0, stage: 'egg' }
  };
  return defaultPets[childId] || { id: childId, name: '小萌宠', emoji: '🥚', level: 1, xp: 0, food: 0, stage: 'egg' };
}

function feedPet(childId) {
  const pets = getPetData();
  const pet = pets[childId] || getPet(childId);
  const records = getRecords();

  let earnedFood = 0;
  for (const date in records) {
    const dayRecord = records[date]?.[childId];
    if (!dayRecord) continue;
    for (const taskId in dayRecord) {
      if (taskId === 'updatedAt' || taskId.startsWith('__redeem_')) continue;
      const entry = dayRecord[taskId];
      const completed = typeof entry === 'object' ? entry.completed : !!entry;
      if (completed) earnedFood += 5;
    }
  }

  const availableFood = Math.max(0, earnedFood - (pet.totalFed || 0));

  if (availableFood < 10) {
    return { success: false, message: '宠物粮不足，快去完成任务吧！' };
  }

  pet.totalFed = (pet.totalFed || 0) + 10;
  pet.food = Math.max(0, pet.food + 10);
  pet.xp = (pet.xp || 0) + 10;

  const result = checkPetLevelUp(pet);
  pets[childId] = pet;
  savePetData(pets);

  return { success: true, pet, leveledUp: result.leveledUp, evolved: result.evolved };
}

function checkPetLevelUp(pet) {
  const stages = [
    { stage: 'egg', emoji: '🥚', level: 1 },
    { stage: 'baby', emoji: '🐣', level: 2 },
    { stage: 'child', emoji: '🐥', level: 5 },
    { stage: 'youth', emoji: '🦕', level: 10 },
    { stage: 'adult', emoji: '🐉', level: 20 }
  ];

  let leveledUp = false;
  let evolved = false;
  const xpNeeded = pet.level * 20;

  if (pet.xp >= xpNeeded) {
    pet.xp -= xpNeeded;
    pet.level += 1;
    leveledUp = true;

    const nextStage = stages.find((s) => s.level === pet.level);
    if (nextStage) {
      pet.stage = nextStage.stage;
      pet.emoji = nextStage.emoji;
      evolved = true;
    }
  }

  return { leveledUp, evolved };
}

function getPetStageLabel(stage) {
  const labels = {
    egg: '蛋蛋',
    baby: '幼崽',
    child: '童年',
    youth: '少年',
    adult: '成年'
  };
  return labels[stage] || '成长中';
}

function clearAllRecords() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PLANS_KEY);
  localStorage.removeItem(REDEMPTIONS_KEY);
  localStorage.removeItem(PET_KEY);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getRecords,
    saveRecords,
    getDayRecord,
    setTaskDone,
    setTaskGuess,
    getSettings,
    saveSettings,
    getTaskLibrary,
    saveTaskLibrary,
    applyTaskLibrary,
    initTaskLibrary,
    getPlans,
    savePlans,
    getPlan,
    savePlan,
    getRewards,
    saveRewards,
    getRedemptions,
    saveRedemptions,
    redeemReward,
    getPetData,
    savePetData,
    getPet,
    feedPet,
    getPetStageLabel,
    exportRecords,
    exportRecordsToCSV,
    importRecords,
    clearAllRecords
  };
}
