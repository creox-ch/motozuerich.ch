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
        var F = "'Public Sans',-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif";
        var O = "'Oswald','Arial Narrow',Arial,sans-serif";
        var rows = '';
        var addRow = function (k, v) { if (v) rows += '<tr>'
          + '<td style="padding:9px 16px 9px 0;border-bottom:1px solid #ece8e0;color:#6f6b62;font-size:11px;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;vertical-align:top">' + esc(k) + '</td>'
          + '<td style="padding:9px 0;border-bottom:1px solid #ece8e0;font-size:14px;font-weight:600;color:#17181c">' + esc(v) + '</td></tr>'; };
        addRow('Betreff', row.betreff);
        addRow('Name', row.name);
        addRow('Firma', row.firma);
        addRow('E-Mail', row.email);
        addRow('Telefon', row.phone);
        if (details) Object.keys(details).forEach(function (k) { addRow(k, details[k]); });
        var msg = row.nachricht ? '<tr><td colspan="2" style="padding:18px 0 2px"><div style="border:1px solid #b9b3a6;border-left:4px solid #c8391f;background:#faf8f4;padding:14px 16px;font-size:14px;line-height:1.55;color:#17181c;white-space:pre-wrap">' + esc(row.nachricht) + '</div></td></tr>' : '';
        var html = '<!doctype html><html><head><meta charset="utf-8"><meta name="color-scheme" content="light">'
          + '<style>@import url(\'https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&display=swap\');</style></head>'
          + '<body style="margin:0;background:#faf8f4;font-family:' + F + '">'
          + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f4"><tr><td align="center" style="padding:26px 12px">'
          + '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:560px;background:#ffffff;border:1px solid #dedad2">'
          + '<tr><td style="padding:18px 28px;border-bottom:3px solid #17181c">'
          +   '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>'
          +     '<td style="font-family:' + O + ';font-weight:700;font-size:20px;letter-spacing:.02em;text-transform:uppercase;color:#17181c">MOTO<span style="color:#c8391f">—</span>ZÜRICH</td>'
          +     '<td align="right" style="font-family:' + F + ';font-size:11px;color:#6f6b62;letter-spacing:.08em;text-transform:uppercase">Neue Anfrage</td>'
          +   '</tr></table>'
          + '</td></tr>'
          + '<tr><td style="padding:24px 28px 6px"><div style="font-family:' + O + ';font-weight:600;font-size:22px;line-height:1.2;color:#17181c">' + esc(subj) + '</div></td></tr>'
          + '<tr><td style="padding:10px 28px 20px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">' + rows + msg + '</table></td></tr>'
          + '<tr><td style="padding:16px 28px 20px;border-top:1px solid #dedad2;background:#faf8f4"><div style="font-family:' + F + ';font-size:12px;color:#a6a196;line-height:1.5">Automatische Benachrichtigung · motozuerich.ch/kontakt · Antwort geht direkt an <b style="color:#8f2914">' + esc(row.email) + '</b></div></td></tr>'
          + '</table></td></tr></table></body></html>';
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
