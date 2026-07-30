'use strict';

const { runScan } = require('./_scan.js');

/**
 * Vercel serverless function: POST /api/scan  { "url": "example.com" }
 * Also accepts GET /api/scan?url=example.com
 */
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(204).end();
  }
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  let url = '';
  if (req.method === 'GET') {
    url = (req.query && req.query.url) || '';
  } else {
    const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
    url = (body && body.url) || '';
  }

  try {
    const result = await runScan(url);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ ok: false, error: err.message || 'That scan failed.' });
  }
};

function safeParse(s) {
  try { return JSON.parse(s); } catch (e) { return {}; }
}
