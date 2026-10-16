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

//calender toggle formatting
const BASE_CALENDAR_URL = 'https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FDenver&showPrint=0&src=NTg4YjViMDZiZTBlNjMzNzliZDViODI5OWE1ODdiMzgzOTJjMmI0MzFmOWUzMTc4Y2NlZTYzNWY1M2Y4YzI3ZEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=ZW4udXNhI2hvbGlkYXlAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&color=%234285f4&color=%230b8043&showTitle=0&showTz=0&showCalendars=0&showTabs=0';
const calendarFrame = document.querySelector('#calendar-frame');
const modeButtons = document.querySelectorAll('[data-mode]');

function setCalendarMode(mode) {
  calendarFrame.src = `${BASE_CALENDAR_URL}&mode=${mode}`;
  modeButtons.forEach((b) => {
    const active = b.dataset.mode === mode;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-pressed', String(active));
  });
}

modeButtons.forEach((b) => b.addEventListener('click', () => setCalendarMode(b.dataset.mode)));
setCalendarMode('AGENDA');
//--------------------------------


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
