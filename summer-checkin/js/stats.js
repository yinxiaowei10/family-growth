function renderStatsPage() {
  const container = document.getElementById('stats-container');
  if (!container) return;

  const records = getRecords();
  const childSelector = document.getElementById('stats-child-select');
  let childId = childSelector ? childSelector.value : 'tongtong';

  if (childSelector) {
    childSelector.addEventListener('change', () => {
      renderStatsForChild(childSelector.value, records, container);
    });
  }

  document.getElementById('export-json')?.addEventListener('click', () => {
    const data = exportRecords();
    downloadFile(JSON.stringify(data, null, 2), `summer-checkin-${getToday()}.json`, 'application/json');
  });

  document.getElementById('export-csv')?.addEventListener('click', () => {
    const csv = exportRecordsToCSV();
    downloadFile(csv, `summer-checkin-${getToday()}.csv`, 'text/csv;charset=utf-8;');
  });

  document.getElementById('import-json')?.addEventListener('click', () => {
    const input = document.getElementById('import-file');
    if (input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      if (importRecords(e.target.result)) {
        alert('导入成功！');
        location.reload();
      } else {
        alert('导入失败，请检查文件格式。');
      }
    };
    reader.readAsText(file);
  });

  renderStatsForChild(childId, records, container);
}

function renderStatsForChild(childId, records, container) {
  const child = CHILDREN[childId];
  const tasks = TASKS[childId];
  const totalDays = Object.keys(records).length;
  const completedDays = getCompletedDays(records, childId);
  const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  let taskStatsHtml = '<div class="task-stats mb-2">';
  tasks.forEach((task) => {
    const count = countTaskCompleted(records, childId, task.id);
    const rate = totalDays > 0 ? Math.round((count / totalDays) * 100) : 0;
    taskStatsHtml += `
      <div class="paper-card stat-card">
        <div>${task.icon} ${task.text}</div>
        <div class="stat-value">${count}天</div>
      </div>
    `;
  });
  taskStatsHtml += '</div>';

  const streak = getMaxStreak(records, childId);
  const { totalEstimated, totalActual } = getTimeSummary(records, childId);
  const diff = totalActual - totalEstimated;
  let timeSummaryText = '和预估差不多';
  if (diff < -2) timeSummaryText = `节省了 ${Math.abs(diff)} 分钟 ⚡`;
  else if (diff > 2) timeSummaryText = `多用了 ${diff} 分钟 🐢`;
  const points = calculatePoints(records, childId);
  const unlockedBadges = BADGES.filter((b) => b.condition(records, childId)).length;

  container.innerHTML = `
    <div class="child-header mb-2">
      <img src="${child.avatar}" alt="${child.name}" onerror="this.style.display='none'">
      <div class="child-info">
        <div class="child-name">${child.name} 的数据统计</div>
      </div>
    </div>
    <div class="paper-card stat-card mb-2">
      <div>⭐ 成长积分</div>
      <div class="stat-value">${points}</div>
    </div>
    <div class="paper-card stat-card mb-2">
      <div>🎖️ 徽章解锁</div>
      <div class="stat-value">${unlockedBadges}/${BADGES.length}</div>
    </div>
    <div class="paper-card stat-card mb-2">
      <div>📅 打卡天数 / 总记录天数</div>
      <div class="stat-value">${completedDays}/${totalDays}</div>
    </div>
    <div class="paper-card stat-card mb-2">
      <div>🎯 完成率</div>
      <div class="stat-value">${completionRate}%</div>
    </div>
    <div class="paper-card stat-card mb-2">
      <div>🔥 最长连续打卡</div>
      <div class="stat-value">${streak}天</div>
    </div>
    <div class="paper-card stat-card mb-2">
      <div>⏱️ 实际 / 预估用时</div>
      <div class="stat-value">${totalActual}/${totalEstimated}分</div>
    </div>
    <div class="paper-card stat-card mb-2">
      <div>🚀 效率对比</div>
      <div class="stat-value" style="font-size: 1.2rem;">${timeSummaryText}</div>
    </div>
    ${taskStatsHtml}
  `;
}

function getTimeSummary(records, childId) {
  let totalEstimated = 0;
  let totalActual = 0;
  let completedCount = 0;

  for (const date in records) {
    const dayRecord = records[date]?.[childId];
    if (!dayRecord) continue;
    for (const taskId in dayRecord) {
      if (taskId === 'updatedAt') continue;
      const entry = dayRecord[taskId];
      const task = TASKS[childId]?.find((t) => t.id === taskId);
      if (!task) continue;
      const completed = typeof entry === 'object' ? entry.completed : !!entry;
      if (!completed) continue;
      completedCount++;
      const actual = typeof entry === 'object' ? entry.actualMinutes : task.estimatedMinutes;
      totalEstimated += task.estimatedMinutes;
      totalActual += actual || task.estimatedMinutes;
    }
  }

  return { totalEstimated, totalActual, completedCount };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderStatsPage };
}
