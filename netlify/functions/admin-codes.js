// netlify/functions/admin-codes.js
// Admin-only endpoint: list and lookup download codes
// action: 'list' → last 30 codes | 'lookup' → codes for a given email

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

  const { adminSecret, action, email } = body;

  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  if (!ADMIN_SECRET || adminSecret !== ADMIN_SECRET) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Niet geautoriseerd' }) };
  }

  const SUPABASE_URL = 'https://rgordytqhaionboljwlz.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnb3JkeXRxaGFpb25ib2xqd2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDAwODEsImV4cCI6MjEwMzA3NjA4MX0.-ZOieeVT97TpH26_Kmfnkthw2bE6b_6khri5zfi6N0Y';

  const sbHeaders = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    let url;

    if (action === 'lookup' && email) {
      const normalizedEmail = email.toLowerCase().trim();
      url = `${SUPABASE_URL}/rest/v1/download_codes?email=eq.${encodeURIComponent(normalizedEmail)}&select=*&order=created_at.desc`;
    } else {
      // Default: list last 30 codes
      url = `${SUPABASE_URL}/rest/v1/download_codes?select=*&order=created_at.desc&limit=30`;
    }

    const resp = await fetch(url, { headers: sbHeaders });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Supabase error:', resp.status, errText);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database fout. Probeer opnieuw.' }),
      };
    }

    const rows = await resp.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, codes: rows || [] }),
    };

  } catch (err) {
    console.error('Fetch error in admin-codes:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Verbindingsfout. Probeer opnieuw.' }),
    };
  }
};
