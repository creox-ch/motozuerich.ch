/* MOTO-ZÜRICH UI kit — Presse (media coverage cards) */

const PRESS = [
  { src: "Blick", title: "Publikumserfolg an der 1. MOTO-ZÜRICH" },
  { src: "Tages-Anzeiger", title: "Neue Motorradmesse in Oerlikon" },
  { src: "Moto.ch", title: "Der Messe-Rückblick" },
  { src: "1000PS", title: "Fotos und Bericht zur MOTO-ZÜRICH 2026" },
  { src: "Streetlife", title: "Das sind die Highlights der MOTO-ZÜRICH" },
];

function PressSection() {
  return (
    <section className="block" id="presse">
      <FadeIn className="section-label"><span>Presse · Berichterstattung 2026</span></FadeIn>
      <h2 className="section-title">Die Presse über<br/><span className="hl">MOTO-ZÜRICH 2026</span></h2>
      <FadeIn as="p" className="section-lead">
        Erste Eindrücke in der Berichterstattung. Die <b>vollständige Foto- und
        Videodokumentation</b> sowie der ausführliche Rückblick folgen
        <span className="hl-soft"> im Juli 2026</span>.
      </FadeIn>
      <div className="press-grid">
        {PRESS.map((p, i) => (
          <a className="press-card" href="#" key={i} onClick={e => e.preventDefault()}>
            <div className="press-card-source">{p.src}</div>
            <div className="press-card-title">{p.title}</div>
            <div className="press-card-arrow">Artikel lesen →</div>
          </a>
        ))}
      </div>
    </section>
  );
}

Object.assign(window, { PressSection });
