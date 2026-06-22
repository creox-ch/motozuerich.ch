/* MOTO-ZÜRICH UI kit — Hero identity (gradient + wordmark) & Aussteller strip */

function HeroIdentity() {
  return (
    <section className="hero-identity" id="top">
      <div className="hero-identity-inner">
        <div className="hero-eyebrow">Save the Date · Zürich-Oerlikon</div>
        <div className="hero-wordmark">MOTO-<wbr/>ZÜRICH</div>
        <div className="hero-date-badge">
          <span className="hero-date-num">19.–21.</span>
          <span className="hero-date-rest">Februar 2027</span>
        </div>
        <div className="hero-divider"></div>
        <div className="hero-slogan">Erleben. Entdecken.<br/>Eintauchen.</div>
      </div>
    </section>
  );
}

function AusstellerStrip() {
  return (
    <section className="strip">
      <div className="strip-inner">
        <div className="strip-text">Werde Teil der <b>MOTO-ZÜRICH 2027</b></div>
        <a href="#" className="strip-btn">Aussteller werden <span>→</span></a>
      </div>
    </section>
  );
}

Object.assign(window, { HeroIdentity, AusstellerStrip });
