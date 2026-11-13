// Shared site chrome: keep navigation and footer markup consistent on every page.
const sharedHeader = `
  <header class="site-header">
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

// Mark the active destination and keep the small-screen navigation accessible.
const currentPage = location.pathname.endsWith('/storefront.html')
  ? 'storefront'
  : location.pathname.endsWith('/gallary.html')
    ? 'gallery'
    : 'home';
const currentLink = document.querySelector(`[data-page="${currentPage}"]`);
if (currentLink) currentLink.setAttribute('aria-current', 'page');

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
