// Communication Logic
document.addEventListener('DOMContentLoaded', () => {
  const speakingTasksContainer = document.getElementById('speaking-tasks');
  const hrTasksContainer = document.getElementById('hr-tasks');
  const newSpeakingInput = document.getElementById('new-speaking-task');
  
  const hrSlider = document.getElementById('hr-slider');
  const hrConfVal = document.getElementById('hr-conf-val');
  const introSlider = document.getElementById('intro-slider');
  const introConfVal = document.getElementById('intro-conf-val');
  const projectSlider = document.getElementById('project-slider');
  const projectConfVal = document.getElementById('project-conf-val');
  
  const selfIntroText = document.getElementById('self-intro-text');
  const projectText = document.getElementById('project-text');
  const overallConfidence = document.getElementById('overall-confidence');
  
  let commData = StorageHelper.get('commData', {
    speakingTasks: [
      { id: 1, title: 'Speak on a random topic for 2 mins', completed: false },
      { id: 2, title: 'Read a news article aloud', completed: false }
    ],
    hrTasks: [
      { id: 1, title: 'Why should we hire you?', completed: false },
      { id: 2, title: 'Where do you see yourself in 5 years?', completed: false },
      { id: 3, title: 'What are your strengths and weaknesses?', completed: false }
    ],
    hrConfidence: 0,
    introConfidence: 0,
    projectConfidence: 0,
    introText: '',
    projectExplanationText: ''
  });

  const saveData = () => {
    StorageHelper.set('commData', commData);
    updateOverallStats();
  };

  const updateOverallStats = () => {
    // Calculate average confidence based on sliders and completed tasks
    const slidersAvg = (parseInt(commData.hrConfidence) + parseInt(commData.introConfidence) + parseInt(commData.projectConfidence)) / 3;
    
    overallConfidence.textContent = `${Math.round(slidersAvg)}%`;
    StorageHelper.updateUserStats({ commProgress: Math.round(slidersAvg) });
  };

  const renderSpeakingTasks = () => {
    speakingTasksContainer.innerHTML = '';
    commData.speakingTasks.forEach(task => {
      const div = document.createElement('div');
      div.className = 'comm-task';
      div.innerHTML = `
        <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; ${task.completed ? 'text-decoration: line-through; opacity: 0.7;' : ''}">
          <input type="checkbox" class="goal-checkbox speaking-cb" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
          <span>${task.title}</span>
        </label>
        <button class="btn-icon delete-speaking" data-id="${task.id}">🗑️</button>
      `;
      speakingTasksContainer.appendChild(div);
    });
    attachTaskListeners();
  };

  const renderHrTasks = () => {
    hrTasksContainer.innerHTML = '';
    commData.hrTasks.forEach(task => {
      const div = document.createElement('div');
      div.className = 'comm-task';
      div.innerHTML = `
        <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; ${task.completed ? 'text-decoration: line-through; opacity: 0.7;' : ''}">
          <input type="checkbox" class="goal-checkbox hr-cb" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
          <span>${task.title}</span>
        </label>
      `;
      hrTasksContainer.appendChild(div);
    });
    attachTaskListeners();
  };

  const attachTaskListeners = () => {
    document.querySelectorAll('.speaking-cb').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        const task = commData.speakingTasks.find(t => t.id === id);
        if (task) {
          task.completed = e.target.checked;
          if (task.completed) StorageHelper.logActivity();
          saveData();
          renderSpeakingTasks();
        }
      });
    });

    document.querySelectorAll('.delete-speaking').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        commData.speakingTasks = commData.speakingTasks.filter(t => t.id !== id);
        saveData();
        renderSpeakingTasks();
      });
    });

    document.querySelectorAll('.hr-cb').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        const task = commData.hrTasks.find(t => t.id === id);
        if (task) {
          task.completed = e.target.checked;
          if (task.completed) StorageHelper.logActivity();
          saveData();
          renderHrTasks();
        }
      });
    });
  };

  // Add new speaking task
  newSpeakingInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      commData.speakingTasks.push({
        id: Date.now(),
        title: e.target.value.trim(),
        completed: false
      });
      e.target.value = '';
      saveData();
      renderSpeakingTasks();
    }
  });

  // Init Data and Listeners for Text/Sliders
  selfIntroText.value = commData.introText;
  projectText.value = commData.projectExplanationText;
  
  hrSlider.value = commData.hrConfidence;
  hrConfVal.textContent = commData.hrConfidence;
  
  introSlider.value = commData.introConfidence;
  introConfVal.textContent = commData.introConfidence;
  
  projectSlider.value = commData.projectConfidence;
  projectConfVal.textContent = commData.projectConfidence;

  selfIntroText.addEventListener('input', (e) => {
    commData.introText = e.target.value;
    saveData();
  });

  projectText.addEventListener('input', (e) => {
    commData.projectExplanationText = e.target.value;
    saveData();
  });

  const attachSliderListener = (slider, valDisplay, key) => {
    slider.addEventListener('input', (e) => {
      valDisplay.textContent = e.target.value;
      commData[key] = parseInt(e.target.value);
      saveData();
    });
  };

  attachSliderListener(hrSlider, hrConfVal, 'hrConfidence');
  attachSliderListener(introSlider, introConfVal, 'introConfidence');
  attachSliderListener(projectSlider, projectConfVal, 'projectConfidence');

  renderSpeakingTasks();
  renderHrTasks();
  updateOverallStats();
});
