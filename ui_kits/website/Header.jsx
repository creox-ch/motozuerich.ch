/* MOTO-ZÜRICH UI kit — Header (date bar + sticky glass nav) */
const { useState } = React;

const LOGO = "../../assets/logo-moto-zuerich.svg";

function DateBar() {
  const items = ["MOTO-ZÜRICH 2027", "19.–21. Februar 2027", "Wird grösser", "Save the Date"];
  const run = [...items, ...items, ...items];
  return (
    <div className="date-bar">
      <div className="date-bar-track">
        {run.map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="header-inner">
        <a href="#top" className="logo-link" aria-label="MOTO-ZÜRICH Home">
          <img className="logo-svg" src={LOGO} alt="MOTO-ZÜRICH" />
        </a>
        <button className="nav-mobile-toggle" aria-label="Menü" onClick={() => setOpen(o => !o)}>☰</button>
        <nav className={open ? "open" : ""}>
          <ul>
            <li><a href="#top" onClick={() => setOpen(false)}>Home</a></li>
            <li><a href="#rueckblick" onClick={() => setOpen(false)}>Rückblick 2026</a></li>
            <li><a href="#presse" onClick={() => setOpen(false)}>Presse</a></li>
            <li><a href="#" className="nav-cta">Aussteller werden →</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

Object.assign(window, { DateBar, Header });
