/* ---------------------------------------------------------------------------
   Static site generator. Reads assets/js/data.js and writes real .html files -
   no framework, no runtime rendering, so every page is crawlable and works
   with JavaScript switched off.

     node build.js

   Run it after editing data.js or anything in this file.
   --------------------------------------------------------------------------- */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = __dirname;
const SITE = 'https://mkroofingaus.com.au';

// ------------------------------------------------------------------ load data
// data.js uses plain `const` declarations so it can be dropped straight into a
// page if ever needed. Those do not land on the sandbox object, so evaluate a
// trailing expression in the same script to hand them back.
const source = fs.readFileSync(path.join(ROOT, 'assets/js/data.js'), 'utf8');
const EXPORT = ';({ BUSINESS, SERVICES, AREAS, REVIEWS, FAQS })';
const { BUSINESS, SERVICES, AREAS, REVIEWS, FAQS } =
  vm.runInNewContext(source + '\n' + EXPORT);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = s => esc(s).replace(/"/g, '&quot;');
const telHref = `tel:${BUSINESS.phoneDial}`;

const DESIGN = SERVICES.filter(s => s.group === 'design');
const ROOFING = SERVICES.filter(s => s.group === 'roofing');

// Photos are dropped in by hand, so decide here whether one exists rather than
// shipping an onerror handler - a placeholder that is part of the markup lays
// out correctly instead of flashing a broken image first.
const hasImage = file => fs.existsSync(path.join(ROOT, 'assets/img', file));

function photo(file, alt) {
  return hasImage(file)
    ? `<img src="/assets/img/${file}" alt="${attr(alt)}" loading="lazy">`
    : `<div class="ph">${icon('image')}<span>${esc(file)}</span></div>`;
}

// -------------------------------------------------------------------- icons
const SPRITE = `
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
  <symbol id="i-phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></symbol>
  <symbol id="i-phone-ring" viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="28" cy="28" r="26"/><path d="M38 33.4v3a2.6 2.6 0 0 1-2.9 2.6 25.7 25.7 0 0 1-11.2-4 25.3 25.3 0 0 1-7.8-7.8 25.7 25.7 0 0 1-4-11.3A2.6 2.6 0 0 1 14.7 13h3a2.6 2.6 0 0 1 2.6 2.2c.2 1.3.5 2.5 1 3.7a2.6 2.6 0 0 1-.6 2.7l-1.7 1.7a20.8 20.8 0 0 0 7.8 7.8l1.7-1.7a2.6 2.6 0 0 1 2.7-.6c1.2.5 2.4.8 3.7 1a2.6 2.6 0 0 1 2.2 2.6Z" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="i-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></symbol>
  <symbol id="i-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
  <symbol id="i-star" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3L7 14.2l-5-4.9 6.9-1L12 2Z"/></symbol>
  <symbol id="i-check-circle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/></symbol>
  <symbol id="i-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></symbol>
  <symbol id="i-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/><path d="m6 20 6-6 6 6" opacity=".5"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></symbol>
  <symbol id="i-calendar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M7.5 14h.01M12 14h.01M16.5 14h.01M7.5 17.5h.01M12 17.5h.01"/></symbol>
  <symbol id="i-dollar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 6.5c0-2-2.2-3-5-3s-5 1-5 3.2 2 3 5 3.6 5 1.4 5 3.7-2.2 3.5-5 3.5-5-1.2-5-3.2"/></symbol>
  <symbol id="i-shield-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="m8 12.2 2.8 2.8L16.2 9"/></symbol>
  <symbol id="i-stopwatch" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13.5" r="8"/><path d="M12 9.5v4l2.5 2M9.5 2h5M19 6l1.6 1.6"/></symbol>
  <symbol id="i-compass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5.5-5.5 2 2-5.5 5.5-2Z"/></symbol>
  <symbol id="i-cube" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2.5 8.5 4.8v9.4L12 21.5 3.5 16.7V7.3L12 2.5Z"/><path d="m3.5 7.3 8.5 4.8 8.5-4.8M12 12.1v9.4"/></symbol>
  <symbol id="i-ruler" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="20" height="8" rx="1.5"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/></symbol>
  <symbol id="i-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></symbol>
  <symbol id="i-hammer" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.5 8.5a2.1 2.1 0 0 1-3-3L12 9"/><path d="M17.6 6.4 14 10l-4-4 3.6-3.6a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 1 0 2.8Z"/><path d="m14 10 6 6"/></symbol>
  <symbol id="i-sparkle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></symbol>
  <symbol id="i-layers" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/></symbol>
  <symbol id="i-drop" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 6.4 6 10.4A6 6 0 0 1 6 13.4C6 9.4 12 3 12 3Z"/></symbol>
  <symbol id="i-brush" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M18 3a3 3 0 0 1 3 3c0 2-3 4-8 8"/><path d="M9 14c-3 0-5 2-5 5 0 1 .4 2 .4 2s2-.4 3-1c1.6-1 2.6-2.6 2.6-4a2 2 0 0 0-1-2Z"/></symbol>
  <symbol id="i-panel" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19 8 5h8l5 14"/><path d="M8 5v14M13 5v14M18 5v14"/></symbol>
  <symbol id="i-ridge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18 12 6l10 12"/><path d="M7 18v-3M12 18v-6M17 18v-3"/></symbol>
  <symbol id="i-gutter" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h18v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z"/><path d="M8 14v6M16 14v3"/></symbol>
  <symbol id="i-pergola" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h18M4 8v13M20 8v13M3 5h18"/><path d="M8 8v3M12 8v3M16 8v3"/></symbol>
  <symbol id="i-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10.5 9-7 9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/></symbol>
  <symbol id="i-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v17H5.5A2.5 2.5 0 0 0 3 22.5V5.5Z"/><path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H13v17h5.5a2.5 2.5 0 0 1 2.5 2.5V5.5Z"/></symbol>
  <symbol id="i-image" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m4 17 5-4 4 3 3-2 4 3"/></symbol>
  <symbol id="i-fb" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1Z"/></symbol>
  <symbol id="i-google" viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 12.23c0-.7-.06-1.38-.18-2.03H12v3.84h5.4a4.62 4.62 0 0 1-2 3.03v2.5h3.24c1.9-1.75 3-4.32 3-7.34Z"/><path d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.24-2.5c-.9.6-2.05.96-3.4.96-2.6 0-4.8-1.76-5.6-4.12H3.07v2.58A10 10 0 0 0 12 22Z"/><path d="M6.4 13.9a5.98 5.98 0 0 1 0-3.8V7.52H3.07a10 10 0 0 0 0 8.96l3.33-2.58Z"/><path d="M12 5.98c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.96 9.96 0 0 0 12 2 10 10 0 0 0 3.07 7.52L6.4 10.1C7.2 7.74 9.4 5.98 12 5.98Z"/></symbol>
  <symbol id="i-map" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m9 4 6 2 5-2v14l-5 2-6-2-5 2V6l5-2Z"/><path d="M9 4v14M15 6v14"/></symbol>
</svg>`;

const icon = (id, cls = '') => `<svg${cls ? ` class="${cls}"` : ''} aria-hidden="true"><use href="#i-${id}"/></svg>`;

// ------------------------------------------------------------------ partials
function head({ title, description, canonical, extraHead = '' }) {
  return `<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${attr(description)}">
<link rel="canonical" href="${SITE}${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${attr(BUSINESS.name)}">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:image" content="${SITE}/assets/img/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#000000">
<link rel="icon" href="/assets/img/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Rubik:wght@300;400;500&display=swap">
<link rel="stylesheet" href="/assets/css/style.css">
${extraHead}
</head>
<body>`;
}

function header(active) {
  const on = p => (active === p ? ' class="is-active"' : '');
  const links = list => list.map(s =>
    `<a href="/services/${s.slug}.html">${esc(s.name)}</a>`).join('\n          ');

  return `
<header class="site-header">
  <div class="wrap header-inner">
    <a href="/" class="brand" aria-label="${attr(BUSINESS.name)} home">
      ${hasImage('logo.png')
        ? `<img class="brand-logo" src="/assets/img/logo.png" alt="" width="400" height="356">` : ''}
      <span class="brand-fallback">
        <span class="n">${esc(BUSINESS.name)}</span>
        <span class="t">${attr(BUSINESS.city)} &middot; ${attr(BUSINESS.state)}</span>
      </span>
    </a>

    <nav class="nav" aria-label="Main">
      <a href="/"${on('home')}>Home</a>
      <span class="has-menu">
        <button class="nav-trigger" type="button" aria-haspopup="true">Design ${icon('chev')}</button>
        <span class="nav-menu">
          ${links(DESIGN)}
        </span>
      </span>
      <span class="has-menu">
        <button class="nav-trigger" type="button" aria-haspopup="true">Roofing ${icon('chev')}</button>
        <span class="nav-menu">
          ${links(ROOFING)}
        </span>
      </span>
      <span class="has-menu">
        <button class="nav-trigger" type="button" aria-haspopup="true">Areas We Serve ${icon('chev')}</button>
        <span class="nav-menu">
          ${AREAS.slice(0, 10).map(a => `<a href="/contact.html">${esc(a)}</a>`).join('\n          ')}
        </span>
      </span>
      <a href="/about.html"${on('about')}>About</a>
      <a href="/contact.html"${on('contact')}>Contact</a>
    </nav>

    <div class="header-cta">
      <a href="${telHref}" class="btn btn--blue">${icon('phone')} ${esc(BUSINESS.phone)}</a>
      <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>

<div class="drawer" id="drawer" aria-hidden="true">
  <div class="drawer-top">
    ${hasImage('logo.png')
      ? `<img class="drawer-logo" src="/assets/img/logo.png" alt="${attr(BUSINESS.name)}">`
      : `<span class="brand-fallback"><span class="n">${esc(BUSINESS.name)}</span><span class="t">${attr(BUSINESS.city)} &middot; ${attr(BUSINESS.state)}</span></span>`}
    <button class="drawer-close" type="button" aria-label="Close menu">&times;</button>
  </div>
  <a href="/">Home</a>
  <div class="grp">Design</div>
  ${DESIGN.map(s => `<a class="sub" href="/services/${s.slug}.html">${esc(s.name)}</a>`).join('\n  ')}
  <div class="grp">Roofing</div>
  ${ROOFING.map(s => `<a class="sub" href="/services/${s.slug}.html">${esc(s.name)}</a>`).join('\n  ')}
  <a href="/services.html">All Services</a>
  <a href="/about.html">About</a>
  <a href="/contact.html">Contact</a>
  <a href="${telHref}" class="btn btn--blue btn--block">${icon('phone')} ${esc(BUSINESS.phone)}</a>
</div>`;
}

function blueBand() {
  const years = new Date().getFullYear() - BUSINESS.since;
  return `
<section class="wrap" style="padding-top:0;padding-bottom:0">
  <div class="band">
    <div class="band-left">
      ${icon('phone-ring', 'ring')}
      <div>
        <h3>Need Any Roofing Help?</h3>
        <a href="${telHref}">${esc(BUSINESS.phone)}</a>
      </div>
    </div>
    <div class="band-right">
      ${hasImage('band.jpg') ? `<img src="/assets/img/band.jpg" alt="" loading="lazy">` : ''}
      <div class="band-badge">
        <b>${years}</b><span>Years of Experience</span>
      </div>
    </div>
  </div>
</section>`;
}

function statsStrip() {
  return `
<section class="stats-strip">
  <div class="wrap stats-grid">
    ${BUSINESS.stats.map(s => `
    <div class="stat">
      <b>${esc(s.n)}</b>
      <span>${esc(s.label)}</span>
    </div>`).join('')}
  </div>
</section>`;
}

function footer(active) {
  const on = p => (active === p ? ' class="is-active"' : '');
  return `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand">
        ${hasImage('logo.png') ? `<img src="/assets/img/logo.png" alt="${attr(BUSINESS.name)}">` : ''}
        <p>We Always Deliver 100% Customer Satisfaction And Absolute Quality Work
           Without Any Other Compromise, Just Like We&rsquo;ve Been Doing Since ${BUSINESS.since}</p>
      </div>

      <div>
        <h4>Info Link</h4>
        <ul class="footer-links">
          <li><a href="/contact.html"${on('contact')}>Contact</a></li>
          <li><a href="/about.html"${on('about')}>About</a></li>
          <li><a href="/services.html"${on('services')}>Services</a></li>
          <li><a href="/contact.html#faq">FAQs</a></li>
        </ul>
      </div>

      <div>
        <h4>Our Services</h4>
        <ul class="footer-links">
          ${SERVICES.slice(0, 8).map(s => `<li><a href="/services/${s.slug}.html">${esc(s.name)}</a></li>`).join('\n          ')}
        </ul>
      </div>

      <div>
        <h4>Contact us</h4>
        <div class="footer-contact">
          <div>${icon('pin')}<span>${esc(BUSINESS.street)}<br>${esc(BUSINESS.city)}, ${esc(BUSINESS.state)} ${esc(BUSINESS.zip)}</span></div>
          <div>${icon('phone')}<a href="${telHref}">${esc(BUSINESS.phone)}</a></div>
          <div>${icon('mail')}<a href="mailto:${attr(BUSINESS.email)}">${esc(BUSINESS.email)}</a></div>
        </div>
        <div class="footer-social">
          <a href="${attr(BUSINESS.facebook)}" target="_blank" rel="noopener" aria-label="Facebook">${icon('fb')}</a>
          <a href="${attr(BUSINESS.google)}" target="_blank" rel="noopener" aria-label="Google Maps">${icon('map')}</a>
        </div>
        <p>Copyright &copy; ${new Date().getFullYear()} ${esc(BUSINESS.name)}</p>
        <p>${esc(BUSINESS.license)}</p>
      </div>
    </div>
    <div class="footer-bottom"></div>
  </div>
</footer>

<a href="#top" class="to-top" id="to-top" aria-label="Back to top">${icon('up')}</a>
${SPRITE}
<script src="/assets/js/site.js" defer></script>
</body>
</html>`;
}

// quote form, reused in the hero, on the contact page and beside the map
function quoteForm({ title, id = 'quote-form', cls = 'quote-card' }) {
  const options = SERVICES.map(s => `<option>${esc(s.name)}</option>`).join('\n        ');
  return `
<form class="${cls}" id="${id}" novalidate>
  <h2>${esc(title)}</h2>
  <div class="field"><input name="name" type="text" placeholder="Name" autocomplete="name" required></div>
  <div class="field"><input name="email" type="email" placeholder="Email" autocomplete="email"></div>
  <div class="field"><input name="phone" type="tel" placeholder="Phone" autocomplete="tel" required></div>
  <div class="field"><input name="address" type="text" placeholder="Address" autocomplete="street-address"></div>
  <div class="field">
    <select name="service">
      <option value="">What do you need?</option>
      ${options}
    </select>
  </div>
  <div class="field"><textarea name="detail" placeholder="Describe the project or the issue you are facing."></textarea></div>
  <button type="submit" class="btn btn--blue btn--block">Send Request</button>
  <p class="form-note">No cost, no obligation. We never pass your details on.</p>
  <p class="form-status" id="status-${id}" hidden></p>
</form>`;
}

// --------------------------------------------------------------- json-ld
function localBusinessSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    name: BUSINESS.name,
    url: SITE,
    telephone: BUSINESS.phoneDial,
    email: BUSINESS.email,
    image: `${SITE}/assets/img/logo.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.street,
      addressLocality: BUSINESS.city,
      addressRegion: BUSINESS.state,
      postalCode: BUSINESS.zip,
      addressCountry: 'US',
    },
    areaServed: AREAS.map(a => ({ '@type': 'Place', name: a })),
    makesOffer: SERVICES.map(s => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s.name, description: s.short },
    })),
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function serviceCards(list) {
  return list.map((s, i) => `
      <article class="svc-card">
        <div class="svc-thumb">${photo(`service-${s.slug}.jpg`, s.name)}</div>
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.short)}</p>
        <a href="/services/${s.slug}.html" class="btn btn--blue">Learn more</a>
      </article>`).join('');
}

// ==================================================================== pages
const pages = {};
const featured = SERVICES.filter(s => s.featured);
const years = new Date().getFullYear() - BUSINESS.since;

/* ------------------------------------------------------------------- home */
pages['index.html'] = head({
  title: `${BUSINESS.name} | Architectural Design & Roofing in ${BUSINESS.city}, ${BUSINESS.state}`,
  description: `Architectural design, 3D visualization, interior planning and professional roofing services in ${BUSINESS.city}, ${BUSINESS.state}. Free inspection and a ${BUSINESS.warrantyYears}-year workmanship warranty.`,
  canonical: '/',
  extraHead: localBusinessSchema(),
}) + header('home') + `
<a id="top"></a>

<section class="hero">
  ${hasImage('hero.jpg') ? `<div class="hero-media"><img src="/assets/img/hero.jpg" alt=""></div>` : ''}
  <div class="wrap">
    <div class="hero-grid">
      <div>
        <h1>Design &amp; Roofing Services in ${esc(BUSINESS.city)} &ndash; Fast &amp; Reliable</h1>
        <ul class="hero-list">
          <li>${icon('star')} Architectural design &amp; permit drawings</li>
          <li>${icon('star')} 3D visualization and walkthroughs</li>
          <li>${icon('star')} Interior planning and finishes</li>
          <li>${icon('star')} Free roof inspection</li>
          <li>${icon('star')} Roof repair, replacement and coating</li>
          <li>${icon('star')} ${BUSINESS.warrantyYears}-Year Workmanship Warranty</li>
        </ul>
        <p class="hero-cta-label">Book Your Free Consultation Today!</p>
        <a href="${telHref}" class="btn btn--blue">${icon('phone')} ${esc(BUSINESS.phone)}</a>
      </div>

      <div>${quoteForm({ title: 'Free Quote' })}</div>
    </div>
  </div>
</section>

${statsStrip()}

<section class="section">
  <div class="wrap about-grid">
    <div>
      <span class="eyebrow">Get to know</span>
      <h2 class="duo"><b>We&rsquo;re Committed To Provide</b><span>Best Design &amp; Roofing Services</span></h2>
      <p>A design and roofing company in ${esc(BUSINESS.city)}, we work on residential and
         commercial projects &mdash; from architectural drawings and 3D renders through to
         roof repair and full replacement, committed to safeguarding your investment and
         ensuring your family&rsquo;s safety.</p>

      <div class="feature-item">
        ${icon('compass')}
        <div>
          <h4>Design &amp; Visualization</h4>
          <p>Architectural drawings, photoreal renders and interior planning &mdash; so you can
             see and approve the whole project before a single tile is lifted.</p>
        </div>
      </div>
      <div class="feature-item">
        ${icon('home')}
        <div>
          <h4>Build Roof Standard</h4>
          <p>Trust ${esc(BUSINESS.name)} for durable, weather-resistant roofs. We ensure the
             highest quality and safety for your home.</p>
        </div>
      </div>
    </div>

    <div class="media-frame">${photo('about.jpg', `${BUSINESS.name} team at work`)}</div>
  </div>
</section>

<section style="padding-bottom:clamp(40px,5vw,64px)">
  <div class="wrap">
    <div class="usp-grid">
      <div class="usp">
        ${icon('calendar')}
        <h4>${BUSINESS.warrantyYears}-Year Warranty</h4>
        <p>We stand by the quality of our workmanship with a solid ${BUSINESS.warrantyYears}-year
           warranty on all roof repairs and installations. This long-term protection gives you
           complete peace of mind and confidence in our services.</p>
      </div>
      <div class="usp">
        ${icon('dollar')}
        <h4>Affordable Pricing</h4>
        <p>Quality work doesn&rsquo;t have to break the bank. At ${esc(BUSINESS.name)}, we offer
           competitive and transparent pricing tailored to suit your budget without compromising
           on workmanship.</p>
      </div>
      <div class="usp">
        ${icon('shield-check')}
        <h4>Emergency Roof Repairs</h4>
        <p>When disaster strikes, we&rsquo;re ready to respond fast. Our emergency roof repair team
           is available to protect your home from leaks, storm damage, and urgent structural
           issues &ndash; 24/7.</p>
      </div>
      <div class="usp">
        ${icon('stopwatch')}
        <h4>Flexible Scheduling</h4>
        <p>We work around your schedule, not the other way around. Whether you need a weekend
           visit or a same-day inspection, we make it easy and convenient to get the help you need.</p>
      </div>
    </div>

    <div class="btn-row is-center" style="margin-top:38px">
      <a href="${telHref}" class="btn btn--blue">${icon('phone')} ${esc(BUSINESS.phone)}</a>
      <a href="/contact.html" class="btn btn--blue">Request Quote</a>
    </div>
  </div>
</section>

<section class="section section--band">
  <div class="wrap">
    <div class="section-head center">
      <h2>Design &amp; Roofing Services for ${esc(BUSINESS.city)}</h2>
      <p class="lede">At ${esc(BUSINESS.name)}, we provide more than roofing &mdash; architectural
        design, 3D visualization and interior planning sit alongside a full roofing service, all
        backed by a ${BUSINESS.warrantyYears}-year warranty. Proudly serving
        ${esc(BUSINESS.region)}, from minor repairs to ground-up projects.</p>
    </div>
    <div class="card-grid">${serviceCards(featured)}</div>
    <div class="btn-row is-center" style="margin-top:40px">
      <a href="/services.html" class="btn btn--blue">See all ${SERVICES.length} services</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap copy-grid">
    <div>
      <h3>Expert Designers &amp; Roofers in ${esc(BUSINESS.city)}</h3>
      <p>Looking for a reliable design and roofing team in ${esc(BUSINESS.city)}? Our licensed and
         insured professionals deliver top-quality workmanship on every project. Whether you need
         permit drawings, a set of renders or a full roof replacement, we provide efficient and
         affordable service ${esc(BUSINESS.city)} homeowners trust.</p>
    </div>
    <div>
      <h3>Leading Design Company in ${esc(BUSINESS.state)}</h3>
      <p>As a trusted contractor in ${esc(BUSINESS.region)}, we specialise in residential and
         commercial projects of all sizes. Our architects and roofing crews use premium materials
         and proven detailing to ensure lasting protection for your home or business.</p>
    </div>
    <div>
      <h3>Affordable Roofing Services ${esc(BUSINESS.city)}</h3>
      <p>We offer the comprehensive services ${esc(BUSINESS.city)} property owners rely on &mdash;
         from leak repairs and flat roof coatings to full restorations. Honest estimates, timely
         service and unmatched quality workmanship across every neighborhood we serve.</p>
    </div>
  </div>
</section>

${blueBand()}

<section class="section">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow is-center">Reviews</span>
      <h2>What our customers say</h2>
    </div>
    <div class="review-grid">
      ${REVIEWS.length ? REVIEWS.map(r => `
      <blockquote class="review">
        <div class="review-head">
          <span class="avatar">${esc(r.name.charAt(0))}</span>
          <b>${esc(r.name)}</b>
          ${icon(r.source === 'Facebook' ? 'fb' : 'google')}
        </div>
        <div class="review-body">${esc(r.text)}</div>
      </blockquote>`).join('') : `
      <div class="review-empty">
        Reviews for ${esc(BUSINESS.name)} will appear here.
        Add them to <code>REVIEWS</code> in <code>assets/js/data.js</code> and rebuild.
      </div>`}
    </div>
  </div>
</section>

<section class="section section--band">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow is-center">Explore recent works</span>
      <h2>Our Latest Projects And Recent Works</h2>
    </div>
    <div class="card-grid">
      ${['work-1.jpg', 'work-2.jpg', 'work-3.jpg', 'work-4.jpg', 'work-5.jpg', 'work-6.jpg']
        .map(f => `<div class="media-frame">${photo(f, 'Recent project')}</div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap map-grid">
    <div class="map-frame">
      <iframe title="${attr(BUSINESS.name)} location" loading="lazy"
        src="https://maps.google.com/maps?q=${encodeURIComponent(BUSINESS.address)}&z=12&output=embed"></iframe>
    </div>
    <div>${quoteForm({ title: 'Book Now', id: 'book-form', cls: 'book-card' })}</div>
  </div>
</section>

` + footer('home');

/* --------------------------------------------------------------- services */
pages['services.html'] = head({
  title: `Our Services | ${BUSINESS.name}`,
  description: `Architectural design, 3D visualization, interior planning and full roofing services across ${BUSINESS.region}.`,
  canonical: '/services.html',
}) + header('services') + `
<a id="top"></a>
<div class="page-head">
  <div class="wrap">
    <h1>Our Services</h1>
    <p class="crumb"><a href="/">Home</a> / Services</p>
  </div>
</div>

<section class="section">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow is-center">Design</span>
      <h2>Architecture, visualization &amp; interiors</h2>
    </div>
    <div class="card-grid">${serviceCards(DESIGN)}</div>
  </div>
</section>

<section class="section section--band">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow is-center">Roofing</span>
      <h2>Repair, replacement &amp; maintenance</h2>
    </div>
    <div class="card-grid">${serviceCards(ROOFING)}</div>
  </div>
</section>

${blueBand()}
` + footer('services');

/* ------------------------------------------------------ service detail pages */
SERVICES.forEach(s => {
  const sameGroup = SERVICES.filter(x => x.group === s.group);
  pages[`services/${s.slug}.html`] = head({
    title: `${s.name} in ${BUSINESS.city}, ${BUSINESS.state} | ${BUSINESS.name}`,
    description: s.short,
    canonical: `/services/${s.slug}.html`,
    extraHead: `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: s.name,
      description: s.short,
      areaServed: BUSINESS.region,
      provider: { '@type': 'GeneralContractor', name: BUSINESS.name, telephone: BUSINESS.phoneDial },
    })}</script>`,
  }) + header('services') + `
<a id="top"></a>
<div class="page-head">
  <div class="wrap">
    <h1>${esc(s.name)}</h1>
    <p class="crumb"><a href="/">Home</a> / <a href="/services.html">Services</a> / ${esc(s.name)}</p>
  </div>
</div>

<section class="section">
  <div class="wrap split">
    <div class="prose">
      <div class="media-frame" style="margin-bottom:30px">${photo(`service-${s.slug}.jpg`, s.name)}</div>
      <p class="lede" style="margin-bottom:24px">${esc(s.short)}</p>
      ${s.body.map(p => `<p>${esc(p)}</p>`).join('\n      ')}

      <h2>What&rsquo;s included</h2>
      <ul class="tick-list">
        ${s.includes.map(x => `<li>${icon('check-circle')}<span>${esc(x)}</span></li>`).join('\n        ')}
      </ul>

      <h2>Why customers choose us for this</h2>
      <p>Every ${s.name.toLowerCase()} job starts with a free consultation and a written scope, so
         you can see what is involved before you spend anything. The estimate is fixed and
         itemized, and our workmanship is covered for ${BUSINESS.warrantyYears} years in writing.</p>

      <div class="btn-row" style="margin-top:28px">
        <a href="${telHref}" class="btn btn--blue">${icon('phone')} ${esc(BUSINESS.phone)}</a>
        <a href="/contact.html" class="btn btn--outline">Request a free quote</a>
      </div>
    </div>

    <aside class="aside-card">
      <h3>${s.group === 'design' ? 'Design services' : 'Roofing services'}</h3>
      <ul class="aside-list">
        ${sameGroup.map(x => `<li><a href="/services/${x.slug}.html"${x.slug === s.slug ? ' class="is-active"' : ''}>${esc(x.name)}</a></li>`).join('\n        ')}
      </ul>
      <h3 style="margin-top:26px">${s.group === 'design' ? 'Roofing services' : 'Design services'}</h3>
      <ul class="aside-list">
        ${(s.group === 'design' ? ROOFING : DESIGN).map(x => `<li><a href="/services/${x.slug}.html">${esc(x.name)}</a></li>`).join('\n        ')}
      </ul>
      <a href="${telHref}" class="btn btn--blue btn--block" style="margin-top:22px">${icon('phone')} ${esc(BUSINESS.phone)}</a>
    </aside>
  </div>
</section>

${blueBand()}
` + footer('services');
});

/* -------------------------------------------------------------------- about */
pages['about.html'] = head({
  title: `About Us | ${BUSINESS.name}`,
  description: `${BUSINESS.name} provides architectural design, 3D visualization, interior planning and roofing services in ${BUSINESS.city}, ${BUSINESS.state}.`,
  canonical: '/about.html',
}) + header('about') + `
<a id="top"></a>
<div class="page-head">
  <div class="wrap">
    <h1>About ${esc(BUSINESS.name)}</h1>
    <p class="crumb"><a href="/">Home</a> / About</p>
  </div>
</div>

<section class="section">
  <div class="wrap split">
    <div class="prose">
      <span class="eyebrow">Who we are</span>
      <h2 class="duo"><b>Design and roofing,</b><span>under one roof</span></h2>
      <p>${esc(BUSINESS.name)} is a ${esc(BUSINESS.city)} contractor covering both sides of a
         project: the drawings and the build. Architectural design, 3D visualization and interior
         planning sit alongside a full roofing service, so a remodel can be drawn, rendered and
         roofed without handing you between three companies.</p>
      <p>We work across ${esc(BUSINESS.region)} for homeowners, landlords and builders, on
         everything from a single leak through to a ground-up project.</p>

      <h2>How we work</h2>
      <ul class="tick-list">
        <li>${icon('check-circle')}<span>Free consultation and written scope before you spend anything</span></li>
        <li>${icon('check-circle')}<span>Fixed, itemized estimates &mdash; no variations unless you approve them</span></li>
        <li>${icon('check-circle')}<span>Honest advice about what needs doing now and what can wait</span></li>
        <li>${icon('check-circle')}<span>${BUSINESS.warrantyYears}-year workmanship warranty in writing</span></li>
        <li>${icon('check-circle')}<span>Site left clean, every day, not just at the end</span></li>
      </ul>

      <h2>Insurance and storm damage</h2>
      <p>After a hail or wind event we document the damage the way adjusters want it &mdash; dated
         photos, a written cause-of-damage summary and an itemized estimate. If your claim needs a
         second opinion on a scope of works, we can provide that too.</p>
    </div>

    <aside class="aside-card">
      <h3>At a glance</h3>
      <ul class="aside-list">
        <li><a>${esc(BUSINESS.street)}</a></li>
        <li><a>${esc(BUSINESS.city)}, ${esc(BUSINESS.state)} ${esc(BUSINESS.zip)}</a></li>
        <li><a>Serving ${esc(BUSINESS.region)}</a></li>
        <li><a>Operating since ${BUSINESS.since}</a></li>
        <li><a>${BUSINESS.warrantyYears}-year workmanship warranty</a></li>
      </ul>
      <a href="/contact.html" class="btn btn--blue btn--block" style="margin-top:22px">Request a free quote</a>
    </aside>
  </div>
</section>

<section class="section section--band">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow is-center">Coverage</span>
      <h2>Areas we serve</h2>
    </div>
    <ul class="area-list">
      ${AREAS.map(a => `<li>${esc(a)}</li>`).join('\n      ')}
    </ul>
  </div>
</section>

${blueBand()}
` + footer('about');

/* ------------------------------------------------------------------ contact */
pages['contact.html'] = head({
  title: `Contact | Free Quote in ${BUSINESS.city}, ${BUSINESS.state} | ${BUSINESS.name}`,
  description: `Call ${BUSINESS.phone} or send a quote request. Design and roofing services across ${BUSINESS.region}.`,
  canonical: '/contact.html',
  extraHead: `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  })}</script>`,
}) + header('contact') + `
<a id="top"></a>
<div class="page-head">
  <div class="wrap">
    <h1>Get in Touch</h1>
    <p class="crumb"><a href="/">Home</a> / Contact</p>
  </div>
</div>

<section class="section">
  <div class="wrap split">
    <div>
      <span class="eyebrow">Booking form</span>
      <h2 style="margin-bottom:22px">Send Quote Request</h2>
      ${quoteForm({ title: '', id: 'contact-form', cls: 'quote-card' }).replace('<h2></h2>\n', '')}
    </div>

    <aside class="info-card">
      <span class="eyebrow">Information</span>
      <h2 style="margin-bottom:14px">Contact details</h2>
      <p style="margin-bottom:10px">Contact us for <strong>professional design and roofing
        solutions</strong> tailored to your needs. Reach out today for a free estimate.</p>

      <div class="info-row">
        <span class="info-ico">${icon('pin')}</span>
        <span><b>Address</b>${esc(BUSINESS.street)}<br>${esc(BUSINESS.city)}, ${esc(BUSINESS.state)} ${esc(BUSINESS.zip)}</span>
      </div>
      <div class="info-row">
        <span class="info-ico">${icon('mail')}</span>
        <span><b>Email Us</b><a href="mailto:${attr(BUSINESS.email)}">${esc(BUSINESS.email)}</a></span>
      </div>
      <div class="info-row">
        <span class="info-ico">${icon('phone')}</span>
        <span><b>Phone</b><a href="${telHref}">${esc(BUSINESS.phone)}</a></span>
      </div>
      <div class="info-row">
        <span class="info-ico">${icon('clock')}</span>
        <span><b>Hours</b>${BUSINESS.hours.map(h => `${esc(h.days)} &mdash; ${esc(h.time)}`).join('<br>')}</span>
      </div>
    </aside>
  </div>
</section>

<section class="section section--band" id="faq">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow is-center">FAQs</span>
      <h2>Questions we get asked a lot</h2>
    </div>
    <div class="faq">
      ${FAQS.map(f => `
      <div class="faq-item">
        <button class="faq-q" type="button" aria-expanded="false">${esc(f.q)} ${icon('plus')}</button>
        <div class="faq-a"><p>${esc(f.a)}</p></div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap map-frame">
    <iframe title="${attr(BUSINESS.name)} location" loading="lazy"
      src="https://maps.google.com/maps?q=${encodeURIComponent(BUSINESS.address)}&z=12&output=embed"></iframe>
  </div>
</section>

${blueBand()}
` + footer('contact');

/* ----------------------------------------------------------- 404 + sitemap */
pages['404.html'] = head({
  title: `Page not found | ${BUSINESS.name}`,
  description: 'That page does not exist.',
  canonical: '/404.html',
}) + header('') + `
<a id="top"></a>
<section class="section center">
  <div class="wrap">
    <span class="eyebrow is-center">404</span>
    <h1>We could not find that page</h1>
    <p class="lede" style="margin-bottom:26px">It may have moved. Try our services, or just give us a call.</p>
    <div class="btn-row is-center">
      <a href="/" class="btn btn--outline">Back to home</a>
      <a href="${telHref}" class="btn btn--blue">${icon('phone')} ${esc(BUSINESS.phone)}</a>
    </div>
  </div>
</section>
` + footer('');

const urls = ['/', '/services.html', '/about.html', '/contact.html']
  .concat(SERVICES.map(s => `/services/${s.slug}.html`));

pages['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}
</urlset>
`;

pages['robots.txt'] = `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`;

// ------------------------------------------------------------------- write
let count = 0;
for (const [file, html] of Object.entries(pages)) {
  const out = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html, 'utf8');
  count++;
}
console.log(`Built ${count} files from ${SERVICES.length} services (${DESIGN.length} design, ${ROOFING.length} roofing).`);
