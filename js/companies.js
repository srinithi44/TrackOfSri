// Companies Logic
document.addEventListener('DOMContentLoaded', () => {
  const companyGrid = document.getElementById('company-grid');
  
  const defaultCompanies = [
    'Amazon', 'Accenture', 'Infosys', 'TCS', 'Capgemini', 'Cognizant', 
    'Wipro', 'HCL', 'Hexaware', 'Zoho', 'LTIMindtree', 'Tech Mahindra'
  ];

  let companiesData = StorageHelper.get('companiesData', defaultCompanies.map(name => ({
    name: name,
    eligibility: true,
    stages: {
      applied: 'Pending',
      oa: 'Pending',
      technical: 'Pending',
      hr: 'Pending',
      offer: 'Pending'
    },
    notes: '',
    checklist: [
      { text: 'Resume updated', done: false },
      { text: 'Company research', done: false }
    ]
  })));

  const saveData = () => {
    StorageHelper.set('companiesData', companiesData);
  };

  const getStatusClass = (status) => {
    if (status === 'Cleared' || status === 'Yes' || status === 'Selected') return 'status-cleared';
    if (status === 'Rejected' || status === 'No') return 'status-rejected';
    return 'status-pending';
  };

  const renderCompanies = () => {
    companyGrid.innerHTML = '';
    
    companiesData.forEach((comp, idx) => {
      const card = document.createElement('div');
      card.className = 'company-card';
      
      const overallStatus = comp.stages.offer === 'Selected' ? 'status-cleared' : 
                           (comp.stages.hr === 'Rejected' || comp.stages.technical === 'Rejected' || comp.stages.oa === 'Rejected' || comp.stages.applied === 'Rejected') ? 'status-rejected' : 'status-pending';
                           
      let overallText = 'In Progress';
      if (overallStatus === 'status-cleared') overallText = 'Offer Received 🏆';
      if (overallStatus === 'status-rejected') overallText = 'Rejected';
      if (comp.stages.applied === 'Pending') overallText = 'Not Applied';
      
      card.innerHTML = `
        <div class="company-header">
          <div class="company-name">${comp.name}</div>
          <span class="status-badge ${overallStatus}">${overallText}</span>
        </div>
        
        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;">
          <input type="checkbox" class="eligibility-cb" data-idx="${idx}" ${comp.eligibility ? 'checked' : ''}>
          Eligible to Apply
        </label>
        
        <div class="pipeline">
          <div class="pipeline-stage">
            <span>Applied</span>
            <select class="status-select stage-select" data-idx="${idx}" data-stage="applied">
              <option value="Pending" ${comp.stages.applied === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Yes" ${comp.stages.applied === 'Yes' ? 'selected' : ''}>Yes</option>
              <option value="Rejected" ${comp.stages.applied === 'Rejected' ? 'selected' : ''}>Rejected</option>
            </select>
          </div>
          <div class="pipeline-stage">
            <span>Online Assessment</span>
            <select class="status-select stage-select" data-idx="${idx}" data-stage="oa">
              <option value="Pending" ${comp.stages.oa === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Cleared" ${comp.stages.oa === 'Cleared' ? 'selected' : ''}>Cleared</option>
              <option value="Rejected" ${comp.stages.oa === 'Rejected' ? 'selected' : ''}>Rejected</option>
            </select>
          </div>
          <div class="pipeline-stage">
            <span>Technical Interview</span>
            <select class="status-select stage-select" data-idx="${idx}" data-stage="technical">
              <option value="Pending" ${comp.stages.technical === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Cleared" ${comp.stages.technical === 'Cleared' ? 'selected' : ''}>Cleared</option>
              <option value="Rejected" ${comp.stages.technical === 'Rejected' ? 'selected' : ''}>Rejected</option>
            </select>
          </div>
          <div class="pipeline-stage">
            <span>HR Interview</span>
            <select class="status-select stage-select" data-idx="${idx}" data-stage="hr">
              <option value="Pending" ${comp.stages.hr === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Cleared" ${comp.stages.hr === 'Cleared' ? 'selected' : ''}>Cleared</option>
              <option value="Rejected" ${comp.stages.hr === 'Rejected' ? 'selected' : ''}>Rejected</option>
            </select>
          </div>
          <div class="pipeline-stage">
            <span>Offer</span>
            <select class="status-select stage-select" data-idx="${idx}" data-stage="offer">
              <option value="Pending" ${comp.stages.offer === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Selected" ${comp.stages.offer === 'Selected' ? 'selected' : ''}>Selected</option>
              <option value="Rejected" ${comp.stages.offer === 'Rejected' ? 'selected' : ''}>Rejected</option>
            </select>
          </div>
        </div>
        
        <div>
          <div style="font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--text-secondary);">Interview Notes & Prep</div>
          <textarea class="company-notes update-notes" data-idx="${idx}" placeholder="Add preparation notes...">${comp.notes}</textarea>
        </div>
      `;
      companyGrid.appendChild(card);
    });

    attachListeners();
  };

  const attachListeners = () => {
    document.querySelectorAll('.eligibility-cb').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const idx = e.target.getAttribute('data-idx');
        companiesData[idx].eligibility = e.target.checked;
        saveData();
      });
    });

    document.querySelectorAll('.stage-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = e.target.getAttribute('data-idx');
        const stage = e.target.getAttribute('data-stage');
        companiesData[idx].stages[stage] = e.target.value;
        saveData();
        renderCompanies(); // re-render to update badges
      });
    });

    document.querySelectorAll('.update-notes').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = e.target.getAttribute('data-idx');
        companiesData[idx].notes = e.target.value;
        saveData();
      });
    });
  };

  renderCompanies();
});
