// netlify/functions/validate-code.js
// Customer endpoint: validates a one-time code and marks it used on success
// Returns signed download token if valid

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
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ongeldige aanvraag' }) };
  }

  const { code, email } = body;

  if (!code || !email) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Code en email zijn verplicht' }) };
  }

  const SUPABASE_URL = 'https://rgordytqhaionboljwlz.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnb3JkeXRxaGFpb25ib2xqd2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDAwODEsImV4cCI6MjEwMzA3NjA4MX0.-ZOieeVT97TpH26_Kmfnkthw2bE6b_6khri5zfi6N0Y';

  const normalizedCode = code.trim().toUpperCase();
  const normalizedEmail = email.toLowerCase().trim();

  const sbHeaders = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  // Look up code in Supabase
  let codeData;
  try {
    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/download_codes?code=eq.${encodeURIComponent(normalizedCode)}&select=*`,
      { headers: sbHeaders }
    );

    if (!resp.ok) {
      console.error('Supabase lookup error:', resp.status, await resp.text());
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Verbindingsfout. Probeer opnieuw.' }),
      };
    }

    const rows = await resp.json();
    codeData = rows && rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.error('Fetch error in validate-code lookup:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Verbindingsfout. Probeer opnieuw.' }),
    };
  }

  if (!codeData) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ valid: false, reason: 'Ongeldige code. Controleer de code en probeer opnieuw.' }),
    };
  }

  // Check email matches
  if (codeData.email !== normalizedEmail) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ valid: false, reason: 'Deze code is niet voor jouw account.' }),
    };
  }

  // Check if already used — allow re-access for the SAME email (returning customer)
  if (codeData.used) {
    const tokenPayload = {
      email: normalizedEmail,
      naam: codeData.naam,
      product: codeData.product,
      code: normalizedCode,
      exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    };
    const downloadToken = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        valid: true,
        downloadToken,
        naam: codeData.naam,
        product: codeData.product,
        returning: true,
      }),
    };
  }

  // Mark as used
  try {
    const patchResp = await fetch(
      `${SUPABASE_URL}/rest/v1/download_codes?code=eq.${encodeURIComponent(normalizedCode)}`,
      {
        method: 'PATCH',
        headers: { ...sbHeaders, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ used: true, used_at: new Date().toISOString() }),
      }
    );

    if (!patchResp.ok) {
      console.error('Supabase update error:', patchResp.status, await patchResp.text());
      // Still return valid=false so the user doesn't get a token for an unupdated code
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Activatie mislukt. Probeer opnieuw.' }),
      };
    }
  } catch (err) {
    console.error('Fetch error in validate-code update:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Verbindingsfout. Probeer opnieuw.' }),
    };
  }

  // Generate a simple signed download token (base64 encoded, good for 24h)
  const tokenPayload = {
    email: normalizedEmail,
    naam: codeData.naam,
    product: codeData.product,
    code: normalizedCode,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };
  const downloadToken = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      valid: true,
      downloadToken,
      naam: codeData.naam,
      product: codeData.product,
    }),
  };
};
