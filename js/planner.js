// Planner Logic
document.addEventListener('DOMContentLoaded', () => {
  const taskListElement = document.getElementById('task-list');
  const addTaskForm = document.getElementById('add-task-form');
  
  // Default tasks if none exist
  const defaultTasks = [
    { id: 1, title: 'Solve 2 Arrays problems', category: 'DSA', priority: 'high', completed: false, notes: '', timeSpent: 0 },
    { id: 2, title: 'Time and Work Practice', category: 'Aptitude', priority: 'medium', completed: false, notes: '', timeSpent: 0 },
    { id: 3, title: 'Record a self introduction video', category: 'Communication', priority: 'medium', completed: false, notes: 'Keep it under 2 minutes', timeSpent: 0 },
    { id: 4, title: 'Update Resume skills section', category: 'Resume', priority: 'low', completed: false, notes: '', timeSpent: 0 }
  ];

  let tasks = StorageHelper.get('plannerTasks', defaultTasks);
  let activeTimer = null;
  let timerInterval = null;

  const saveTasks = () => {
    StorageHelper.set('plannerTasks', tasks);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const renderTasks = () => {
    taskListElement.innerHTML = '';
    
    // Sort tasks: incomplete first, then by priority (high > medium > low)
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });

    sortedTasks.forEach(task => {
      const isTimerActive = activeTimer === task.id;
      
      const div = document.createElement('div');
      div.className = `task-item ${task.completed ? 'completed' : ''}`;
      div.innerHTML = `
        <div class="task-main">
          <div class="task-left">
            <input type="checkbox" class="goal-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
            <span class="task-title">${task.title}</span>
            <span class="badge badge-primary">${task.category}</span>
          </div>
          <button class="btn-icon delete-btn" data-id="${task.id}" title="Delete Task">🗑️</button>
        </div>
        <div class="task-details">
          <span class="priority-badge priority-${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority</span>
          <button class="timer-btn ${isTimerActive ? 'active' : ''}" data-id="${task.id}">
            ⏱️ <span class="timer-display">${formatTime(task.timeSpent)}</span>
          </button>
          <div style="flex: 1;">
            <input type="text" class="notes-input" placeholder="Add notes here..." data-id="${task.id}" value="${task.notes}">
          </div>
        </div>
      `;
      taskListElement.appendChild(div);
    });

    attachEventListeners();
  };

  const attachEventListeners = () => {
    // Checkboxes
    document.querySelectorAll('.goal-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        const task = tasks.find(t => t.id === id);
        if (task) {
          task.completed = e.target.checked;
          if (task.completed) {
            StorageHelper.logActivity();
          }
          if (task.completed && activeTimer === id) {
            stopTimer(); // stop timer if marked completed
          }
          saveTasks();
          renderTasks(); // Re-render to sort
        }
      });
    });

    // Notes
    document.querySelectorAll('.notes-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        const task = tasks.find(t => t.id === id);
        if (task) {
          task.notes = e.target.value;
          saveTasks();
        }
      });
    });

    // Delete
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        tasks = tasks.filter(t => t.id !== id);
        if (activeTimer === id) stopTimer();
        saveTasks();
        renderTasks();
      });
    });

    // Timer
    document.querySelectorAll('.timer-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        
        if (activeTimer === id) {
          stopTimer();
        } else {
          startTimer(id);
        }
      });
    });
  };

  const startTimer = (id) => {
    if (activeTimer) stopTimer();
    
    activeTimer = id;
    renderTasks(); // update UI to show active state
    
    timerInterval = setInterval(() => {
      const task = tasks.find(t => t.id === activeTimer);
      if (task) {
        task.timeSpent += 1;
        
        // Update total study hours every minute (1/60th of an hour)
        if (task.timeSpent % 60 === 0) {
          const stats = StorageHelper.get('userStats', {});
          const currentHours = stats.studyHours || 0;
          StorageHelper.updateUserStats({ studyHours: +(currentHours + (1/60)).toFixed(2) });
          
          // Log to study history
          const history = StorageHelper.get('studyHistory', {});
          const todayDateStr = new Date().toDateString();
          history[todayDateStr] = +( (history[todayDateStr] || 0) + (1/60) ).toFixed(2);
          StorageHelper.set('studyHistory', history);
        }
        
        // Update display without re-rendering everything
        const btn = document.querySelector(`.timer-btn[data-id="${id}"] .timer-display`);
        if (btn) btn.textContent = formatTime(task.timeSpent);
        saveTasks();
      }
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerInterval);
    activeTimer = null;
    timerInterval = null;
    renderTasks();
  };

  addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const titleInput = document.getElementById('new-task-title');
    const categoryInput = document.getElementById('new-task-category');
    const priorityInput = document.getElementById('new-task-priority');
    
    const newTask = {
      id: Date.now(),
      title: titleInput.value,
      category: categoryInput.value,
      priority: priorityInput.value,
      completed: false,
      notes: '',
      timeSpent: 0
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    
    titleInput.value = ''; // reset form
  });

  renderTasks();
});
