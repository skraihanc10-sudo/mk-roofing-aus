/* ---------------------------------------------------------------------------
   MK Roofing LLC - static site + self-hosted admin panel.

   The site stays static. The admin does not render pages at request time: it
   edits content/data.json and then re-runs build.js, which writes real .html
   files. Visitors and Google still get plain HTML that works with JavaScript
   switched off, which is why a local trade site can rank at all.

   Everything editable lives under DATA_DIR:

     DATA_DIR/content/data.json   the site's content
     DATA_DIR/images/             photos, uploaded or shipped
     DATA_DIR/site/               the generated .html

   On Railway, mount a persistent Volume and point DATA_DIR at it, or every
   edit is wiped by the next deploy. Without one it falls back to this
   checkout, which is what you want locally.
   --------------------------------------------------------------------------- */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const cookieParser = require('cookie-parser');

const build = require('./build');

const APP_DIR = __dirname;
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : APP_DIR;
const CONTENT_DIR = path.join(DATA_DIR, 'content');
const IMAGES_DIR = DATA_DIR === APP_DIR
  ? path.join(APP_DIR, 'assets/img')          // local: edit the repo's own photos
  : path.join(DATA_DIR, 'images');            // deployed: the volume
const SITE_DIR = DATA_DIR === APP_DIR ? APP_DIR : path.join(DATA_DIR, 'site');
const DATA_FILE = path.join(CONTENT_DIR, 'data.json');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-only-secret-change-me';
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const PORT = process.env.PORT || 3000;

// ------------------------------------------------------------------ bootstrap
// First boot against an empty volume: seed it from the checkout so there is
// something to serve. Existing files are never overwritten, so admin edits and
// uploads always survive a deploy.
function ensureDataDir() {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  fs.mkdirSync(SITE_DIR, { recursive: true });

  if (DATA_DIR === APP_DIR) return;

  const seedData = path.join(APP_DIR, 'content/data.json');
  if (!fs.existsSync(DATA_FILE) && fs.existsSync(seedData)) {
    fs.copyFileSync(seedData, DATA_FILE);
  }

  // Copied per file rather than only when the folder is empty: once anything
  // has been uploaded the folder is non-empty forever, and artwork shipped in
  // a later release (a new logo, say) would never reach production.
  const seedImages = path.join(APP_DIR, 'assets/img');
  if (fs.existsSync(seedImages)) {
    for (const file of fs.readdirSync(seedImages)) {
      const dest = path.join(IMAGES_DIR, file);
      if (!fs.existsSync(dest)) fs.copyFileSync(path.join(seedImages, file), dest);
    }
  }
}
ensureDataDir();

// ---------------------------------------------------------------------- build
let lastBuild = null;

function rebuild() {
  const result = build({ dataFile: DATA_FILE, imagesDir: IMAGES_DIR, outDir: SITE_DIR });
  lastBuild = Object.assign({ at: new Date().toISOString() }, result);
  return lastBuild;
}

// Build on boot, so a fresh container serves current content even if nobody
// has opened the admin since the last deploy.
try {
  rebuild();
} catch (err) {
  console.error('Initial build failed:', err.message);
}

// ------------------------------------------------------------------- sessions
// A signed expiry rather than a stored session list - there is one user and no
// database, and this survives a restart without needing one.
function signSession(expiresAt) {
  const payload = String(expiresAt);
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return payload + '.' + sig;
}

function verifySession(token) {
  if (!token || typeof token !== 'string') return false;
  const dot = token.lastIndexOf('.');
  if (dot < 1) return false;
  const payload = token.slice(0, dot);
  const given = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(
    crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
  );
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return false;
  return Number(payload) > Date.now();
}

function requireAuth(req, res, next) {
  if (!verifySession(req.cookies && req.cookies.admin_session)) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  next();
}

// ----------------------------------------------------------------- data files
function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  // Write then rename, so a crash mid-write cannot leave the site with a
  // half-written file it can no longer build from.
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, DATA_FILE);
}

// ------------------------------------------------------------------------ app
const app = express();
app.disable('x-powered-by');
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.get('/health', (req, res) => res.json({ ok: true, lastBuild }));

// ----------------------------------------------------------------- admin auth
app.post('/admin/api/login', (req, res) => {
  if (!ADMIN_PASSWORD) {
    return res.status(500).json({
      error: 'ADMIN_PASSWORD is not set on the server. Add it under Railway > Variables.',
    });
  }
  const given = Buffer.from(String((req.body && req.body.password) || ''));
  const expected = Buffer.from(ADMIN_PASSWORD);
  const ok = given.length === expected.length && crypto.timingSafeEqual(given, expected);
  if (!ok) return res.status(401).json({ error: 'Wrong password' });

  const expiresAt = Date.now() + SESSION_MAX_AGE_MS;
  res.cookie('admin_session', signSession(expiresAt), {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    maxAge: SESSION_MAX_AGE_MS,
  });
  res.json({ ok: true });
});

app.post('/admin/api/logout', (req, res) => {
  res.clearCookie('admin_session');
  res.json({ ok: true });
});

app.get('/admin/api/session', (req, res) => {
  res.json({ authenticated: verifySession(req.cookies && req.cookies.admin_session) });
});

// -------------------------------------------------------------- admin content
app.get('/admin/api/data', requireAuth, (req, res) => {
  const images = fs.existsSync(IMAGES_DIR)
    ? fs.readdirSync(IMAGES_DIR).filter(f => !f.startsWith('.') && !f.startsWith('_')).sort()
    : [];
  res.json({ data: readData(), images, lastBuild });
});

const SLUG_RE = /^[a-z0-9-]+$/;

function validate(data) {
  if (!data || typeof data !== 'object') return 'Invalid data';
  if (!data.business || typeof data.business !== 'object') return 'Business details are missing';
  if (!Array.isArray(data.services)) return 'Services must be a list';
  if (!data.services.length) return 'Keep at least one service - the site is built around them';

  const b = data.business;
  for (const field of ['name', 'phone', 'phoneDial', 'email', 'street', 'city', 'state', 'zip']) {
    if (!String(b[field] || '').trim()) return 'Business "' + field + '" cannot be empty';
  }
  // Every call button on the site is built from phoneDial, so a typo here
  // breaks every phone link at once.
  if (!/^\+?[0-9]{7,15}$/.test(String(b.phoneDial).trim())) {
    return 'Dial number must be digits, optionally starting with + (e.g. +15055285353)';
  }
  if (!String(b.email).includes('@')) return 'Email address does not look right';

  const seen = new Set();
  for (const s of data.services) {
    if (!SLUG_RE.test(String(s.slug || ''))) {
      return 'Invalid web address for "' + (s.name || 'a service') +
             '" - lowercase letters, numbers and hyphens only';
    }
    if (seen.has(s.slug)) return 'Two services share the web address "' + s.slug + '"';
    seen.add(s.slug);
    if (!String(s.name || '').trim()) return 'Every service needs a name';
    if (s.group !== 'design' && s.group !== 'roofing') {
      return '"' + s.name + '" must sit in either the Design or the Roofing group';
    }
  }
  return null;
}

app.put('/admin/api/data', requireAuth, (req, res) => {
  const problem = validate(req.body);
  if (problem) return res.status(400).json({ error: problem });

  const previous = readData();
  writeData(req.body);
  try {
    res.json({ ok: true, build: rebuild() });
  } catch (err) {
    // A failed build would leave the live site stale with nobody the wiser, so
    // put the old content back rather than keep a version that cannot publish.
    writeData(previous);
    try { rebuild(); } catch (_) {}
    res.status(500).json({ error: 'Could not publish that: ' + err.message });
  }
});

// --------------------------------------------------------------------- photos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.post('/admin/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received' });
  if (req.file.mimetype !== 'image/jpeg') {
    return res.status(400).json({ error: 'Expected a JPEG - the panel converts before uploading' });
  }
  // The filename decides where a picture appears (hero.jpg is the hero,
  // service-roof-repair.jpg is that service's photo), so the panel sends the
  // slot it is filling and the uploaded name is ignored entirely.
  const slot = String((req.body && req.body.slot) || '').trim();
  if (!SLUG_RE.test(slot)) return res.status(400).json({ error: 'Invalid image slot' });

  fs.writeFileSync(path.join(IMAGES_DIR, slot + '.jpg'), req.file.buffer);
  try {
    rebuild();
  } catch (err) {
    return res.status(500).json({ error: 'Uploaded, but the site could not rebuild: ' + err.message });
  }
  res.json({ ok: true, file: slot + '.jpg' });
});

app.delete('/admin/api/image/:slot', requireAuth, (req, res) => {
  const slot = String(req.params.slot || '');
  if (!SLUG_RE.test(slot)) return res.status(400).json({ error: 'Invalid image slot' });
  const target = path.join(IMAGES_DIR, slot + '.jpg');
  if (fs.existsSync(target)) fs.unlinkSync(target);
  try { rebuild(); } catch (_) {}
  res.json({ ok: true });
});

// --------------------------------------------------------------- static files
// Source and config sit in the same folder as the site. Nothing here is secret,
// but there is no reason to hand it out.
const PRIVATE = new Set(['server.js', 'build.js', 'package.json', 'package-lock.json',
  'railway.toml', 'prepare-photos.py', 'readme.md', '.nvmrc', '.gitignore',
  '.env', '.env.example']);

app.use((req, res, next) => {
  const rel = decodeURIComponent(req.path).replace(/^\/+/, '').toLowerCase();
  const top = rel.split('/')[0];
  if (PRIVATE.has(rel) || rel.split('/').some(p => p.startsWith('.'))) {
    return res.status(404).end();
  }
  if (top === 'content' || top === 'node_modules' || top === '_incoming') {
    return res.status(404).end();
  }
  next();
});

app.use('/admin', express.static(path.join(APP_DIR, 'admin'), { maxAge: 0 }));
// Uploaded photos win over the ones in the checkout.
app.use('/assets/img', express.static(IMAGES_DIR, { maxAge: '7d' }));
app.use('/assets', express.static(path.join(APP_DIR, 'assets'), { maxAge: '7d' }));

// Pages change on every rebuild, so they revalidate; assets are cached hard.
app.use(express.static(SITE_DIR, { extensions: ['html'], maxAge: 0, redirect: false }));

// Fall back to the pages committed to the repo. This only matters when a boot
// build has failed - without it the site would serve nothing at all rather
// than slightly stale pages. Source files are already blocked above.
if (SITE_DIR !== APP_DIR) {
  app.use(express.static(APP_DIR, { extensions: ['html'], maxAge: 0, redirect: false }));
}

app.use((req, res) => {
  const notFound = path.join(SITE_DIR, '404.html');
  res.status(404);
  if (fs.existsSync(notFound)) return res.sendFile(notFound);
  res.type('text/plain').send('Not found');
});

app.listen(PORT, () => {
  console.log('MK Roofing LLC listening on ' + PORT);
  console.log('  data:  ' + DATA_DIR);
  console.log('  pages: ' + (lastBuild ? lastBuild.files + ' built' : 'BUILD FAILED'));
  if (!ADMIN_PASSWORD) console.warn('  WARNING: ADMIN_PASSWORD is not set - /admin will refuse everyone.');
});
