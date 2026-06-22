/* MOTO-ZÜRICH UI kit — Footer (dark) */

const LOGO_WHITE = "../../assets/logo-moto-zuerich-white.svg";

function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div>
          <img className="footer-logo" src={LOGO_WHITE} alt="MOTO-ZÜRICH" />
          <p className="footer-tagline">
            Der unabhängige Saisonauftakt der Schweizer Motorradszene.
            19.–21. Februar 2027 · Zürich-Oerlikon.
          </p>
          <a href="#" className="footer-cta">Aussteller werden <span>→</span></a>
        </div>
        <div className="footer-col">
          <h4>Event</h4>
          <ul>
            <li><a href="#event">Das Event</a></li>
            <li><a href="#rueckblick">Rückblick 2026</a></li>
            <li><a href="#programm">Programm</a></li>
            <li><a href="#presse">Presse</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Besuchen</h4>
          <ul>
            <li><a href="#">Anreise</a></li>
            <li><a href="#">Tickets</a></li>
            <li><a href="#">StageOne · Halle 550</a></li>
            <li><a href="#">Zürich-Oerlikon</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Kontakt</h4>
          <ul>
            <li><a href="#">yves@motozuerich.ch</a></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">Newsletter</a></li>
            <li><a href="#">Feedback</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 MOTO-ZÜRICH</span>
        <span>19.–21. Februar 2027 · Save the Date</span>
      </div>
    </footer>
  );
}

Object.assign(window, { Footer });
