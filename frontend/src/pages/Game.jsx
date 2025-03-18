import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { joinGame, submitAnswer } from "../api/api";
import { socket } from "../api/socket";
import "../style/Game.css";

function Game() {
  const { id: room_id } = useParams(); // ✅ Récupérer l'ID de la room
  const navigate = useNavigate();
  const user_id = localStorage.getItem("user_id");
  const username = localStorage.getItem("username");

  const [currentSong, setCurrentSong] = useState(null);
  const [answer, setAnswer] = useState("");
  const [scores, setScores] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  // 📌 Rejoindre la partie
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await joinGame(user_id, room_id);
        if (response.data.current_song) {
          setCurrentSong(response.data.current_song);
        }
      } catch (err) {
        console.error("❌ Erreur en rejoignant la partie :", err);
      }
    };

    fetchGame();

    // 📡 Gestion des événements WebSocket
    socket.on("new_round", (data) => {
      console.log("🎵 Nouveau round reçu :", data);
      setCurrentSong(data.song_title);
    });

    socket.on("update_scores", (data) => {
      console.log("📊 Mise à jour des scores :", data);
      setScores(data.scores);
    });

    socket.on("game_over", (data) => {
      console.log("🏆 Partie terminée :", data);
      setGameOver(true);
      setWinner(data.winner);
    });

    return () => {
      socket.off("new_round");
      socket.off("update_scores");
      socket.off("game_over");
    };
  }, [room_id, user_id]);

  // 📌 Soumettre une réponse
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;

    try {
      await submitAnswer(room_id, username, answer);
      setAnswer("");
    } catch (err) {
      console.error("❌ Erreur lors de la soumission :", err);
    }
  };

  // 📌 Retour aux Rooms après la fin du jeu
  const handleBackToRooms = () => {
    navigate("/rooms");
  };

  return (
    <div className="game-container">
      <h1>🎶 Blind Test</h1>

      {!gameOver ? (
        <>
          <h2>Devinez la musique !</h2>
          <p>🎵 Titre actuel : {currentSong || "En attente..."}</p>

          <input
            type="text"
            placeholder="Entrez votre réponse..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <button onClick={handleSubmitAnswer}>Envoyer</button>

          <div className="scores">
            <h3>📊 Scores</h3>
            <ul>
              {scores.map((player) => (
                <li key={player.username}>
                  {player.username}: {player.score} points
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="game-over">
          <h2>🏆 Partie terminée !</h2>
          <p>Le gagnant est : {winner}</p>
          <button onClick={handleBackToRooms}>Retour aux Rooms</button>
        </div>
      )}
    </div>
  );
}

export default Game;
