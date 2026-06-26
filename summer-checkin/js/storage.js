const STORAGE_KEY = 'summerCheckinRecords';
const SETTINGS_KEY = 'summerCheckinSettings';

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

function getDayRecord(date, childId) {
  const records = getRecords();
  return records[date]?.[childId] || {};
}

function setTaskDone(date, childId, taskId, done) {
  const records = getRecords();
  if (!records[date]) {
    records[date] = {};
  }
  if (!records[date][childId]) {
    records[date][childId] = {};
  }
  if (done) {
    records[date][childId][taskId] = true;
  } else {
    delete records[date][childId][taskId];
  }
  records[date][childId].updatedAt = new Date().toISOString();
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

function exportRecords() {
  return getRecords();
}

function exportRecordsToCSV() {
  const records = getRecords();
  const rows = [];
  rows.push(['日期', '孩子', '任务ID', '任务名称', '是否完成', '更新时间'].join(','));

  for (const date in records) {
    for (const childId in records[date]) {
      const dayRecord = records[date][childId];
      for (const taskId in dayRecord) {
        if (taskId === 'updatedAt') continue;
        const child = CHILDREN[childId];
        const task = TASKS[childId]?.find((t) => t.id === taskId);
        rows.push([
          date,
          child?.name || childId,
          taskId,
          task?.text || taskId,
          dayRecord[taskId] ? '是' : '否',
          dayRecord.updatedAt || ''
        ].join(','));
      }
    }
  }

  return rows.join('\n');
}

function importRecords(jsonString) {
  try {
    const records = JSON.parse(jsonString);
    saveRecords(records);
    return true;
  } catch (e) {
    console.error('导入失败', e);
    return false;
  }
}

function clearAllRecords() {
  localStorage.removeItem(STORAGE_KEY);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getRecords,
    saveRecords,
    getDayRecord,
    setTaskDone,
    getSettings,
    saveSettings,
    exportRecords,
    exportRecordsToCSV,
    importRecords,
    clearAllRecords
  };
}
