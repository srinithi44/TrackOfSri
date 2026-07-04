// Main App Logic for PlacementOS
document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  
  const applyTheme = (theme) => {
    if (theme === 'beige') {
      document.documentElement.setAttribute('data-theme', 'beige');
      if (themeToggleBtn) themeToggleBtn.innerHTML = '🌙'; // Switch to dark icon
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeToggleBtn) themeToggleBtn.innerHTML = '☀️'; // Switch to light icon
    }
  };

  // Initial Theme Load
  // Force Reset for V3
  if (!localStorage.getItem('placementOS_v3_reset')) {
    localStorage.clear();
    localStorage.setItem('placementOS_v3_reset', 'true');
    // We can do a quick reload or just proceed, but proceeding is fine since get() uses defaults
  }
  
  const currentTheme = StorageHelper.getTheme();
  applyTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const newTheme = document.documentElement.hasAttribute('data-theme') ? 'dark' : 'beige';
      applyTheme(newTheme);
      StorageHelper.setTheme(newTheme);
      
      // Dispatch custom event for charts to update
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
    });
  }
  
  // Mobile Sidebar Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');
  
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && 
          !sidebar.contains(e.target) && 
          !mobileMenuBtn.contains(e.target) &&
          sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    });
  }
  
  // Setup Streak Logging (Login check only breaks streak if missed)
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const stats = StorageHelper.get('userStats', {});
  
  if (stats.lastActivityDate) {
    const lastActivity = new Date(stats.lastActivityDate);
    lastActivity.setHours(0, 0, 0, 0);
    
    const diffTime = todayDate.getTime() - lastActivity.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1 && (stats.streak || 0) > 0) {
      // Missed at least one day, streak is broken
      StorageHelper.updateUserStats({ streak: 0 });
      sessionStorage.setItem('streakReset', 'true');
      
      const newDaysRemaining = Math.max(0, (stats.daysRemaining || 90) - diffDays);
      StorageHelper.updateUserStats({ daysRemaining: newDaysRemaining });
    }
  }

  // Global Toast for Real-time Streak Updates
  const showToast = (message, type = 'success') => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'danger') {
      toast.style.background = 'linear-gradient(135deg, var(--danger), #B91C1C)';
    }
    toast.innerHTML = message;
    container.appendChild(toast);
    
    setTimeout(() => toast.remove(), 4500);
  };

  window.addEventListener('streakUpdated', () => {
    if (sessionStorage.getItem('streakIncremented') === 'true') {
      showToast('🔥 Streak +1! Your consistency is paying off.');
      sessionStorage.removeItem('streakIncremented');
      
      // If we are on dashboard, update it instantly
      if (typeof window.renderDashboardStats === 'function') {
        window.renderDashboardStats();
      }
    }
    updateGlobalStreakUI();
  });

  // Inject Global Streak Indicator into Topbar
  const topbarActions = document.querySelector('.topbar-actions');
  if (topbarActions) {
    const streakBadge = document.createElement('div');
    streakBadge.className = 'badge badge-warning';
    streakBadge.style.display = 'flex';
    streakBadge.style.alignItems = 'center';
    streakBadge.style.gap = '0.25rem';
    streakBadge.innerHTML = `<span>🔥</span><span id="global-streak-count">${StorageHelper.get('userStats', {streak: 0}).streak}</span>`;
    
    // Insert before the theme toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      topbarActions.insertBefore(streakBadge, themeBtn);
    } else {
      topbarActions.prepend(streakBadge);
    }
  }

  const updateGlobalStreakUI = () => {
    const globalCount = document.getElementById('global-streak-count');
    if (globalCount) {
      globalCount.textContent = StorageHelper.get('userStats', {streak: 0}).streak;
      globalCount.classList.add('animate-burn');
      setTimeout(() => globalCount.classList.remove('animate-burn'), 2000);
    }
    
    // Also update any specific on-page streak counters
    const streakCounters = document.querySelectorAll('#streak-count');
    streakCounters.forEach(el => {
       el.textContent = StorageHelper.get('userStats', {streak: 0}).streak;
    });
  };

  updateGlobalStreakUI();

  // Check pending session storage toasts on load
  if (sessionStorage.getItem('streakIncremented') === 'true') {
    showToast('🔥 Streak +1! Your consistency is paying off.');
    sessionStorage.removeItem('streakIncremented');
  } else if (sessionStorage.getItem('streakReset') === 'true') {
    showToast('⚠️ You missed a day. Streak reset to 0. Rebuild it!', 'danger');
    sessionStorage.removeItem('streakReset');
  }
});
