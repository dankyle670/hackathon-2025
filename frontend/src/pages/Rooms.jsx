import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Rooms.css';
import { getRooms, createRoom, joinRoom } from '../api/api';
import { AuthContext } from '../context/AuthContext';

function Rooms() {
  const { user, token } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);  // Ajout de l'état de chargement
  const [error, setError] = useState(null);      // Ajout de l'état d'erreur
  const navigate = useNavigate();

  // 📌 Vérifier si l'utilisateur est connecté
  useEffect(() => {
    if (!user || !token) {
      console.warn('⚠️ Aucun utilisateur trouvé, redirection...');
      navigate('/login');
    } else {
      fetchRooms(); // Chargement des rooms lorsque l'utilisateur est connecté
    }
  }, [user, token, navigate]);

  // 📌 Charger les rooms disponibles
  const fetchRooms = async () => {
    try {
      console.log('📡 Envoi de la requête GET /api/rooms');
      const response = await getRooms();
      setRooms(response.data.rooms);
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des rooms :', error);
      setError('Erreur lors du chargement des rooms.');
      setLoading(false);
    }
  };

  // 📌 Créer une nouvelle room et rediriger
  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
      const response = await createRoom(newRoomName, 'Mix');
      const newRoom = response.data;

      setRooms([...rooms, { id: newRoom.room_id, name: newRoomName, game_id: null }]);
      setNewRoomName('');
      setShowForm(false);
      navigate(`/room/${newRoom.room_id}`);
    } catch (error) {
      console.error('❌ Erreur lors de la création de la room :', error);
    }
  };

  // 📌 Rejoindre une room
  const handleJoinRoom = async (roomId, gameId) => {
    if (!user) {
      alert('Vous devez être connecté pour rejoindre une room.');
      return;
    }

    try {
      await joinRoom(user.id, roomId);
      if (gameId) {
        navigate(`/game/${gameId}`); // ✅ Redirection vers la partie en cours si elle existe
      } else {
        navigate(`/room/${roomId}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la connexion à la room :', error);
    }
  };

  return (
    <div className="rooms-container">
      <h1 className="rooms-title">🎭 Choisis une Room</h1>

      {/* Affichage de l'état de chargement ou d'erreur */}
      {loading && <p>Chargement des rooms...</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="rooms-buttons">
        {rooms.length > 0 ? (
          rooms.map(room => (
            <button
              key={room.id}
              className="room-button"
              onClick={() => handleJoinRoom(room.id, room.game_id)}
            >
              {room.name} ({room.players?.length || 0} joueurs) {room.game_id ? '🎮 Partie en cours' : ''}
            </button>
          ))
        ) : (
          !loading && <p>Aucune room disponible</p>  // N'afficher ce message que si les rooms sont chargées
        )}
      </div>

      <button className="create-room-button" onClick={() => setShowForm(true)}>➕ Créer une Room</button>

      {showForm && (
        <div className="room-alert">
          <input
            type="text"
            placeholder="Nom de la room"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <button onClick={handleCreateRoom}>Créer</button>
          <button className="close-alert" onClick={() => setShowForm(false)}>✖</button>
        </div>
      )}
    </div>
  );
}

export default Rooms;
