import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoom, startGame } from '../api/api';
import { AuthContext } from '../context/AuthContext';
import '../style/Room.css';

const genres = ['Pop', 'Rock', 'Rap', 'Classique', 'Jazz', 'Electro'];

function Room() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) {
      console.warn('🚨 Aucun utilisateur trouvé, redirection...');
      alert('Vous devez être connecté pour rejoindre une room.');
      navigate('/login');
      return;
    }

    fetchRoomData();
  }, []);

  const fetchRoomData = async () => {
    try {
      const response = await getRoom(id);
      setRoom(response.data);
      setLoading(false);
      console.log('✅ Room trouvée :', response.data);

      if (!response.data.players.includes(user.id)) {
        console.warn('🚨 L\'utilisateur n\'est pas dans cette room !');
        alert('Vous n\'êtes pas dans cette room !');
        navigate('/rooms');
        return;
      }

      if (response.data.game_id) {
        navigate(`/game/${response.data.game_id}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement de la room :', error);
      setLoading(false);
      alert('Room introuvable !');
      navigate('/rooms');
    }
  };

  const handleStartGame = async () => {
    if (!selectedGenre) {
      alert('Veuillez choisir un genre avant de jouer !');
      return;
    }

    try {
      await startGame(id);
      navigate(`/game/${id}`);
    } catch (error) {
      console.error('❌ Erreur lors du démarrage de la partie :', error);
    }
  };

  return (
    <div className="room-container">
      {loading ? (
        <p>Chargement de la room...</p>
      ) : room ? (
        <>
          <h1>🎵 Room : {room.name}</h1>
          <h2>Joueurs : {room.players.length}</h2>
          <h3>Statut : {room.status}</h3>

          <div className="genres-list">
            {genres.map((genre) => (
              <button
                key={genre}
                className={`genre-button ${selectedGenre === genre ? 'selected' : ''}`}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>

          <button className="start-game" onClick={handleStartGame}>
            ▶ Commencer à jouer
          </button>
        </>
      ) : (
        <p>Room introuvable...</p>
      )}
    </div>
  );
}

export default Room;
