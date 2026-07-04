// Dashboard Logic
document.addEventListener('DOMContentLoaded', () => {
  const renderDashboardStats = () => {
    const stats = StorageHelper.get('userStats', {
      streak: 1,
      daysRemaining: 90,
      studyHours: 12,
      dsaProgress: 15,
      aptitudeProgress: 10,
      commProgress: 5
    });

    const elements = {
      streak: document.getElementById('streak-count'),
      daysRemaining: document.getElementById('days-remaining'),
      studyHours: document.getElementById('study-hours'),
      dsaBar: document.getElementById('dsa-bar'),
      aptitudeBar: document.getElementById('aptitude-bar'),
      commBar: document.getElementById('comm-bar'),
      dsaVal: document.getElementById('dsa-val'),
      aptitudeVal: document.getElementById('aptitude-val'),
      commVal: document.getElementById('comm-val')
    };

    if (elements.streak) elements.streak.textContent = stats.streak;
    if (elements.daysRemaining) elements.daysRemaining.textContent = stats.daysRemaining;
    if (elements.studyHours) elements.studyHours.textContent = stats.studyHours;

    if (elements.dsaBar) elements.dsaBar.style.width = `${stats.dsaProgress}%`;
    if (elements.dsaVal) elements.dsaVal.textContent = `${stats.dsaProgress}%`;
    
    if (elements.aptitudeBar) elements.aptitudeBar.style.width = `${stats.aptitudeProgress}%`;
    if (elements.aptitudeVal) elements.aptitudeVal.textContent = `${stats.aptitudeProgress}%`;
    
    if (elements.commBar) elements.commBar.style.width = `${stats.commProgress}%`;
    if (elements.commVal) elements.commVal.textContent = `${stats.commProgress}%`;
    
    // Motivation & Animation
    const streakMotivation = document.getElementById('streak-motivation');
    const streakIcon = document.getElementById('streak-icon');
    
    if (streakMotivation && streakIcon) {
      if (stats.streak === 0 || !stats.streak) {
        streakMotivation.textContent = "Start today to build your streak!";
        streakIcon.classList.remove('animate-burn');
      } else if (stats.streak <= 3) {
        streakMotivation.textContent = "Good start! Keep the momentum going.";
        streakIcon.classList.add('animate-burn');
      } else if (stats.streak <= 7) {
        streakMotivation.textContent = "You're on fire! 🔥 Consistency is key.";
        streakIcon.classList.add('animate-burn');
      } else {
        streakMotivation.textContent = "Unstoppable! 🚀 Your discipline is legendary.";
        streakIcon.classList.add('animate-burn');
      }
    }
  };

  // Quotes Array
  const quotes = [
    { text: "Discipline beats motivation.", author: "PlacementOS" },
    { text: "Small progress every day leads to big success.", author: "Consistency" },
    { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Hard Work" },
    { text: "Don't stop when you're tired. Stop when you're done.", author: "Perseverance" }
  ];
  
  const quoteText = document.getElementById('daily-quote');
  const quoteAuthor = document.getElementById('daily-author');
  
  if (quoteText && quoteAuthor) {
    const today = new Date().getDay();
    const quote = quotes[today % quotes.length];
    quoteText.textContent = `"${quote.text}"`;
    quoteAuthor.textContent = `- ${quote.author}`;
  }
  
  // Make render function available globally so app.js can trigger it
  window.renderDashboardStats = renderDashboardStats;
});
