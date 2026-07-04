// Charts for Dashboard
document.addEventListener('DOMContentLoaded', () => {
  if (typeof Chart === 'undefined') return;

  Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
  Chart.defaults.font.family = 'Inter';
  
  const getChartColors = () => {
    const isBeige = document.documentElement.hasAttribute('data-theme');
    const style = getComputedStyle(document.body);
    return {
      primary: style.getPropertyValue('--primary').trim() || '#2563EB',
      secondary: style.getPropertyValue('--secondary').trim() || '#7C3AED',
      success: style.getPropertyValue('--success').trim() || '#22C55E',
      bgSecondary: style.getPropertyValue('--bg-secondary').trim(),
      gridLines: isBeige ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'
    };
  };

  let colors = getChartColors();
  
  // Get Study History
  const studyHistory = StorageHelper.get('studyHistory', {});
  const today = new Date();
  const labels = [];
  const data = [];
  
  // Generate last 7 days labels
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    
    // Read hours from history or default to 0
    const dateStr = d.toDateString();
    const hours = studyHistory[dateStr] || 0;
    data.push(hours);
  }
  
  // Weekly Study Chart (Line Chart)
  const ctxWeekly = document.getElementById('weeklyStudyChart');
  let weeklyChart;
  
  if (ctxWeekly) {
    weeklyChart = new Chart(ctxWeekly, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Study Hours',
          data: data,
          borderColor: colors.primary,
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
          y: { 
            beginAtZero: true,
            grid: { color: colors.gridLines }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  // Update charts on theme change
  window.addEventListener('themeChanged', () => {
    colors = getChartColors();
    Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
    
    if (weeklyChart) {
      weeklyChart.options.scales.y.grid.color = colors.gridLines;
      weeklyChart.update();
    }
  });
});
