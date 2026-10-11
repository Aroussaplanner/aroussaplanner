// netlify/functions/check-admin.js
// Validates admin password — used by the lock screen before showing the admin panel

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

  const { adminSecret } = body;
  const ADMIN_SECRET = process.env.ADMIN_SECRET;

  if (!ADMIN_SECRET || adminSecret !== ADMIN_SECRET) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Verkeerd wachtwoord' }) };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true }),
  };
};
