import React, { useEffect, useState } from 'react';
import { leaderboardService } from '../services/Api';
import { Trophy, Medal, Star } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  profile_picture: string;
  total_score: number;
  games_played: number;
}

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const response = await leaderboardService.getGlobalLeaderboard();
        setLeaderboard(response.data.leaderboard);
        setError(null);
      } catch (error) {
        console.error('Erreur lors du chargement du classement:', error);
        setError('Impossible de charger le classement. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-[#FFD700]" size={24} />;
      case 2:
        return <Medal className="text-[#C0C0C0]" size={24} />;
      case 3:
        return <Medal className="text-[#CD7F32]" size={24} />;
      default:
        return <Star className="text-[#FFCC00]" size={24} />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="loading-bar"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <p className="text-red-500 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-4xl font-bold text-white text-center mb-8">
        Classement Général
      </h1>

      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            {leaderboard.map((entry) => (
              <div
                key={entry.user_id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8">
                    {getMedalIcon(entry.rank)}
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src={entry.profile_picture}
                      alt={entry.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{entry.username}</h3>
                      <p className="text-sm text-gray-600">
                        {entry.games_played} parties jouées
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#003399]">
                    {entry.total_score}
                  </div>
                  <div className="text-sm text-gray-600">points</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};