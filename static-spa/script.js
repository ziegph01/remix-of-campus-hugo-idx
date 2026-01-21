/**
 * Campus Hugo - Static SPA JavaScript
 * file:// compatible - no server required
 */

// ===== STATE =====
const State = {
  isLoggedIn: false,
  isGuest: false,
  username: 'Gast',
  moodData: {},
  currentPage: 'landing',
  calendarDate: new Date(),
  regStep: 1,
  
  init() {
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    this.username = localStorage.getItem('username') || 'Gast';
    this.moodData = JSON.parse(localStorage.getItem('mood-data-v2') || '{}');
  },
  
  save() {
    localStorage.setItem('isLoggedIn', this.isLoggedIn);
    localStorage.setItem('username', this.username);
    localStorage.setItem('mood-data-v2', JSON.stringify(this.moodData));
  }
};

// ===== NAVIGATION =====
function navigateTo(page, params = {}) {
  State.currentPage = page;
  
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const targetPage = document.getElementById('page-' + page);
  if (targetPage) targetPage.classList.add('active');
  
  updateHeader();
  updateMenu();
  window.scrollTo(0, 0);
  
  // Page-specific init
  if (page === 'dashboard') initDashboard();
  if (page === 'forum') initForum();
  if (page === 'berater') initBerater();
  if (page === 'notenplaner') initNotenplaner();
  if (page === 'artikel') initArtikel();
  if (page === 'einstellungen') initEinstellungen();
  if (page === 'artikel-detail' && params.id) showArticleDetail(params.id);
}

function enterGuestMode() {
  State.isGuest = true;
  State.isLoggedIn = false;
  navigateTo('dashboard');
  document.querySelectorAll('.guest-lockable').forEach(el => el.classList.add('locked'));
  document.getElementById('guest-cta').style.display = 'block';
  document.getElementById('welcome-text').textContent = 'Willkommen im';
  document.getElementById('dashboard-username').textContent = 'Gastmodus';
}

function updateHeader() {
  const search = document.getElementById('header-search');
  if (State.isLoggedIn && !State.isGuest) {
    search.style.display = '';
  } else {
    search.style.display = 'none';
  }
}

function updateMenu() {
  const nav = document.getElementById('menu-nav');
  const isAuth = State.isLoggedIn || State.isGuest;
  
  if (isAuth) {
    nav.innerHTML = `
      <a href="#" onclick="navigateTo('dashboard'); toggleMenu(); return false;">🏠 Home</a>
      <a href="#" onclick="navigateTo('forum'); toggleMenu(); return false;">💬 Forum</a>
      <a href="#" onclick="navigateTo('berater'); toggleMenu(); return false;">❤️ Beratung</a>
      <a href="#" onclick="navigateTo('notenplaner'); toggleMenu(); return false;">📊 Notenplaner</a>
      <a href="#" onclick="navigateTo('artikel'); toggleMenu(); return false;">📚 Wissen</a>
      <a href="#" onclick="navigateTo('einstellungen'); toggleMenu(); return false;">⚙️ Dein Profil</a>
      <div class="menu-divider"></div>
      <a href="#" class="accent-link" onclick="logout(); return false;">🚪 Log Out</a>
    `;
  } else {
    nav.innerHTML = `
      <a href="#" onclick="navigateTo('landing'); toggleMenu(); return false;">🏠 Home</a>
      <a href="#" onclick="navigateTo('login'); toggleMenu(); return false;">🔑 Anmelden</a>
      <a href="#" onclick="navigateTo('registrierung'); toggleMenu(); return false;">✨ Registrieren</a>
    `;
  }
}

function toggleMenu() {
  document.getElementById('menu-overlay').classList.toggle('active');
  document.getElementById('menu-dropdown').classList.toggle('active');
}

function logout() {
  State.isLoggedIn = false;
  State.isGuest = false;
  localStorage.removeItem('isLoggedIn');
  navigateTo('landing');
  toggleMenu();
}

// ===== AUTH =====
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  const storedEmail = localStorage.getItem('userEmail');
  const storedPassword = localStorage.getItem('userPassword');
  
  if (storedEmail === email && storedPassword === password) {
    State.isLoggedIn = true;
    State.username = localStorage.getItem('username') || 'User';
    State.save();
    showToast('Willkommen zurück!');
    navigateTo('dashboard');
  } else {
    showToast('E-Mail oder Passwort falsch');
  }
}

function nextRegStep() {
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const username = document.getElementById('reg-username').value;
  
  if (State.regStep === 1) {
    if (!email.includes('@')) { showToast('Bitte gültige E-Mail eingeben'); return; }
    if (password.length < 6) { showToast('Passwort mind. 6 Zeichen'); return; }
  }
  if (State.regStep === 2 && !username.trim()) { showToast('Bitte Namen eingeben'); return; }
  
  State.regStep++;
  updateRegUI();
}

function prevRegStep() {
  State.regStep--;
  updateRegUI();
}

function updateRegUI() {
  document.querySelectorAll('.reg-step').forEach(s => s.classList.remove('active'));
  document.querySelector(`.reg-step[data-step="${State.regStep}"]`).classList.add('active');
  document.querySelectorAll('.progress-step').forEach((s, i) => {
    s.classList.toggle('active', i < State.regStep);
  });
}

function finishRegistration() {
  localStorage.setItem('userEmail', document.getElementById('reg-email').value);
  localStorage.setItem('userPassword', document.getElementById('reg-password').value);
  localStorage.setItem('username', document.getElementById('reg-username').value);
  localStorage.setItem('studiengang', document.getElementById('reg-studiengang').value);
  localStorage.setItem('hochschule', document.getElementById('reg-hochschule').value);
  localStorage.setItem('isLoggedIn', 'true');
  
  State.isLoggedIn = true;
  State.username = document.getElementById('reg-username').value;
  State.save();
  
  unlockBadge('first_login', 10);
  showToast('Willkommen bei Campus Hugo! 🎉');
  navigateTo('dashboard');
}

function togglePasswordVisibility(inputId, icon) {
  const input = document.getElementById(inputId);
  input.type = input.type === 'password' ? 'text' : 'password';
}

// ===== DASHBOARD =====
function initDashboard() {
  if (!State.isGuest) {
    document.getElementById('dashboard-username').textContent = State.username;
    document.getElementById('welcome-text').textContent = 'Willkommen zurück,';
    document.getElementById('guest-cta').style.display = 'none';
    
    // Check mood
    const todayKey = getTodayKey();
    if (!State.moodData[todayKey]) {
      setTimeout(() => openDialog('mood-dialog'), 500);
    }
  }
  
  renderCalendar();
  renderMoodChart();
  renderStundenplan();
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function renderCalendar() {
  const container = document.getElementById('calendar-days');
  if (!container) return;
  
  const year = State.calendarDate.getFullYear();
  const month = State.calendarDate.getMonth();
  const months = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  
  document.getElementById('calendar-month-year').textContent = `${months[month]} ${year}`;
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const todayKey = getTodayKey();
  
  let html = '';
  for (let i = 0; i < startOffset; i++) html += '<div class="calendar-day empty"></div>';
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const mood = State.moodData[dateKey];
    const isToday = dateKey === todayKey;
    let classes = 'calendar-day';
    if (isToday) classes += ' today';
    if (mood) classes += ` mood-${mood}`;
    html += `<div class="${classes}" onclick="selectDateForMood('${dateKey}')">${day}</div>`;
  }
  
  container.innerHTML = html;
}

function changeCalendarMonth(delta) {
  State.calendarDate.setMonth(State.calendarDate.getMonth() + delta);
  renderCalendar();
}

function selectDateForMood(dateKey) {
  if (State.isGuest) return;
  window.selectedMoodDate = dateKey;
  openDialog('mood-dialog');
}

function selectMood(moodId) {
  const dateKey = window.selectedMoodDate || getTodayKey();
  State.moodData[dateKey] = moodId;
  State.save();
  closeDialog('mood-dialog');
  renderCalendar();
  renderMoodChart();
  showToast('Stimmung gespeichert! 🎉');
  
  // Badge
  const moodCount = Object.keys(State.moodData).length;
  if (moodCount === 1) unlockBadge('first_mood', 15);
  if (moodCount >= 7) unlockBadge('mood_week', 50);
}

function renderMoodChart() {
  const container = document.getElementById('mood-chart');
  if (!container) return;
  
  const moodValues = { great: 100, good: 80, neutral: 60, unwell: 40, bad: 20 };
  const moodColors = { great: 'var(--mood-great)', good: 'var(--mood-good)', neutral: 'var(--mood-neutral)', unwell: 'var(--mood-unwell)', bad: 'var(--mood-bad)' };
  
  let html = '';
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const mood = State.moodData[key];
    const height = mood ? moodValues[mood] : 20;
    const color = mood ? moodColors[mood] : 'var(--muted)';
    html += `<div class="mood-bar" style="height: ${height}%; background: ${color};"></div>`;
  }
  container.innerHTML = html;
}

// ===== STUNDENPLAN =====
function getStundenplan() {
  return JSON.parse(localStorage.getItem('stundenplan') || '[]');
}

function saveStundenplan(entries) {
  localStorage.setItem('stundenplan', JSON.stringify(entries));
}

function renderStundenplan() {
  const container = document.getElementById('stundenplan-content');
  if (!container) return;
  
  const entries = getStundenplan();
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];
  const colors = { primary: 'var(--primary)', blue: 'hsl(210 90% 50%)', purple: 'hsl(270 70% 50%)', orange: 'hsl(25 90% 50%)', pink: 'hsl(330 80% 60%)' };
  
  let html = '<div class="stundenplan-grid">';
  days.forEach(day => {
    const dayEntries = entries.filter(e => e.day === day).sort((a,b) => a.startTime.localeCompare(b.startTime));
    html += `<div class="stundenplan-day"><div class="stundenplan-day-header">${day}</div>`;
    dayEntries.forEach(e => {
      html += `<div class="stundenplan-entry" style="background: ${colors[e.color] || colors.primary};">
        <div class="subject">${e.subject}</div>
        <div class="time">${e.startTime} - ${e.endTime}</div>
        ${e.room ? `<div class="room">${e.room}</div>` : ''}
        <button class="stundenplan-delete" onclick="deleteStundenplanEntry('${e.id}')"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
      </div>`;
    });
    html += '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function addStundenplanEntry() {
  const subject = document.getElementById('sp-subject').value;
  if (!subject) { showToast('Bitte Fach eingeben'); return; }
  
  const entries = getStundenplan();
  entries.push({
    id: Date.now().toString(),
    subject,
    day: document.getElementById('sp-day').value,
    startTime: document.getElementById('sp-start').value,
    endTime: document.getElementById('sp-end').value,
    room: document.getElementById('sp-room').value,
    color: document.querySelector('#sp-colors .color-option.active')?.dataset.color || 'primary'
  });
  saveStundenplan(entries);
  renderStundenplan();
  closeDialog('stundenplan-dialog');
  showToast('Eintrag hinzugefügt');
}

function deleteStundenplanEntry(id) {
  const entries = getStundenplan().filter(e => e.id !== id);
  saveStundenplan(entries);
  renderStundenplan();
}

function toggleView(view) {
  document.getElementById('toggle-calendar').classList.toggle('active', view === 'calendar');
  document.getElementById('toggle-stundenplan').classList.toggle('active', view === 'stundenplan');
  document.getElementById('calendar-view').style.display = view === 'calendar' ? '' : 'none';
  document.getElementById('stundenplan-view').style.display = view === 'stundenplan' ? '' : 'none';
}

// ===== DIALOGS =====
function openDialog(id) {
  document.getElementById('dialog-overlay').classList.add('active');
  document.getElementById(id).classList.add('active');
}

function closeDialog(id) {
  document.getElementById('dialog-overlay').classList.remove('active');
  document.getElementById(id).classList.remove('active');
}

function closeAllDialogs() {
  document.getElementById('dialog-overlay').classList.remove('active');
  document.querySelectorAll('.dialog.active').forEach(d => d.classList.remove('active'));
}

// ===== COPING =====
const copingExercises = {
  stress: [
    { title: '🧘 Box Breathing', desc: '4s einatmen, 4s halten, 4s ausatmen, 4s halten. Wiederhole 4x.' },
    { title: '💪 Muskelentspannung', desc: 'Spanne Fäuste 5s an, dann loslassen. Spüre die Entspannung.' },
    { title: '🎵 Achtsame Pause', desc: 'Schließe die Augen, atme tief und höre auf die Geräusche um dich.' }
  ],
  angst: [
    { title: '🌬️ 4-7-8 Atmung', desc: '4s einatmen, 7s halten, 8s ausatmen. 3-4x wiederholen.' },
    { title: '👀 5-4-3-2-1 Grounding', desc: '5 Dinge sehen, 4 hören, 3 fühlen, 2 riechen, 1 schmecken.' },
    { title: '🧘 Body Scan', desc: 'Vom Kopf bis zu den Füßen - spüre jeden Körperteil und entspanne.' }
  ],
  einsamkeit: [
    { title: '💚 Selbstmitgefühl', desc: 'Lege Hand aufs Herz, sage: "Ich bin nicht allein, das ist menschlich."' },
    { title: '📝 Dankbarkeit', desc: 'Schreibe 3 Menschen auf, für die du dankbar bist.' },
    { title: '📞 Verbindung', desc: 'Schreibe einer Person eine kurze Nachricht - einfach so.' }
  ],
  ueberforderung: [
    { title: '🛑 Gedanken-Stopp', desc: 'Sage laut "STOPP", atme 3x tief, fokussiere nur EINE Sache.' },
    { title: '📋 Brain Dump', desc: 'Schreibe alles auf, was dich beschäftigt. Dann: Was ist wirklich wichtig?' },
    { title: '🚶 Mini-Reset', desc: 'Steh auf, strecke dich, trink Wasser, öffne ein Fenster.' }
  ]
};

function showCopingExercises(category) {
  const exercises = copingExercises[category] || [];
  const container = document.getElementById('coping-exercises');
  const categories = document.getElementById('coping-categories');
  
  let html = `<button class="btn btn-outline mb-4" onclick="hideCopingExercises()">← Zurück</button>`;
  exercises.forEach(ex => {
    html += `<div class="coping-exercise"><h4>${ex.title}</h4><p>${ex.desc}</p></div>`;
  });
  
  container.innerHTML = html;
  container.style.display = 'block';
  categories.style.display = 'none';
  
  trackCopingExercise(category);
}

function hideCopingExercises() {
  document.getElementById('coping-exercises').style.display = 'none';
  document.getElementById('coping-categories').style.display = 'grid';
}

function trackCopingExercise(category) {
  const count = parseInt(localStorage.getItem('hugoExercises') || '0') + 1;
  localStorage.setItem('hugoExercises', count);
  if (count === 1) unlockBadge('first_coping', 20);
  if (count >= 10) unlockBadge('coping_pro', 75);
}

// ===== FORUM =====
function getForumPosts() { return JSON.parse(localStorage.getItem('forum-posts') || '[]'); }
function saveForumPosts(posts) { localStorage.setItem('forum-posts', JSON.stringify(posts)); }

const defaultPosts = [
  { id: '1', author: 'Anonym', title: 'Prüfungsstress - wie geht ihr damit um?', content: 'Ich hab nächste Woche 3 Klausuren und weiß nicht, wie ich das schaffen soll...', category: 'stress', date: '2025-01-20', comments: 5 },
  { id: '2', author: 'Lisa M.', title: 'Lerngruppe für Mathe gesucht', content: 'Suche 2-3 Leute für wöchentliche Lerngruppe. Wer hat Interesse?', category: 'allgemein', date: '2025-01-19', comments: 3 },
  { id: '3', author: 'Anonym', title: 'Motivation am Tiefpunkt', content: 'Fühle mich so unmotiviert... Hat jemand Tipps?', category: 'motivation', date: '2025-01-18', comments: 8 }
];

function initForum() {
  let posts = getForumPosts();
  if (posts.length === 0) { posts = defaultPosts; saveForumPosts(posts); }
  renderForumPosts(posts);
}

function renderForumPosts(posts) {
  const container = document.getElementById('forum-posts');
  const categoryLabels = { allgemein: 'Allgemein', stress: 'Stress & Prüfungen', motivation: 'Motivation', tipps: 'Tipps & Tricks' };
  
  container.innerHTML = posts.map(p => `
    <div class="post-card" data-category="${p.category}">
      <div class="post-header">
        <div class="post-avatar">${p.author.charAt(0)}</div>
        <div class="post-meta">
          <div class="post-author">${p.author}</div>
          <div class="post-date">${p.date}</div>
        </div>
        <span class="post-category">${categoryLabels[p.category] || p.category}</span>
      </div>
      <h3 class="post-title">${p.title}</h3>
      <p class="post-content">${p.content}</p>
      <div class="post-actions">
        <button class="post-action"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg> ${p.comments || 0} Kommentare</button>
      </div>
    </div>
  `).join('');
}

function filterPosts(category) {
  document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  
  const posts = getForumPosts();
  const filtered = category === 'alle' ? posts : posts.filter(p => p.category === category);
  renderForumPosts(filtered);
}

function createForumPost() {
  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;
  if (!title || !content) { showToast('Bitte Titel und Inhalt eingeben'); return; }
  
  const posts = getForumPosts();
  posts.unshift({
    id: Date.now().toString(),
    author: document.getElementById('post-anonymous').checked ? 'Anonym' : State.username,
    title,
    content,
    category: document.getElementById('post-category').value,
    date: new Date().toISOString().split('T')[0],
    comments: 0
  });
  saveForumPosts(posts);
  
  unlockBadge('first_post', 25);
  closeDialog('new-post-dialog');
  initForum();
  showToast('Beitrag veröffentlicht!');
}

// ===== BERATER =====
const beraterList = [
  { id: '1', name: 'Frau Koch', role: 'Psychologische Beraterin', desc: 'Ich bin seit 10 Jahren als psychologische Beraterin an der Universität tätig. Meine Schwerpunkte sind Prüfungsangst, Stressbewältigung und persönliche Krisen.', image: 'assets/sarah-mentor.png', available: true },
  { id: '2', name: 'Herr Müller', role: 'Studienberater', desc: 'Als Studienberater unterstütze ich dich bei Fragen rund ums Studium - von Fachwechsel bis Prüfungsordnung.', image: 'assets/oliver-mentor.png', available: true },
  { id: '3', name: 'Frau Schmidt', role: 'Sozialberaterin', desc: 'Finanzielle Sorgen, BAföG-Fragen oder Nebenjob-Probleme? Ich helfe dir, dich auf dein Studium konzentrieren zu können.', image: 'assets/martina-mentor.png', available: false }
];

let bookedAppointments = JSON.parse(localStorage.getItem('booked-appointments') || '[]');
let selectedAppointmentDate = null;

function initBerater() {
  const container = document.getElementById('berater-list');
  container.innerHTML = beraterList.map(b => `
    <div class="berater-card-horizontal">
      <div class="berater-card-inner">
        <img src="${b.image}" alt="${b.name}" class="berater-image">
        <div class="berater-content">
          <div class="berater-header">
            <span class="berater-name">${b.name}</span>
            <span class="berater-status ${b.available ? 'available' : 'unavailable'}">${b.available ? 'Verfügbar' : 'Nicht verfügbar'}</span>
          </div>
          <p class="berater-role">${b.role}</p>
          <p class="berater-desc">${b.desc}</p>
          <div class="berater-actions">
            <button class="btn btn-primary ${State.isGuest ? 'locked' : ''}" onclick="openChat('${b.id}')" ${!b.available || State.isGuest ? 'disabled' : ''}>Connect</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  renderBookedAppointments();
  renderAppointmentDates();
  
  // Handle guest mode
  const appointmentCard = document.getElementById('appointment-card');
  if (State.isGuest && appointmentCard) {
    appointmentCard.classList.add('disabled');
    appointmentCard.onclick = null;
  }
}

function renderBookedAppointments() {
  const banner = document.getElementById('booked-appointments-banner');
  const list = document.getElementById('booked-appointments-list');
  if (!banner || !list) return;
  
  if (bookedAppointments.length === 0) {
    banner.style.display = 'none';
    return;
  }
  
  banner.style.display = 'block';
  list.innerHTML = bookedAppointments.map((app, idx) => {
    const berater = beraterList.find(b => b.id === app.beraterId);
    const dateStr = new Date(app.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
    return `<div class="booked-appointment-item">
      <div class="booked-appointment-info">
        <img src="${berater?.image || ''}" alt="${berater?.name || ''}">
        <div>
          <p>${dateStr} um ${app.time} Uhr</p>
          <span>${berater?.name} - ${berater?.role}</span>
        </div>
      </div>
      <button class="btn btn-destructive btn-sm" onclick="cancelAppointment(${idx})">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        Stornieren
      </button>
    </div>`;
  }).join('');
}

function cancelAppointment(idx) {
  bookedAppointments.splice(idx, 1);
  localStorage.setItem('booked-appointments', JSON.stringify(bookedAppointments));
  renderBookedAppointments();
  showToast('Termin storniert');
}

function renderAppointmentDates() {
  const container = document.getElementById('appointment-dates');
  if (!container) return;
  
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  let html = '';
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    html += `<button class="appointment-date-btn" data-date="${dateStr}" onclick="selectAppointmentDate('${dateStr}')">
      <span class="day">${days[date.getDay()]}</span>
      <span class="date">${date.getDate()}</span>
      <span class="month">${months[date.getMonth()]}</span>
    </button>`;
  }
  container.innerHTML = html;
}

function selectAppointmentDate(dateStr) {
  selectedAppointmentDate = dateStr;
  document.querySelectorAll('.appointment-date-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.date === dateStr);
  });
  renderAppointmentSlots(dateStr);
}

function renderAppointmentSlots(dateStr) {
  const container = document.getElementById('appointment-slots-container');
  const slotsEl = document.getElementById('appointment-slots');
  container.style.display = 'block';
  
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  let html = '';
  
  beraterList.filter(b => b.available).forEach(berater => {
    const availableTimes = times.filter((t, idx) => (parseInt(berater.id) + new Date(dateStr).getDay() + idx) % 3 !== 0);
    availableTimes.forEach(time => {
      const isBooked = bookedAppointments.some(a => a.date === dateStr && a.time === time && a.beraterId === berater.id);
      if (!isBooked) {
        html += `<div class="slot-item">
          <div class="slot-berater">
            <img src="${berater.image}" alt="${berater.name}">
            <div class="slot-berater-info">
              <p>${berater.name}</p>
              <span>${berater.role}</span>
            </div>
          </div>
          <div>
            <span class="slot-time">${time}</span>
            <button class="btn btn-primary btn-sm" onclick="bookAppointment('${berater.id}', '${dateStr}', '${time}')">Buchen</button>
          </div>
        </div>`;
      }
    });
  });
  
  slotsEl.innerHTML = html || '<p style="color: var(--muted-foreground); text-align: center; padding: 1rem;">Keine Termine verfügbar</p>';
}

function bookAppointment(beraterId, date, time) {
  bookedAppointments.push({ beraterId, date, time });
  localStorage.setItem('booked-appointments', JSON.stringify(bookedAppointments));
  
  const berater = beraterList.find(b => b.id === beraterId);
  const dateStr = new Date(date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
  
  document.getElementById('booking-details').innerHTML = `
    <p><strong>${berater?.name}</strong></p>
    <p>${dateStr} um ${time} Uhr</p>
  `;
  
  closeDialog('appointment-dialog');
  openDialog('booking-confirmation-dialog');
  renderBookedAppointments();
  showToast('Termin gebucht! 🎉');
}

function openChat(beraterId) {
  if (State.isGuest) return;
  const berater = beraterList.find(b => b.id === beraterId);
  if (!berater) return;
  
  document.getElementById('chat-berater-name').textContent = berater.name;
  document.getElementById('chat-berater-img').src = berater.image;
  document.getElementById('chat-messages').innerHTML = `<div class="chat-message berater">Hallo! Wie kann ich dir helfen?</div>`;
  
  openDialog('berater-chat-dialog');
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  
  const container = document.getElementById('chat-messages');
  container.innerHTML += `<div class="chat-message user">${msg}</div>`;
  input.value = '';
  
  setTimeout(() => {
    container.innerHTML += `<div class="chat-message berater">Danke für deine Nachricht. Ich melde mich bald bei dir!</div>`;
    container.scrollTop = container.scrollHeight;
  }, 1000);
}

function sendAnonymousMessage() {
  const msg = document.getElementById('anonymous-message').value.trim();
  if (!msg) { showToast('Bitte Nachricht eingeben'); return; }
  
  closeDialog('anonymous-chat-dialog');
  showToast('Nachricht gesendet! Ein Berater wird sich melden.');
  document.getElementById('anonymous-message').value = '';
}

// ===== NOTENPLANER =====
function getGrades() { return JSON.parse(localStorage.getItem('grades') || '[]'); }
function saveGrades(grades) { localStorage.setItem('grades', JSON.stringify(grades)); }

function initNotenplaner() {
  renderGrades();
  updateGradeStats();
}

function renderGrades() {
  const grades = getGrades();
  const container = document.getElementById('grades-list');
  
  if (grades.length === 0) {
    container.innerHTML = '<div class="card" style="text-align: center; color: var(--muted-foreground);">Noch keine Noten eingetragen. Füge deine erste Note hinzu!</div>';
    return;
  }
  
  const bySemester = grades.reduce((acc, g) => {
    if (!acc[g.semester]) acc[g.semester] = [];
    acc[g.semester].push(g);
    return acc;
  }, {});
  
  let html = '';
  Object.keys(bySemester).sort().reverse().forEach(sem => {
    const semGrades = bySemester[sem];
    const avg = (semGrades.reduce((s, g) => s + g.grade * g.ects, 0) / semGrades.reduce((s, g) => s + g.ects, 0)).toFixed(2);
    const ects = semGrades.reduce((s, g) => s + g.ects, 0);
    
    html += `<div class="semester-section">
      <div class="semester-header"><h3>${sem}</h3><span class="semester-stats">⌀ ${avg} • ${ects} ECTS</span></div>`;
    
    semGrades.forEach(g => {
      const gradeClass = g.grade <= 1.5 ? 'excellent' : g.grade <= 2.5 ? 'good' : g.grade <= 3.5 ? 'satisfactory' : g.grade <= 4.0 ? 'sufficient' : 'failed';
      html += `<div class="grade-item">
        <div class="grade-info"><h4>${g.subject}</h4><p>${g.ects} ECTS</p></div>
        <div class="grade-value ${gradeClass}">${g.grade.toFixed(1)}</div>
        <div class="grade-actions">
          <button class="grade-action" onclick="editGrade('${g.id}')"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>
          <button class="grade-action" onclick="deleteGrade('${g.id}')"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
        </div>
      </div>`;
    });
    html += '</div>';
  });
  
  container.innerHTML = html;
}

function updateGradeStats() {
  const grades = getGrades();
  const totalEcts = grades.reduce((s, g) => s + g.ects, 0);
  const avgGrade = grades.length ? (grades.reduce((s, g) => s + g.grade * g.ects, 0) / totalEcts).toFixed(2) : '-';
  
  document.getElementById('avg-grade').textContent = avgGrade;
  document.getElementById('total-ects').textContent = totalEcts;
}

function saveGrade() {
  const subject = document.getElementById('grade-subject').value;
  const grade = parseFloat(document.getElementById('grade-value').value);
  const ects = parseInt(document.getElementById('grade-ects').value);
  const semester = document.getElementById('grade-semester').value;
  const editId = document.getElementById('grade-edit-id').value;
  
  if (!subject || !grade || !ects || !semester) { showToast('Bitte alle Felder ausfüllen'); return; }
  
  let grades = getGrades();
  if (editId) {
    grades = grades.map(g => g.id === editId ? { ...g, subject, grade, ects, semester } : g);
  } else {
    grades.push({ id: Date.now().toString(), subject, grade, ects, semester });
    unlockBadge('first_grade', 15);
  }
  
  saveGrades(grades);
  closeDialog('grade-dialog');
  initNotenplaner();
  showToast(editId ? 'Note aktualisiert' : 'Note hinzugefügt');
}

function editGrade(id) {
  const grade = getGrades().find(g => g.id === id);
  if (!grade) return;
  
  document.getElementById('grade-subject').value = grade.subject;
  document.getElementById('grade-value').value = grade.grade;
  document.getElementById('grade-ects').value = grade.ects;
  document.getElementById('grade-semester').value = grade.semester;
  document.getElementById('grade-edit-id').value = id;
  document.getElementById('grade-dialog-title').textContent = 'Note bearbeiten';
  
  openDialog('grade-dialog');
}

function deleteGrade(id) {
  const grades = getGrades().filter(g => g.id !== id);
  saveGrades(grades);
  initNotenplaner();
  showToast('Note gelöscht');
}

// ===== ARTIKEL =====
const articles = [
  { id: 'produktivitaet', category: 'Produktivität', title: 'Effektives Zeitmanagement', excerpt: 'Lerne, wie du deine Zeit optimal nutzt.', readTime: '5 Min' },
  { id: 'gesundheit', category: 'Gesundheit', title: 'Gesunder Schlaf im Studium', excerpt: 'Warum Schlaf so wichtig ist.', readTime: '4 Min' },
  { id: 'motivation', category: 'Motivation', title: 'Motivationstief überwinden', excerpt: 'Strategien gegen das Tief.', readTime: '6 Min' },
  { id: 'lernen', category: 'Lernen', title: 'Aktives vs. Passives Lernen', excerpt: 'Die besten Lernmethoden.', readTime: '7 Min' },
  { id: 'stress', category: 'Gesundheit', title: 'Stress reduzieren', excerpt: 'Praktische Tipps für weniger Stress.', readTime: '5 Min' },
  { id: 'fokus', category: 'Produktivität', title: 'Deep Work Methode', excerpt: 'Konzentriert arbeiten lernen.', readTime: '8 Min' }
];

function initArtikel() {
  renderArticles(articles);
  
  document.querySelectorAll('#article-filter .filter-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#article-filter .filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.category;
      renderArticles(cat === 'Alle' ? articles : articles.filter(a => a.category === cat));
    };
  });
}

function renderArticles(list) {
  document.getElementById('articles-list').innerHTML = list.map(a => `
    <div class="article-card" onclick="navigateTo('artikel-detail', {id: '${a.id}'})">
      <div class="article-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
      <span class="article-category">${a.category}</span>
      <h3 class="article-title">${a.title}</h3>
      <p class="article-excerpt">${a.excerpt}</p>
      <span class="article-meta">📖 ${a.readTime} Lesezeit</span>
    </div>
  `).join('');
}

function showArticleDetail(id) {
  const article = articles.find(a => a.id === id);
  if (!article) { navigateTo('artikel'); return; }
  
  const readArticles = JSON.parse(localStorage.getItem('readArticles') || '[]');
  if (!readArticles.includes(id)) {
    readArticles.push(id);
    localStorage.setItem('readArticles', JSON.stringify(readArticles));
    if (readArticles.length >= 5) unlockBadge('article_reader', 40);
  }
  
  document.getElementById('article-content').innerHTML = `
    <div class="article-detail-header">
      <span class="article-category">${article.category}</span>
      <h1>${article.title}</h1>
      <div class="article-detail-meta"><span>📖 ${article.readTime} Lesezeit</span></div>
    </div>
    <div class="article-detail-content">
      <p>${article.excerpt}</p>
      <h2>Einführung</h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <h2>Praktische Tipps</h2>
      <ul>
        <li>Plane regelmäßige Pausen ein</li>
        <li>Setze dir realistische Ziele</li>
        <li>Feiere kleine Erfolge</li>
      </ul>
      <h2>Fazit</h2>
      <p>Mit diesen Strategien kannst du dein Studium erfolgreicher meistern!</p>
    </div>
  `;
}

// ===== EINSTELLUNGEN =====
function initEinstellungen() {
  renderBadges();
  loadProfileSettings();
  updateLevelDisplay();
  
  const isDark = localStorage.getItem('theme') === 'dark';
  document.getElementById('dark-mode-toggle').classList.toggle('active', isDark);
}

function switchSettingsTab(tab) {
  document.querySelectorAll('.tabs .tab-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  
  document.querySelectorAll('.settings-tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
}

function loadProfileSettings() {
  document.getElementById('settings-name').value = localStorage.getItem('username') || '';
  document.getElementById('settings-hochschule').value = localStorage.getItem('hochschule') || '';
  document.getElementById('settings-studiengang').value = localStorage.getItem('studiengang') || '';
  document.getElementById('settings-bio').value = localStorage.getItem('bio') || '';
  
  const name = localStorage.getItem('username') || 'User';
  document.getElementById('profile-name').textContent = name;
  document.getElementById('avatar-initials').textContent = name.charAt(0).toUpperCase();
  document.getElementById('profile-study').textContent = localStorage.getItem('studiengang') || 'Kein Studiengang';
}

function saveProfile() {
  localStorage.setItem('username', document.getElementById('settings-name').value);
  localStorage.setItem('hochschule', document.getElementById('settings-hochschule').value);
  localStorage.setItem('studiengang', document.getElementById('settings-studiengang').value);
  localStorage.setItem('bio', document.getElementById('settings-bio').value);
  
  State.username = document.getElementById('settings-name').value;
  unlockBadge('profile_complete', 30);
  showToast('Profil gespeichert!');
  loadProfileSettings();
}

function toggleDarkMode() {
  const toggle = document.getElementById('dark-mode-toggle');
  const isDark = toggle.classList.toggle('active');
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// ===== BADGES =====
const allBadges = [
  { id: 'first_login', name: 'Willkommen!', desc: 'Erste Anmeldung', exp: 10, icon: '👋', color: 'hsl(161 93% 30%)' },
  { id: 'first_mood', name: 'Selbstreflexion', desc: 'Erste Mood getrackt', exp: 15, icon: '😊', color: 'hsl(45 60% 50%)' },
  { id: 'mood_week', name: 'Mood-Streak', desc: '7 Tage Mood getrackt', exp: 50, icon: '🔥', color: 'hsl(25 90% 50%)' },
  { id: 'first_coping', name: 'Hugos Freund', desc: 'Erste Coping-Übung', exp: 20, icon: '🦥', color: 'hsl(120 40% 40%)' },
  { id: 'coping_pro', name: 'Coping-Pro', desc: '10 Übungen gemacht', exp: 75, icon: '🧘', color: 'hsl(270 70% 50%)' },
  { id: 'first_post', name: 'Community-Start', desc: 'Erster Forum-Post', exp: 25, icon: '💬', color: 'hsl(210 90% 50%)' },
  { id: 'first_grade', name: 'Fleißig', desc: 'Erste Note eingetragen', exp: 15, icon: '📝', color: 'hsl(330 80% 55%)' },
  { id: 'article_reader', name: 'Wissbegierig', desc: '5 Artikel gelesen', exp: 40, icon: '📚', color: 'hsl(200 80% 45%)' },
  { id: 'profile_complete', name: 'Vollständig', desc: 'Profil ausgefüllt', exp: 30, icon: '✨', color: 'hsl(45 90% 50%)' }
];

function getUnlockedBadges() { return JSON.parse(localStorage.getItem('unlockedBadges') || '{}'); }
function getUserExp() { return parseInt(localStorage.getItem('userExp') || '0'); }

function unlockBadge(id, exp) {
  const unlocked = getUnlockedBadges();
  if (unlocked[id]) return;
  
  unlocked[id] = true;
  localStorage.setItem('unlockedBadges', JSON.stringify(unlocked));
  
  const currentExp = getUserExp();
  localStorage.setItem('userExp', currentExp + exp);
  
  const badge = allBadges.find(b => b.id === id);
  showToast(`🏆 Badge: ${badge?.name}! +${exp} EXP`);
}

function renderBadges() {
  const unlocked = getUnlockedBadges();
  const container = document.getElementById('badges-grid');
  
  container.innerHTML = allBadges.map(b => `
    <div class="badge-card ${unlocked[b.id] ? '' : 'locked'}">
      ${unlocked[b.id] ? '<div class="badge-unlocked"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>' : ''}
      <div class="badge-icon" style="background: ${b.color};">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
      <div class="badge-desc">${b.desc}</div>
      <span class="badge-exp">+${b.exp} EXP</span>
    </div>
  `).join('');
  
  document.getElementById('unlocked-badges-count').textContent = Object.keys(unlocked).length;
}

function updateLevelDisplay() {
  const exp = getUserExp();
  const level = Math.floor(exp / 100) + 1;
  const progress = exp % 100;
  const titles = ['Neuling', 'Anfänger', 'Fortgeschritten', 'Experte', 'Meister'];
  
  document.getElementById('level-badge').textContent = level;
  document.getElementById('level-title').textContent = titles[Math.min(level - 1, 4)];
  document.getElementById('level-exp').textContent = `${exp} / ${level * 100} EXP`;
  document.getElementById('level-progress').style.width = `${progress}%`;
  document.getElementById('settings-level').textContent = `Level ${level} • ${exp} EXP`;
}

// ===== TOAST =====
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease-out forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== SEARCH =====
function initSearch() {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  
  const items = [
    { name: 'Forum', desc: 'Community', page: 'forum' },
    { name: 'Notenplaner', desc: 'Noten verwalten', page: 'notenplaner' },
    { name: 'Beratung', desc: 'Unterstützung', page: 'berater' },
    { name: 'Wissen', desc: 'Artikel & Tipps', page: 'artikel' },
    { name: 'Einstellungen', desc: 'Dein Profil', page: 'einstellungen' }
  ];
  
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (!q) { results.classList.remove('active'); return; }
    
    const matches = items.filter(i => i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q));
    if (matches.length) {
      results.innerHTML = matches.map(m => `<a href="#" class="search-result-item" onclick="navigateTo('${m.page}'); return false;"><span class="search-result-name">${m.name}</span><span class="search-result-desc">${m.desc}</span></a>`).join('');
      results.classList.add('active');
    } else {
      results.innerHTML = '<div class="search-result-item">Keine Ergebnisse</div>';
      results.classList.add('active');
    }
  });
  
  input.addEventListener('blur', () => setTimeout(() => results.classList.remove('active'), 200));
}

// ===== COLOR PICKER =====
document.addEventListener('click', e => {
  if (e.target.classList.contains('color-option')) {
    e.target.parentElement.querySelectorAll('.color-option').forEach(c => c.classList.remove('active'));
    e.target.classList.add('active');
  }
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  State.init();
  
  // Apply dark mode
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
  }
  
  // Determine start page
  if (State.isLoggedIn) {
    navigateTo('dashboard');
  } else {
    navigateTo('landing');
  }
  
  initSearch();
  
  // ESC to close dialogs
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllDialogs();
  });
});
