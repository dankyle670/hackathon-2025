import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { roomService, gameService, initSocket } from '../services/Api';
import { Trophy, MessageCircle, Home, Play, Music, Pause, Volume2, VolumeX } from 'lucide-react';



interface Player {
  id: string;
  username: string;
  score: number;
}

interface Question {
  text: string;
  choices: string[];
}

interface Song {
  title: string;
  artist: string;
  preview_url: string;
}

interface GameSettings {
  topic: string;
  subtopic: string;
  country: string;
}

export const Room: React.FC = () => {
  const { id } = useParams();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [messages, setMessages] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    topic: '',
    subtopic: '',
    country: ''
  });
  const [username, setUsername] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  // Load game options on component mount
  useEffect(() => {
    const loadGameOptions = async () => {
      try {
        const topicsResponse = await gameService.getTopics();
        setTopics(topicsResponse.data.topics);
        
        const countriesResponse = await gameService.getCountries();
        setCountries(countriesResponse.data.countries);
        
        // Set default values
        if (topicsResponse.data.topics.length > 0) {
          const defaultTopic = topicsResponse.data.topics[0];
          setGameSettings(prev => ({...prev, topic: defaultTopic}));
          
          // Load subtopics for the default topic
          const subtopicsResponse = await gameService.getSubtopics(defaultTopic);
          setSubtopics(subtopicsResponse.data.subtopics);
          
          if (subtopicsResponse.data.subtopics.length > 0) {
            setGameSettings(prev => ({...prev, subtopic: subtopicsResponse.data.subtopics[0]}));
          }
          
          if (countriesResponse.data.countries.length > 0) {
            setGameSettings(prev => ({...prev, country: countriesResponse.data.countries[0]}));
          }
        }
        
        // Get user info from local storage
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        setUsername(userInfo.username || '');
        setUserId(userInfo.id || '');
        
      } catch (error) {
        console.error('Error loading game options:', error);
      }
    };
    
    loadGameOptions();
  }, []);

  useEffect(() => {
    const socket = initSocket();
    
    // Load room information
    const loadRoom = async () => {
      try {
        const response = await roomService.getRoom(id!);
        setPlayers(response.data.players);
      } catch (error) {
        console.error('Error loading room:', error);
      }
    };

    loadRoom();

    // Listen to socket events
    socket.on('new_round', (data) => {
      console.log('New round data:', data);
      setCurrentQuestion({
        text: data.question,
        choices: data.choices || ['A', 'B', 'C', 'D'] // Fallback if no choices provided
      });
      setCurrentSong({
        title: data.song_title,
        artist: data.song_artist || '',
        preview_url: data.song_preview || ''
      });
      setTimeLeft(30);
      setGameStatus('playing');
      
      // Automatically play the song if there's a preview URL
      if (data.song_preview && audioElement) {
        audioElement.src = data.song_preview;
        audioElement.play().then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.error('Error playing audio:', error);
        });
      }
    });

    socket.on('update_scores', (data) => {
      setPlayers(data.scores);
    });

    socket.on('game_over', (data) => {
      setGameStatus('finished');
      addMessage(`Game over! Winner: ${data.winner}`);
      
      // Stop the audio if it's playing
      if (audioElement) {
        audioElement.pause();
        setIsPlaying(false);
      }
    });

    // Join the socket room
    socket.emit('join', { room: id });

    return () => {
      socket.off('new_round');
      socket.off('update_scores');
      socket.off('game_over');
      socket.emit('leave', { room: id });
    };
  }, [id, audioElement]);

  // Timer countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameStatus === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameStatus === 'playing') {
      // Time's up for this round
      addMessage("Time's up!");
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft, gameStatus]);

  const handleTopicChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTopic = e.target.value;
    setGameSettings(prev => ({...prev, topic: selectedTopic}));
    
    try {
      const response = await gameService.getSubtopics(selectedTopic);
      setSubtopics(response.data.subtopics);
      
      if (response.data.subtopics.length > 0) {
        setGameSettings(prev => ({...prev, subtopic: response.data.subtopics[0]}));
      } else {
        setGameSettings(prev => ({...prev, subtopic: ''}));
      }
    } catch (error) {
      console.error('Error loading subtopics:', error);
    }
  };

  const Navigate = useNavigate();
  const handleStartGame = async () => {
    try {
      const response = await gameService.startGame(id!, gameSettings.topic, gameSettings.subtopic, gameSettings.country);
      console.log("✅ Réponse du backend:", response.data);
  
      // 🔄 Redirection vers la page du jeu
      Navigate(`/game/${id}`);
    } catch (error: any) {
      console.error("❌ Erreur lors du démarrage:", error.response?.data || error.message);
    }
  }

  

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer) return;
    
    try {
      await gameService.submitAnswer(id!, username, selectedAnswer);
      addMessage(`You submitted: ${selectedAnswer}`);
      setSelectedAnswer('');
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };




  const addMessage = (message: string) => {
    setMessages(prev => [...prev, message]);
  };

  const handleJoinGame = async () => {
    if (!userId) {
      addMessage('You need to be logged in to join the game');
      return;
    }
    
    try {
      await gameService.joinGame(userId, id!);
      addMessage('You joined the game!');
    } catch (error) {
      console.error('Error joining game:', error);
      addMessage('Failed to join the game. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main game section */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#003399]">Room #{id}</h1>
            <div className="text-lg font-semibold text-[#FFCC00]">
              {timeLeft}s
            </div>
          </div>

          {/* Game controls - only show when waiting */}
          {gameStatus === 'waiting' && (
            <div className="mb-8 bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Start a New Game</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Topic</label>
                  <select 
                    className="w-full p-2 border rounded-lg"
                    value={gameSettings.topic}
                    onChange={handleTopicChange}
                  >
                    {topics.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>
                
                {subtopics.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Subtopic</label>
                    <select 
                      className="w-full p-2 border rounded-lg"
                      value={gameSettings.subtopic}
                      onChange={(e) => setGameSettings(prev => ({...prev, subtopic: e.target.value}))}
                    >
                      {subtopics.map(subtopic => (
                        <option key={subtopic} value={subtopic}>{subtopic}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <select 
                    className="w-full p-2 border rounded-lg"
                    value={gameSettings.country}
                    onChange={(e) => setGameSettings(prev => ({...prev, country: e.target.value}))}
                  >
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button 
                  className="flex items-center gap-2 bg-[#003399] text-white py-2 px-4 rounded-lg hover:bg-[#002266] transition-colors"
                  onClick={handleStartGame}
                >
                  <Play size={16} />
                  Start Game
                </button>
              </div>
            </div>
          )}

          {/* Game in progress */}
          {gameStatus === 'playing' && currentQuestion && (
            <div className="space-y-6">
              {/* Question */}
              <p className="text-xl font-medium text-center mb-8">
                {currentQuestion.text}
              </p>
              
              {/* If it's a multiple choice question */}
              {currentQuestion.choices && currentQuestion.choices.length > 0 ? (
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
              ) : (
                /* If it's a free text question (like guessing a song title) */
                <div className="space-y-4">
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg"
                    placeholder="Enter your answer..."
                    value={selectedAnswer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                  />
                </div>
              )}
              
              <button
                className="w-full mt-6 bg-[#003399] text-white py-3 rounded-lg hover:bg-[#002266] transition-colors"
                onClick={handleAnswerSubmit}
              >
                Submit Answer
              </button>
            </div>
          )}

          {gameStatus === 'finished' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
              <p className="text-xl mb-6">
                Winner: {players.length > 0 ? players[0].username : 'Nobody'}
              </p>
              <button
                className="bg-[#003399] text-white py-2 px-6 rounded-lg hover:bg-[#002266] transition-colors"
                onClick={() => setGameStatus('waiting')}
              >
                Start New Game
              </button>
            </div>
          )}
        </div>

        {/* Sidebar with scores and chat */}
        <div className="space-y-6">
          {/* Scoreboard */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="text-[#FFCC00]" />
              <h2 className="text-xl font-semibold">Scoreboard</h2>
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
              {players.length === 0 && (
                <p className="text-gray-500 text-center py-2">No players yet</p>
              )}
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
              {messages.length === 0 && (
                <p className="text-gray-500 text-center py-2">No messages yet</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border rounded-lg px-3 py-2"
                placeholder="Your message..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    addMessage(`You: ${target.value}`);
                    target.value = '';
                  }
                }}
              />
              <button 
                className="bg-[#FFCC00] text-[#003399] px-4 py-2 rounded-lg hover:bg-[#FFD633] transition-colors"
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Your message..."]') as HTMLInputElement;
                  if (input && input.value) {
                    addMessage(`You: ${input.value}`);
                    input.value = '';
                  }
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};