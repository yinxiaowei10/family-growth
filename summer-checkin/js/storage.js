const STORAGE_KEY = 'summerCheckinRecords';
const SETTINGS_KEY = 'summerCheckinSettings';
const TASK_LIBRARY_KEY = 'summerCheckinTaskLibrary';
const PLANS_KEY = 'summerCheckinPlans';

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
        actualMinutes: task?.estimatedMinutes ?? 0,
        completedAt: null
      };
    } else if (val && typeof val === 'object') {
      normalized[taskId] = val;
    }
  }
  return normalized;
}

function getDayRecord(date, childId) {
  const records = getRecords();
  const raw = records[date]?.[childId] || {};
  return normalizeDayRecord(raw, childId);
}

function setTaskDone(date, childId, taskId, done, actualMinutes = null) {
  const records = getRecords();
  if (!records[date]) {
    records[date] = {};
  }
  if (!records[date][childId]) {
    records[date][childId] = {};
  }
  if (done) {
    const task = TASKS[childId]?.find((t) => t.id === taskId);
    records[date][childId][taskId] = {
      completed: true,
      actualMinutes: actualMinutes ?? task?.estimatedMinutes ?? 0,
      completedAt: new Date().toISOString()
    };
  } else {
    delete records[date][childId][taskId];
  }
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

function getPlan(date, childId) {
  const plans = getPlans();
  const plan = plans[date]?.[childId];
  if (plan && plan.length > 0) {
    return plan;
  }
  return TASKS[childId]?.map((t) => t.id) || [];
}

function savePlan(date, childId, taskIds) {
  const plans = getPlans();
  if (!plans[date]) {
    plans[date] = {};
  }
  plans[date][childId] = [...taskIds];
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
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getRecords,
    saveRecords,
    getDayRecord,
    setTaskDone,
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
    exportRecords,
    exportRecordsToCSV,
    importRecords,
    clearAllRecords
  };
}
