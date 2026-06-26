function renderCheckinPage() {
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
    updateProgress(dateInput.value, childId);
  });

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const childId = tab.dataset.child;
      updateUrlChild(childId);
      renderTasks(dateInput.value, childId);
      updateProgress(dateInput.value, childId);
    });
  });

  const initialChild = getActiveChild();
  updateUrlChild(initialChild);
  renderTasks(today, initialChild);
  updateProgress(today, initialChild);
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
      const newCompleted = !isCompleted;
      setTaskDone(date, cId, taskId, newCompleted);
      item.classList.toggle('completed');
      const checkbox = item.querySelector('.task-checkbox');
      checkbox.textContent = newCompleted ? '✓' : '';

      if (newCompleted) {
        checkbox.classList.add('task-bounce');
        setTimeout(() => checkbox.classList.remove('task-bounce'), 500);
      }

      const oldPercent = getCurrentPercent();
      updateProgress(date, cId);
      const newPercent = getCurrentPercent();

      if (oldPercent < 100 && newPercent === 100) {
        triggerCelebration(cId);
      }
    });
  });
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
    confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
    document.body.appendChild(confetti);
  }
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
