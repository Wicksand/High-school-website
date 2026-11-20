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
      <button class="menu-toggle" type="button" aria-label="Open site menu" aria-expanded="false" aria-controls="mobile-drawer">
        <span class="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>
      </button>
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

// Add page-specific section links here. Each entry appears beneath its site
// link in every mobile drawer and in the desktop page navigation on that page.
const PAGE_NAVIGATION = {
  home: [
    { id: 'updates', label: 'Latest Update' },
    { id: 'schedule', label: 'Calendars' },
    { id: 'registration', label: 'Registration' },
    { id: 'about', label: 'About' }
  ]
};
const PAGE_PATHS = {
  home: 'index.html',
  storefront: 'storefront.html',
  gallery: 'gallary.html',
  sponsors: 'sponsors.html'
};

// Add shared elements before page-specific scripts initialize.
document.body.insertAdjacentHTML('afterbegin', sharedHeader);
document.body.insertAdjacentHTML('beforeend', sharedFooter);

// The mobile drawer combines shared site links with any page-specific links.
const siteHeader = document.querySelector('.site-header');
const mainNav = document.querySelector('#main-nav');
const menuButton = document.querySelector('.menu-toggle');
const navHome = document.createComment('main navigation placement');
const mobileDrawer = document.createElement('aside');
mobileDrawer.id = 'mobile-drawer';
mobileDrawer.className = 'mobile-drawer';
mobileDrawer.setAttribute('aria-label', 'Site menu');
const drawerNav = document.createElement('div');
drawerNav.className = 'drawer-navigation';
mobileDrawer.appendChild(drawerNav);
const drawerBackdrop = document.createElement('button');
drawerBackdrop.className = 'drawer-backdrop';
drawerBackdrop.type = 'button';
drawerBackdrop.setAttribute('aria-label', 'Close site menu');
drawerBackdrop.setAttribute('tabindex', '-1');
siteHeader.after(drawerBackdrop, mobileDrawer);
mainNav.before(navHome);

const currentPage = location.pathname.endsWith('/storefront.html')
  ? 'storefront'
  : location.pathname.endsWith('/gallary.html')
    ? 'gallery'
    : location.pathname.endsWith('/sponsors.html')
      ? 'sponsors'
      : 'home';
const currentLink = mainNav.querySelector(`[data-page="${currentPage}"]`);
if (currentLink) currentLink.setAttribute('aria-current', 'page');

function createPageLinks(pageKey, items, id = '') {
  const links = document.createElement('nav');
  if (id) links.id = id;
  links.className = 'quick-links';
  links.setAttribute('aria-label', 'Page navigation');

  items.forEach(({ id: sectionId, label }, index) => {
    const link = document.createElement('a');
    link.href = `${PAGE_PATHS[pageKey] || `${pageKey}.html`}#${sectionId}`;
    const number = document.createElement('span');
    number.textContent = String(index + 1);
    link.append(number, document.createTextNode(label));
    links.appendChild(link);
  });
  return links;
}

const pageNavigationItems = PAGE_NAVIGATION[currentPage] || [];
let pageMenu = null;
let pageLinks = null;
const mobilePageNavGroups = new Map();

Object.entries(PAGE_NAVIGATION).forEach(([pageKey, items]) => {
  const siteLink = mainNav.querySelector(`[data-page="${pageKey}"]`);
  if (!siteLink || !items.length) return;

  const group = document.createElement('div');
  group.className = 'page-nav-group';
  group.append(createPageLinks(pageKey, items));
  mobilePageNavGroups.set(pageKey, group);
});

if (pageNavigationItems.length) {
  pageMenu = document.createElement('div');
  pageMenu.className = 'quick-strip';
  pageLinks = createPageLinks(currentPage, pageNavigationItems, 'page-links');

  const pageMain = document.querySelector('main');
  pageMain?.insertBefore(pageMenu, pageMain.firstChild);
}

function placeNavigation() {
  const isMobile = window.matchMedia('(max-width: 800px)').matches;
  if (isMobile) {
    drawerNav.append(mainNav);
    mobilePageNavGroups.forEach((group, pageKey) => {
      const siteLink = mainNav.querySelector(`[data-page="${pageKey}"]`);
      siteLink?.after(group);
    });
  } else {
    mobilePageNavGroups.forEach((group) => group.remove());
    navHome.after(mainNav);
    if (pageLinks && pageMenu) pageMenu.append(pageLinks);
  }
}
placeNavigation();

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

function closeMobileMenu() {
  mobileDrawer.classList.remove('is-open');
  drawerBackdrop.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open site menu');
}

menuButton.addEventListener('click', () => {
  const isOpen = mobileDrawer.classList.toggle('is-open');
  drawerBackdrop.classList.toggle('is-open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close site menu' : 'Open site menu');
});

drawerBackdrop.addEventListener('click', closeMobileMenu);
drawerNav.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMobileMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMobileMenu();
});
window.addEventListener('resize', () => {
  const wasMobile = drawerNav.contains(mainNav);
  placeNavigation();
  if (wasMobile !== drawerNav.contains(mainNav)) closeMobileMenu();
});


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
