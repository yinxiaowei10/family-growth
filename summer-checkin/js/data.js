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

const TASKS = {
  tongtong: [
    {
      id: 'outdoor',
      text: '户外2小时',
      duration: '2小时',
      icon: '☀️',
      category: 'health'
    },
    {
      id: 'english',
      text: '英语输入30分钟',
      duration: '30分钟',
      icon: '🔤',
      category: 'english'
    },
    {
      id: 'reading',
      text: '中文阅读1.5小时',
      duration: '1.5小时',
      icon: '📚',
      category: 'chinese'
    },
    {
      id: 'math',
      text: '数学20分钟',
      duration: '20分钟',
      icon: '🔢',
      category: 'math'
    },
    {
      id: 'writing',
      text: '自由写作',
      duration: '每天写一点',
      icon: '✍️',
      category: 'chinese'
    },
    {
      id: 'nap',
      text: '午睡30-40分钟',
      duration: '30-40分钟',
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
      icon: '☀️',
      category: 'health'
    },
    {
      id: 'mathcamp',
      text: '数学营补学',
      duration: '25-30分钟',
      icon: '🔢',
      category: 'math'
    },
    {
      id: 'abcreading',
      text: 'ABC Reading打卡',
      duration: '15-20分钟',
      icon: '🔤',
      category: 'english'
    }
  ]
};

const BADGES = [
  {
    id: 'streak-3',
    name: '连续3天',
    icon: '🔥',
    condition: (records, childId) => getMaxStreak(records, childId) >= 3
  },
  {
    id: 'streak-7',
    name: '连续7天',
    icon: '🌟',
    condition: (records, childId) => getMaxStreak(records, childId) >= 7
  },
  {
    id: 'streak-14',
    name: '连续14天',
    icon: '🏆',
    condition: (records, childId) => getMaxStreak(records, childId) >= 14
  },
  {
    id: 'outdoor-master',
    name: '运动达人',
    icon: '☀️',
    condition: (records, childId) => countTaskCompleted(records, childId, 'outdoor') >= 20
  },
  {
    id: 'reading-master',
    name: '阅读达人',
    icon: '📚',
    condition: (records, childId) => countTaskCompleted(records, childId, 'reading') >= 20
  },
  {
    id: 'writing-master',
    name: '写作之星',
    icon: '✍️',
    condition: (records, childId) => countTaskCompleted(records, childId, 'writing') >= 15
  },
  {
    id: 'english-master',
    name: '英语小能手',
    icon: '🔤',
    condition: (records, childId) => countTaskCompleted(records, childId, 'english') >= 20 || countTaskCompleted(records, childId, 'abcreading') >= 20
  },
  {
    id: 'math-master',
    name: '数学小天才',
    icon: '🔢',
    condition: (records, childId) => countTaskCompleted(records, childId, 'math') >= 20 || countTaskCompleted(records, childId, 'mathcamp') >= 20
  },
  {
    id: 'halfway',
    name: '暑假过半',
    icon: '🎯',
    condition: (records, childId) => getCompletedDays(records, childId) >= 28
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SUMMER_START,
    SUMMER_END,
    TOTAL_WEEKS,
    CHILDREN,
    TASKS,
    BADGES,
    MAP_NODES,
    getMaxStreak,
    countTaskCompleted,
    getCompletedDays,
    isDayCompleted
  };
}
