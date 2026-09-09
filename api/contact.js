/* POST /api/contact
   Öffentliche Kundenanfrage von motozuerich.ch (Kontaktformular /kontakt + «?»-Frage-Widget).
   SELF-CONTAINED (Entscheid Ivanna 09.09): schreibt in mz_kontakt (Portal-DB, Projekt
   nitvaqtqttaykkqmdumk) und schickt eine Benachrichtigung an team@motozuerich.ch —
   NICHT über slswiss-tickets (eigene MZ-Infrastruktur, same-origin, kein CORS).

   ENV (Vercel-Projekt motozuerich-ch):
     SUPABASE_URL, SUPABASE_SERVICE_ROLE — Portal-Projekt (bereits gesetzt, wie /api/price-access)
     RESEND_API_KEY — für die Benachrichtigung (NEU hinzufügen)
*/
var NOTIFY_TO = 'team@motozuerich.ch';
var NOTIFY_FROM = 'MOTO-ZUERICH <leads@motozuerich.ch>';
var MIN_FILL_MS = 2500;

function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }
  try {
    var b = req.body;
    if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
    b = b || {};

    if (b.hp) { res.status(200).json({ ok: true }); return; }                                     // Honeypot
    if (b.elapsed_ms != null && Number(b.elapsed_ms) < MIN_FILL_MS) { res.status(200).json({ ok: true }); return; } // Time-Trap

    var email = (b.email || '').toString().trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { res.status(400).json({ ok: false, error: 'email' }); return; }
    if (b.consent !== true && b.consent !== 'true') { res.status(400).json({ ok: false, error: 'consent' }); return; }

    var details = (b.details && typeof b.details === 'object' && !Array.isArray(b.details)) ? b.details : null;
    if (details) { try { if (JSON.stringify(details).length > 4000) details = null; } catch (e) { details = null; } }
    var quelle = (b.quelle && typeof b.quelle === 'object' && !Array.isArray(b.quelle)) ? b.quelle : null;

    var row = {
      form_key: (b.form_key === 'ask') ? 'ask' : 'kontakt',
      betreff: b.betreff ? b.betreff.toString().slice(0, 200) : null,
      name: b.name ? b.name.toString().slice(0, 200) : null,
      email: email.slice(0, 254),
      phone: b.phone ? b.phone.toString().slice(0, 60) : null,
      firma: b.firma ? b.firma.toString().slice(0, 200) : null,
      consent: true,
      nachricht: b.nachricht ? b.nachricht.toString().slice(0, 5000) : null,
      details: details,
      quelle: quelle
    };

    var url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE;
    if (!url || !key) { res.status(500).json({ ok: false, error: 'config' }); return; }
    var r = await fetch(url.replace(/\/$/, '') + '/rest/v1/mz_kontakt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': key, 'Authorization': 'Bearer ' + key, 'Prefer': 'return=minimal' },
      body: JSON.stringify(row)
    });
    if (!r.ok) { res.status(502).json({ ok: false, error: 'db' }); return; }

    // Benachrichtigung an team@ — nicht kritisch, der Lead ist schon gespeichert.
    var rk = process.env.RESEND_API_KEY;
    if (rk) {
      try {
        var subj = row.form_key === 'ask' ? 'Frage über motozuerich.ch' : ('Kundenanfrage – ' + (row.betreff || ''));
        var rows = '';
        var addRow = function (k, v) { if (v) rows += '<tr><td style="padding:3px 12px 3px 0;color:#666;vertical-align:top">' + esc(k) + '</td><td><b>' + esc(v) + '</b></td></tr>'; };
        addRow('Betreff', row.betreff);
        addRow('Name', row.name);
        addRow('Firma', row.firma);
        addRow('E-Mail', row.email);
        addRow('Telefon', row.phone);
        if (details) Object.keys(details).forEach(function (k) { addRow(k, details[k]); });
        var msg = row.nachricht ? '<p style="white-space:pre-wrap;margin:14px 0;font-size:14px">' + esc(row.nachricht) + '</p>' : '';
        var html = '<div style="font-family:system-ui,Arial,sans-serif;color:#111">'
          + '<h2 style="margin:0 0 10px;font-size:18px">' + esc(subj) + '</h2>'
          + '<table style="border-collapse:collapse;font-size:14px">' + rows + '</table>' + msg
          + '<p style="color:#999;font-size:12px;margin-top:16px">motozuerich.ch · Kundenanfrage-Formular</p></div>';
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + rk, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: NOTIFY_FROM, to: [NOTIFY_TO], reply_to: row.email, subject: subj, html: html })
        });
      } catch (e) { /* Mail-Fehler kippt die gespeicherte Anfrage nicht */ }
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
};
