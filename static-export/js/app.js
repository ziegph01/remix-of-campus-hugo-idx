/**
 * Campus Hugo - Static App JavaScript
 * Handles all interactivity, state management, and navigation
 */

// ===== STATE MANAGEMENT =====
const AppState = {
  isLoggedIn: false,
  isGuest: false,
  username: 'Gast',
  moodData: {},
  currentDate: new Date(),
  
  init() {
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    this.username = localStorage.getItem('username') || 'Gast';
    this.moodData = JSON.parse(localStorage.getItem('mood-data-v2') || '{}');
    
    // Check URL for guest mode
    const urlParams = new URLSearchParams(window.location.search);
    this.isGuest = urlParams.get('guest') === 'true';
  },
  
  save() {
    localStorage.setItem('isLoggedIn', this.isLoggedIn);
    localStorage.setItem('username', this.username);
    localStorage.setItem('mood-data-v2', JSON.stringify(this.moodData));
  }
};

// ===== MENU HANDLING =====
function initMenu() {
  const menuBtn = document.querySelector('.menu-btn');
  const menuOverlay = document.querySelector('.menu-overlay');
  const menuDropdown = document.querySelector('.menu-dropdown');
  
  if (!menuBtn) return;
  
  menuBtn.addEventListener('click', () => {
    menuOverlay.classList.toggle('active');
    menuDropdown.classList.toggle('active');
  });
  
  menuOverlay.addEventListener('click', () => {
    menuOverlay.classList.remove('active');
    menuDropdown.classList.remove('active');
  });
  
  // Close menu on link click
  document.querySelectorAll('.menu-dropdown a').forEach(link => {
    link.addEventListener('click', () => {
      menuOverlay.classList.remove('active');
      menuDropdown.classList.remove('active');
    });
  });
}

// ===== DIALOG HANDLING =====
function openDialog(dialogId) {
  const overlay = document.querySelector('.dialog-overlay');
  const dialog = document.getElementById(dialogId);
  
  if (overlay && dialog) {
    overlay.classList.add('active');
    dialog.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeDialog(dialogId) {
  const overlay = document.querySelector('.dialog-overlay');
  const dialog = document.getElementById(dialogId);
  
  if (overlay && dialog) {
    overlay.classList.remove('active');
    dialog.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function initDialogs() {
  // Close dialog on overlay click
  document.querySelectorAll('.dialog-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        const activeDialog = document.querySelector('.dialog.active');
        if (activeDialog) {
          closeDialog(activeDialog.id);
        }
      }
    });
  });
  
  // Close buttons
  document.querySelectorAll('.dialog-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const dialog = btn.closest('.dialog');
      if (dialog) {
        closeDialog(dialog.id);
      }
    });
  });
  
  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeDialog = document.querySelector('.dialog.active');
      if (activeDialog) {
        closeDialog(activeDialog.id);
      }
    }
  });
}

// ===== MOOD TRACKING =====
const MoodTracker = {
  moods: [
    { id: 'bad', label: 'schlecht', emoji: '😢', color: 'var(--mood-bad)' },
    { id: 'unwell', label: 'unwohl', emoji: '😟', color: 'var(--mood-unwell)' },
    { id: 'neutral', label: 'neutral', emoji: '😐', color: 'var(--mood-neutral)' },
    { id: 'good', label: 'gut', emoji: '🙂', color: 'var(--mood-good)' },
    { id: 'great', label: 'sehr gut', emoji: '😆', color: 'var(--mood-great)' }
  ],
  
  getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  },
  
  setMood(dateKey, moodId) {
    AppState.moodData[dateKey] = moodId;
    AppState.save();
    this.updateUI();
  },
  
  getMood(dateKey) {
    return AppState.moodData[dateKey] || null;
  },
  
  selectMood(moodId) {
    const todayKey = this.getTodayKey();
    this.setMood(todayKey, moodId);
    closeDialog('mood-dialog');
    showToast('Stimmung gespeichert! 🎉');
  },
  
  updateUI() {
    // Update calendar cells
    document.querySelectorAll('.calendar-day[data-date]').forEach(cell => {
      const dateKey = cell.dataset.date;
      const mood = this.getMood(dateKey);
      
      // Remove all mood classes
      cell.classList.remove('mood-great', 'mood-good', 'mood-neutral', 'mood-unwell', 'mood-bad');
      
      if (mood) {
        cell.classList.add(`mood-${mood}`);
      }
    });
    
    // Update mood chart
    this.updateChart();
  },
  
  updateChart() {
    const chartContainer = document.querySelector('.mood-chart');
    if (!chartContainer) return;
    
    // Get last 7 days
    const bars = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const mood = this.getMood(key);
      
      let height = 20;
      let color = 'var(--muted)';
      
      if (mood) {
        const moodObj = this.moods.find(m => m.id === mood);
        if (moodObj) {
          color = moodObj.color;
          switch (mood) {
            case 'great': height = 100; break;
            case 'good': height = 80; break;
            case 'neutral': height = 60; break;
            case 'unwell': height = 40; break;
            case 'bad': height = 20; break;
          }
        }
      }
      
      bars.push({ height, color, day: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][date.getDay()] });
    }
    
    chartContainer.innerHTML = bars.map(bar => `
      <div class="mood-bar" style="height: ${bar.height}%; background: ${bar.color};" title="${bar.day}"></div>
    `).join('');
  },
  
  checkTodayMood() {
    if (AppState.isGuest || !AppState.isLoggedIn) return;
    
    const todayKey = this.getTodayKey();
    if (!this.getMood(todayKey)) {
      setTimeout(() => openDialog('mood-dialog'), 500);
    }
  }
};

// ===== CALENDAR =====
const Calendar = {
  currentDate: new Date(),
  
  init() {
    this.render();
    this.bindEvents();
  },
  
  render() {
    const container = document.querySelector('.calendar-days');
    const headerEl = document.querySelector('.calendar-month-year');
    
    if (!container) return;
    
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // Update header
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    if (headerEl) {
      headerEl.textContent = `${months[month]} ${year}`;
    }
    
    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Adjust for Monday start (0 = Sunday in JS)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    let html = '';
    
    // Empty cells for offset
    for (let i = 0; i < startOffset; i++) {
      html += '<div class="calendar-day empty"></div>';
    }
    
    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const mood = MoodTracker.getMood(dateKey);
      const isToday = dateKey === todayKey;
      
      let classes = 'calendar-day';
      if (isToday) classes += ' today';
      if (mood) classes += ` mood-${mood}`;
      
      html += `<div class="${classes}" data-date="${dateKey}">${day}</div>`;
    }
    
    container.innerHTML = html;
    
    // Bind click events to day cells
    container.querySelectorAll('.calendar-day:not(.empty)').forEach(cell => {
      cell.addEventListener('click', () => {
        if (AppState.isGuest) return;
        openDialog('mood-dialog');
        // Store selected date for mood selection
        window.selectedMoodDate = cell.dataset.date;
      });
    });
  },
  
  bindEvents() {
    const prevBtn = document.querySelector('.calendar-prev');
    const nextBtn = document.querySelector('.calendar-next');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
      });
    }
  }
};

// ===== SEARCH =====
function initSearch() {
  const searchInput = document.querySelector('.header-search input');
  const searchResults = document.querySelector('.search-results');
  
  if (!searchInput) return;
  
  const searchItems = [
    { type: 'funktion', name: 'Forum', description: 'Austausch mit anderen Studierenden', href: 'forum.html' },
    { type: 'funktion', name: 'Notenplaner', description: 'Noten verwalten', href: 'notenplaner.html' },
    { type: 'funktion', name: 'Artikel', description: 'Hilfreiche Tipps', href: 'artikel.html' },
    { type: 'funktion', name: 'Beratung', description: 'Professionelle Unterstützung', href: 'berater.html' },
    { type: 'mentor', name: 'Martina', description: 'Stressmanagement', href: 'dashboard.html' },
    { type: 'mentor', name: 'Oliver', description: 'Zeitmanagement', href: 'dashboard.html' },
    { type: 'mentor', name: 'Sarah', description: 'Work-Life-Balance', href: 'dashboard.html' },
  ];
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (!query) {
      if (searchResults) searchResults.classList.remove('active');
      return;
    }
    
    const results = searchItems.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query)
    );
    
    if (searchResults) {
      if (results.length > 0) {
        searchResults.innerHTML = results.map(item => `
          <a href="${item.href}" class="search-result-item">
            <span class="search-result-name">${item.name}</span>
            <span class="search-result-desc">${item.description}</span>
          </a>
        `).join('');
        searchResults.classList.add('active');
      } else {
        searchResults.innerHTML = '<div class="search-no-results">Keine Ergebnisse</div>';
        searchResults.classList.add('active');
      }
    }
  });
  
  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      if (searchResults) searchResults.classList.remove('active');
    }, 200);
  });
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, duration = 3000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: var(--foreground);
    color: var(--background);
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    z-index: 1000;
    animation: slideUp 0.3s ease-out;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease-out forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Add toast animations
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(100%); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  @keyframes slideDown {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to { transform: translateX(-50%) translateY(100%); opacity: 0; }
  }
`;
document.head.appendChild(toastStyles);

// ===== AUTH HANDLING =====
const Auth = {
  login(email, password) {
    const storedEmail = localStorage.getItem('userEmail');
    const storedPassword = localStorage.getItem('userPassword');
    
    if (storedEmail === email && storedPassword === password) {
      AppState.isLoggedIn = true;
      AppState.save();
      showToast('Willkommen zurück!');
      setTimeout(() => window.location.href = 'dashboard.html', 500);
      return true;
    }
    
    showToast('E-Mail oder Passwort ist falsch.');
    return false;
  },
  
  register(data) {
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userPassword', data.password);
    localStorage.setItem('username', data.username);
    localStorage.setItem('studiengang', data.studiengang || '');
    localStorage.setItem('hochschule', data.hochschule || '');
    localStorage.setItem('isRegistered', 'true');
    localStorage.setItem('isLoggedIn', 'true');
    
    AppState.isLoggedIn = true;
    AppState.username = data.username;
    AppState.save();
    
    showToast(`Willkommen, ${data.username}!`);
    setTimeout(() => window.location.href = 'dashboard.html', 500);
  },
  
  logout() {
    localStorage.removeItem('isLoggedIn');
    AppState.isLoggedIn = false;
    window.location.href = 'index.html';
  }
};

// ===== LOGIN FORM =====
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;
  
  const togglePassword = form.querySelector('.toggle-password');
  const passwordInput = form.querySelector('#password');
  
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      togglePassword.innerHTML = type === 'password' 
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    });
  }
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    Auth.login(email, password);
  });
}

// ===== REGISTRATION FORM =====
function initRegistrationForm() {
  const form = document.getElementById('registration-form');
  if (!form) return;
  
  let currentStep = 1;
  const totalSteps = 4;
  
  const formData = {
    email: '',
    password: '',
    username: '',
    studiengang: '',
    hochschule: '',
    interessen: '',
    gluecklich: ''
  };
  
  function showStep(step) {
    document.querySelectorAll('.reg-step').forEach(s => s.classList.remove('active'));
    document.querySelector(`.reg-step[data-step="${step}"]`).classList.add('active');
    
    // Update progress
    document.querySelectorAll('.progress-step').forEach((s, i) => {
      s.classList.toggle('active', i < step);
    });
  }
  
  function validateStep(step) {
    switch(step) {
      case 1:
        if (!formData.email.includes('@')) {
          showToast('Bitte gib eine gültige E-Mail ein');
          return false;
        }
        if (formData.password.length < 6) {
          showToast('Passwort muss mindestens 6 Zeichen haben');
          return false;
        }
        return true;
      case 2:
        if (!formData.username.trim()) {
          showToast('Bitte gib einen Namen ein');
          return false;
        }
        return true;
      default:
        return true;
    }
  }
  
  // Bind input changes
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', (e) => {
      formData[e.target.name] = e.target.value;
    });
  });
  
  // Next buttons
  form.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        currentStep++;
        showStep(currentStep);
      }
    });
  });
  
  // Back buttons
  form.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
      currentStep--;
      showStep(currentStep);
    });
  });
  
  // Finish button
  form.querySelector('.btn-finish')?.addEventListener('click', () => {
    Auth.register(formData);
  });
  
  // Toggle password visibility
  const togglePassword = form.querySelector('.toggle-password');
  const passwordInput = form.querySelector('#password');
  
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
    });
  }
}

// ===== MASCOT CLICK (COPING DIALOG) =====
function initMascotClick() {
  const mascots = document.querySelectorAll('.dashboard-mascot, .dashboard-mascot-mobile');
  mascots.forEach(mascot => {
    mascot.addEventListener('click', () => {
      openDialog('coping-dialog');
    });
  });
}

// ===== UPDATE UI BASED ON LOGIN STATE =====
function updateUIForAuthState() {
  const isLoggedIn = AppState.isLoggedIn;
  const isGuest = AppState.isGuest;
  
  // Update username in dashboard
  const usernameEl = document.querySelector('.dashboard-username');
  if (usernameEl) {
    usernameEl.textContent = isGuest ? 'Gastmodus' : AppState.username;
  }
  
  // Show/hide guest lock
  if (isGuest) {
    document.querySelectorAll('.guest-lockable').forEach(el => {
      el.classList.add('locked');
    });
  }
}

// ===== ARTICLE FILTER =====
function initArticleFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const articles = document.querySelectorAll('.article-card');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      articles.forEach(article => {
        if (category === 'Alle' || article.dataset.category === category) {
          article.style.display = '';
        } else {
          article.style.display = 'none';
        }
      });
    });
  });
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
  AppState.init();
  
  initMenu();
  initDialogs();
  initSearch();
  initLoginForm();
  initRegistrationForm();
  initMascotClick();
  initArticleFilter();
  
  // Page-specific initialization
  if (document.querySelector('.calendar-days')) {
    Calendar.init();
    MoodTracker.updateUI();
    MoodTracker.checkTodayMood();
  }
  
  updateUIForAuthState();
  
  // Mood selection
  document.querySelectorAll('.mood-option').forEach(option => {
    option.addEventListener('click', () => {
      const moodId = option.dataset.mood;
      MoodTracker.selectMood(moodId);
    });
  });
});

// ===== DEMO DATA FOR GUESTS =====
function loadDemoData() {
  if (AppState.isGuest) {
    AppState.moodData = {
      '2025-01-03': 'great',
      '2025-01-05': 'good',
      '2025-01-06': 'neutral',
      '2025-01-02': 'good'
    };
    MoodTracker.updateUI();
  }
}
