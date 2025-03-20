import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { roomService, gameService, initSocket } from '../services/Api';
import { Trophy, MessageCircle, Home } from 'lucide-react';

interface Player {
  id: string;
  username: string;
  score: number;
}

interface Question {
  text: string;
  choices: string[];
}

export const Room: React.FC = () => {
  const { id } = useParams();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const socket = initSocket();
    
    // Charger les informations de la room
    const loadRoom = async () => {
      try {
        const response = await roomService.getRoom(id!);
        setPlayers(response.data.players);
      } catch (error) {
        console.error('Erreur lors du chargement de la room:', error);
      }
    };

    loadRoom();

    // Écouter les événements socket
    socket.on('new_round', (data) => {
      setCurrentQuestion(data.question);
      setTimeLeft(30);
      setGameStatus('playing');
    });

    socket.on('update_scores', (data) => {
      setPlayers(data.scores);
    });

    socket.on('game_over', (data) => {
      setGameStatus('finished');
    });

    return () => {
      socket.off('new_round');
      socket.off('update_scores');
      socket.off('game_over');
    };
  }, [id]);

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer) return;
    
    try {
      await gameService.submitAnswer(id!, 'username', selectedAnswer);
      setSelectedAnswer('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la réponse:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Section principale du jeu */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#003399]">Salle #{id}</h1>
            <div className="text-lg font-semibold text-[#FFCC00]">
              {timeLeft}s
            </div>
          </div>

          {gameStatus === 'playing' && currentQuestion && (
            <div className="space-y-6">
              <p className="text-xl font-medium text-center mb-8">
                {currentQuestion.text}
              </p>
              <div className="grid grid-cols-1 gap-4">
                {currentQuestion.choices.map((choice, index) => (
                  <button
                    key={index}
                    className={`p-4 rounded-lg text-left transition-colors ${
                      selectedAnswer === choice
                        ? 'bg-[#FFCC00] text-[#003399]'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedAnswer(choice)}
                  >
                    {choice}
                  </button>
                ))}
              </div>
              <button
                className="w-full mt-6 bg-[#003399] text-white py-3 rounded-lg hover:bg-[#002266] transition-colors"
                onClick={handleAnswerSubmit}
              >
                Valider la réponse
              </button>
            </div>
          )}

          {gameStatus === 'waiting' && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">En attente du début de la partie...</p>
            </div>
          )}
        </div>

        {/* Sidebar avec les scores et le chat */}
        <div className="space-y-6">
          {/* Classement */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="text-[#FFCC00]" />
              <h2 className="text-xl font-semibold">Classement</h2>
            </div>
            <div className="space-y-3">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="font-medium">
                    {index + 1}. {player.username}
                  </span>
                  <span className="text-[#003399] font-semibold">
                    {player.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="text-[#FFCC00]" />
              <h2 className="text-xl font-semibold">Chat</h2>
            </div>
            <div className="h-48 overflow-y-auto mb-4 space-y-2">
              {messages.map((msg, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded">
                  {msg}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border rounded-lg px-3 py-2"
                placeholder="Votre message..."
              />
              <button className="bg-[#FFCC00] text-[#003399] px-4 py-2 rounded-lg hover:bg-[#FFD633] transition-colors">
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};