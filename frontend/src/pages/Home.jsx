import React from "react";
import { Link } from "react-router-dom";
import "../style/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* Présentation du jeu */}
      <section className="intro-section">
        <h1 className="game-title">🎵 Bienvenue sur <span>BeatGuess</span> !</h1>
        <p className="game-description">
          Teste tes connaissances musicales en devinant le plus rapidement possible les morceaux joués. 
          Affronte tes amis ou des joueurs du monde entier dans une ambiance fun et compétitive !
        </p>
        <div className="action-buttons">
          <Link to="/signup" className="btn primary-btn">🚀 Commencer</Link>
          <Link to="/rooms" className="btn secondary-btn">🎮 Voir les Rooms</Link>
        </div>
      </section>

      {/* Explication des règles */}
      <section className="rules-section">
        <h2>📜 Règles du jeu</h2>
        <ul className="rules-list">
          <li>🎶 Un extrait musical est joué.</li>
          <li>⏳ Tu as quelques secondes pour deviner le titre ou l’artiste.</li>
          <li>💬 Écris ta réponse dans le chat avant les autres joueurs.</li>
          <li>🏆 Le plus rapide gagne des points.</li>
          <li>🔀 Plusieurs rounds pour un maximum de fun !</li>
        </ul>
        <p className="bonus-info">🔥 Rejoins une room et montre tes skills !</p>
      </section>

      {/* Call-to-Action final */}
      <div className="final-cta">
        <p>Prêt à jouer ?</p>
        <Link to="/signup" className="btn primary-btn">🎧 Rejoindre une partie</Link>
      </div>
    </div>
  );
};

export default Home;
