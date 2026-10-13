// netlify/functions/submission-created.js
// Automatisch getriggerd door Netlify bij elk formulierverzending.
// Slaat aanmeldingen op in Supabase zodat ze in het beheerportaal zichtbaar zijn.

exports.handler = async (event) => {
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const payload = body.payload;

  // Alleen het aanmelding-formulier verwerken
  if (!payload || payload.form_name !== 'privacy-kaart-aanmelding') {
    return { statusCode: 200, body: 'Skipped (not aanmelding form)' };
  }

  const data = payload.data || {};

  const SUPABASE_URL = 'https://rgordytqhaionboljwlz.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnb3JkeXRxaGFpb25ib2xqd2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MDAwODEsImV4cCI6MjEwMzA3NjA4MX0.-ZOieeVT97TpH26_Kmfnkthw2bE6b_6khri5zfi6N0Y';

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/aanmeldingen`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        naam:       data.naam       || '',
        whatsapp:   data.whatsapp   || '',
        email:      data.email      || '',
        trouwdatum: data.trouwdatum || null,
        bruidegom:  data.bruidegom  || '',
        gezien:     false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Supabase insert error:', err);
      return { statusCode: 500, body: 'Supabase error: ' + err };
    }

    console.log('Aanmelding opgeslagen:', data.naam, data.email);
    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('Fetch error:', err);
    return { statusCode: 500, body: String(err) };
  }
};
