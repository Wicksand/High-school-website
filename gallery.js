// ===== SETTINGS: the only thing you need to edit =====

// Published CSV link of the "gallery" tab (File → Share → Publish to web → pick the tab → CSV)
const GALLERY_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTbuSz2W3-9TrBprkb3iMMsOYp5wBmMDHrBJVXlA_JiE3yUgmEyAVZjR0CTnjHuxtz7Tbhdp8PzNKjC/pub?gid=1641952326&single=true&output=csv';

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

// Drive share link -> direct image link (size = width in pixels); other URLs pass through
function imageUrl(link, size) {
  if (!link) return '';
  const m = link.match(/drive\.google\.com\/file\/d\/([\w-]+)/) ||
            link.match(/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([\w-]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w${size}` : link;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

// ===== Render gallery =====
const grid = document.querySelector('#gallery-grid');
let photos = [];

async function loadGallery() {
  let rows;
  try {
    rows = await loadSheet(GALLERY_SHEET_URL);
  } catch (e) {
    console.warn('loadGallery', e);
    grid.innerHTML = '';
    grid.appendChild(el('p', 'gallery-status', 'Photos could not be loaded right now. Please try again later.'));
    return;
  }

  photos = rows
    .map((r) => ({
      link: r['image link'] || r.image || '',
      caption: r.caption || '',
      alt: r['alt txt'] || r['alt text'] || r.alt || r.caption || '',
      order: parseFloat(r.order) || 999,
      show: r.show || ''
    }))
    .filter((p) => p.link && !/^(no|n|false|hide)$/i.test(p.show))
    .sort((a, b) => a.order - b.order);

  grid.innerHTML = '';
  if (!photos.length) {
    grid.appendChild(el('p', 'gallery-status', 'No photos yet. Check back soon!'));
    return;
  }

  photos.forEach((p, i) => {
    const btn = el('button', 'gallery-item');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'View larger: ' + (p.caption || p.alt || 'photo ' + (i + 1)));

    const img = document.createElement('img');
    img.src = imageUrl(p.link, 600);
    img.alt = p.alt;
    img.loading = 'lazy';
    btn.appendChild(img);

    if (p.caption) btn.appendChild(el('span', 'gallery-caption', p.caption));
    btn.addEventListener('click', () => openLightbox(i));
    grid.appendChild(btn);
  });
}

// ===== Lightbox =====
const lightbox = document.querySelector('#lightbox');
const lightboxImg = document.querySelector('#lightbox-img');
const lightboxCaption = document.querySelector('#lightbox-caption');
const lightboxCount = document.querySelector('#lightbox-count');
let current = 0;

function showPhoto(i) {
  current = (i + photos.length) % photos.length;
  const p = photos[current];
  lightboxImg.src = imageUrl(p.link, 1600);
  lightboxImg.alt = p.alt;
  lightboxCaption.textContent = p.caption;
  lightboxCount.textContent = `${current + 1} / ${photos.length}`;
}

function openLightbox(i) {
  showPhoto(i);
  lightbox.showModal();
}

lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showPhoto(current - 1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => showPhoto(current + 1));

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.close();
});

lightbox.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') showPhoto(current - 1);
  if (e.key === 'ArrowRight') showPhoto(current + 1);
});

lightbox.addEventListener('close', () => { lightboxImg.removeAttribute('src'); });

loadGallery();