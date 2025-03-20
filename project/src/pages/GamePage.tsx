import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { gameService, initSocket } from '../services/Api';
import { Trophy } from 'lucide-react';

interface Question {
  text: string;
  choices: string[];
  correctAnswer: string;
}

interface Player {
  id: string;
  username: string;
  score: number;
}

export const GamePage: React.FC = () => {
  const { id } = useParams(); // Room ID
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [players, setPlayers] = useState<Player[]>([]);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    // Récupérer les informations de l'utilisateur depuis le localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    setUsername(userInfo.username || 'Guest');

    const socket = initSocket();

    // S'assurer que le socket rejoint la room
    socket.emit('join', { room: id });
    console.log(`🔌 Socket connecté et rejoint la room: ${id}`);

    // 🎯 Vérifier si une partie est en cours dès l'arrivée sur la page
    const fetchGameStatus = async () => {
      try {
        const response = await gameService.getGameStatus(id!);
        console.log("📊 Statut du jeu:", response.data);
        if (response.data.status === 'playing') {
          setGameStatus('playing');
          // Si une question est en cours, l'afficher
          if (response.data.currentQuestion) {
            setQuestion({
              text: response.data.currentQuestion.text,
              choices: response.data.currentQuestion.choices || ['A', 'B', 'C', 'D'],
              correctAnswer: response.data.currentQuestion.correctAnswer,
            });
            // Mettre à jour le temps restant si disponible
            if (response.data.timeLeft) {
              setTimeLeft(response.data.timeLeft);
            }
          }
        }
        // Mettre à jour la liste des joueurs
        if (response.data.players) {
          setPlayers(response.data.players);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération du statut du jeu:', error);
      }
    };

    fetchGameStatus();

    // 🎯 Réception d'une nouvelle question via WebSocket
    socket.on('new_round', (data) => {
      console.log("🔄 Nouvelle question reçue :", data);
      setQuestion({
        text: data.question,
        choices: data.choices || ['A', 'B', 'C', 'D'],
        correctAnswer: data.correctAnswer,
      });
      setTimeLeft(30);
      setGameStatus('playing');
    });

    // 🎯 Mise à jour du score des joueurs
    socket.on('update_scores', (data) => {
      console.log("🔄 Données reçues du backend :", data);
      console.log("📈 Mise à jour des scores:", data.scores);
      setPlayers(data.scores);
    });

    // 🎯 Fin de la partie
    socket.on('game_over', (data) => {
      console.log("🏁 Fin de la partie:", data);
      setGameStatus('finished');
    });

    // Timer pour le compte à rebours
    let timer: NodeJS.Timeout;
    if (gameStatus === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
      socket.off('new_round');
      socket.off('update_scores');
      socket.off('game_over');
      socket.emit('leave', { room: id });
    };
  }, [id, gameStatus]);

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return;
    try {
      console.log(`🔹 Soumission de la réponse: ${selectedAnswer} par ${username}`);
      await gameService.submitAnswer(id!, username, selectedAnswer);
      setSelectedAnswer('');
    } catch (error) {
      console.error('❌ Erreur lors de la soumission de la réponse:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#003399] text-center">Game Room #{id}</h1>
      
      {/* Timer visible pendant le jeu */}
      {gameStatus === 'playing' && (
        <div className="text-center mt-2">
          <span className="text-xl font-bold text-[#FFCC00]">{timeLeft}s</span>
        </div>
      )}
      
      {gameStatus === 'playing' && question && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">{question.text}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.choices.map((choice, index) => (
              <button
                key={index}
                className={`p-3 rounded-lg ${
                  selectedAnswer === choice 
                    ? 'bg-[#FFCC00] text-[#003399]' 
                    : 'bg-gray-200 hover:bg-gray-300'
                } transition-colors`}
                onClick={() => setSelectedAnswer(choice)}
              >
                {choice}
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            className={`mt-4 py-2 px-6 rounded-lg w-full ${
              selectedAnswer 
                ? 'bg-[#003399] text-white hover:bg-[#002266]' 
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            } transition-colors`}
          >
            Submit Answer
          </button>
        </div>
      )}
      
      {gameStatus === 'waiting' && (
        <div className="text-center py-8 bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-bold">Waiting for the game to start...</h2>
          <p className="text-gray-600 mt-2">
            The host needs to start the game from the room page.
          </p>
        </div>
      )}
      
      {gameStatus === 'finished' && (
        <div className="text-center py-8 bg-white p-6 rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-bold">Game Over!</h2>
          {players.length > 0 && (
            <p className="text-lg mt-4">
              🏆 Winner: <span className="font-bold text-[#FFCC00]">{players[0].username}</span> with {players[0].score} points!
            </p>
          )}
        </div>
      )}
      
      <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Trophy className="text-[#FFCC00]" /> Leaderboard
        </h2>
        {players.length > 0 ? (
          <ul className="mt-4 divide-y">
            {players.map((player, index) => (
              <li key={player.id} className="flex justify-between p-2">
                <span>{index + 1}. {player.username}</span>
                <span className="font-semibold">{player.score} pts</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 mt-4">No players yet</p>
        )}
      </div>
    </div>
  );
};