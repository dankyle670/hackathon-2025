import React, { useState } from 'react';
import { Trophy, Award, Star, Gift } from 'lucide-react';

interface UserStats {
  totalGames: number;
  totalPoints: number;
  winRate: number;
  badges: string[];
  donationPoints: number;
}

export const Profile: React.FC = () => {
  const [stats] = useState<UserStats>({
    totalGames: 150,
    totalPoints: 3750,
    winRate: 65,
    badges: ['Expert Histoire', 'Champion Géographie', 'Maître Quiz'],
    donationPoints: 1000,
  });

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profil principal */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="Profile"
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold">Felix Schmidt</h1>
                <p className="text-gray-600">Membre depuis Mars 2024</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-[#003399]">
                  {stats.totalGames}
                </div>
                <div className="text-gray-600">Parties jouées</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-[#003399]">
                  {stats.totalPoints}
                </div>
                <div className="text-gray-600">Points totaux</div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Trophy className="text-[#FFCC00]" />
                Statistiques
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Taux de victoire</span>
                  <span className="font-semibold">{stats.winRate}%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Meilleure catégorie</span>
                  <span className="font-semibold">Histoire</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>Pays favori</span>
                  <span className="font-semibold">Allemagne</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Badges */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Award className="text-[#FFCC00]" />
              Badges
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {stats.badges.map((badge, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Star className="text-[#FFCC00]" />
                  <span className="font-medium">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Section Dons */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Gift className="text-[#FFCC00]" />
            Points de don
          </h2>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-[#003399]">
              {stats.donationPoints}
            </div>
            <div className="text-gray-600">points disponibles</div>
          </div>
          <button className="w-full bg-[#FFCC00] text-[#003399] py-3 rounded-lg hover:bg-[#FFD633] transition-colors font-semibold">
            Faire un don
          </button>
          <p className="text-sm text-gray-600 mt-4 text-center">
            Convertissez vos points en dons pour des associations européennes
          </p>
        </div>
      </div>
    </div>
  );
};