// Mock Tests Logic
document.addEventListener('DOMContentLoaded', () => {
  const mockGrid = document.getElementById('mock-grid');
  const addMockBtn = document.getElementById('add-mock-btn');
  
  let mockData = StorageHelper.get('mockData', [
    {
      id: 1,
      type: 'DSA Mock #1',
      score: 85,
      accuracy: 90,
      timeTaken: '45 mins',
      weakTopics: 'Dynamic Programming',
      plan: 'Solve 5 DP problems'
    },
    {
      id: 2,
      type: 'Aptitude Mock #1',
      score: 70,
      accuracy: 75,
      timeTaken: '60 mins',
      weakTopics: 'Time and Work',
      plan: 'Revise formulas'
    }
  ]);

  const saveData = () => {
    StorageHelper.set('mockData', mockData);
  };

  const renderMocks = () => {
    mockGrid.innerHTML = '';
    
    mockData.forEach(mock => {
      const card = document.createElement('div');
      card.className = 'mock-card';
      
      card.innerHTML = `
        <div class="mock-title">${mock.type}</div>
        
        <div class="form-group">
          <label>Score (%)</label>
          <input type="number" class="input-control update-mock" data-id="${mock.id}" data-field="score" value="${mock.score}">
        </div>
        
        <div class="form-group">
          <label>Accuracy (%)</label>
          <input type="number" class="input-control update-mock" data-id="${mock.id}" data-field="accuracy" value="${mock.accuracy}">
        </div>
        
        <div class="form-group">
          <label>Time Taken (mins)</label>
          <input type="text" class="input-control update-mock" data-id="${mock.id}" data-field="timeTaken" value="${mock.timeTaken}">
        </div>
        
        <div class="form-group">
          <label>Weak Topics</label>
          <input type="text" class="input-control update-mock" data-id="${mock.id}" data-field="weakTopics" value="${mock.weakTopics}">
        </div>
        
        <div class="form-group">
          <label>Improvement Plan</label>
          <textarea class="input-control update-mock" data-id="${mock.id}" data-field="plan" rows="2">${mock.plan}</textarea>
        </div>
        
        <button class="btn btn-outline btn-block delete-mock" data-id="${mock.id}">Delete</button>
      `;
      mockGrid.appendChild(card);
    });

    attachListeners();
  };

  const attachListeners = () => {
    document.querySelectorAll('.update-mock').forEach(input => {
      input.addEventListener('change', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        const field = e.target.getAttribute('data-field');
        const mock = mockData.find(m => m.id === id);
        if (mock) {
          mock[field] = e.target.value;
          saveData();
        }
      });
    });

    document.querySelectorAll('.delete-mock').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        mockData = mockData.filter(m => m.id !== id);
        saveData();
        renderMocks();
      });
    });
  };

  addMockBtn.addEventListener('click', () => {
    mockData.push({
      id: Date.now(),
      type: `Mock Test #${mockData.length + 1}`,
      score: 0,
      accuracy: 0,
      timeTaken: '0 mins',
      weakTopics: '',
      plan: ''
    });
    saveData();
    renderMocks();
  });

  renderMocks();
});
