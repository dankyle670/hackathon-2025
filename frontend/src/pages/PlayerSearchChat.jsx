import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import '../style/PlayerSearchChat.css';

function PlayerSearchChat() {
  const [search, setSearch] = useState('');
  const [players, setPlayers] = useState([
    { id: 1, name: 'Alex' },
    { id: 2, name: 'Sophie' },
    { id: 3, name: 'Jordan' },
    { id: 4, name: 'Emma' },
    { id: 5, name: 'Liam' }
  ]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="player-search-container">
      <h1 className="title">Chats</h1>
      <div className="search-box">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Who would you like to chat with?"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredPlayers.length === 0 ? (
        <p className="info-text">Start playing to connect with other players</p>
      ) : (
        <div className="player-list">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              className={`player-item ${selectedPlayer?.id === player.id ? 'selected' : ''}`}
              onClick={() => setSelectedPlayer(player)}
            >
              <span className="player-name">{player.name}</span>
            </div>
          ))}
        </div>
      )}

      {selectedPlayer && (
        <div className="chat-box">
          <h3>Chat with {selectedPlayer.name}</h3>
          <textarea
            placeholder="Write a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={() => alert(`Message sent to ${selectedPlayer.name}: ${message}`)}>Send</button>
        </div>
      )}

      <button className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>
    </div>
  );
}

export default PlayerSearchChat;
