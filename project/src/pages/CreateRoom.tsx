import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Users, ArrowLeft } from 'lucide-react';
import { roomService } from '../services/Api';

export const CreateRoom: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    genre: 'Mix',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await roomService.createRoom(formData.name, formData.genre);
      navigate(`/room/${response.data.room_id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la création de la salle');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/rooms')}
        className="text-white mb-6 flex items-center gap-2 hover:text-[#FFCC00] transition-colors"
      >
        <ArrowLeft size={20} />
        Retour aux salles
      </button>

      <div className="bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Créer une nouvelle salle</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Nom de la salle
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#003399] focus:border-transparent"
                placeholder="Entrez le nom de la salle"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="genre">
              Genre
            </label>
            <div className="relative">
              <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                id="genre"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#003399] focus:border-transparent appearance-none"
              >
                <option value="Mix">Mix</option>
                <option value="Pop">Pop</option>
                <option value="Rock">Rock</option>
                <option value="Jazz">Jazz</option>
                <option value="Classical">Classique</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#FFCC00] text-[#003399] py-3 rounded-lg font-semibold hover:bg-[#FFD633] transition-colors"
          >
            Créer la salle
          </button>
        </form>
      </div>
    </div>
  );
};