import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search } from 'lucide-react';
import { roomService } from '../services/Api';

interface Room {
  id: string;
  name: string;
  genre: string;
  status: string;
  players: string[];
  game_id: string | null;
}

export const RoomList: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await roomService.getRooms();
        setRooms(response.data.rooms);
      } catch (err) {
        setError('Erreur lors du chargement des rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
    const interval = setInterval(fetchRooms, 5000); // Rafraîchir toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#003399] flex items-center justify-center">
        <div className="loading-bar w-48"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Salles disponibles</h1>
        <button
          onClick={() => navigate('/create-room')}
          className="bg-[#FFCC00] text-[#003399] px-6 py-3 rounded-lg font-semibold hover:bg-[#FFD633] transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Créer une salle
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-xl p-6">
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher une salle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#003399] focus:border-transparent"
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => navigate(`/room/${room.id}`)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-[#003399]">{room.name}</h3>
                  <p className="text-gray-600">{room.genre}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users size={20} className="text-gray-400" />
                    <span className="text-gray-600">{room.players.length}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    room.status === 'playing'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {room.status === 'playing' ? 'En cours' : 'En attente'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredRooms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucune salle ne correspond à votre recherche
            </div>
          )}
        </div>
      </div>
    </div>
  );
};