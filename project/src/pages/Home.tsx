import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Brain, Globe, Trophy, Users, Music, 
  Utensils, Languages, Palette, LandPlot, Landmark, Flag
} from 'lucide-react';

const categories = [
  { id: 'history', icon: BookOpen, label: 'Histoire' },
  { id: 'science', icon: Brain, label: 'Science' },
  { id: 'geography', icon: Globe, label: 'Géographie' },
  { id: 'sports', icon: Trophy, label: 'Sport' },
  { id: 'celebrities', icon: Users, label: 'Célébrités' },
  { id: 'music', icon: Music, label: 'Musique' },
  { id: 'food', icon: Utensils, label: 'Gastronomie' },
  { id: 'language', icon: Languages, label: 'Langues' },
  { id: 'art', icon: Palette, label: 'Art/Culture' },
  { id: 'economy', icon: Landmark, label: 'Économie/Politique' },
  { id: 'nature', icon: LandPlot, label: 'Nature/Sites' },
  { id: 'eu', icon: Flag, label: 'UE-Facts' },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-white text-center mb-8">
        Bienvenue sur Euro Match
      </h1>
      
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Choisissez vos catégories
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#FFCC00] hover:bg-[#FFD633] transition-colors"
                onClick={() => navigate(`/category/${category.id}`)}
              >
                <Icon size={32} className="text-[#003399] mb-2" />
                <span className="text-[#003399] font-medium">{category.label}</span>
              </button>
            );
          })}
        </div>
        
        <div className="mt-8 flex justify-center gap-4">
          <button
            className="px-6 py-3 bg-[#003399] text-white rounded-lg hover:bg-[#002266] transition-colors"
            onClick={() => navigate('/create-room')}
          >
            Créer une salle
          </button>
          <button
            className="px-6 py-3 bg-[#003399] text-white rounded-lg hover:bg-[#002266] transition-colors"
            onClick={() => navigate('/rooms')}
          >
            Rejoindre une salle
          </button>
        </div>
      </div>
    </div>
  );
};