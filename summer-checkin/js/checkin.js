function renderCheckinPage() {
  const dateInput = document.getElementById('checkin-date');
  const today = getToday();
  dateInput.value = today;

  dateInput.addEventListener('change', () => {
    renderTasks(dateInput.value);
    updateProgress(dateInput.value);
  });

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      renderTasks(dateInput.value, tab.dataset.child);
      updateProgress(dateInput.value, tab.dataset.child);
    });
  });

  renderTasks(today, 'tongtong');
  updateProgress(today, 'tongtong');
}

function renderTasks(date, childId = 'tongtong') {
  const container = document.getElementById('task-list');
  const child = CHILDREN[childId];
  const tasks = TASKS[childId];
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
      const completed = !!dayRecord[task.id];
      return `
        <div class="task-item ${completed ? 'completed' : ''}" data-task="${task.id}" data-child="${childId}">
          <div class="task-checkbox">${completed ? '✓' : ''}</div>
          <div class="task-text"><span class="task-icon">${task.icon}</span>${task.text}</div>
          <div class="task-duration">${task.duration}</div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = headerHtml + tasksHtml;

  container.querySelectorAll('.task-item').forEach((item) => {
    item.addEventListener('click', () => {
      const taskId = item.dataset.task;
      const cId = item.dataset.child;
      const isCompleted = item.classList.contains('completed');
      setTaskDone(date, cId, taskId, !isCompleted);
      item.classList.toggle('completed');
      item.querySelector('.task-checkbox').textContent = isCompleted ? '' : '✓';
      updateProgress(date, cId);
    });
  });
}

function updateProgress(date, childId = 'tongtong') {
  const tasks = TASKS[childId];
  const dayRecord = getDayRecord(date, childId);
  const requiredTasks = tasks.filter((t) => !t.optional);
  const completedCount = requiredTasks.filter((t) => dayRecord[t.id]).length;
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
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderCheckinPage };
}
