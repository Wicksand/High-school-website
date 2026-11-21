// ===== SETTINGS: the only things you need to edit =====

// 1) Published CSV link of the "store" tab of your Google Sheet
const STORE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTbuSz2W3-9TrBprkb3iMMsOYp5wBmMDHrBJVXlA_JiE3yUgmEyAVZjR0CTnjHuxtz7Tbhdp8PzNKjC/pub?gid=984481950&single=true&output=csv';

// 2) Google Form that receives reservations. Each reservation is one row.
//    orderId: optional; paste the entry number of your "Order ID" question
const RESERVE_FORM = {
  action: 'https://docs.google.com/forms/d/e/1FAIpQLScwRVqRV_Vqex4a-J2DreA2Ov2YYONBAXDgNugDybmEaL-how/formResponse',
  fields: {
    name: 'entry.1521779006',
    email: 'entry.109984016',
    item: 'entry.1767052160',
    size: 'entry.1793409310', // no longer sent; the size is inside the Item text
    quantity: 'entry.1673246123',
    notes: 'entry.1802804218',
    orderId: 'entry.PASTE_ORDER_ID'
  }
};

const MAX_LINES = 10; // different item/size lines per reservation
const MAX_QTY = 10;   // quantity per line

// ===== Sheet helpers =====
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

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function parseSizes(s) {
  return (s || '').split(/[,/|]/).map((x) => x.trim()).filter(Boolean);
}

function isSoldOut(item) {
  return /sold|out|unavailable/i.test(item.status || '');
}

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

// ===== Reservation list (cart) =====
const CART_KEY = 'tr-reservation-list';
let storeItems = [];
let cart = loadCart();

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((l) => l && typeof l.name === 'string' && typeof l.size === 'string' && Number.isInteger(l.qty) && l.qty > 0)
      .map((l) => ({ name: l.name.slice(0, 200), size: l.size.slice(0, 50), qty: Math.min(l.qty, MAX_QTY) }))
      .slice(0, MAX_LINES);
  } catch (e) {
    return [];
  }
}

function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* storage blocked: list just won't persist */ }
}

function totalQty() {
  return cart.reduce((n, l) => n + l.qty, 0);
}

const cartBar = document.querySelector('#cart-bar');
const cartCount = document.querySelector('#cart-count');

const cartBadge = document.querySelector('#cart-badge');

function updateCartBar() {
  const n = totalQty();
  cartBar.hidden = n === 0;
  document.body.classList.toggle('has-cart', n > 0);
  cartBadge.textContent = n;
  cartCount.textContent = n + (n === 1 ? ' item' : ' items') + ' reserved';
}

// Drops saved lines for items that were removed, sold out, or had their sizes changed
function pruneCart() {
  cart = cart.filter((line) => {
    const item = storeItems.find((i) => i.name === line.name);
    if (!item || isSoldOut(item)) return false;
    const sizes = parseSizes(item.sizes);
    return sizes.length ? sizes.includes(line.size) : line.size === 'One size';
  });
  saveCart();
  updateCartBar();
}

// ===== Render store =====
const grid = document.querySelector('#store-grid');

function buildCard(item) {
  const soldOut = isSoldOut(item);
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

  const btn = el('button', 'button button-dark', soldOut ? 'Sold out' : 'Add to reservation');
  btn.type = 'button';
  btn.disabled = soldOut;
  if (!soldOut) btn.addEventListener('click', () => openPicker(item));
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

  storeItems = rows
    .filter((r) => r.name && !/^(no|n|false|hide)$/i.test(r.show || ''))
    .sort((a, b) => (parseFloat(a.order) || 999) - (parseFloat(b.order) || 999));

  grid.innerHTML = '';
  if (!storeItems.length) {
    grid.appendChild(el('p', 'store-status', 'No items are available right now. Check back soon!'));
  } else {
    storeItems.forEach((item) => grid.appendChild(buildCard(item)));
  }
  pruneCart();
}

// ===== Dialog helpers =====
function wireDialog(dialog) {
  dialog.querySelector('.reserve-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
}

// ===== "Add to reservation" picker =====
const addDialog = document.querySelector('#add-dialog');
const addForm = document.querySelector('#add-form');
const addFeedback = addForm.querySelector('.form-feedback');
const addSizeField = document.querySelector('#add-size-field');
const addSize = addForm.elements.size;
let pickerItem = null;

wireDialog(addDialog);

function openPicker(item) {
  pickerItem = item;
  addForm.reset();
  addFeedback.textContent = '';
  document.querySelector('#add-title').textContent = item.name;

  const sizes = parseSizes(item.sizes);
  addSize.innerHTML = '';
  if (sizes.length) {
    sizes.forEach((s) => addSize.add(new Option(s, s)));
    addSizeField.hidden = false;
  } else {
    addSize.add(new Option('One size', 'One size'));
    addSizeField.hidden = true;
  }
  addDialog.showModal();
}

addForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const size = addSize.value;
  const qty = clamp(parseInt(addForm.elements.quantity.value, 10) || 1, 1, MAX_QTY);
  const existing = cart.find((l) => l.name === pickerItem.name && l.size === size);

  if (existing) {
    existing.qty = Math.min(existing.qty + qty, MAX_QTY);
  } else if (cart.length >= MAX_LINES) {
    addFeedback.textContent = 'Your list is full. Please submit this reservation first, then start another.';
    return;
  } else {
    cart.push({ name: pickerItem.name, size, qty });
  }
  saveCart();
  updateCartBar();
  addDialog.close();
});

// ===== Review and submit =====
const reviewDialog = document.querySelector('#review-dialog');
const reviewForm = document.querySelector('#review-form');
const reviewFeedback = reviewForm.querySelector('.form-feedback');
const reviewSubmit = document.querySelector('#review-submit');
const cartList = document.querySelector('#cart-list');
let openedAt = 0;
let pendingOrderId = '';

wireDialog(reviewDialog);

function renderCart() {
  cartList.innerHTML = '';
  if (!cart.length) {
    cartList.appendChild(el('p', 'cart-empty', 'Your reservation list is empty.'));
    reviewSubmit.disabled = true;
    return;
  }
  reviewSubmit.disabled = false;

  cart.forEach((line, i) => {
    const row = el('div', 'cart-line');

    const name = el('div', 'cart-line-name');
    name.appendChild(el('strong', '', line.name));
    if (line.size !== 'One size') name.appendChild(el('small', '', 'Size ' + line.size));
    row.appendChild(name);

    const controls = el('div', 'cart-line-controls');
    const minus = el('button', 'qty-btn', '−');
    minus.type = 'button';
    minus.setAttribute('aria-label', 'Decrease quantity of ' + line.name);
    const qty = el('span', 'qty-value', String(line.qty));
    const plus = el('button', 'qty-btn', '+');
    plus.type = 'button';
    plus.setAttribute('aria-label', 'Increase quantity of ' + line.name);
    const remove = el('button', 'cart-remove', 'Remove');
    remove.type = 'button';

    minus.addEventListener('click', () => { if (line.qty > 1) { line.qty--; changed(); } });
    plus.addEventListener('click', () => { if (line.qty < MAX_QTY) { line.qty++; changed(); } });
    remove.addEventListener('click', () => { cart.splice(i, 1); changed(); });

    controls.append(minus, qty, plus, remove);
    row.appendChild(controls);
    cartList.appendChild(row);
  });
}

function changed() {
  saveCart();
  updateCartBar();
  renderCart();
  if (!cart.length) reviewDialog.close();
}

document.querySelector('#cart-open').addEventListener('click', () => {
  reviewFeedback.textContent = '';
  renderCart();
  openedAt = Date.now();
  reviewDialog.showModal();
});

function makeOrderId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 characters, no look-alikes
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return 'TR-' + Array.from(bytes, (b) => chars[b % 32]).join('');
}

function summary() {
  return cart.map((l) => `${l.qty}× ${l.name}${l.size !== 'One size' ? ' (' + l.size + ')' : ''}`).join(', ');
}

// Item cell text, e.g. "2× Titans Hoodie (M); 1× Grid Kids Cap"
function itemsText() {
  return cart.map((l) => `${l.qty}× ${l.name}${l.size !== 'One size' ? ' (' + l.size + ')' : ''}`).join('; ');
}

function finish(orderId) {
  reviewFeedback.textContent = `Reserved! Order ${orderId}: ${summary()}. The Booster Club will be in touch about pickup.`;
  cart = [];
  saveCart();
  updateCartBar();
  reviewForm.reset();
  pendingOrderId = '';
  setTimeout(() => { reviewDialog.close(); renderCart(); }, 6000);
}

reviewForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!cart.length) return;

  // Bot check: the hidden field was filled in, or the form was submitted in under 2 seconds
  if (reviewForm.elements.website.value || Date.now() - openedAt < 2000) {
    finish(makeOrderId());
    return;
  }
  if (RESERVE_FORM.action.includes('PASTE_')) {
    reviewFeedback.textContent = 'Reservations are not set up yet.';
    return;
  }

  // Reuse the same order ID if a failed attempt is retried, so repeats are easy to spot
  const orderId = pendingOrderId || makeOrderId();
  pendingOrderId = orderId;

  const f = RESERVE_FORM.fields;
  const data = new URLSearchParams();
  data.append(f.name, reviewForm.elements.name.value.trim());
  data.append(f.email, reviewForm.elements.email.value.trim());
  data.append(f.item, itemsText());
  data.append(f.quantity, String(totalQty()));
  data.append(f.notes, reviewForm.elements.notes.value.trim());
  if (f.orderId && !f.orderId.includes('PASTE_')) data.append(f.orderId, orderId);

  reviewSubmit.disabled = true;
  reviewFeedback.textContent = 'Sending…';
  try {
    // One form submission per reservation; no-cors because Google doesn't allow reading the reply
    await fetch(RESERVE_FORM.action, { method: 'POST', mode: 'no-cors', body: data });
    finish(orderId);
  } catch (err) {
    console.warn('reserve', err);
    reviewFeedback.textContent = 'Something went wrong. Please try again.';
  } finally {
    reviewSubmit.disabled = !cart.length;
  }
});

updateCartBar();
loadStore();