import React from "react";
import { Link } from "react-router-dom";
import "../style/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* Présentation du jeu */}
      <section className="intro-section">
        <h1 className="game-title">⭐️ Bienvenue sur <span>EuroMatch</span> !</h1>
        <p className="game-description">
          Teste tes connaissances sur l'Europe en répondant à des questions sur différents thèmes !
          Défie tes amis ou des joueurs du monde entier et montre ta culture générale !
        </p>
        <div className="action-buttons">
          <Link to="/signup" className="btn primary-btn">🚀 Commencer</Link>
          <Link to="/categories" className="btn secondary-btn">📚 Choisir une catégorie</Link>
        </div>
      </section>

      {/* Explication des règles */}
      <section className="rules-section">
        <h2>📜 Règles du jeu</h2>
        <ul className="rules-list">
          <li>❓ Sélectionne un ou plusieurs thèmes de questions.</li>
          <li>⏳ Tu as quelques secondes pour répondre correctement.</li>
          <li>🏆 Gagne des points en répondant juste et rapidement.</li>
          <li>🌍 Défie d'autres joueurs et grimpe dans le classement !</li>
        </ul>
        <p className="bonus-info">🔥 Lance-toi et teste tes connaissances !</p>
      </section>

      {/* Call-to-Action final */}
      <div className="final-cta">
        <p>Prêt à jouer ?</p>
        <Link to="/signup" className="btn primary-btn">🎮 Commencer l'aventure</Link>
      </div>
    </div>
  );
};

export default Home;