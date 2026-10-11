// netlify/functions/generate-code.js
// Admin-only endpoint: generates a one-time download code for a customer
// Protected by ADMIN_SECRET environment variable

const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://aroussaplanner.com',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { adminSecret, email, naam, product = 'privacy-kaart' } = body;

  // Verify admin secret
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  if (!ADMIN_SECRET || adminSecret !== ADMIN_SECRET) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Niet geautoriseerd' }) };
  }

  if (!email || !naam) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email en naam zijn verplicht' }) };
  }

  // Generate unique code: ARO-XXXX-XXXX (uppercase alphanum, no confusing chars)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part1 = '', part2 = '';
  for (let i = 0; i < 4; i++) part1 += chars[Math.floor(Math.random() * chars.length)];
  for (let i = 0; i < 4; i++) part2 += chars[Math.floor(Math.random() * chars.length)];
  const code = `ARO-${part1}-${part2}`;

  // Store code in Netlify Blobs
  const store = getStore('download-codes');
  const codeData = {
    email: email.toLowerCase().trim(),
    naam: naam.trim(),
    product,
    code,
    createdAt: new Date().toISOString(),
    used: false,
    usedAt: null,
  };

  await store.setJSON(code, codeData);

  // Also index by email (to look up pending codes)
  const emailKey = `email:${email.toLowerCase().trim()}:${product}`;
  await store.setJSON(emailKey, { code, createdAt: codeData.createdAt });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      code,
      email,
      naam,
      product,
    }),
  };
};
