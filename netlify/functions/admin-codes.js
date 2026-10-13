// netlify/functions/admin-codes.js
// Admin-only endpoint: list, lookup, revoke and manage download codes
// Actions: 'list' | 'lookup' | 'all' | 'revoke'

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

  const { adminSecret, action, email, code: codeToRevoke } = body;

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
    // ── REVOKE: delete a single code ──────────────────────────────────────────
    if (action === 'revoke') {
      if (!codeToRevoke) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Code is verplicht' }) };
      }

      const deleteResp = await fetch(
        `${SUPABASE_URL}/rest/v1/download_codes?code=eq.${encodeURIComponent(codeToRevoke)}`,
        { method: 'DELETE', headers: sbHeaders }
      );

      if (!deleteResp.ok) {
        const errText = await deleteResp.text();
        console.error('Supabase delete error:', deleteResp.status, errText);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Verwijderen mislukt. Probeer opnieuw.' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Code ingetrokken.' }),
      };
    }

    // ── REVOKE ALL: delete all codes for an email ─────────────────────────────
    if (action === 'revoke-all') {
      if (!email) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email is verplicht' }) };
      }

      const normalizedEmail = email.toLowerCase().trim();
      const deleteResp = await fetch(
        `${SUPABASE_URL}/rest/v1/download_codes?email=eq.${encodeURIComponent(normalizedEmail)}`,
        { method: 'DELETE', headers: sbHeaders }
      );

      if (!deleteResp.ok) {
        const errText = await deleteResp.text();
        console.error('Supabase delete-all error:', deleteResp.status, errText);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Verwijderen mislukt. Probeer opnieuw.' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Alle codes voor klant ingetrokken.' }),
      };
    }

    // ── FETCH queries ─────────────────────────────────────────────────────────
    let url;

    if (action === 'all') {
      // All codes, no limit — for full customer management view
      url = `${SUPABASE_URL}/rest/v1/download_codes?select=*&order=created_at.desc&limit=1000`;
    } else if (action === 'lookup' && email) {
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
