const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');

menuButton.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

mainNav.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    mainNav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
});

const scheduleList = document.querySelector('#schedule-list');
const calendarView = document.querySelector('#schedule-calendar');
const filter = document.querySelector('#team-filter');
const scheduleButtons = document.querySelectorAll('[data-view]');
const eventRows = [...document.querySelectorAll('.event-row')];

function applyScheduleFilter() {
  const selectedProgram = filter.value;
  eventRows.forEach((row) => {
    row.hidden = selectedProgram !== 'all' && row.dataset.program !== selectedProgram;
  });
}

function renderCalendar() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({ length: 31 }, (_, index) => index + 1);
  const leadingDays = Array.from({ length: 4 }, () => '<div class="calendar-cell calendar-empty" aria-hidden="true"></div>').join('');
  const eventsByDay = { 9: 'High School · Sample', 10: 'Grid Kids · Sample', 16: 'High School · Sample' };
  const selectedProgram = filter.value;
  calendarView.innerHTML = `<div class="calendar-grid">${days.map((day) => `<div class="calendar-cell calendar-head">${day}</div>`).join('')}${leadingDays}${dates.map((day) => {
    const event = eventsByDay[day];
    const eventProgram = event?.startsWith('Grid') ? 'grid-kids' : 'high-school';
    const showEvent = event && (selectedProgram === 'all' || eventProgram === selectedProgram);
    return `<div class="calendar-cell"><strong>Oct ${day}</strong>${showEvent ? `<span>${event}</span>` : ''}</div>`;
  }).join('')}</div>`;
}

scheduleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const showCalendar = button.dataset.view === 'calendar';
    scheduleList.hidden = showCalendar;
    calendarView.hidden = !showCalendar;
    scheduleButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    if (showCalendar) renderCalendar();
  });
});

filter.addEventListener('change', () => {
  applyScheduleFilter();
  if (!calendarView.hidden) renderCalendar();
});

function showDemoFeedback(form, message) {
  form.querySelector('.form-feedback').textContent = message;
}

document.querySelector('#registration-form').addEventListener('submit', (event) => {
  event.preventDefault();
  showDemoFeedback(event.currentTarget, 'Registration preview complete. No information was sent or saved.');
});

document.querySelector('#reservation-form').addEventListener('submit', (event) => {
  event.preventDefault();
  showDemoFeedback(event.currentTarget, 'Reservation preview complete. No order or payment was created.');
});

const adminForm = document.querySelector('#admin-form');
const announcementTitle = document.querySelector('#announcement-title');
const announcementCopy = document.querySelector('#announcement-copy');
const savedAnnouncement = JSON.parse(localStorage.getItem('demo1-announcement') || 'null');
if (savedAnnouncement) {
  announcementTitle.textContent = savedAnnouncement.title;
  announcementCopy.textContent = savedAnnouncement.copy;
  document.querySelector('#admin-title').value = savedAnnouncement.title;
  document.querySelector('#admin-copy').value = savedAnnouncement.copy;
}

adminForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const announcement = {
    title: document.querySelector('#admin-title').value.trim(),
    copy: document.querySelector('#admin-copy').value.trim()
  };
  announcementTitle.textContent = announcement.title;
  announcementCopy.textContent = announcement.copy;
  localStorage.setItem('demo1-announcement', JSON.stringify(announcement));
  showDemoFeedback(adminForm, 'Announcement preview updated in this browser only.');
});
