import { useEffect, useState } from "react";
import { Logo } from "./Logo";

export function Navbar({ onOpenWidget }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (e) => {
    const href = e.currentTarget.getAttribute("href");
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <nav className={`nav ${scrolled ? "nav-solid" : ""}`}>
      <div className="container nav-inner">
        <a href="#top" className="nav-logo" onClick={handleNavClick}>
          <Logo size={32} />
        </a>
        <ul className="nav-links">
          <li><a href="#features" className="nav-link" onClick={handleNavClick}>Features</a></li>
          <li><a href="#how" className="nav-link" onClick={handleNavClick}>How it works</a></li>
          <li><a href="#use-cases" className="nav-link" onClick={handleNavClick}>Use cases</a></li>
        </ul>
        <button className="btn btn-primary nav-cta" onClick={onOpenWidget}>
          Open ChefBot
        </button>
      </div>
    </nav>
  );
}
