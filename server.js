/* ---------------------------------------------------------------------------
   Static file server for Railway. No dependencies - the site is plain HTML, so
   there is nothing to install and nothing to keep patched.

   Handles clean URLs (/services/roof-repair serves roof-repair.html), sends a
   real 404 page, and sets cache headers that let assets be cached hard while
   pages stay fresh.
   --------------------------------------------------------------------------- */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

// Source and config live in the same folder as the site, so keep them out of
// the web root's reach. Nothing here is secret, but there is no reason to
// hand it out either.
const PRIVATE = new Set([
  'server.js', 'build.js', 'package.json', 'package-lock.json',
  'railway.toml', 'readme.md', '.nvmrc', '.gitignore',
]);

function isPrivate(pathname) {
  const rel = pathname.replace(/^\/+/, '').toLowerCase();
  return PRIVATE.has(rel) || rel.split('/').some(part => part.startsWith('.'));
}

// Never serve anything outside the project directory, whatever the request says.
function resolveSafe(pathname) {
  const decoded = decodeURIComponent(pathname);
  const target = path.normalize(path.join(ROOT, decoded));
  return target.startsWith(ROOT) ? target : null;
}

// A request for /services/roof-repair should find roof-repair.html.
function findFile(target) {
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    const index = path.join(target, 'index.html');
    return fs.existsSync(index) ? index : null;
  }
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return target;
  if (!path.extname(target) && fs.existsSync(target + '.html')) return target + '.html';
  return null;
}

function send(res, status, body, type, cache) {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': cache,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname;

  if (pathname === '/health') {
    return send(res, 200, JSON.stringify({ ok: true }), TYPES['.json'], 'no-store');
  }

  const safe = resolveSafe(pathname === '/' ? '/index.html' : pathname);
  if (!safe) return send(res, 400, 'Bad request', TYPES['.txt'], 'no-store');

  const file = isPrivate(pathname) ? null : findFile(safe);

  if (!file) {
    const notFound = path.join(ROOT, '404.html');
    const body = fs.existsSync(notFound) ? fs.readFileSync(notFound) : 'Not found';
    return send(res, 404, body, TYPES['.html'], 'no-store');
  }

  const ext = path.extname(file).toLowerCase();
  const isPage = ext === '.html';
  // Pages change whenever the site is rebuilt, so they revalidate every time.
  // Everything else is safe to cache for a week.
  const cache = isPage ? 'public, max-age=0, must-revalidate' : 'public, max-age=604800';

  send(res, 200, fs.readFileSync(file), TYPES[ext] || 'application/octet-stream', cache);
});

server.listen(PORT, () => {
  console.log(`MK Roofing AUS listening on ${PORT}`);
});
