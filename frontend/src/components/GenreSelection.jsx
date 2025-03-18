import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../style/GenreSelection.css";

function GenreSelection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedGenres, setSelectedGenres] = useState([]);

  const genres = ["Pop", "Rock", "Hip-Hop", "Jazz", "Classique", "Électro", "Reggae", "Folk"];

  const handleGenreClick = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleStartGame = () => {
    if (selectedGenres.length === 0) {
      alert("Veuillez sélectionner au moins un genre.");
      return;
    }
    navigate(`/game/${id}`);
  };

  return (
    <div className="genre-selection-container">
      <h1>🎵 Sélectionnez un Genre</h1>
      <div className="genre-buttons">
        {genres.map((genre) => (
          <button
            key={genre}
            className={`genre-button ${selectedGenres.includes(genre) ? "selected" : ""}`}
            onClick={() => handleGenreClick(genre)}
          >
            {genre}
          </button>
        ))}
      </div>
      <button className="start-game-button" onClick={handleStartGame}>
        🎮 Commencer le Jeu
      </button>
    </div>
  );
}

export default GenreSelection;
