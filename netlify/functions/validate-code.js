// netlify/functions/validate-code.js
// Customer endpoint: validates a one-time code and marks it used on success
// Returns signed download token if valid

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
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ongeldige aanvraag' }) };
  }

  const { code, email } = body;

  if (!code || !email) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Code en email zijn verplicht' }) };
  }

  const normalizedCode = code.trim().toUpperCase();
  const normalizedEmail = email.toLowerCase().trim();

  const store = getStore('download-codes');

  // Look up code
  let codeData;
  try {
    codeData = await store.get(normalizedCode, { type: 'json' });
  } catch {
    codeData = null;
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

  // Check if already used
  if (codeData.used) {
    const usedDate = codeData.usedAt ? new Date(codeData.usedAt).toLocaleDateString('nl-NL') : 'onbekend';
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        valid: false,
        reason: `Deze code is al gebruikt op ${usedDate}. Neem contact op via WhatsApp als je hulp nodig hebt.`,
      }),
    };
  }

  // Mark as used
  const updatedData = {
    ...codeData,
    used: true,
    usedAt: new Date().toISOString(),
  };
  await store.setJSON(normalizedCode, updatedData);

  // Generate a simple signed download token (base64 encoded, good for 24h)
  const tokenPayload = {
    email: normalizedEmail,
    naam: codeData.naam,
    product: codeData.product,
    code: normalizedCode,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
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
