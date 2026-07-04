// Analytics Logic
document.addEventListener('DOMContentLoaded', () => {
  if (typeof Chart === 'undefined') return;

  const style = getComputedStyle(document.body);
  const primary = style.getPropertyValue('--primary').trim() || '#2563EB';
  const secondary = style.getPropertyValue('--secondary').trim() || '#7C3AED';
  const success = style.getPropertyValue('--success').trim() || '#22C55E';
  const warning = style.getPropertyValue('--warning').trim() || '#F59E0B';
  const danger = style.getPropertyValue('--danger').trim() || '#EF4444';
  
  Chart.defaults.color = style.getPropertyValue('--text-secondary').trim();
  Chart.defaults.font.family = 'Inter';

  // Load real data for charts
  const dsaData = StorageHelper.get('dsaData', []);
  const companiesData = StorageHelper.get('companiesData', []);
  const studyHistory = StorageHelper.get('studyHistory', {});

  // Compute DSA Topic Stats
  const topicLabels = [];
  const topicData = [];
  
  if (dsaData.length > 0) {
    dsaData.forEach(topic => {
      let solved = 0;
      topic.problems.forEach(p => {
        if (p.status === 'Solved') solved++;
      });
      if (solved > 0) {
        topicLabels.push(topic.name);
        topicData.push(solved);
      }
    });
  }
  
  if (topicLabels.length === 0) {
    topicLabels.push('No problems solved yet');
    topicData.push(1); // placeholder to show empty chart
  }

  // Compute Company Status
  let statusCounts = { 'Applied': 0, 'OA': 0, 'Technical': 0, 'HR': 0, 'Offers': 0 };
  
  companiesData.forEach(comp => {
    if (comp.stages.offer === 'Selected') statusCounts['Offers']++;
    else if (comp.stages.hr === 'Cleared' || comp.stages.hr === 'Pending') {
      if (comp.stages.hr === 'Pending' && comp.stages.technical === 'Cleared') statusCounts['HR']++;
    }
    // Simplification for bar chart:
    if (comp.stages.applied === 'Yes' || comp.stages.applied === 'Cleared') statusCounts['Applied']++;
    if (comp.stages.oa === 'Cleared') statusCounts['OA']++;
    if (comp.stages.technical === 'Cleared') statusCounts['Technical']++;
    if (comp.stages.hr === 'Cleared') statusCounts['HR']++;
  });

  const barData = [
    statusCounts['Applied'],
    statusCounts['OA'],
    statusCounts['Technical'],
    statusCounts['HR'],
    statusCounts['Offers']
  ];

  // Monthly Study Chart Data (last 14 days)
  const monthlyLabels = [];
  const monthlyData = [];
  const today = new Date();
  
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    monthlyLabels.push(d.getDate() + '/' + (d.getMonth() + 1));
    const dateStr = d.toDateString();
    monthlyData.push(studyHistory[dateStr] || 0);
  }

  // Monthly Study Chart
  const ctxMonthly = document.getElementById('monthlyStudyChart');
  if (ctxMonthly) {
    new Chart(ctxMonthly, {
      type: 'line',
      data: {
        labels: monthlyLabels,
        datasets: [{
          label: 'Study Hours',
          data: monthlyData,
          borderColor: primary,
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // Problems Pie Chart
  const ctxPie = document.getElementById('problemsPieChart');
  if (ctxPie) {
    new Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels: topicLabels,
        datasets: [{
          data: topicData,
          backgroundColor: [primary, secondary, success, warning, danger, '#14B8A6', '#8B5CF6'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' }
        },
        cutout: '70%'
      }
    });
  }

  // Company Bar Chart
  const ctxBar = document.getElementById('companyBarChart');
  if (ctxBar) {
    new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: ['Applied', 'OA Cleared', 'Tech Cleared', 'HR Cleared', 'Offers'],
        datasets: [{
          label: 'Number of Companies',
          data: barData,
          backgroundColor: [secondary, primary, warning, success, 'gold'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { stepSize: 1 } },
          x: { grid: { display: false } }
        }
      }
    });
  }
});
