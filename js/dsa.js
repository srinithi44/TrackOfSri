// DSA Tracker Logic
document.addEventListener('DOMContentLoaded', () => {
  const topicList = document.getElementById('topic-list');
  const searchInput = document.getElementById('search-input');
  const difficultyFilter = document.getElementById('difficulty-filter');
  const statusFilter = document.getElementById('status-filter');
  const totalProgressText = document.getElementById('total-progress-text');
  
  let dsaData = [];

  const loadData = async () => {
    // Try to get from local storage first
    const localData = StorageHelper.get('dsaData', null);
    
    if (localData) {
      dsaData = localData;
      renderTopics();
      updateOverallProgress();
    } else {
      try {
        const response = await fetch('data/leetcode.json');
        const json = await response.json();
        dsaData = json.topics;
        StorageHelper.set('dsaData', dsaData);
        renderTopics();
        updateOverallProgress();
      } catch (e) {
        console.error('Error loading DSA data:', e);
      }
    }
  };

  const saveData = () => {
    StorageHelper.set('dsaData', dsaData);
    updateOverallProgress();
  };

  const updateOverallProgress = () => {
    let totalProblems = 0;
    let solvedProblems = 0;

    dsaData.forEach(topic => {
      let topicSolved = 0;
      topic.problems.forEach(p => {
        totalProblems++;
        if (p.status === 'Solved') {
          solvedProblems++;
          topicSolved++;
        }
      });
      // Update topic completion %
      topic.completion = topic.problems.length > 0 ? Math.round((topicSolved / topic.problems.length) * 100) : 0;
    });

    const overall = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;
    totalProgressText.textContent = `${overall}%`;
    
    // Update global dashboard stats
    StorageHelper.updateUserStats({ dsaProgress: overall });
  };

  const renderTopics = () => {
    const searchVal = searchInput.value.toLowerCase();
    const diffVal = difficultyFilter.value;
    const statVal = statusFilter.value;
    
    topicList.innerHTML = '';
    
    dsaData.forEach((topic, topicIndex) => {
      // Filter problems
      const filteredProblems = topic.problems.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchVal) || p.pattern.toLowerCase().includes(searchVal);
        const matchesDiff = diffVal === 'All' || p.difficulty === diffVal;
        const matchesStatus = statVal === 'All' || p.status === statVal;
        return matchesSearch && matchesDiff && matchesStatus;
      });
      
      // If no problems match and searching/filtering, hide topic. Else show if not searching.
      if (filteredProblems.length === 0 && (searchVal !== '' || diffVal !== 'All' || statVal !== 'All')) {
        return; 
      }
      
      const card = document.createElement('div');
      card.className = 'topic-card';
      
      card.innerHTML = `
        <div class="topic-header" onclick="this.nextElementSibling.classList.toggle('active')">
          <div class="topic-title-group">
            <span class="topic-title">${topic.name}</span>
            <span class="badge badge-primary">${filteredProblems.length} Problems</span>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span class="text-muted">${topic.completion}%</span>
            <div class="progress-container" style="width: 100px; margin-top: 0;">
              <div class="progress-bar" style="width: ${topic.completion}%"></div>
            </div>
            <span>▼</span>
          </div>
        </div>
        <div class="problems-container ${searchVal ? 'active' : ''}">
          <table class="problems-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Problem</th>
                <th>Difficulty</th>
                <th>Pattern</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${filteredProblems.map((p, pIndex) => `
                <tr>
                  <td class="text-muted">${p.id}</td>
                  <td><strong>${p.name}</strong></td>
                  <td class="diff-${p.difficulty.toLowerCase()}">${p.difficulty}</td>
                  <td>${p.pattern}</td>
                  <td>
                    <select class="status-select" data-topic="${topicIndex}" data-id="${p.id}">
                      <option value="Todo" ${p.status === 'Todo' ? 'selected' : ''}>Todo</option>
                      <option value="Attempted" ${p.status === 'Attempted' ? 'selected' : ''}>Attempted</option>
                      <option value="Solved" ${p.status === 'Solved' ? 'selected' : ''}>Solved</option>
                      <option value="Revisit" ${p.status === 'Revisit' ? 'selected' : ''}>Revisit</option>
                    </select>
                  </td>
                  <td>
                    <input type="text" class="table-notes-input" placeholder="Add notes..." value="${p.notes}" data-topic="${topicIndex}" data-id="${p.id}">
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      
      topicList.appendChild(card);
    });

    attachListeners();
  };

  const attachListeners = () => {
    document.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const tIdx = e.target.getAttribute('data-topic');
        const pId = e.target.getAttribute('data-id');
        const prob = dsaData[tIdx].problems.find(p => p.id === pId);
        if (prob) {
          const oldStatus = prob.status;
          prob.status = e.target.value;
          if (prob.status === 'Solved' && oldStatus !== 'Solved') {
            StorageHelper.logActivity();
          }
          saveData();
          renderTopics(); // re-render to update progress bars
        }
      });
    });

    document.querySelectorAll('.table-notes-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const tIdx = e.target.getAttribute('data-topic');
        const pId = e.target.getAttribute('data-id');
        const prob = dsaData[tIdx].problems.find(p => p.id === pId);
        if (prob) {
          prob.notes = e.target.value;
          saveData();
        }
      });
    });
  };

  searchInput.addEventListener('input', renderTopics);
  difficultyFilter.addEventListener('change', renderTopics);
  statusFilter.addEventListener('change', renderTopics);

  loadData();
});
