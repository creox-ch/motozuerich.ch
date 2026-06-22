/* MOTO-ZÜRICH UI kit — "Was ist MOTO-ZÜRICH" pillar grid */

const PILLARS = [
  { n: "01", cls: "aussteller", tag: "Erdgeschoss · StageOne", title: "Kuratierte Markenwelt",
    body: <>Echte Neuheiten der kommenden Saison – ausgewählt und klar inszeniert. <b>Auf 5'740 m²</b> präsentieren Marken, Händler und Importeure ihre Saison-Essenz.</> },
  { n: "02", cls: "livearena", tag: "Bühne · StageOne", title: "Live Arena",
    body: <>Das <b>Herzstück</b> für Talks, Interviews und Stories. Kurze Formate, keine endlosen Monologe – Racing-Einblicke, Reise-Geschichten und Premieren.</> },
  { n: "03", cls: "yellow", tag: "Obergeschoss · Halle 550", title: "Action Zone",
    body: <><b>Über 4'000 m²</b> Erlebnisfläche für Action, Show und Motorsport. Hier trifft <b>Adrenalin auf Community</b> – Motorsport zum Anfassen.</> },
  { n: "04", cls: "", tag: "Chicago Bar", title: "Saisonstart-Party",
    body: <>Wenn der Tag endet, geht es weiter: Fahrer:innen, Händler und Friends feiern den Saisonstart – mit <b>DJ-Sets, Drinks und Zürich-Flair.</b></> },
];

function PillarSection() {
  return (
    <section className="block" id="event">
      <FadeIn className="section-label">
        <span>Über das Event · Für alle, die noch nicht dabei waren</span>
      </FadeIn>
      <h2 className="section-title">Die <span className="hl">MOTO-ZÜRICH</span><br/>auf einen Blick</h2>
      <FadeIn as="p" className="section-lead">
        Der <b>unabhängige Saisonauftakt</b> der Schweizer Motorradszene – ein urbanes,
        kuratiertes Drei-Tage-Event in Zürich-Oerlikon. Statt Messe-Gigantismus setzen wir auf
        <b> Qualität, Nähe und Erlebnis</b>: kompakt statt überdimensioniert, persönlich statt anonym.
      </FadeIn>
      <div className="what-grid">
        {PILLARS.map(p => (
          <div key={p.n} className={"what-card " + p.cls}>
            <div className="what-card-num">{p.n}</div>
            <div className="what-card-tag">{p.tag}</div>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

Object.assign(window, { PillarSection });
