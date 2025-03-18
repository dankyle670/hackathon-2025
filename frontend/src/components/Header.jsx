import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../style/Header.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      {/* Logo cliquable qui ramène à l'accueil */}
      <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
        🎵 <span>BeatGuess</span>
      </Link>

      {/* Bouton du menu burger pour mobile */}
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      {/* Navigation avec état "open" pour le menu mobile */}
      <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Accueil</Link>
        <Link to="/rooms" onClick={() => setMenuOpen(false)}>Rooms</Link>
        <Link to="/signup" onClick={() => setMenuOpen(false)}>Inscription</Link>
        <Link to="/login" onClick={() => setMenuOpen(false)}>Connexion</Link>
        <Link to="/profile" className="profile-link" onClick={() => setMenuOpen(false)}>👤 Profil</Link>
      </nav>
    </header>
  );
};

export default Header;
