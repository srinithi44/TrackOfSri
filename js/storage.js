// Storage Utilities for PlacementOS
const StorageHelper = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(`placementOS_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(`placementOS_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('Error writing to localStorage', e);
    }
  },
  
  updateUserStats: (updates) => {
    const stats = StorageHelper.get('userStats', {
      streak: 0,
      daysRemaining: 90,
      studyHours: 0,
      dsaProgress: 0,
      aptitudeProgress: 0,
      commProgress: 0,
      lastLoginDate: null
    });
    
    const newStats = { ...stats, ...updates };
    StorageHelper.set('userStats', newStats);
    return newStats;
  },
  
  getTheme: () => {
    return StorageHelper.get('theme', 'dark');
  },
  
  setTheme: (theme) => {
    StorageHelper.set('theme', theme);
  },
  
  logActivity: () => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const today = todayDate.toDateString();
    
    const stats = StorageHelper.get('userStats', {});
    const lastActivity = stats.lastActivityDate;
    
    if (lastActivity !== today) {
      let newStreak = stats.streak || 0;
      let newDaysRemaining = stats.daysRemaining || 90;
      
      if (lastActivity) {
        const lastDate = new Date(lastActivity);
        lastDate.setHours(0, 0, 0, 0);
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
        newDaysRemaining = Math.max(0, (stats.daysRemaining || 90) - diffDays);
      } else {
        newStreak = 1;
      }
      
      sessionStorage.setItem('streakIncremented', 'true');
      
      StorageHelper.updateUserStats({
        lastActivityDate: today,
        streak: newStreak,
        daysRemaining: newDaysRemaining
      });
      
      window.dispatchEvent(new Event('streakUpdated'));
    }
  }
};

window.StorageHelper = StorageHelper;
