// netlify/functions/send-access.js
// Stuurt een branded toegangs-email naar de klant na het aanmaken van een code
// Vereist RESEND_API_KEY env var + ADMIN_SECRET voor autorisatie

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

  const { adminSecret, email, naam, product, code } = body;

  // Admin auth
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  if (!ADMIN_SECRET || adminSecret !== ADMIN_SECRET) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Niet geautoriseerd' }) };
  }

  // Email service check
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Email service niet geconfigureerd. Voeg RESEND_API_KEY toe in Netlify.' }),
    };
  }

  // Validate required fields
  if (!email || !naam || !product || !code) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ontbrekende gegevens' }) };
  }

  const PRODUCT_NAMEN = {
    'bruid-checklist':    'Bruid Checklist',
    'contract-checklist': 'Contract Checklist',
    'rode-vlaggen-gids':  'Rode Vlaggen Gids',
    'whatsapp-scripts':   'WhatsApp Scripts Bundel',
    'dagvan-draaiboek':   'Dag-Van Draaiboek',
    'ziana-gids':         'De Ziana Gids',
    'budget-calculator':  'Budget Calculator',
    'bruiloft-tijdlijn':  'Bruiloft Tijdlijn',
    'complete-bundel':    'Complete Bundel (alle 8 gidsen)',
  };

  const productNaam = PRODUCT_NAMEN[product] || product;
  const voornaam    = naam.split(' ')[0];
  const isBundle    = product === 'complete-bundel';
  const accessUrl   = `https://aroussaplanner.com/mijn-account?code=${encodeURIComponent(code)}`;

  const emailHtml = buildEmailHTML({ voornaam, naam, code, productNaam, isBundle, accessUrl, email });

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    'Aroussa Wedding Planner <hallo@aroussaplanner.com>',
        to:      [email],
        subject: `Jouw ${productNaam} staat klaar ✨`,
        html:    emailHtml,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Resend error:', resp.status, errText);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Email kon niet worden verstuurd. Controleer de Resend configuratie.' }),
      };
    }

    const data = await resp.json();
    console.log('Email verstuurd:', data.id, '→', email);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, emailId: data.id }),
    };

  } catch (err) {
    console.error('Send-access error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Verbindingsfout. Probeer opnieuw.' }),
    };
  }
};

// ── EMAIL HTML TEMPLATE ────────────────────────────────────────────────────
function buildEmailHTML({ voornaam, naam, code, productNaam, isBundle, accessUrl, email }) {
  const bodyText = isBundle
    ? `Jouw <strong style="color:#F5F0E8;">Complete Bundel</strong> staat klaar — alle 8 Aroussa gidsen zijn voor jou gepersonaliseerd!`
    : `Jouw <strong style="color:#F5F0E8;">${productNaam}</strong> staat klaar en is persoonlijk voor jou gemaakt!`;

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Jouw ${productNaam} staat klaar</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F0E8;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;">

  <!-- HEADER -->
  <tr><td style="background:#1A1210;border-radius:8px 8px 0 0;padding:32px 36px 28px;text-align:center;">
    <p style="margin:0 0 2px;font-size:10px;font-weight:bold;letter-spacing:0.22em;text-transform:uppercase;color:#C4A882;">Aroussa</p>
    <p style="margin:0;font-size:24px;font-weight:300;color:#F5F0E8;font-family:Georgia,'Times New Roman',serif;letter-spacing:0.06em;">Wedding Planner</p>
    <div style="width:36px;height:1px;background:rgba(196,168,130,0.5);margin:16px auto 0;"></div>
  </td></tr>

  <!-- BODY -->
  <tr><td style="background:#2D2520;padding:36px 36px 28px;border-left:1px solid #3a2e2a;border-right:1px solid #3a2e2a;">

    <p style="margin:0 0 20px;font-size:22px;font-family:Georgia,'Times New Roman',serif;font-weight:300;color:#F5F0E8;line-height:1.35;">Hoi ${voornaam}! 🌹</p>

    <p style="margin:0 0 24px;font-size:14px;color:#9B8E7E;line-height:1.75;">${bodyText}</p>

    <!-- CODE BOX -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      <tr><td style="background:#1A1210;border:1px solid rgba(196,168,130,0.3);border-radius:6px;padding:22px 24px;text-align:center;">
        <p style="margin:0 0 10px;font-size:10px;font-weight:bold;letter-spacing:0.2em;text-transform:uppercase;color:#C4A882;">Jouw persoonlijke toegangscode</p>
        <p style="margin:0 0 10px;font-size:30px;font-family:Georgia,'Times New Roman',serif;font-weight:400;color:#F5F0E8;letter-spacing:0.14em;">${code}</p>
        <p style="margin:0;font-size:11px;color:rgba(155,142,126,0.8);">Gekoppeld aan: ${naam}</p>
      </td></tr>
    </table>

    <!-- INSTRUCTIONS -->
    <p style="margin:0 0 10px;font-size:10px;font-weight:bold;letter-spacing:0.14em;text-transform:uppercase;color:#C4A882;">Zo open je jouw product:</p>
    <p style="margin:0 0 6px;font-size:13px;color:#9B8E7E;line-height:1.65;">
      <span style="color:#C4A882;font-weight:bold;">1.</span>&nbsp; Klik op de knop hieronder<br>
      <span style="color:#C4A882;font-weight:bold;">2.</span>&nbsp; Log in met dit e-mailadres: <span style="color:#F5F0E8;">${email}</span><br>
      <span style="color:#C4A882;font-weight:bold;">3.</span>&nbsp; De code is al voor jou ingevuld — klik op <strong style="color:#F5F0E8;">Activeren</strong>
    </p>

    <!-- CTA BUTTON -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 32px;">
      <tr><td align="center">
        <a href="${accessUrl}" style="display:inline-block;padding:15px 44px;background:#C4A882;color:#1A1210;font-size:11px;font-weight:bold;letter-spacing:0.16em;text-transform:uppercase;text-decoration:none;border-radius:2px;">Open jouw product &rarr;</a>
      </td></tr>
    </table>

    <div style="height:1px;background:rgba(196,168,130,0.12);margin:0 0 22px;"></div>

    <p style="margin:0;font-size:12px;color:rgba(155,142,126,0.75);line-height:1.7;">
      De code is persoonlijk en gekoppeld aan jouw e-mailadres. Bewaar deze email — je hebt de code nodig om jouw product te openen.<br><br>
      Vragen? Stuur ons een appje: <a href="https://wa.me/31613115286" style="color:#C4A882;text-decoration:none;">06 13 11 52 86</a>
    </p>

  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#1A1210;border-radius:0 0 8px 8px;padding:20px 36px;text-align:center;border-top:1px solid rgba(196,168,130,0.1);">
    <p style="margin:0 0 4px;font-size:11px;color:rgba(155,142,126,0.6);">Aroussa Wedding Planner &middot; <a href="https://aroussaplanner.com" style="color:#C4A882;text-decoration:none;">aroussaplanner.com</a></p>
    <p style="margin:0;font-size:10px;color:rgba(155,142,126,0.4);">Je ontvangt deze email omdat je een Aroussa product hebt besteld.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
