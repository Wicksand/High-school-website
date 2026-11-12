// ===== SETTINGS: the only things you need to edit =====

// 1) Published CSV link of the "store" tab of your Google Sheet
const STORE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTbuSz2W3-9TrBprkb3iMMsOYp5wBmMDHrBJVXlA_JiE3yUgmEyAVZjR0CTnjHuxtz7Tbhdp8PzNKjC/pub?gid=984481950&single=true&output=csv';

// 2) Google Form that receives reservations (its responses land in a sheet).
//    action = the form's link with /viewform replaced by /formResponse
//    fields = the entry.#### id of each question
const RESERVE_FORM = {
  action: 'https://docs.google.com/forms/d/e/PASTE_FORM_ID/formResponse',
  fields: {
    name: 'entry.0000000001',
    email: 'entry.0000000002',
    item: 'entry.0000000003',
    size: 'entry.0000000004',
    quantity: 'entry.0000000005',
    notes: 'entry.0000000006'
  }
};

// ===== Mobile menu =====
const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');

menuButton.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

// ===== Sheet helpers (same as script.js) =====
function parseCSV(text) {
  const rows = []; let row = [], cell = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (inQ) {
      if (c === '"' && n === '"') { cell += '"'; i++; }
      else if (c === '"') inQ = false;
      else cell += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && n === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

async function loadSheet(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Sheet request failed: ' + res.status);
  const [head, ...body] = parseCSV(await res.text());
  const keys = head.map((h) => h.trim().toLowerCase());
  return body
    .filter((r) => r.some((c) => c.trim()))
    .map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] || '').trim()])));
}

// Turns a Google Drive share link into a direct image link; other URLs pass through
function imageUrl(link) {
  if (!link) return '';
  const m = link.match(/drive\.google\.com\/file\/d\/([\w-]+)/) ||
            link.match(/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([\w-]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800` : link;
}

function formatPrice(p) {
  if (!p) return '';
  return /^\d+(\.\d+)?$/.test(p) ? '$' + Number(p).toFixed(2) : p;
}

// ===== Render store =====
const grid = document.querySelector('#store-grid');

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function buildCard(item) {
  const soldOut = /sold|out|unavailable/i.test(item.status || '');
  const card = el('article', 'store-card' + (soldOut ? ' is-soldout' : ''));

  const photo = el('div', 'store-photo');
  const src = imageUrl(item.image);
  if (src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = item['alt text'] || item['alt txt'] || item['alt'] || item.name;
    img.loading = 'lazy';
    photo.appendChild(img);
  }
  card.appendChild(photo);

  const body = el('div', 'store-body');
  body.appendChild(el('h3', '', item.name));
  if (item.price) body.appendChild(el('p', 'store-price', formatPrice(item.price)));
  if (item.description) body.appendChild(el('p', 'store-desc', item.description));
  if (item.sizes) body.appendChild(el('p', 'store-sizes', item.sizes));

  const btn = el('button', 'button button-dark', soldOut ? 'Sold out' : 'Reserve');
  btn.type = 'button';
  btn.disabled = soldOut;
  if (!soldOut) btn.addEventListener('click', () => openReserve(item));
  body.appendChild(btn);

  card.appendChild(body);
  return card;
}

async function loadStore() {
  let rows;
  try {
    rows = await loadSheet(STORE_SHEET_URL);
  } catch (e) {
    console.warn('loadStore', e);
    grid.innerHTML = '';
    grid.appendChild(el('p', 'store-status', 'Items could not be loaded right now. Please try again later.'));
    return;
  }

  const items = rows
    .filter((r) => r.name && !/^(no|n|false|hide)$/i.test(r.show || ''))
    .sort((a, b) => (parseFloat(a.order) || 999) - (parseFloat(b.order) || 999));

  grid.innerHTML = '';
  if (!items.length) {
    grid.appendChild(el('p', 'store-status', 'No items are available right now. Check back soon!'));
    return;
  }
  items.forEach((item) => grid.appendChild(buildCard(item)));
}

// ===== Reservation dialog =====
const dialog = document.querySelector('#reserve-dialog');
const form = document.querySelector('#reserve-form');
const feedback = form.querySelector('.form-feedback');
const sizeField = document.querySelector('#size-field');
const sizeSelect = form.elements.size;
let currentItem = null;

function openReserve(item) {
  currentItem = item;
  form.reset();
  feedback.textContent = '';
  document.querySelector('#reserve-title').textContent = item.name;

  const sizes = (item.sizes || '').split(/[,/|]/).map((s) => s.trim()).filter(Boolean);
  sizeSelect.innerHTML = '';
  if (sizes.length) {
    sizes.forEach((s) => sizeSelect.add(new Option(s, s)));
    sizeField.hidden = false;
    sizeSelect.required = true;
  } else {
    sizeSelect.add(new Option('One size', 'One size'));
    sizeField.hidden = true;
    sizeSelect.required = false;
  }
  dialog.showModal();
}

dialog.querySelector('.reserve-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (RESERVE_FORM.action.includes('PASTE_')) {
    feedback.textContent = 'Reservations are not set up yet.';
    return;
  }

  const f = RESERVE_FORM.fields;
  const data = new URLSearchParams();
  data.append(f.name, form.elements.name.value.trim());
  data.append(f.email, form.elements.email.value.trim());
  data.append(f.item, currentItem.name);
  data.append(f.size, sizeSelect.value);
  data.append(f.quantity, form.elements.quantity.value);
  data.append(f.notes, form.elements.notes.value.trim());

  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  feedback.textContent = 'Sending…';
  try {
    // Google Forms doesn't allow reading the response, so no-cors is expected
    await fetch(RESERVE_FORM.action, { method: 'POST', mode: 'no-cors', body: data });
    feedback.textContent = 'Reserved! The Booster Club will be in touch about pickup.';
    form.reset();
    setTimeout(() => dialog.close(), 2500);
  } catch (err) {
    console.warn('reserve', err);
    feedback.textContent = 'Something went wrong. Please try again.';
  } finally {
    submit.disabled = false;
  }
});

loadStore();