const PERIODS = {
  morning: { label: '上午', icon: '☀️' },
  noon: { label: '中午', icon: '🍎' },
  afternoon: { label: '下午', icon: '🌤️' },
  evening: { label: '晚上', icon: '🌙' }
};

let selectedPeriod = 'morning';
let pendingGuess = null;
let pendingComplete = null;

function renderCheckinPage() {
  initTaskLibrary();

  const dateInput = document.getElementById('checkin-date');
  const today = getToday();
  dateInput.value = today;

  const getActiveChild = () => {
    const activeTab = document.querySelector('.tab.active');
    return activeTab?.dataset.child || 'tongtong';
  };

  const updateUrlChild = (childId) => {
    const url = new URL(window.location.href);
    if (childId && childId !== 'tongtong') {
      url.searchParams.set('child', childId);
    } else {
      url.searchParams.delete('child');
    }
    window.history.replaceState({}, '', url);
  };

  dateInput.addEventListener('change', () => {
    const childId = getActiveChild();
    renderPlan(dateInput.value, childId);
    renderActivityLibrary(dateInput.value, childId);
    updateProgress(dateInput.value, childId);
  });

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const childId = tab.dataset.child;
      updateUrlChild(childId);
      document.body.className = document.body.className.replace(/theme-\w+/g, '') + ' ' + CHILDREN[childId].theme;
      if (childId === 'songsong') {
        document.body.classList.add('young-child-mode');
      }
      renderPlan(dateInput.value, childId);
      renderActivityLibrary(dateInput.value, childId);
      updateProgress(dateInput.value, childId);
    });
  });

  const initialChild = getActiveChild();
  updateUrlChild(initialChild);
  document.body.className = document.body.className.replace(/theme-\w+/g, '') + ' ' + CHILDREN[initialChild].theme;
  if (initialChild === 'songsong') {
    document.body.classList.add('young-child-mode');
  }
  renderPlan(today, initialChild);
  renderActivityLibrary(today, initialChild);
  updateProgress(today, initialChild);
}

function renderPlan(date, childId = 'tongtong') {
  const container = document.getElementById('plan-container');
  if (!container) return;

  const child = CHILDREN[childId];
  const plan = getPlan(date, childId);
  const dayRecord = getDayRecord(date, childId);

  let html = `
    <div class="child-header paper-card mb-2">
      <img src="${child.avatar}" alt="${child.name}" onerror="this.style.display='none'">
      <div class="child-info">
        <div class="child-name">${child.name}</div>
        <div class="child-meta">${child.age} · ${child.grade} · ${child.characterDesc}</div>
      </div>
    </div>
  `;

  for (const [key, info] of Object.entries(PERIODS)) {
    const isSelected = selectedPeriod === key;
    const taskIds = plan[key] || [];
    const tasksHtml = taskIds
      .map((taskId) => {
        const task = TASKS[childId]?.find((t) => t.id === taskId);
        if (!task) return '';
        const record = dayRecord[taskId];
        const completed = !!record?.completed;
        const guessed = record?.guessedMinutes ?? task.estimatedMinutes;
        const actual = record?.actualMinutes;
        const diffHtml = completed ? formatTimeDiff(guessed, actual) : '';

        return `
          <div class="task-item ${completed ? 'completed' : ''}" data-task="${task.id}" data-child="${childId}">
            <div class="task-checkbox">${completed ? '✓' : ''}</div>
            <div class="task-text">
              <div><span class="task-icon">${task.icon}</span>${task.text}</div>
              ${completed
                ? `<div class="task-actual">猜 ${guessed} 分 → 用了 ${actual} 分 · ${diffHtml}</div>`
                : `<div class="task-estimate">猜 ${guessed} 分钟</div>`}
            </div>
          </div>
        `;
      })
      .join('');

    const emptyHtml = taskIds.length === 0
      ? `<div class="period-empty">点底部卡片库，把活动加进「${info.label}」</div>`
      : '';

    html += `
      <div class="paper-card period-card ${isSelected ? 'period-selected' : ''}" data-period="${key}">
        <div class="period-header">
          <div class="period-title"><span class="period-icon">${info.icon}</span>${info.label}</div>
          <button type="button" class="btn btn-small period-select-btn" onclick="selectPeriod('${key}')">${isSelected ? '✓ 当前' : '选这个'}</button>
        </div>
        <div class="period-tasks">${tasksHtml || emptyHtml}</div>
      </div>
    `;
  }

  container.innerHTML = html;

  container.querySelectorAll('.period-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.period-select-btn')) return;
      const period = card.dataset.period;
      selectPeriod(period);
    });
  });

  container.querySelectorAll('.task-item').forEach((item) => {
    item.addEventListener('click', () => {
      const taskId = item.dataset.task;
      const cId = item.dataset.child;
      handleTaskClick(date, cId, taskId);
    });
  });
}

function renderActivityLibrary(date, childId = 'tongtong') {
  const container = document.getElementById('activity-library');
  if (!container) return;

  const tasks = TASKS[childId] || [];
  const plan = getPlan(date, childId);
  const taskLocation = {};
  for (const [period, ids] of Object.entries(plan)) {
    ids.forEach((id) => {
      taskLocation[id] = period;
    });
  }

  document.getElementById('selected-period-label').textContent = PERIODS[selectedPeriod].label;

  container.innerHTML = tasks
    .map((task) => {
      const location = taskLocation[task.id];
      const inSelected = location === selectedPeriod;
      const inOther = location && location !== selectedPeriod;
      const chipClass = inSelected ? 'added' : inOther ? 'in-other' : '';
      const badge = inSelected ? '✓' : inOther ? PERIODS[location].label : '+';

      return `
        <button type="button" class="activity-chip ${chipClass}" onclick="toggleTaskInPeriod('${date}', '${childId}', '${task.id}')">
          <span class="activity-chip-icon">${task.icon}</span>
          <span class="activity-chip-text">${task.text}</span>
          <span class="activity-chip-badge">${badge}</span>
        </button>
      `;
    })
    .join('');
}

function selectPeriod(period) {
  selectedPeriod = period;
  const dateInput = document.getElementById('checkin-date');
  const activeChild = document.querySelector('.tab.active')?.dataset.child || 'tongtong';
  renderPlan(dateInput.value, activeChild);
  renderActivityLibrary(dateInput.value, activeChild);
}

function toggleTaskInPeriod(date, childId, taskId) {
  const plan = getPlan(date, childId);
  const newPlan = { morning: [...plan.morning], noon: [...plan.noon], afternoon: [...plan.afternoon], evening: [...plan.evening] };

  let currentlyIn = null;
  for (const [key, ids] of Object.entries(newPlan)) {
    if (ids.includes(taskId)) {
      currentlyIn = key;
      break;
    }
  }

  if (currentlyIn === selectedPeriod) {
    newPlan[selectedPeriod] = newPlan[selectedPeriod].filter((id) => id !== taskId);
    savePlan(date, childId, newPlan);
    renderPlan(date, childId);
    renderActivityLibrary(date, childId);
    updateProgress(date, childId);
  } else {
    if (currentlyIn) {
      newPlan[currentlyIn] = newPlan[currentlyIn].filter((id) => id !== taskId);
    }
    newPlan[selectedPeriod].push(taskId);
    savePlan(date, childId, newPlan);
    renderPlan(date, childId);
    renderActivityLibrary(date, childId);
    updateProgress(date, childId);
    openGuessModal(date, childId, taskId);
  }
}

function openGuessModal(date, childId, taskId) {
  const task = TASKS[childId]?.find((t) => t.id === taskId);
  if (!task) return;

  const modal = document.getElementById('guess-modal');
  const title = modal.querySelector('.guess-modal-title');
  const input = document.getElementById('guess-minutes-input');
  const presets = modal.querySelector('.time-presets');

  title.textContent = `「${task.text}」要多久？`;
  input.value = task.estimatedMinutes || '';

  const presetValues = [5, 10, 15, 20, 25, 30, 45, 60, 90, 120].filter((m) => m !== task.estimatedMinutes);
  presetValues.unshift(task.estimatedMinutes);
  presets.innerHTML = presetValues
    .slice(0, 8)
    .map((m) => `<button type="button" class="time-preset" data-min="${m}" onclick="document.getElementById('guess-minutes-input').value='${m}'">${m}分</button>`)
    .join('');

  pendingGuess = { date, childId, taskId };
  modal.classList.remove('hidden');
  input.focus();
}

function closeGuessModal() {
  document.getElementById('guess-modal').classList.add('hidden');
  pendingGuess = null;
}

function confirmGuessModal() {
  if (!pendingGuess) return;
  const { date, childId, taskId } = pendingGuess;
  const input = document.getElementById('guess-minutes-input');
  const minutes = parseInt(input.value, 10);
  if (Number.isNaN(minutes) || minutes < 0) {
    alert('请输入有效的分钟数');
    return;
  }
  setTaskGuess(date, childId, taskId, minutes);
  closeGuessModal();
  renderPlan(date, childId);
}

function handleTaskClick(date, childId, taskId) {
  const dayRecord = getDayRecord(date, childId);
  const record = dayRecord[taskId];
  openTimeModal(date, childId, taskId, !!record?.completed);
}

function openTimeModal(date, childId, taskId, isEdit) {
  const task = TASKS[childId]?.find((t) => t.id === taskId);
  if (!task) return;

  const dayRecord = getDayRecord(date, childId);
  const record = dayRecord[taskId];
  const guessed = record?.guessedMinutes ?? task.estimatedMinutes;
  const currentActual = record?.completed ? record.actualMinutes : guessed;

  const modal = document.getElementById('time-modal');
  const title = modal.querySelector('.time-modal-title');
  const estimateText = modal.querySelector('.time-modal-estimate');
  const input = document.getElementById('actual-minutes-input');
  const presets = modal.querySelector('.time-presets');

  title.textContent = isEdit ? `修改「${task.text}」的实际用时` : `完成「${task.text}」用了多久？`;
  estimateText.textContent = `你的猜测：${guessed} 分钟`;
  input.value = currentActual || '';

  const presetValues = [5, 10, 15, 20, 25, 30, 45, 60, 90, 120].filter((m) => m !== guessed);
  presetValues.unshift(guessed);
  presets.innerHTML = presetValues
    .slice(0, 8)
    .map((m) => `<button type="button" class="time-preset" data-min="${m}" onclick="document.getElementById('actual-minutes-input').value='${m}'">${m}分</button>`)
    .join('');

  pendingComplete = { date, childId, taskId, isEdit };
  document.getElementById('uncomplete-task').classList.toggle('hidden', !isEdit);
  modal.classList.remove('hidden');
  input.focus();
}

function closeTimeModal() {
  document.getElementById('time-modal').classList.add('hidden');
  pendingComplete = null;
}

function confirmTimeModal() {
  if (!pendingComplete) return;
  const { date, childId, taskId } = pendingComplete;
  const input = document.getElementById('actual-minutes-input');
  const minutes = parseInt(input.value, 10);
  if (Number.isNaN(minutes) || minutes < 0) {
    alert('请输入有效的分钟数');
    return;
  }
  setTaskDone(date, childId, taskId, true, minutes);
  closeTimeModal();
  renderPlan(date, childId);
  updateProgress(date, childId);

  if (getCurrentPercent() === 100) {
    triggerCelebration(childId);
  }
}

function skipTimeModal() {
  if (!pendingComplete) return;
  const { date, childId, taskId } = pendingComplete;
  const dayRecord = getDayRecord(date, childId);
  const guessed = dayRecord[taskId]?.guessedMinutes;
  setTaskDone(date, childId, taskId, true, guessed);
  closeTimeModal();
  renderPlan(date, childId);
  updateProgress(date, childId);

  if (getCurrentPercent() === 100) {
    triggerCelebration(childId);
  }
}

function uncompleteTask() {
  if (!pendingComplete) return;
  const { date, childId, taskId } = pendingComplete;
  setTaskDone(date, childId, taskId, false);
  closeTimeModal();
  renderPlan(date, childId);
  updateProgress(date, childId);
}

function getCurrentPercent() {
  const text = document.querySelector('.progress-text');
  return text ? parseInt(text.textContent, 10) || 0 : 0;
}

function triggerCelebration(childId) {
  const child = CHILDREN[childId];
  createConfetti();

  const overlay = document.createElement('div');
  overlay.className = 'celebration-overlay';
  overlay.innerHTML = `
    <div class="celebration-content">
      <div class="celebration-character">${child.avatar ? `<img src="${child.avatar}" alt="${child.name}">` : '🎉'}</div>
      <div class="celebration-title">太棒了！</div>
      <div class="celebration-text">${child.name} 完成了今天所有任务</div>
      <button class="btn btn-primary celebration-close">继续加油</button>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('.celebration-close').addEventListener('click', () => {
    overlay.remove();
    document.querySelectorAll('.confetti').forEach((c) => c.remove());
  });

  setTimeout(() => {
    if (document.body.contains(overlay)) {
      overlay.remove();
      document.querySelectorAll('.confetti').forEach((c) => c.remove());
    }
  }, 4000);
}

function createConfetti() {
  const colors = ['#FFB347', '#87CEEB', '#98D98E', '#FFE082', '#DDA0DD'];
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 2 + 's';
    confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
    document.body.appendChild(confetti);
  }
}

function formatTimeDiff(guessed, actual) {
  const diff = actual - guessed;
  if (diff <= -2) {
    return '<span class="time-saved">快一点 ⚡</span>';
  } else if (diff >= 2) {
    return '<span class="time-extra">久一点 🐢</span>';
  }
  return '<span class="time-match">好准 ✅</span>';
}

function updateProgress(date, childId = 'tongtong') {
  const plan = getPlan(date, childId);
  const dayRecord = getDayRecord(date, childId);

  let totalRequired = 0;
  let completedRequired = 0;

  for (const taskIds of Object.values(plan)) {
    for (const taskId of taskIds) {
      const task = TASKS[childId]?.find((t) => t.id === taskId);
      if (!task || task.optional) continue;
      totalRequired++;
      if (dayRecord[taskId]?.completed) completedRequired++;
    }
  }

  const percent = totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 0;

  const circle = document.querySelector('.progress-ring-fill');
  const text = document.querySelector('.progress-text');
  if (circle && text) {
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
    text.textContent = `${percent}%`;

    if (percent === 100) {
      circle.style.stroke = '#98D98E';
      circle.parentElement.classList.add('progress-complete');
    } else {
      circle.style.stroke = '';
      circle.parentElement.classList.remove('progress-complete');
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderCheckinPage };
}
