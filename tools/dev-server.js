'use strict';

/**
 * Local dev server so the scanner works before this is on Vercel.
 *
 *   node tools/dev-server.js          -> http://localhost:8080
 *   node tools/dev-server.js 3000     -> http://localhost:3000
 *
 * Serves the static site AND runs /api/scan with the exact same code
 * Vercel will run. Needs Node 18 or newer.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { runScan } = require('../api/_scan.js');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.argv[2]) || 8080;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 1e6) req.destroy(); });
    req.on('end', () => resolve(data));
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/api/scan') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    let target = url.searchParams.get('url') || '';
    if (req.method === 'POST') {
      try { target = (JSON.parse(await readBody(req)) || {}).url || target; } catch (e) { /* ignore */ }
    }
    try {
      const result = await runScan(target);
      res.writeHead(200); res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400); res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }

  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  });
});

server.listen(PORT, () => {
  console.log(`\n  ryderschilling-v2  →  http://localhost:${PORT}`);
  console.log(`  /api/scan is live, so the site scanner works locally.\n`);
});
