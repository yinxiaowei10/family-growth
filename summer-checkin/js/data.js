const SUMMER_START = '2025-07-05';
const SUMMER_END = '2025-08-31';
const TOTAL_WEEKS = 8;

const CHILDREN = {
  tongtong: {
    id: 'tongtong',
    name: '桐桐',
    avatar: 'assets/characters/tongtong-bubble.png',
    theme: 'theme-tongtong',
    age: '10岁',
    grade: '四升五',
    character: '泡泡',
    characterDesc: '爱想象、爱阅读的梦幻泡泡',
    color: '#87CEEB'
  },
  songsong: {
    id: 'songsong',
    name: '松松',
    avatar: 'assets/characters/songsong-tuantuan.png',
    theme: 'theme-songsong',
    age: '4岁',
    grade: '幼儿园',
    character: '团团',
    characterDesc: '圆润可爱、慢慢成长的团团',
    color: '#FFB347'
  }
};

const DEFAULT_TASKS = {
  tongtong: [
    {
      id: 'outdoor',
      text: '户外2小时',
      duration: '2小时',
      estimatedMinutes: 120,
      icon: '☀️',
      category: 'health'
    },
    {
      id: 'english',
      text: '英语输入30分钟',
      duration: '30分钟',
      estimatedMinutes: 30,
      icon: '🔤',
      category: 'english'
    },
    {
      id: 'reading',
      text: '中文阅读1.5小时',
      duration: '1.5小时',
      estimatedMinutes: 90,
      icon: '📚',
      category: 'chinese'
    },
    {
      id: 'math',
      text: '数学20分钟',
      duration: '20分钟',
      estimatedMinutes: 20,
      icon: '🔢',
      category: 'math'
    },
    {
      id: 'writing',
      text: '自由写作',
      duration: '约15分钟',
      estimatedMinutes: 15,
      icon: '✍️',
      category: 'chinese'
    },
    {
      id: 'nap',
      text: '午睡30-40分钟',
      duration: '30-40分钟',
      estimatedMinutes: 35,
      icon: '😴',
      category: 'health',
      optional: true
    }
  ],
  songsong: [
    {
      id: 'outdoor',
      text: '户外2小时+',
      duration: '2小时+',
      estimatedMinutes: 120,
      icon: '☀️',
      category: 'health'
    },
    {
      id: 'mathcamp',
      text: '数学营补学',
      duration: '25-30分钟',
      estimatedMinutes: 27,
      icon: '🔢',
      category: 'math'
    },
    {
      id: 'abcreading',
      text: 'ABC Reading打卡',
      duration: '15-20分钟',
      estimatedMinutes: 17,
      icon: '🔤',
      category: 'english'
    }
  ]
};

let TASKS = JSON.parse(JSON.stringify(DEFAULT_TASKS));

const BADGES = [
  {
    id: 'first-task',
    name: '第一次',
    icon: '🌱',
    condition: (records, childId) => countAnyTaskCompleted(records, childId) >= 1,
    progress: (records, childId) => ({ current: Math.min(countAnyTaskCompleted(records, childId), 1), total: 1 })
  },
  {
    id: 'streak-3',
    name: '连续3天',
    icon: '🔥',
    condition: (records, childId) => getMaxStreak(records, childId) >= 3,
    progress: (records, childId) => ({ current: Math.min(getMaxStreak(records, childId), 3), total: 3 })
  },
  {
    id: 'streak-7',
    name: '连续7天',
    icon: '🌟',
    condition: (records, childId) => getMaxStreak(records, childId) >= 7,
    progress: (records, childId) => ({ current: Math.min(getMaxStreak(records, childId), 7), total: 7 })
  },
  {
    id: 'streak-14',
    name: '连续14天',
    icon: '🏆',
    condition: (records, childId) => getMaxStreak(records, childId) >= 14,
    progress: (records, childId) => ({ current: Math.min(getMaxStreak(records, childId), 14), total: 14 })
  },
  {
    id: 'perfect-day',
    name: '完美一天',
    icon: '✨',
    condition: (records, childId) => getCompletedDays(records, childId) >= 1,
    progress: (records, childId) => ({ current: Math.min(getCompletedDays(records, childId), 1), total: 1 })
  },
  {
    id: 'halfway',
    name: '暑假过半',
    icon: '🎯',
    condition: (records, childId) => getCompletedDays(records, childId) >= 28,
    progress: (records, childId) => ({ current: Math.min(getCompletedDays(records, childId), 28), total: 28 })
  },
  {
    id: 'outdoor-master',
    name: '运动达人',
    icon: '☀️',
    condition: (records, childId) => countCategoryCompleted(records, childId, 'health') >= 20,
    progress: (records, childId) => ({ current: Math.min(countCategoryCompleted(records, childId, 'health'), 20), total: 20 })
  },
  {
    id: 'reading-master',
    name: '阅读达人',
    icon: '📚',
    condition: (records, childId) => countCategoryCompleted(records, childId, 'chinese') >= 20,
    progress: (records, childId) => ({ current: Math.min(countCategoryCompleted(records, childId, 'chinese'), 20), total: 20 })
  },
  {
    id: 'writing-master',
    name: '写作之星',
    icon: '✍️',
    condition: (records, childId) => countTaskCompleted(records, childId, 'writing') >= 15,
    progress: (records, childId) => ({ current: Math.min(countTaskCompleted(records, childId, 'writing'), 15), total: 15 })
  },
  {
    id: 'english-master',
    name: '英语小能手',
    icon: '🔤',
    condition: (records, childId) => countCategoryCompleted(records, childId, 'english') >= 20,
    progress: (records, childId) => ({ current: Math.min(countCategoryCompleted(records, childId, 'english'), 20), total: 20 })
  },
  {
    id: 'math-master',
    name: '数学小天才',
    icon: '🔢',
    condition: (records, childId) => countCategoryCompleted(records, childId, 'math') >= 20,
    progress: (records, childId) => ({ current: Math.min(countCategoryCompleted(records, childId, 'math'), 20), total: 20 })
  },
  {
    id: 'explorer',
    name: '探索家',
    icon: '🧭',
    condition: (records, childId) => getCompletedCategories(records, childId) >= 3,
    progress: (records, childId) => ({ current: Math.min(getCompletedCategories(records, childId), 3), total: 3 })
  },
  {
    id: 'time-saver',
    name: '时间管理大师',
    icon: '⏱️',
    condition: (records, childId) => getTotalSavedMinutes(records, childId) >= 60,
    progress: (records, childId) => ({ current: Math.min(getTotalSavedMinutes(records, childId), 60), total: 60 })
  },
  {
    id: 'speed-star',
    name: '闪电侠',
    icon: '⚡',
    condition: (records, childId) => hasBigTimeSave(records, childId, 10),
    progress: (records, childId) => ({ current: hasBigTimeSave(records, childId, 10) ? 1 : 0, total: 1 })
  },
  {
    id: 'collector',
    name: '徽章收藏家',
    icon: '🎖️',
    condition: (records, childId) => getUnlockedBadgeCount(records, childId, 'collector') >= 5,
    progress: (records, childId) => {
      const unlocked = getUnlockedBadgeCount(records, childId, 'collector');
      return { current: Math.min(unlocked, 5), total: 5 };
    }
  }
];

const MAP_NODES = [
  { week: 1, label: '出发', reward: '适应期小奖励' },
  { week: 2, label: '第一站', reward: '选一部电影' },
  { week: 3, label: '小河旁', reward: '户外野餐' },
  { week: 4, label: '半山腰', reward: '小玩具一个' },
  { week: 5, label: '森林里', reward: '书店任选一本书' },
  { week: 6, label: '湖边', reward: '冰淇淋日' },
  { week: 7, label: '山顶', reward: '周末短途游' },
  { week: 8, label: '终点', reward: '暑假大奖' }
];

function getMaxStreak(records, childId) {
  let maxStreak = 0;
  let currentStreak = 0;
  const dates = Object.keys(records).sort();

  for (const date of dates) {
    const dayRecord = records[date]?.[childId];
    if (dayRecord && isDayCompleted(dayRecord, childId)) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
}

function countTaskCompleted(records, childId, taskId) {
  let count = 0;
  for (const date in records) {
    const dayRecord = records[date]?.[childId];
    if (dayRecord && dayRecord[taskId]) {
      count++;
    }
  }
  return count;
}

function getCompletedDays(records, childId) {
  let count = 0;
  for (const date in records) {
    const dayRecord = records[date]?.[childId];
    if (dayRecord && isDayCompleted(dayRecord, childId)) {
      count++;
    }
  }
  return count;
}

function isDayCompleted(dayRecord, childId) {
  const tasks = TASKS[childId];
  const requiredTasks = tasks.filter((t) => !t.optional);
  return requiredTasks.every((task) => dayRecord[task.id]);
}

function countAnyTaskCompleted(records, childId) {
  let count = 0;
  for (const date in records) {
    const dayRecord = records[date]?.[childId];
    if (!dayRecord) continue;
    for (const taskId in dayRecord) {
      if (taskId === 'updatedAt') continue;
      const entry = dayRecord[taskId];
      const completed = typeof entry === 'object' ? entry.completed : !!entry;
      if (completed) count++;
    }
  }
  return count;
}

function countCategoryCompleted(records, childId, category) {
  let count = 0;
  for (const date in records) {
    const dayRecord = records[date]?.[childId];
    if (!dayRecord) continue;
    for (const taskId in dayRecord) {
      if (taskId === 'updatedAt') continue;
      const task = TASKS[childId]?.find((t) => t.id === taskId);
      if (!task || task.category !== category) continue;
      const entry = dayRecord[taskId];
      const completed = typeof entry === 'object' ? entry.completed : !!entry;
      if (completed) count++;
    }
  }
  return count;
}

function getCompletedCategories(records, childId) {
  const categories = new Set();
  for (const date in records) {
    const dayRecord = records[date]?.[childId];
    if (!dayRecord) continue;
    for (const taskId in dayRecord) {
      if (taskId === 'updatedAt') continue;
      const task = TASKS[childId]?.find((t) => t.id === taskId);
      if (!task || !task.category) continue;
      const entry = dayRecord[taskId];
      const completed = typeof entry === 'object' ? entry.completed : !!entry;
      if (completed) categories.add(task.category);
    }
  }
  return categories.size;
}

function getTaskActualMinutes(entry, task) {
  if (typeof entry === 'object' && entry.completed) {
    return entry.actualMinutes ?? task?.estimatedMinutes ?? 0;
  }
  if (entry === true) {
    return task?.estimatedMinutes ?? 0;
  }
  return 0;
}

function getTotalSavedMinutes(records, childId) {
  let saved = 0;
  for (const date in records) {
    const dayRecord = records[date]?.[childId];
    if (!dayRecord) continue;
    for (const taskId in dayRecord) {
      if (taskId === 'updatedAt') continue;
      const task = TASKS[childId]?.find((t) => t.id === taskId);
      if (!task) continue;
      const entry = dayRecord[taskId];
      const completed = typeof entry === 'object' ? entry.completed : !!entry;
      if (!completed) continue;
      const actual = getTaskActualMinutes(entry, task);
      saved += task.estimatedMinutes - actual;
    }
  }
  return saved;
}

function hasBigTimeSave(records, childId, threshold = 10) {
  for (const date in records) {
    const dayRecord = records[date]?.[childId];
    if (!dayRecord) continue;
    for (const taskId in dayRecord) {
      if (taskId === 'updatedAt') continue;
      const task = TASKS[childId]?.find((t) => t.id === taskId);
      if (!task) continue;
      const entry = dayRecord[taskId];
      const completed = typeof entry === 'object' ? entry.completed : !!entry;
      if (!completed) continue;
      const actual = getTaskActualMinutes(entry, task);
      if (task.estimatedMinutes - actual >= threshold) return true;
    }
  }
  return false;
}

function calculatePoints(records, childId) {
  let points = 0;
  for (const date in records) {
    const dayRecord = records[date]?.[childId];
    if (!dayRecord) continue;
    for (const taskId in dayRecord) {
      if (taskId === 'updatedAt') continue;
      if (taskId.startsWith('__redeem_')) {
        points -= dayRecord[taskId].cost || 0;
        continue;
      }
      const task = TASKS[childId]?.find((t) => t.id === taskId);
      if (!task) continue;
      const entry = dayRecord[taskId];
      const completed = typeof entry === 'object' ? entry.completed : !!entry;
      if (!completed) continue;
      points += 10;
      const actual = getTaskActualMinutes(entry, task);
      const saved = task.estimatedMinutes - actual;
      if (saved >= 5) {
        points += 5;
      } else if (saved >= -2) {
        points += 2;
      }
    }
  }
  points += Math.floor(getMaxStreak(records, childId) / 3) * 20;
  return Math.max(0, points);
}

function getUnlockedBadgeCount(records, childId, excludeId = null) {
  return BADGES.filter((b) => b.id !== excludeId && b.condition(records, childId)).length;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SUMMER_START,
    SUMMER_END,
    TOTAL_WEEKS,
    CHILDREN,
    DEFAULT_TASKS,
    TASKS,
    BADGES,
    MAP_NODES,
    getMaxStreak,
    countTaskCompleted,
    countAnyTaskCompleted,
    countCategoryCompleted,
    getCompletedCategories,
    getCompletedDays,
    isDayCompleted,
    getTotalSavedMinutes,
    hasBigTimeSave,
    calculatePoints,
    getUnlockedBadgeCount
  };
}
