import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { gameService, initSocket } from '../services/Api';
import { Trophy, Clock, Send } from 'lucide-react';

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

  useEffect(() => {
    const socket = initSocket();
    
    // Receive new question
    socket.on('new_round', (data) => {
      setQuestion({
        text: data.question,
        choices: data.choices || ['A', 'B', 'C', 'D'],
        correctAnswer: data.correctAnswer,
      });
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

  const handleStartGame = async () => {
    try {
      await gameService.startGame(id!);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return;
    try {
      await gameService.submitAnswer(id!, selectedAnswer);
      setSelectedAnswer('');
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#003399] text-center">Game Room #{id}</h1>
      {gameStatus === 'waiting' && (
        <div className="text-center py-8">
          <button onClick={handleStartGame} className="bg-[#FFCC00] text-[#003399] py-2 px-6 rounded-lg">
            Start Game
          </button>
        </div>
      )}
      {gameStatus === 'playing' && question && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">{question.text}</h2>
          <div className="grid grid-cols-2 gap-4">
            {question.choices.map((choice, index) => (
              <button
                key={index}
                className={`p-3 rounded-lg ${selectedAnswer === choice ? 'bg-[#FFCC00]' : 'bg-gray-200'}`}
                onClick={() => setSelectedAnswer(choice)}
              >
                {choice}
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmitAnswer}
            className="mt-4 bg-[#003399] text-white py-2 px-6 rounded-lg"
          >
            Submit Answer
          </button>
        </div>
      )}
      {gameStatus === 'finished' && (
        <div className="text-center py-8">
          <h2 className="text-xl font-bold">Game Over!</h2>
        </div>
      )}
      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Trophy className="text-[#FFCC00]" /> Leaderboard
        </h2>
        <ul>
          {players.map((player, index) => (
            <li key={player.id} className="flex justify-between p-2 border-b">
              <span>{index + 1}. {player.username}</span>
              <span>{player.score} pts</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};