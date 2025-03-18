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
  const navigate = useNavigate();

  // 📌 Vérifier si l'utilisateur est connecté
  useEffect(() => {
    console.log('🔍 Vérification de l\'utilisateur :', { user, token });

    if (!user || !token) {
      console.warn('⚠️ Aucun utilisateur trouvé, redirection...');
      navigate('/login');
    } else {
      fetchRooms();
    }
  }, [user, token, navigate]);

  // 📌 Charger les rooms disponibles
  const fetchRooms = async () => {
    try {
      console.log('📡 Envoi de la requête GET /api/rooms');
      const response = await getRooms();
      console.log('✅ Réponse reçue :', response.data);
      setRooms(response.data.rooms);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des rooms :', error);
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
          <p>Aucune room disponible</p>
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
