/* MOTO-ZÜRICH UI kit — Rückblick 2026 (stats + programme accordion) */
const { useRef: useRefR, useState: useStateR } = React;

const STATS = [
  { t: 2.5, fmt: "dec", suffix: "", label: <><b>Event-Tage</b><br/>20.–22. Februar 2026</> },
  { t: 10000, fmt: "ch", suffix: " m²", label: <><b>Eventfläche</b><br/>StageOne + Halle 550</> },
  { t: 80, fmt: "int", suffix: "", label: <><b>Aussteller &amp; Acts</b><br/>auf zwei Etagen</> },
  { t: 84, fmt: "int", suffix: "", label: <><b>Programm-Auftritte</b><br/>Live Arena &amp; Action Zone</> },
  { t: 22117, fmt: "ch", suffix: "", label: <><b>Besucher</b><br/>MOTO-ZÜRICH 2026</>, hi: true },
];

const PROGRAMME = [
  { side: "Live Arena", cls: "", title: "10 Programme · ~35 Auftritte", items: [
    ["01", "Suse Mühlemeier · „Building Speed\"", "Frauen, Technik & Rennsport – Stories aus Boxengasse und Paddock."],
    ["02", "Horst Saiger LIVE · TT, Macau, NW200", "Onboard-Insights von den schnellsten Strassenkursen der Welt."],
    ["03", "Dominique Aegerter LIVE aus Phillip Island", "Live-Schaltung nach Australien vom WorldSBK-Wochenende."],
    ["04", "DJane INAMAR · Saisonstart-Party", "Night-Ride Vibes – Chill Lounge bis Melodic Techno."],
  ]},
  { side: "Action Zone", cls: "action", title: "7 Shows · 49 Auftritte", items: [
    ["01", "Live-Boxenstopp · Team Bolliger", "Boxenstopps im Minutentakt – wie an der echten 24h-Rennstrecke."],
    ["02", "Chris Lietsch · Harley-Davidson Stuntshow", "Offizieller H-D DACH Stuntfahrer auf der Low Rider S."],
    ["03", "Nicola L'Impennatore (IT) · Vespa Freestyle", "Italienischer Vespa-Profi mit 30+ Tricks – bis zum Backflip."],
  ]},
  { side: "Aussteller 2026", cls: "aussteller", title: "92 Marken, Händler & Acts", items: [
    ["—", "Ducati · BMW Motorrad · Harley-Davidson · Honda", "Erdgeschoss · StageOne – 32 Stände."],
    ["—", "Triumph · Zero · Vespa · Aprilia · Moto Guzzi", "Obergeschoss · Halle 550 – 30 Stände & Marken."],
    ["—", "SAIGER Racing · MotoGP-Simulator · Food Court", "Action Zone – 30 Acts & Erlebnisse."],
  ]},
];

function Accordion() {
  const [open, setOpen] = useStateR(0);
  return (
    <div className="programm-accordion" id="programm">
      {PROGRAMME.map((g, i) => (
        <div className="programm-acc" key={i}>
          <div className="programm-acc-summary" onClick={() => setOpen(open === i ? -1 : i)}
               style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "18px", padding: "20px 22px" }}>
            <span className={"acc-side " + g.cls}>{g.side}</span>
            <span className="acc-title">{g.title}</span>
            <span className="acc-toggle">{open === i ? "–" : "+"}</span>
          </div>
          {open === i && (
            <ul className="programm-list">
              {g.items.map((it, j) => (
                <li className="programm-item" key={j}>
                  <span className="programm-num">{it[0]}</span>
                  <div>
                    <div className="programm-name">{it[1]}</div>
                    <div className="programm-desc">{it[2]}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function RueckblickSection() {
  const gridRef = useRefR(null);
  useSequentialCounters(gridRef);
  return (
    <section className="block-alt" id="rueckblick">
      <div className="inner">
        <h2 className="section-title">
          <span className="hl">Rückblick</span> 2026
        </h2>
        <FadeIn as="p" className="section-lead">
          Mit der ersten Ausgabe ist ein <b>neuer Treffpunkt</b> für die Schweizer Motorradszene
          entstanden. Auf <b>10'000 m²</b> erwartete die Besucher:innen ein vielseitiges Programm –
          die Premiere hat gezeigt: die Szene wünscht sich ein
          <span className="hl-soft"> unabhängiges, kuratiertes Event zum Saisonstart</span>.
        </FadeIn>
        <div className="nums-grid" ref={gridRef}>
          {STATS.map((s, i) => (
            <div className={"num" + (s.hi ? " hi" : "")} key={i}>
              <div className="num-big" data-target={s.t} data-fmt={s.fmt} data-suffix={s.suffix}>0</div>
              <div className="num-label">{s.label}</div>
            </div>
          ))}
        </div>
        <Accordion />
      </div>
    </section>
  );
}

Object.assign(window, { RueckblickSection });
