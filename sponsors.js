// Sponsors page: reads the same "sponsors" tab the header bar uses.
// Wrapped in a function so it can't clash with all.js.
(() => {
  // Published CSV link of the "sponsors" tab (same link as in all.js)
  const SPONSORS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTbuSz2W3-9TrBprkb3iMMsOYp5wBmMDHrBJVXlA_JiE3yUgmEyAVZjR0CTnjHuxtz7Tbhdp8PzNKjC/pub?gid=435942087&single=true&output=csv';

  const grid = document.querySelector('#sponsor-grid');
  if (!grid) return;

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
    return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w600` : link;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function buildCard(s) {
    const card = el('article', 'sponsor-card');
    const logoBox = el('div', 'sponsor-logo');
    const body = el('div', 'sponsor-body');
    const title = el('h3', '', s.name);

    const src = imageUrl(s.logo);
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = s.name;
      img.loading = 'lazy';
      // If the logo can't load, show the name big instead
      img.onerror = () => {
        logoBox.innerHTML = '';
        logoBox.appendChild(el('span', 'sponsor-logo-name', s.name));
        title.remove();
        if (!body.children.length) body.remove();
      };
      logoBox.appendChild(img);
      body.appendChild(title);
    } else {
      logoBox.appendChild(el('span', 'sponsor-logo-name', s.name));
    }

    if (s.message) body.appendChild(el('p', 'sponsor-message', s.message));

    if (/^https?:\/\//i.test(s.link)) {
      const a = el('a', 'sponsor-visit', 'Visit website →');
      a.href = s.link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', 'Visit ' + s.name + ' website (opens in a new tab)');
      body.appendChild(a);
    }

    card.appendChild(logoBox);
    if (body.children.length) card.appendChild(body);
    return card;
  }

  async function init() {
    let rows;
    try {
      rows = await loadSheet(SPONSORS_SHEET_URL);
    } catch (e) {
      console.warn('sponsors page', e);
      grid.innerHTML = '';
      grid.appendChild(el('p', 'sponsor-status', 'Sponsors could not be loaded right now. Please try again later.'));
      return;
    }

    const sponsors = rows
      .map((r) => ({
        name: r.name || '',
        logo: r.logo || r.image || '',
        link: r.link || r.url || '',
        message: r.message || r.note || r.notes || '',
        order: parseFloat(r.order) || 999,
        show: r.show || ''
      }))
      .filter((s) => s.name && !/^(no|n|false|hide)$/i.test(s.show))
      .sort((a, b) => a.order - b.order);

    grid.innerHTML = '';
    if (!sponsors.length) {
      grid.appendChild(el('p', 'sponsor-status', 'Sponsors will be listed here soon.'));
      return;
    }
    sponsors.forEach((s) => grid.appendChild(buildCard(s)));
  }

  init();
})();