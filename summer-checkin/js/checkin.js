let currentEditTaskId = null;
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
    renderTasks(dateInput.value, childId);
    renderTaskLibrary(dateInput.value, childId);
  });

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const childId = tab.dataset.child;
      updateUrlChild(childId);
      renderTasks(dateInput.value, childId);
      renderTaskLibrary(dateInput.value, childId);
    });
  });

  const initialChild = getActiveChild();
  updateUrlChild(initialChild);
  renderTasks(today, initialChild);
  renderTaskLibrary(today, initialChild);
}

function renderTasks(date, childId = 'tongtong') {
  const container = document.getElementById('task-list');
  const child = CHILDREN[childId];
  const plan = getPlan(date, childId);
  const tasks = plan
    .map((id) => TASKS[childId]?.find((t) => t.id === id))
    .filter(Boolean);
  const dayRecord = getDayRecord(date, childId);

  document.body.className = document.body.className.replace(/theme-\w+/g, '').replace(/young-child-mode/g, '') + ' ' + child.theme;
  if (childId === 'songsong') {
    document.body.classList.add('young-child-mode');
  }

  const headerHtml = `
    <div class="child-header">
      <img src="${child.avatar}" alt="${child.name}" onerror="this.style.display='none'">
      <div class="child-info">
        <div class="child-name">${child.name}</div>
        <div class="child-meta">${child.age} · ${child.grade} · ${child.characterDesc}</div>
      </div>
    </div>
  `;

  const tasksHtml = tasks
    .map((task) => {
      const record = dayRecord[task.id];
      const completed = !!record?.completed;
      const actualMinutes = record?.actualMinutes;
      const diffHtml = completed ? formatTimeDiff(task.estimatedMinutes, actualMinutes) : '';
      return `
        <div class="task-item ${completed ? 'completed' : ''}" data-task="${task.id}" data-child="${childId}">
          <div class="task-checkbox">${completed ? '✓' : ''}</div>
          <div class="task-text">
            <div><span class="task-icon">${task.icon}</span>${task.text}</div>
            ${completed ? `<div class="task-actual">实际 ${actualMinutes} 分钟 · ${diffHtml}</div>` : `<div class="task-estimate">预估 ${task.estimatedMinutes} 分钟</div>`}
          </div>
        </div>
      `;
    })
    .join('');

  const emptyHtml = tasks.length === 0
    ? `<div class="empty-state">
         <p>今天还没有安排打卡项目</p>
         <p style="font-size: 0.85rem;">去底部的「打卡项目库」里选几个吧 🎯</p>
       </div>`
    : '';

  container.innerHTML = headerHtml + tasksHtml + emptyHtml;

  container.querySelectorAll('.task-item').forEach((item) => {
    item.addEventListener('click', () => {
      const taskId = item.dataset.task;
      const cId = item.dataset.child;
      handleTaskClick(date, cId, taskId);
    });
  });
}

function formatTimeDiff(estimated, actual) {
  const diff = actual - estimated;
  if (diff < -2) {
    return `<span class="time-saved">节省了 ${Math.abs(diff)} 分钟 ⚡</span>`;
  } else if (diff > 2) {
    return `<span class="time-extra">多用了 ${diff} 分钟 🐢</span>`;
  }
  return '<span class="time-match">时间刚好 ✅</span>';
}

function handleTaskClick(date, childId, taskId) {
  const dayRecord = getDayRecord(date, childId);
  const record = dayRecord[taskId];
  if (record?.completed) {
    openTimeModal(date, childId, taskId, true);
  } else {
    openTimeModal(date, childId, taskId, false);
  }
}

function openTimeModal(date, childId, taskId, isEdit) {
  const task = TASKS[childId]?.find((t) => t.id === taskId);
  if (!task) return;

  const dayRecord = getDayRecord(date, childId);
  const existing = dayRecord[taskId];
  const currentActual = existing?.completed ? existing.actualMinutes : task.estimatedMinutes;

  const modal = document.getElementById('time-modal');
  const title = modal.querySelector('.time-modal-title');
  const estimateText = modal.querySelector('.time-modal-estimate');
  const input = modal.querySelector('#actual-minutes-input');
  const presets = modal.querySelector('.time-presets');

  title.textContent = isEdit ? `修改「${task.text}」的实际用时` : `完成「${task.text}」用了多久？`;
  estimateText.textContent = `预估时间：${task.estimatedMinutes} 分钟`;
  input.value = currentActual || '';

  const presetValues = [10, 15, 20, 25, 30, 45, 60, 90, 120].filter((m) => m !== task.estimatedMinutes);
  presetValues.unshift(task.estimatedMinutes);
  presets.innerHTML = presetValues
    .slice(0, 8)
    .map((m) => `<button type="button" class="time-preset" data-min="${m}">${m}分</button>`)
    .join('');

  presets.querySelectorAll('.time-preset').forEach((btn) => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.min;
    });
  });

  pendingComplete = { date, childId, taskId, isEdit };
  document.getElementById('uncomplete-task').classList.toggle('hidden', !isEdit);
  modal.classList.remove('hidden');
  input.focus();
}

function closeTimeModal() {
  const modal = document.getElementById('time-modal');
  modal.classList.add('hidden');
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
  renderTasks(date, childId);
  updateProgress(date, childId);

  const percent = getCurrentPercent();
  if (percent === 100) {
    triggerCelebration(childId);
  }
}

function skipTimeModal() {
  if (!pendingComplete) return;
  const { date, childId, taskId } = pendingComplete;
  const task = TASKS[childId]?.find((t) => t.id === taskId);
  setTaskDone(date, childId, taskId, true, task?.estimatedMinutes ?? 0);
  closeTimeModal();
  renderTasks(date, childId);
  updateProgress(date, childId);

  const percent = getCurrentPercent();
  if (percent === 100) {
    triggerCelebration(childId);
  }
}

function uncompleteTask() {
  if (!pendingComplete) return;
  const { date, childId, taskId } = pendingComplete;
  setTaskDone(date, childId, taskId, false);
  closeTimeModal();
  renderTasks(date, childId);
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

function updateProgress(date, childId = 'tongtong') {
  const plan = getPlan(date, childId);
  const tasks = plan
    .map((id) => TASKS[childId]?.find((t) => t.id === id))
    .filter(Boolean);
  const dayRecord = getDayRecord(date, childId);
  const requiredTasks = tasks.filter((t) => !t.optional);
  const completedCount = requiredTasks.filter((t) => dayRecord[t.id]?.completed).length;
  const totalCount = requiredTasks.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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

function renderTaskLibrary(date, childId = 'tongtong') {
  const container = document.getElementById('task-library-list');
  if (!container) return;

  const tasks = TASKS[childId] || [];
  const plan = getPlan(date, childId);

  container.innerHTML = tasks
    .map((task) => {
      const inPlan = plan.includes(task.id);
      const isEditing = currentEditTaskId === task.id;

      if (isEditing) {
        return `
          <div class="library-item library-item-editing" data-task="${task.id}">
            <div class="library-edit-row">
              <input type="text" class="library-input library-input-icon" value="${task.icon}" placeholder="图标" maxlength="2">
              <input type="text" class="library-input library-input-name" value="${escapeHtml(task.text)}" placeholder="任务名称">
              <input type="number" class="library-input library-input-time" value="${task.estimatedMinutes}" placeholder="分钟">
            </div>
            <div class="library-edit-actions">
              <label class="library-check"><input type="checkbox" class="library-optional" ${task.optional ? 'checked' : ''}> 可选</label>
              <button type="button" class="btn btn-small btn-primary" onclick="saveTaskEdit('${task.id}', '${childId}')">保存</button>
              <button type="button" class="btn btn-small" onclick="cancelTaskEdit()">取消</button>
            </div>
          </div>
        `;
      }

      return `
        <div class="library-item" data-task="${task.id}">
          <button type="button" class="library-toggle ${inPlan ? 'active' : ''}" onclick="toggleTaskInPlan('${date}', '${childId}', '${task.id}')" aria-label="加入今日计划">
            ${inPlan ? '✓' : '+'}
          </button>
          <div class="library-info">
            <div class="library-name"><span class="library-icon">${task.icon}</span>${escapeHtml(task.text)}</div>
            <div class="library-meta">预估 ${task.estimatedMinutes} 分钟 · ${task.optional ? '可选' : '必做'}</div>
          </div>
          <div class="library-actions">
            <button type="button" class="btn btn-small" onclick="startTaskEdit('${task.id}')">编辑</button>
            <button type="button" class="btn btn-small btn-danger" onclick="deleteTask('${date}', '${childId}', '${task.id}')">删除</button>
          </div>
        </div>
      `;
    })
    .join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function toggleTaskInPlan(date, childId, taskId) {
  const plan = [...getPlan(date, childId)];
  const index = plan.indexOf(taskId);
  if (index >= 0) {
    plan.splice(index, 1);
  } else {
    plan.push(taskId);
  }
  savePlan(date, childId, plan);
  renderTasks(date, childId);
  renderTaskLibrary(date, childId);
  updateProgress(date, childId);
}

function startTaskEdit(taskId) {
  currentEditTaskId = taskId;
  const activeChild = document.querySelector('.tab.active')?.dataset.child || 'tongtong';
  const dateInput = document.getElementById('checkin-date');
  renderTaskLibrary(dateInput.value, activeChild);
}

function cancelTaskEdit() {
  currentEditTaskId = null;
  const activeChild = document.querySelector('.tab.active')?.dataset.child || 'tongtong';
  const dateInput = document.getElementById('checkin-date');
  renderTaskLibrary(dateInput.value, activeChild);
}

function saveTaskEdit(taskId, childId) {
  const item = document.querySelector(`.library-item[data-task="${taskId}"]`);
  if (!item) return;

  const icon = item.querySelector('.library-input-icon').value.trim() || '📝';
  const text = item.querySelector('.library-input-name').value.trim() || '未命名任务';
  const estimatedMinutes = parseInt(item.querySelector('.library-input-time').value, 10) || 15;
  const optional = item.querySelector('.library-optional').checked;

  const library = getTaskLibrary();
  const tasks = library[childId] || [];
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.icon = icon;
    task.text = text;
    task.estimatedMinutes = estimatedMinutes;
    task.duration = `${estimatedMinutes}分钟`;
    task.optional = optional;
  }

  saveTaskLibrary(library);
  currentEditTaskId = null;

  const dateInput = document.getElementById('checkin-date');
  const activeChild = document.querySelector('.tab.active')?.dataset.child || childId;
  renderTasks(dateInput.value, activeChild);
  renderTaskLibrary(dateInput.value, activeChild);
  updateProgress(dateInput.value, activeChild);
}

function deleteTask(date, childId, taskId) {
  if (!confirm('确定要删除这个打卡项目吗？')) return;

  const library = getTaskLibrary();
  if (library[childId]) {
    library[childId] = library[childId].filter((t) => t.id !== taskId);
    saveTaskLibrary(library);
  }

  const plan = getPlan(date, childId).filter((id) => id !== taskId);
  savePlan(date, childId, plan);

  const records = getRecords();
  if (records[date]?.[childId]?.[taskId]) {
    delete records[date][childId][taskId];
    saveRecords(records);
  }

  renderTasks(date, childId);
  renderTaskLibrary(date, childId);
  updateProgress(date, childId);
}

function addNewTask(childId) {
  const library = getTaskLibrary();
  if (!library[childId]) {
    library[childId] = [];
  }
  const newId = 'task_' + Date.now();
  library[childId].push({
    id: newId,
    text: '新任务',
    icon: '🌟',
    estimatedMinutes: 15,
    duration: '15分钟',
    category: 'custom',
    optional: false
  });
  saveTaskLibrary(library);

  const dateInput = document.getElementById('checkin-date');
  const activeChild = document.querySelector('.tab.active')?.dataset.child || childId;
  startTaskEdit(newId);
  renderTaskLibrary(dateInput.value, activeChild);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderCheckinPage };
}
