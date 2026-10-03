const programButtons = [...document.querySelectorAll('[data-program-choice]')];
const eventCards = [...document.querySelectorAll('.mobile-event')];
const calendarToggle = document.querySelector('#calendar-toggle');
const mobileEvents = document.querySelector('#mobile-events');
const mobileCalendar = document.querySelector('#mobile-calendar');
let selectedProgram = 'all';

function filterEvents() {
  eventCards.forEach((card) => {
    card.hidden = selectedProgram !== 'all' && card.dataset.program !== selectedProgram;
  });
  if (!mobileCalendar.hidden) renderCalendar();
}

programButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedProgram = button.dataset.programChoice;
    programButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    filterEvents();
  });
});

function renderCalendar() {
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const leadingDays = Array.from({ length: 4 }, () => '<span class="calendar-empty" aria-hidden="true"></span>').join('');
  const eventDays = { 9: ['high-school', 'High school'], 10: ['grid-kids', 'Grid Kids'], 16: ['high-school', 'High school'] };
  const dates = Array.from({ length: 31 }, (_, index) => {
    const day = index + 1;
    const event = eventDays[day];
    const showEvent = event && (selectedProgram === 'all' || selectedProgram === event[0]);
    return `<div class="calendar-day${showEvent ? ' has-event' : ''}" aria-label="October ${day}${showEvent ? `, ${event[1]}` : ''}"><b>${day}</b>${showEvent ? `<small>${event[1]}</small>` : ''}</div>`;
  }).join('');
  mobileCalendar.innerHTML = `${weekdays.map((day) => `<div class="calendar-day calendar-weekday">${day}</div>`).join('')}${leadingDays}${dates}`;
}

calendarToggle.addEventListener('click', () => {
  const showCalendar = mobileCalendar.hidden;
  mobileCalendar.hidden = !showCalendar;
  mobileEvents.hidden = showCalendar;
  calendarToggle.textContent = showCalendar ? 'List view' : 'Calendar view';
  calendarToggle.setAttribute('aria-pressed', String(showCalendar));
  if (showCalendar) renderCalendar();
});

function showFeedback(form, message) {
  form.querySelector('.form-feedback').textContent = message;
}

document.querySelector('#registration-form').addEventListener('submit', (event) => {
  event.preventDefault();
  showFeedback(event.currentTarget, 'Inquiry preview complete. Nothing was sent or saved.');
});

document.querySelector('#reservation-form').addEventListener('submit', (event) => {
  event.preventDefault();
  showFeedback(event.currentTarget, 'Reservation preview complete. No order or payment was created.');
});

const adminForm = document.querySelector('#admin-form');
const titleField = document.querySelector('#admin-title');
const copyField = document.querySelector('#admin-copy');
const announcementTitle = document.querySelector('#announcement-title');
const announcementCopy = document.querySelector('#announcement-copy');
const savedAnnouncement = JSON.parse(localStorage.getItem('demo2-announcement') || 'null');
if (savedAnnouncement) {
  titleField.value = savedAnnouncement.title;
  copyField.value = savedAnnouncement.copy;
  announcementTitle.textContent = savedAnnouncement.title;
  announcementCopy.textContent = savedAnnouncement.copy;
}

adminForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const announcement = { title: titleField.value.trim(), copy: copyField.value.trim() };
  announcementTitle.textContent = announcement.title;
  announcementCopy.textContent = announcement.copy;
  localStorage.setItem('demo2-announcement', JSON.stringify(announcement));
  showFeedback(adminForm, 'Announcement preview updated in this browser only.');
});

document.querySelectorAll('.bottom-link').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.bottom-link').forEach((item) => item.classList.toggle('active', item === link));
  });
});
