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
const EXPORT = ';({ BUSINESS, SERVICES, SUBURBS, REVIEWS, FAQS })';
const { BUSINESS, SERVICES, SUBURBS, REVIEWS, FAQS } =
  vm.runInNewContext(source + '\n' + EXPORT);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = s => esc(s).replace(/"/g, '&quot;');
const telHref = `tel:${BUSINESS.phoneDial}`;

// -------------------------------------------------------------------- icons
// One sprite, injected into every page so icons never cost a request.
const SPRITE = `
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
  <symbol id="i-phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></symbol>
  <symbol id="i-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></symbol>
  <symbol id="i-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></symbol>
  <symbol id="i-check-circle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6 6 6-6 6"/></symbol>
  <symbol id="i-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></symbol>
  <symbol id="i-badge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8"/></symbol>
  <symbol id="i-wallet" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M17 15h.01"/></symbol>
  <symbol id="i-bolt" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></symbol>
  <symbol id="i-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></symbol>
  <symbol id="i-hammer" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.5 8.5a2.1 2.1 0 0 1-3-3L12 9"/><path d="M17.6 6.4 14 10l-4-4 3.6-3.6a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 1 0 2.8Z"/><path d="m14 10 6 6"/></symbol>
  <symbol id="i-sparkle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></symbol>
  <symbol id="i-layers" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/></symbol>
  <symbol id="i-drop" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 6.4 6 10.4A6 6 0 0 1 6 13.4C6 9.4 12 3 12 3Z"/></symbol>
  <symbol id="i-brush" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M18 3a3 3 0 0 1 3 3c0 2-3 4-8 8"/><path d="M9 14c-3 0-5 2-5 5 0 1 .4 2 .4 2s2-.4 3-1c1.6-1 2.6-2.6 2.6-4a2 2 0 0 0-1-2Z"/></symbol>
  <symbol id="i-panel" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19 8 5h8l5 14"/><path d="M8 5v14M13 5v14M18 5v14"/></symbol>
  <symbol id="i-ridge" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18 12 6l10 12"/><path d="M7 18v-3M12 18v-6M17 18v-3"/></symbol>
  <symbol id="i-gutter" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h18v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z"/><path d="M8 14v6M16 14v3"/></symbol>
  <symbol id="i-tile" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 12h18M9 5v14M15 5v14"/></symbol>
  <symbol id="i-spray" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="9" width="8" height="12" rx="2"/><path d="M11 9V5h4M19 5h.01M19 9h.01M22 7h.01"/></symbol>
  <symbol id="i-pergola" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h18M4 8v13M20 8v13M3 5h18"/><path d="M8 8v3M12 8v3M16 8v3"/></symbol>
  <symbol id="i-image" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m4 17 5-4 4 3 3-2 4 3"/></symbol>
  <symbol id="i-fb" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1Z"/></symbol>
  <symbol id="i-map" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m9 4 6 2 5-2v14l-5 2-6-2-5 2V6l5-2Z"/><path d="M9 4v14M15 6v14"/></symbol>
</svg>`;

const icon = (id, cls = '') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;

// Photos are dropped in by hand, so decide here whether one exists rather than
// shipping an onerror handler - a placeholder that is part of the markup lays
// out correctly instead of flashing a broken image first.
const hasImage = file => fs.existsSync(path.join(ROOT, 'assets/img', file));

function photo(file, alt, cls = '') {
  return hasImage(file)
    ? `<img${cls ? ` class="${cls}"` : ''} src="/assets/img/${file}" alt="${attr(alt)}" loading="lazy">`
    : `<div class="ph">${icon('image')}<span>${esc(file)}</span></div>`;
}

// ------------------------------------------------------------------ partials
function head({ title, description, canonical, extraHead = '' }) {
  return `<!DOCTYPE html>
<html lang="en-AU">
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
<meta property="og:image" content="${SITE}/assets/img/logo.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0e1620">
<link rel="icon" href="/assets/img/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/favicon.png">
<link rel="preload" as="style" href="/assets/css/style.css">
<link rel="stylesheet" href="/assets/css/style.css">
${extraHead}
</head>
<body>`;
}

function header(active) {
  const on = p => (active === p ? ' class="is-active"' : '');
  const menu = SERVICES.map(s =>
    `<a href="/services/${s.slug}.html">${esc(s.name)}</a>`).join('\n          ');

  return `
<div class="topline">
  <div class="wrap">
    <span>Free roof inspection across <strong>${esc(BUSINESS.region)}</strong></span>
    <span class="topline-right">
      <a href="mailto:${attr(BUSINESS.email)}">${esc(BUSINESS.email)}</a>
      <a href="${telHref}"><strong>${esc(BUSINESS.phone)}</strong></a>
    </span>
  </div>
</div>

<header class="site-header">
  <div class="wrap header-inner">
    <a href="/" class="brand" aria-label="${attr(BUSINESS.name)} home">
      <img class="brand-logo" src="/assets/img/logo.png" alt="${attr(BUSINESS.name)}"
           onerror="this.hidden=true;this.nextElementSibling.hidden=false">
      <span class="brand-fallback" hidden>
        <span class="n">MK Roofing AUS</span>
        <span class="t">Canberra &middot; ACT</span>
      </span>
    </a>

    <nav class="nav" aria-label="Main">
      <a href="/"${on('home')}>Home</a>
      <span class="has-menu">
        <button class="nav-trigger" type="button" aria-haspopup="true">Services ${icon('chev')}</button>
        <span class="nav-menu">
          ${menu}
        </span>
      </span>
      <a href="/services.html"${on('services')}>All Services</a>
      <a href="/about.html"${on('about')}>About</a>
      <a href="/contact.html"${on('contact')}>Contact</a>
    </nav>

    <div class="header-cta">
      <a href="/contact.html" class="btn btn--ghost">Free Quote</a>
      <a href="${telHref}" class="btn btn--primary">${icon('phone')} ${esc(BUSINESS.phone)}</a>
      <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>

<div class="drawer" id="drawer" aria-hidden="true">
  <div class="drawer-top">
    <span class="brand-fallback"><span class="n">MK Roofing AUS</span><span class="t">Canberra &middot; ACT</span></span>
    <button class="drawer-close" type="button" aria-label="Close menu">&times;</button>
  </div>
  <a href="/">Home</a>
  <a href="/services.html">All Services</a>
  ${SERVICES.map(s => `<a class="sub" href="/services/${s.slug}.html">${esc(s.name)}</a>`).join('\n  ')}
  <a href="/about.html">About</a>
  <a href="/contact.html">Contact</a>
  <a href="${telHref}" class="btn btn--primary btn--block">${icon('phone')} ${esc(BUSINESS.phone)}</a>
</div>`;
}

function ctaBand() {
  return `
<section class="cta-band">
  <div class="wrap">
    <div>
      <h2>Get a free roof inspection</h2>
      <p>Photos, an honest assessment and a fixed quote &mdash; at no cost.</p>
    </div>
    <div class="btn-row">
      <a href="${telHref}" class="btn btn--ghost">${icon('phone')} ${esc(BUSINESS.phone)}</a>
      <a href="/contact.html" class="btn btn--dark">Request a quote</a>
    </div>
  </div>
</section>`;
}

function footer() {
  return `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand">
        <img src="/assets/img/logo.png" alt="${attr(BUSINESS.name)}" onerror="this.hidden=true">
        <p>Roof repairs, restorations and replacements across ${esc(BUSINESS.region)}.
           Licensed, insured and backed by a ${BUSINESS.warrantyYears}-year workmanship warranty.</p>
        <div class="footer-social">
          <a href="${attr(BUSINESS.facebook)}" target="_blank" rel="noopener" aria-label="Facebook">${icon('fb')}</a>
          <a href="${attr(BUSINESS.google)}" target="_blank" rel="noopener" aria-label="Google Maps">${icon('map')}</a>
        </div>
      </div>

      <div>
        <h4>Services</h4>
        <ul class="footer-links">
          ${SERVICES.slice(0, 7).map(s => `<li><a href="/services/${s.slug}.html">${esc(s.name)}</a></li>`).join('\n          ')}
          <li><a href="/services.html">View all &rarr;</a></li>
        </ul>
      </div>

      <div>
        <h4>Company</h4>
        <ul class="footer-links">
          <li><a href="/about.html">About us</a></li>
          <li><a href="/services.html">All services</a></li>
          <li><a href="/contact.html">Contact</a></li>
          <li><a href="/contact.html#faq">FAQs</a></li>
        </ul>
      </div>

      <div>
        <h4>Get in touch</h4>
        <div class="footer-contact">
          <div>${icon('phone')}<a href="${telHref}">${esc(BUSINESS.phone)}</a></div>
          <div>${icon('mail')}<a href="mailto:${attr(BUSINESS.email)}">${esc(BUSINESS.email)}</a></div>
          <div>${icon('pin')}<span>${esc(BUSINESS.address)}</span></div>
          <div>${icon('clock')}<span>${esc(BUSINESS.hours[0].days)}<br>${esc(BUSINESS.hours[0].time)}</span></div>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} ${esc(BUSINESS.name)}. All rights reserved.</span>
      <span>Serving ${esc(BUSINESS.region)} since ${BUSINESS.since}</span>
    </div>
  </div>
</footer>

<a href="${telHref}" class="call-fab">${icon('phone')} Call now</a>
${SPRITE}
<script src="/assets/js/site.js" defer></script>
</body>
</html>`;
}

// quote form, reused on the home page and the contact page
function quoteForm({ compact = false } = {}) {
  const options = SERVICES.map(s => `<option>${esc(s.name)}</option>`).join('\n          ');
  return `
<form class="quote-card" id="quote-form" novalidate>
  <h2>${compact ? 'Send a quote request' : 'Get your free quote'}</h2>
  <p class="sub">We reply the same day, most days within the hour.</p>

  <div class="field-row">
    <div class="field">
      <label for="q-name">Name</label>
      <input id="q-name" name="name" type="text" autocomplete="name" required>
    </div>
    <div class="field">
      <label for="q-phone">Phone</label>
      <input id="q-phone" name="phone" type="tel" autocomplete="tel" required>
    </div>
  </div>

  <div class="field">
    <label for="q-email">Email</label>
    <input id="q-email" name="email" type="email" autocomplete="email">
  </div>

  <div class="field">
    <label for="q-suburb">Suburb</label>
    <input id="q-suburb" name="suburb" type="text" autocomplete="address-level2">
  </div>

  <div class="field">
    <label for="q-service">What do you need?</label>
    <select id="q-service" name="service">
      <option value="">Not sure &mdash; please advise</option>
      ${options}
    </select>
  </div>

  <div class="field">
    <label for="q-detail">Tell us about the roof</label>
    <textarea id="q-detail" name="detail" placeholder="Age of the roof, what you have noticed, anything urgent."></textarea>
  </div>

  <button type="submit" class="btn btn--primary btn--block">Get my free quote</button>
  <p class="form-note">No cost, no obligation. We never pass your details on.</p>
  <p class="form-status" id="form-status" hidden></p>
</form>`;
}

// --------------------------------------------------------------- json-ld
function localBusinessSchema() {
  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'RoofingContractor',
    name: BUSINESS.name,
    url: SITE,
    telephone: BUSINESS.phoneDial,
    email: BUSINESS.email,
    image: `${SITE}/assets/img/logo.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '4 Bancroft St',
      addressLocality: 'Dickson',
      addressRegion: 'ACT',
      postalCode: '2602',
      addressCountry: 'AU',
    },
    areaServed: SUBURBS.map(s => ({ '@type': 'Place', name: s })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: BUSINESS.rating,
      reviewCount: BUSINESS.ratingCount,
    },
    makesOffer: SERVICES.map(s => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s.name, description: s.short },
    })),
  })}</script>`;
}

// ==================================================================== pages
const pages = {};

/* ------------------------------------------------------------------- home */
const featured = SERVICES.filter(s => s.featured);

pages['index.html'] = head({
  title: `Roofing Canberra | Roof Repairs & Restoration | ${BUSINESS.name}`,
  description: `Canberra roofing specialists. Free roof inspection, honest quotes and a ${BUSINESS.warrantyYears}-year workmanship warranty on repairs, restorations and replacements.`,
  canonical: '/',
  extraHead: localBusinessSchema(),
}) + header('home') + `
<section class="hero">
  ${hasImage('hero.jpg') ? `<div class="hero-media"><img src="/assets/img/hero.jpg" alt=""></div>` : ''}
  <div class="wrap">
    <div class="hero-grid">
      <div>
        <span class="eyebrow">Canberra &amp; ACT &middot; since ${BUSINESS.since}</span>
        <h1>Your roof, <em>sorted properly</em> the first time.</h1>
        <p class="hero-sub">Repairs, restorations and full replacements across ${esc(BUSINESS.region)} &mdash;
          with a free inspection, photos of what we find, and a fixed price before we start.</p>

        <ul class="hero-points">
          <li>${icon('check')} Free inspection and written quote</li>
          <li>${icon('check')} ${BUSINESS.warrantyYears}-year workmanship warranty</li>
          <li>${icon('check')} Licensed, insured, local crew</li>
          <li>${icon('check')} Emergency leak call-outs</li>
        </ul>

        <div class="btn-row">
          <a href="${telHref}" class="btn btn--primary">${icon('phone')} ${esc(BUSINESS.phone)}</a>
          <a href="#quote" class="btn btn--on-dark">Book a free inspection</a>
        </div>

        <div class="hero-proof">
          <div>
            <div class="stars">&#9733;&#9733;&#9733;&#9733;&#9734;</div>
            <small>${BUSINESS.rating} from ${BUSINESS.ratingCount} Google reviews</small>
          </div>
          <div class="proof-sep"></div>
          <div>
            <b>${new Date().getFullYear() - BUSINESS.since}+ years</b>
            <small>on Canberra roofs</small>
          </div>
          <div class="proof-sep"></div>
          <div>
            <b>Tile &amp; Colorbond</b>
            <small>both trades in-house</small>
          </div>
        </div>
      </div>

      <div id="quote">${quoteForm()}</div>
    </div>
  </div>
</section>

<section class="trust">
  <div class="wrap">
    <div class="trust-grid">
      <div class="trust-item">${icon('shield')}<div><b>${BUSINESS.warrantyYears}-year warranty</b><span>Written workmanship guarantee on every job</span></div></div>
      <div class="trust-item">${icon('wallet')}<div><b>Fixed quotes</b><span>The price we quote is the price you pay</span></div></div>
      <div class="trust-item">${icon('bolt')}<div><b>Emergency call-outs</b><span>Storm damage and active leaks covered fast</span></div></div>
      <div class="trust-item">${icon('badge')}<div><b>Licensed &amp; insured</b><span>Fully covered, ACT compliant work</span></div></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow">What we do</span>
      <h2>Roofing services for Canberra homes</h2>
      <p class="lede">From a single cracked tile to a full re-roof &mdash; and everything that keeps
        the water out in between.</p>
    </div>

    <div class="card-grid">
      ${featured.map(s => `
      <a class="svc-card" href="/services/${s.slug}.html">
        <span class="svc-icon">${icon(s.icon)}</span>
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.short)}</p>
        <span class="svc-more">Learn more ${icon('arrow')}</span>
      </a>`).join('')}
    </div>

    <div class="center" style="margin-top:44px">
      <a href="/services.html" class="btn btn--dark">See all ${SERVICES.length} services ${icon('arrow')}</a>
    </div>
  </div>
</section>

<section class="section section--shell">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow">How it works</span>
      <h2>Four steps, no surprises</h2>
    </div>
    <div class="steps">
      <div class="step">
        <h3>Book the inspection</h3>
        <p>Call or send the form. We will usually be on site within a couple of days.</p>
      </div>
      <div class="step">
        <h3>We assess and photograph</h3>
        <p>Every fault is photographed so you can see exactly what we are talking about.</p>
      </div>
      <div class="step">
        <h3>Fixed written quote</h3>
        <p>Itemised, with what needs doing now and what can safely wait.</p>
      </div>
      <div class="step">
        <h3>We do the work</h3>
        <p>Tidy site, clear timeline, and the warranty in writing when we finish.</p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow">Recent work</span>
      <h2>Before and after, around Canberra</h2>
      <p class="lede">Drop your photos into <code>assets/img/</code> as <code>work-1.jpg</code> &hellip; <code>work-6.jpg</code>
        and they will appear here.</p>
    </div>
    <div class="work-grid">
      ${[
        ['work-1.jpg', 'Roof restoration', 'Full restoration, Belconnen'],
        ['work-2.jpg', 'Re-bedding', 'Ridge capping renewed, Woden'],
        ['work-3.jpg', 'Roof painting', 'Colour change, Gungahlin'],
        ['work-4.jpg', 'Pressure wash', 'Moss and lichen removed, Weston'],
        ['work-5.jpg', 'Tile repair', 'Broken tiles replaced, Dickson'],
        ['work-6.jpg', 'Colorbond', 'Re-sheet, Queanbeyan'],
      ].map(([file, tag, cap]) => `
      <figure class="work-item">
        <span class="work-tag">${esc(tag)}</span>
        ${photo(file, cap)}
        ${hasImage(file) ? `<figcaption>${esc(cap)}</figcaption>` : ''}
      </figure>`).join('')}
    </div>
  </div>
</section>

<section class="section section--sand">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow">Reviews</span>
      <h2>What Canberra homeowners say</h2>
    </div>
    <div class="review-grid">
      ${REVIEWS.map(r => `
      <blockquote class="review">
        <div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
        <p>${esc(r.text)}</p>
        <div class="review-by">
          <span class="avatar">${esc(r.name.charAt(0))}</span>
          <span><b>${esc(r.name)}</b><span>via ${esc(r.source)}</span></span>
        </div>
      </blockquote>`).join('')}
    </div>
  </div>
</section>

<section class="section section--ink">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow">Where we work</span>
      <h2>Across Canberra and the surrounding region</h2>
    </div>
    <ul class="suburb-list" style="justify-content:center">
      ${SUBURBS.map(s => `<li>${esc(s)}</li>`).join('\n      ')}
    </ul>
  </div>
</section>

` + ctaBand() + footer();

/* --------------------------------------------------------------- services */
pages['services.html'] = head({
  title: `Roofing Services in Canberra | ${BUSINESS.name}`,
  description: 'Roof inspection, repair, restoration, replacement, painting, Colorbond, gutters, re-bedding and more across Canberra and the ACT.',
  canonical: '/services.html',
}) + header('services') + `
<div class="page-head">
  <div class="wrap">
    <h1>Our roofing services</h1>
    <p class="crumb"><a href="/">Home</a> / Services</p>
  </div>
</div>

<section class="section">
  <div class="wrap">
    <div class="section-head center">
      <p class="lede">Everything we do, in one place. Each one starts with the same free
        inspection and fixed written quote.</p>
    </div>
    <div class="card-grid">
      ${SERVICES.map(s => `
      <a class="svc-card" href="/services/${s.slug}.html">
        <span class="svc-icon">${icon(s.icon)}</span>
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.short)}</p>
        <span class="svc-more">Learn more ${icon('arrow')}</span>
      </a>`).join('')}
    </div>
  </div>
</section>

` + ctaBand() + footer();

/* ------------------------------------------------------ service detail pages */
SERVICES.forEach((s, i) => {
  const others = SERVICES.filter(x => x.slug !== s.slug).slice(0, 8);
  pages[`services/${s.slug}.html`] = head({
    title: `${s.name} Canberra | ${BUSINESS.name}`,
    description: s.short,
    canonical: `/services/${s.slug}.html`,
    extraHead: `<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: s.name,
      description: s.short,
      areaServed: BUSINESS.region,
      provider: { '@type': 'RoofingContractor', name: BUSINESS.name, telephone: BUSINESS.phoneDial },
    })}</script>`,
  }) + header('services') + `
<div class="page-head">
  <div class="wrap">
    <h1>${esc(s.name)}</h1>
    <p class="crumb"><a href="/">Home</a> / <a href="/services.html">Services</a> / ${esc(s.name)}</p>
  </div>
</div>

<section class="section">
  <div class="wrap split">
    <div class="prose">
      <p class="lede" style="margin-bottom:28px">${esc(s.short)}</p>
      ${s.body.map(p => `<p>${esc(p)}</p>`).join('\n      ')}

      <h2>What&rsquo;s included</h2>
      <ul class="tick-list">
        ${s.includes.map(x => `<li>${icon('check-circle')}<span>${esc(x)}</span></li>`).join('\n        ')}
      </ul>

      <h2>Why homeowners choose us for this</h2>
      <p>Every ${s.name.toLowerCase()} job starts with a free inspection and a photo report, so you
        can see the problem before you spend anything. The quote is fixed and itemised, and the
        workmanship is covered for ${BUSINESS.warrantyYears} years in writing.</p>

      <div class="btn-row" style="margin-top:30px">
        <a href="${telHref}" class="btn btn--primary">${icon('phone')} ${esc(BUSINESS.phone)}</a>
        <a href="/contact.html" class="btn btn--ghost">Request a free quote</a>
      </div>
    </div>

    <aside class="aside-card">
      <h3>All services</h3>
      <ul class="aside-list">
        ${SERVICES.map(x => `<li><a href="/services/${x.slug}.html"${x.slug === s.slug ? ' class="is-active"' : ''}>${esc(x.name)}</a></li>`).join('\n        ')}
      </ul>
      <a href="${telHref}" class="btn btn--primary btn--block" style="margin-top:22px">${icon('phone')} Call ${esc(BUSINESS.phone)}</a>
    </aside>
  </div>
</section>

` + ctaBand() + footer();
});

/* -------------------------------------------------------------------- about */
pages['about.html'] = head({
  title: `About Us | Canberra Roofing Contractor | ${BUSINESS.name}`,
  description: `${BUSINESS.name} has been repairing and restoring Canberra roofs since ${BUSINESS.since}. Licensed, insured, and backed by a ${BUSINESS.warrantyYears}-year workmanship warranty.`,
  canonical: '/about.html',
}) + header('about') + `
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
      <h2>A local crew, on Canberra roofs since ${BUSINESS.since}</h2>
      <p>We are a small, hands-on roofing team based in Dickson. The person who quotes your job is
        the person who turns up to do it, which is the main reason our quotes hold and our timelines
        mean something.</p>
      <p>We work on tile and Colorbond, on everything from a single cracked tile through to a full
        re-roof, for homeowners, landlords and builders across ${esc(BUSINESS.region)}.</p>

      <h2>How we work</h2>
      <ul class="tick-list">
        <li>${icon('check-circle')}<span>Free inspection with a photo report, before you spend anything</span></li>
        <li>${icon('check-circle')}<span>Fixed written quotes &mdash; no variations unless you approve them</span></li>
        <li>${icon('check-circle')}<span>Honest advice about what needs doing now and what can wait</span></li>
        <li>${icon('check-circle')}<span>${BUSINESS.warrantyYears}-year workmanship warranty in writing</span></li>
        <li>${icon('check-circle')}<span>Site left clean, every day, not just at the end</span></li>
      </ul>

      <h2>Insurance and storm damage</h2>
      <p>After a storm we can document the damage the way insurers want it &mdash; dated photos, a
        written cause-of-damage summary and an itemised quote. If your claim needs a second opinion
        on a scope of works, we can provide that too.</p>
    </div>

    <aside class="aside-card">
      <h3>At a glance</h3>
      <ul class="aside-list">
        <li><a>Based in ${esc(BUSINESS.address)}</a></li>
        <li><a>Serving ${esc(BUSINESS.region)}</a></li>
        <li><a>Operating since ${BUSINESS.since}</a></li>
        <li><a>${BUSINESS.rating}&#9733; from ${BUSINESS.ratingCount} Google reviews</a></li>
        <li><a>${BUSINESS.warrantyYears}-year workmanship warranty</a></li>
      </ul>
      <a href="/contact.html" class="btn btn--primary btn--block" style="margin-top:22px">Request a free quote</a>
    </aside>
  </div>
</section>

<section class="section section--ink">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow">Coverage</span>
      <h2>Suburbs we work in</h2>
    </div>
    <ul class="suburb-list" style="justify-content:center">
      ${SUBURBS.map(s => `<li>${esc(s)}</li>`).join('\n      ')}
    </ul>
  </div>
</section>

` + ctaBand() + footer();

/* ------------------------------------------------------------------ contact */
pages['contact.html'] = head({
  title: `Contact | Free Roof Quote in Canberra | ${BUSINESS.name}`,
  description: `Call ${BUSINESS.phone} or send a quote request. Free roof inspections across ${BUSINESS.region}.`,
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
<div class="page-head">
  <div class="wrap">
    <h1>Get in touch</h1>
    <p class="crumb"><a href="/">Home</a> / Contact</p>
  </div>
</div>

<section class="section">
  <div class="wrap split">
    <div>${quoteForm({ compact: true })}</div>

    <aside>
      <span class="eyebrow">Talk to us</span>
      <h2 style="margin-bottom:22px">Fastest way is a phone call</h2>

      <div class="footer-contact" style="color:var(--body);margin-bottom:30px">
        <div>${icon('phone')}<span><b style="display:block;color:var(--ink)">Phone</b>
          <a href="${telHref}" style="color:var(--accent);font-weight:600">${esc(BUSINESS.phone)}</a></span></div>
        <div>${icon('mail')}<span><b style="display:block;color:var(--ink)">Email</b>
          <a href="mailto:${attr(BUSINESS.email)}" style="color:var(--accent);font-weight:600">${esc(BUSINESS.email)}</a></span></div>
        <div>${icon('pin')}<span><b style="display:block;color:var(--ink)">Address</b>${esc(BUSINESS.address)}</span></div>
      </div>

      <h3>Opening hours</h3>
      <ul class="aside-list" style="margin-bottom:26px">
        ${BUSINESS.hours.map(h => `<li><a>${esc(h.days)} &mdash; ${esc(h.time)}</a></li>`).join('\n        ')}
      </ul>

      <div style="border-radius:var(--radius-lg);overflow:hidden;border:1px solid var(--line)">
        <iframe title="MK Roofing AUS location" loading="lazy" style="width:100%;height:280px;border:0"
          src="https://maps.google.com/maps?q=4%20Bancroft%20St%20Dickson%20ACT%202602&z=13&output=embed"></iframe>
      </div>
    </aside>
  </div>
</section>

<section class="section section--shell" id="faq">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow">FAQs</span>
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

` + ctaBand() + footer();

/* ----------------------------------------------------------- 404 + sitemap */
pages['404.html'] = head({
  title: `Page not found | ${BUSINESS.name}`,
  description: 'That page does not exist.',
  canonical: '/404.html',
}) + header('') + `
<section class="section center">
  <div class="wrap">
    <span class="eyebrow">404</span>
    <h1>We could not find that page</h1>
    <p class="lede" style="margin-bottom:28px">It may have moved. Try our services, or just give us a call.</p>
    <div class="btn-row" style="justify-content:center">
      <a href="/" class="btn btn--dark">Back to home</a>
      <a href="${telHref}" class="btn btn--primary">${icon('phone')} ${esc(BUSINESS.phone)}</a>
    </div>
  </div>
</section>
` + footer();

const urls = ['/', '/services.html', '/about.html', '/contact.html']
  .concat(SERVICES.map(s => `/services/${s.slug}.html`));

pages['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">
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
console.log(`Built ${count} files from ${SERVICES.length} services.`);
