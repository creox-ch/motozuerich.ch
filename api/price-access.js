/* POST /api/price-access
   Preis-Gate der Standflächen-Karte (motozuerich.ch).
   Nimmt einen Lead entgegen, schreibt ihn nach mz_preis_interesse (Portal-DB,
   Supabase-Projekt nitvaqtqttaykkqmdumk) und antwortet {ok:true}. Danach
   schaltet der Client die Preise frei (rein kosmetisches Gate — Preise liegen
   im Client-Bundle; Zweck ist die Lead-Erfassung, nicht Geheimhaltung).

   Kein E-Mail-Versand, kein Double-Opt-In: minimaler Ein-Schritt-Flow.
   Zustimmung ist implizit (Absenden = consent=true); Marketing separat/optional.

   ENV (Vercel-Projekt motozuerich-ch):
     SUPABASE_URL           – URL des Portal-Projekts (…supabase.co)
     SUPABASE_SERVICE_ROLE  – service_role Key desselben Projekts (nur serverseitig!)
*/
module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }
  try {
    var b = req.body;
    if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
    b = b || {};

    // Honeypot: befülltes Feld => Bot. Erfolg vortäuschen, nichts speichern.
    if (b.hp) { res.status(200).json({ ok: true }); return; }

    var email = (b.email || '').toString().trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      res.status(400).json({ ok: false, error: 'email' }); return;
    }

    var url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE;
    if (!url || !key) { res.status(500).json({ ok: false, error: 'config' }); return; }

    // quelle nur als flaches Objekt akzeptieren und in der Groesse begrenzen
    var q = (b.quelle && typeof b.quelle === 'object' && !Array.isArray(b.quelle)) ? b.quelle : null;
    if (q) { try { if (JSON.stringify(q).length > 2000) q = null; } catch (e) { q = null; } }

    var row = {
      email: email.slice(0, 254),
      firma: ((b.firma || '').toString().trim().slice(0, 200)) || null,
      consent: true,
      marketing_consent: !!b.marketing_consent,
      stand_id: b.stand_id ? b.stand_id.toString().slice(0, 32) : null,
      quelle: q
    };

    // Upsert per E-Mail (braucht UNIQUE(email) auf der Tabelle).
    var r = await fetch(url.replace(/\/$/, '') + '/rest/v1/mz_preis_interesse?on_conflict=email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': 'Bearer ' + key,
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify(row)
    });
    if (!r.ok) { res.status(502).json({ ok: false, error: 'db' }); return; }

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
};
