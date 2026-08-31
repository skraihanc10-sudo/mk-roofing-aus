# MK Roofing AUS — website

A rebuild of mkroofingaus.com.au. Static HTML, no framework, no build tooling
beyond one Node script.

```
node build.js
```

That reads `assets/js/data.js` and writes every `.html` file in the project.
Run it after any content change, then upload the folder.

---

## Adding or changing a service

Everything lives in **`assets/js/data.js`**. Add an object to `SERVICES`:

```js
{
  slug: 'skylight-installation',        // becomes /services/skylight-installation.html
  name: 'Skylight Installation',
  icon: 'sparkle',                      // any i-* id from the sprite in build.js
  featured: true,                       // show it on the home page (optional)
  short: 'One line for the card and the meta description.',
  body: [ 'First paragraph.', 'Second paragraph.' ],
  includes: [ 'Bullet one', 'Bullet two' ],
}
```

Then `node build.js`. That one entry creates the detail page and adds it to the
home grid, the services page, the header dropdown, the mobile menu, the footer,
the sidebar on every service page, the quote form's dropdown, the sitemap and
the structured data. Nothing else needs editing.

Deleting a service is the same in reverse — remove the object, rebuild, and
delete the leftover file in `services/`.

Phone number, email, address, hours, suburbs, reviews and FAQs are in the same
file.

---

## Photos

Drop these into `assets/img/`. The build checks which exist and only writes an
`<img>` for the ones that are there — anything missing shows a labelled
placeholder rather than a broken image.

| File | Where it appears | Suggested size |
| --- | --- | --- |
| `logo.png` | Header and footer | ~400×160, transparent |
| `favicon.png` | Browser tab | 180×180 square |
| `hero.jpg` | Behind the home page headline | 2000×1200, landscape |
| `work-1.jpg` … `work-6.jpg` | Recent work grid | 1200×900, 4:3 |

For the hero, pick something wide with room on the left — the headline sits over
that side and the image is dimmed behind it.

---

## The quote form

Right now it opens the customer's email app with the enquiry filled in. That
works everywhere but relies on them having mail set up.

To have it post properly instead, set `FORM_ENDPOINT` near the bottom of
`assets/js/site.js`:

```js
var FORM_ENDPOINT = 'https://formspree.io/f/xxxxxxx';
```

Any endpoint that accepts a JSON POST works — Formspree, Netlify Forms, Web3Forms,
or your own script. The form handles the loading state, success and failure
messages already.

---

## Hosting

It is plain static files, so anything works: Netlify, Cloudflare Pages, Vercel,
GitHub Pages, or ordinary cPanel hosting. Upload the whole folder; `index.html`
is the entry point.

Two things to set up on whichever host you choose:

- point `404.html` at the not-found handler
- keep `sitemap.xml` and `robots.txt` at the domain root

`SITE` at the top of `build.js` sets the domain used in canonical tags, the
sitemap and the social preview URLs. It is currently
`https://mkroofingaus.com.au`.

---

## Two things to confirm

- **Years in business.** The old site says both *"11 Years of Experience"* and
  *"Since 2020"*. This build uses `since: 2020` from `data.js` and works the rest
  out from it. Change that number if 2020 is wrong.
- **Licence and ABN.** `BUSINESS.abn` is empty. Australian customers look for it,
  and it is worth having in the footer — fill it in and it can be added.
