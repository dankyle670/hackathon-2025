import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/CreateRoomAlert.css";

const CreateRoomAlert = ({ onCreate }) => {
  const [roomName, setRoomName] = useState("");
  const [participants, setParticipants] = useState(2);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomName.trim()) {
      alert("Le nom de la room est requis !");
      return;
    }
    if (participants < 2) {
      alert("Le nombre minimum de participants est 2.");
      return;
    }

    const newRoom = { id: Date.now(), name: roomName, participants };
    onCreate(newRoom);
    setRoomName("");
    setParticipants(2);

    // 🔄 Redirection automatique vers la sélection des genres après création
    navigate(`/room/${newRoom.id}/genres`);
  };

  return (
    <div className="create-room-alert">
      <h3>➕ Créer une Room</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom de la Room"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          required
        />
        <input
          type="number"
          min="2"
          max="50"
          placeholder="Nombre de participants"
          value={participants}
          onChange={(e) => setParticipants(parseInt(e.target.value, 10))}
          required
        />
        <button type="submit">Créer</button>
      </form>
    </div>
  );
};

export default CreateRoomAlert;
