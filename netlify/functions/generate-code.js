// netlify/functions/generate-code.js
// Admin-only endpoint: generates a one-time download code for a customer
// Protected by ADMIN_SECRET environment variable

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

  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rgordytqhaionboljwlz.supabase.co';
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnb3JkeXRxaGFpb25ib2xqd2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDAwODEsImV4cCI6MjEwMzA3NjA4MX0.-ZOieeVT97TpH26_Kmfnkthw2bE6b_6khri5zfi6N0Y';

  // Generate unique code: ARO-XXXX-XXXX (uppercase alphanum, no confusing chars)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part1 = '', part2 = '';
  for (let i = 0; i < 4; i++) part1 += chars[Math.floor(Math.random() * chars.length)];
  for (let i = 0; i < 4; i++) part2 += chars[Math.floor(Math.random() * chars.length)];
  const code = `ARO-${part1}-${part2}`;

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/download_codes`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        code,
        email: normalizedEmail,
        naam: naam.trim(),
        product,
        used: false,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Supabase insert error:', resp.status, errText);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Opslaan mislukt. Probeer opnieuw.' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        code,
        email: normalizedEmail,
        naam: naam.trim(),
        product,
      }),
    };
  } catch (err) {
    console.error('Fetch error in generate-code:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Verbindingsfout. Probeer opnieuw.' }),
    };
  }
};
