// Aptitude Logic
document.addEventListener('DOMContentLoaded', () => {
  const sectionsContainer = document.getElementById('sections-container');
  const chaptersGrid = document.getElementById('chapters-grid');
  const totalAccuracyText = document.getElementById('total-accuracy-text');
  
  let aptData = [];
  let currentSectionIndex = 0;

  const loadData = async () => {
    const localData = StorageHelper.get('aptitudeData', null);
    
    if (localData) {
      aptData = localData;
      renderSections();
      updateOverallStats();
    } else {
      try {
        const response = await fetch('data/aptitude.json');
        const json = await response.json();
        aptData = json.sections;
        StorageHelper.set('aptitudeData', aptData);
        renderSections();
        updateOverallStats();
      } catch (e) {
        console.error('Error loading Aptitude data:', e);
      }
    }
  };

  const saveData = () => {
    StorageHelper.set('aptitudeData', aptData);
    updateOverallStats();
  };

  const updateOverallStats = () => {
    let totalChaptersWithData = 0;
    let totalAccuracy = 0;
    let totalProgress = 0;
    let chapterCount = 0;

    aptData.forEach(sec => {
      sec.chapters.forEach(ch => {
        chapterCount++;
        if (ch.questionsSolved > 0) {
          totalChaptersWithData++;
          totalAccuracy += parseFloat(ch.accuracy) || 0;
        }
        totalProgress += parseFloat(ch.progress) || 0;
      });
    });

    const avgAccuracy = totalChaptersWithData > 0 ? Math.round(totalAccuracy / totalChaptersWithData) : 0;
    const avgProgress = chapterCount > 0 ? Math.round(totalProgress / chapterCount) : 0;
    
    totalAccuracyText.textContent = `${avgAccuracy}%`;
    StorageHelper.updateUserStats({ aptitudeProgress: avgProgress });
  };

  const renderSections = () => {
    sectionsContainer.innerHTML = '';
    
    aptData.forEach((sec, idx) => {
      const div = document.createElement('div');
      div.className = `section-tab ${idx === currentSectionIndex ? 'active' : ''}`;
      
      // Calculate section progress
      let secProgress = 0;
      sec.chapters.forEach(ch => { secProgress += parseFloat(ch.progress) || 0; });
      let avgSecProg = sec.chapters.length > 0 ? Math.round(secProgress / sec.chapters.length) : 0;
      
      div.innerHTML = `
        <h3>${sec.name}</h3>
        <p class="text-muted" style="font-size: 0.85rem;">${avgSecProg}% Complete</p>
      `;
      div.addEventListener('click', () => {
        currentSectionIndex = idx;
        renderSections();
      });
      sectionsContainer.appendChild(div);
    });

    renderChapters();
  };

  const renderChapters = () => {
    chaptersGrid.innerHTML = '';
    const section = aptData[currentSectionIndex];
    
    if (!section) return;

    section.chapters.forEach((ch, chIdx) => {
      const card = document.createElement('div');
      card.className = 'chapter-card';
      
      card.innerHTML = `
        <div class="chapter-header">
          <div class="chapter-title">${ch.name}</div>
          <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; cursor: pointer;">
            <input type="checkbox" class="goal-checkbox revision-check" data-idx="${chIdx}" ${ch.revision ? 'checked' : ''}>
            Need Revision
          </label>
        </div>
        
        <div class="stats-grid">
          <div class="stat-input-group">
            <label>Questions Solved</label>
            <input type="number" class="stat-input update-stat" data-field="questionsSolved" data-idx="${chIdx}" value="${ch.questionsSolved}" min="0">
          </div>
          <div class="stat-input-group">
            <label>Accuracy (%)</label>
            <input type="number" class="stat-input update-stat" data-field="accuracy" data-idx="${chIdx}" value="${ch.accuracy}" min="0" max="100">
          </div>
          <div class="stat-input-group">
            <label>Mock Score (out of 10)</label>
            <input type="number" class="stat-input update-stat" data-field="mockScore" data-idx="${chIdx}" value="${ch.mockScore}" min="0" max="10">
          </div>
          <div class="stat-input-group">
            <label>Progress (%)</label>
            <input type="number" class="stat-input update-stat" data-field="progress" data-idx="${chIdx}" value="${ch.progress}" min="0" max="100">
          </div>
        </div>
        
        <div class="stat-input-group" style="margin-top: 1rem;">
          <label>Weak Topics / Notes</label>
          <input type="text" class="stat-input update-stat" data-field="weakness" data-idx="${chIdx}" value="${ch.weakness}" placeholder="e.g. Calculation speed...">
        </div>
      `;
      chaptersGrid.appendChild(card);
    });

    attachListeners();
  };

  const attachListeners = () => {
    document.querySelectorAll('.update-stat').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = e.target.getAttribute('data-idx');
        const field = e.target.getAttribute('data-field');
        const val = e.target.type === 'number' ? (e.target.value === '' ? 0 : parseFloat(e.target.value)) : e.target.value;
        
        const oldVal = aptData[currentSectionIndex].chapters[idx][field];
        aptData[currentSectionIndex].chapters[idx][field] = val;
        
        if (field === 'questionsSolved' && val > oldVal) {
          StorageHelper.logActivity();
        }
        
        saveData();
      });
    });

    document.querySelectorAll('.revision-check').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const idx = e.target.getAttribute('data-idx');
        aptData[currentSectionIndex].chapters[idx].revision = e.target.checked;
        saveData();
      });
    });
  };

  loadData();
});
