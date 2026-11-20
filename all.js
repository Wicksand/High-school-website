// Shared site chrome: keep navigation and footer markup consistent on every page.
const sharedHeader = `
  <header class="site-header">
    <div class="sponsor-bar" id="sponsor-bar" hidden>
  <div class="wrap sponsor-inner">
    <span class="sponsor-label">Our sponsors</span>
    <div class="sponsor-window"><div class="sponsor-track" id="sponsor-track"></div></div>
  </div>
  </div>
    <div class="wrap header-main">
      <a class="brand" href="index.html#home" aria-label="Thunder Ridge Football home">
        <span class="brand-mark" aria-hidden="true">TR</span>
        <span><strong>THUNDER RIDGE</strong><small>FOOTBALL · TITANS</small></span>
      </a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav">Site Menu</button>
      <nav id="main-nav" class="main-nav" aria-label="Main navigation">
        <a href="index.html#home" data-page="home">Home with Registration</a>
        <a href="storefront.html" data-page="storefront">Storefront</a>
        <a href="gallary.html" data-page="gallery">Gallery</a>
        <a href="sponsors.html" data-page="sponsors">Sponsors</a>
      </nav>
    </div>
  </header>
`;

const sharedFooter = `
  <footer class="site-footer">
    <div class="wrap footer-inner">
      <a class="brand brand-footer" href="index.html#home" aria-label="Thunder Ridge Football home">
        <span class="brand-mark" aria-hidden="true">TR</span>
        <span><strong>THUNDER RIDGE FOOTBALL</strong><small>BOOSTER CLUB</small></span>
      </a>
      <nav class="footer-links" aria-label="External school links">
        <a href="https://www.thunderridgetitans.com/" target="_blank" rel="noreferrer">Thunder Ridge High School</a>
        <a href="https://ps.d93.k12.id.us/" target="_blank" rel="noreferrer">PowerSchool - Bonneville Joint School District 93</a>
      </nav>
    </div>
  </footer>
`;

// Add shared elements before page-specific scripts initialize.
document.body.insertAdjacentHTML('afterbegin', sharedHeader);
document.body.insertAdjacentHTML('beforeend', sharedFooter);

// Match overscroll areas to the shared sponsor bar above and footer below.
function updateEdgeBackground() {
  const root = document.documentElement;
  const atBottom = root.scrollHeight > window.innerHeight &&
    window.scrollY >= root.scrollHeight - window.innerHeight - 1;
  const color = atBottom ? '#090f18' : '#f5f6f8';

  root.style.background = color;
  document.body.style.background = color;
}

window.addEventListener('scroll', updateEdgeBackground, { passive: true });
window.addEventListener('resize', updateEdgeBackground);
new ResizeObserver(updateEdgeBackground).observe(document.body);
updateEdgeBackground();

// Pages marked data-no-sponsor-bar (the sponsors page) don't show the scrolling bar
if (document.body.hasAttribute('data-no-sponsor-bar')) {
  document.querySelector('#sponsor-bar')?.remove();
}

// Keep sticky elements below the header, whatever its height (sponsor bar included)
const siteHeader = document.querySelector('.site-header');
let lastHeaderHeight = 0;

function syncHeaderHeight() {
  const h = siteHeader.offsetHeight;
  if (h === lastHeaderHeight) return;
  lastHeaderHeight = h;
  document.documentElement.style.setProperty('--header-h', h + 'px');
  window.dispatchEvent(new Event('resize')); // lets the page menu recalculate its position
}

new ResizeObserver(syncHeaderHeight).observe(siteHeader);
syncHeaderHeight();

// Mark the active destination and keep the small-screen navigation accessible.
const currentPage = location.pathname.endsWith('/storefront.html')
  ? 'storefront'
  : location.pathname.endsWith('/gallary.html')
    ? 'gallery'
    : location.pathname.endsWith('/sponsors.html')
      ? 'sponsors'
      : 'home';
const currentLink = document.querySelector(`[data-page="${currentPage}"]`);
if (currentLink) currentLink.setAttribute('aria-current', 'page');

const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');

function syncMobileNavSpace() {
  const isMobile = window.matchMedia('(max-width: 800px)').matches;
  const isOpen = mainNav.classList.contains('is-open');
  document.documentElement.style.setProperty('--mobile-nav-space', isMobile && isOpen ? `${mainNav.offsetHeight}px` : '0px');
}

menuButton.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  syncMobileNavSpace();
});

mainNav.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    mainNav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    syncMobileNavSpace();
  }
});

window.addEventListener('resize', syncMobileNavSpace);


// ADD SPONSOR CAROUSEL TO EACH PAGE HERE, EXCEPT FOR SPONSOR PAGE.
// Sponsor strip: reads the "sponsors" tab of the Google Sheet.
// Wrapped in a function so it can't clash with other scripts on the page.
(() => {
  // Published CSV link of the "sponsors" tab (File → Share → Publish to web → pick the tab → CSV)
  const SPONSORS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTbuSz2W3-9TrBprkb3iMMsOYp5wBmMDHrBJVXlA_JiE3yUgmEyAVZjR0CTnjHuxtz7Tbhdp8PzNKjC/pub?gid=435942087&single=true&output=csv';

  const bar = document.querySelector('#sponsor-bar');
  const track = document.querySelector('#sponsor-track');
  if (!bar || !track) return;

  const SPEED = 40;            // pixels per second; lower = slower

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

  function imageUrl(link) {
    if (!link) return '';
    const m = link.match(/drive\.google\.com\/file\/d\/([\w-]+)/) ||
              link.match(/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([\w-]+)/);
    return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w400` : link;
  }

  let sponsors = [];

  function buildItem(s, hidden) {
      const safeLink = /^https?:\/\//i.test(s.link) ? s.link : '';
      const node = document.createElement(safeLink ? 'a' : 'span');
      node.className = 'sponsor-item';
      if (safeLink) {
        node.href = safeLink;
        node.target = '_blank';
        node.rel = 'noopener noreferrer';
        node.setAttribute('aria-label', s.name + ' (opens in a new tab)');
      }
      if (hidden) {
        node.setAttribute('aria-hidden', 'true');
        if (safeLink) node.tabIndex = -1;
      }

      const src = imageUrl(s.logo);
      if (src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = hidden ? '' : s.name;
        img.onload = scheduleSpeed;
        img.onerror = () => { img.remove(); node.textContent = s.name; scheduleSpeed(); };
        node.appendChild(img);
      } else {
        node.textContent = s.name;
      }
      return node;
    }

// Sets the scroll duration from the track's real width
  function updateSpeed() {
    track.style.setProperty('--dur', (track.scrollWidth / 2 / SPEED) + 's');
  }

  let speedTimer;
  function scheduleSpeed() {
    clearTimeout(speedTimer);
    speedTimer = setTimeout(updateSpeed, 200);
  }

  // Measures one set, repeats it to fill the bar, then doubles it for a seamless loop
  function render() {
    if (!sponsors.length) return;
    const width = track.parentElement.clientWidth || window.innerWidth;

    track.innerHTML = '';
    sponsors.forEach((s) => track.appendChild(buildItem(s, false)));
    const oneSet = track.scrollWidth || 1;
    const repeats = Math.max(1, Math.ceil(width / oneSet));

    track.innerHTML = '';
    for (let copy = 0; copy < 2; copy++) {
      for (let r = 0; r < repeats; r++) {
        sponsors.forEach((s) => track.appendChild(buildItem(s, copy === 1)));
      }
    }
    updateSpeed();
  }

  async function init() {
    let rows;
    try {
      rows = await loadSheet(SPONSORS_SHEET_URL);
    } catch (e) {
      console.warn('sponsors', e);
      return; // bar stays hidden
    }

    sponsors = rows
      .map((r) => ({
        name: r.name || '',
        logo: r.logo || r.image || '',
        link: r.link || r.url || '',
        order: parseFloat(r.order) || 999,
        show: r.show || ''
      }))
      .filter((s) => s.name && !/^(no|n|false|hide)$/i.test(s.show))
      .sort((a, b) => a.order - b.order);

    if (!sponsors.length) return;
    bar.hidden = false;
    render();

    let timer;
    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(render, 250);
    });
  }

  init();
})();
