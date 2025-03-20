import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const API_URL = 'http://localhost:8080/api';

// Configuration de l'instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configuration du socket
let socket: Socket | null = null;

export const initSocket = () => {
  if (!socket) {
    socket = io('http://localhost:8080', { path: '/socket.io' });
    
    socket.on('connect', () => {
      console.log('Connecté au serveur Socket.IO');
    });
    
    socket.on('error', (error) => {
      console.error('Erreur Socket.IO:', error);
    });
  }
  return socket;
};

export const gameService = {
  getTopics: () => api.get('/game/topics'),
  getSubtopics: (topic: string) => api.post('/game/subtopics', { topic }),
  getCountries: () => api.get('/game/countries'),
  generateQuestion: (topic: string, subtopic: string, country: string) => 
    api.post('/game/generate_question', { topic, subtopic, country }),
  startGame: (roomId: string, topic: string, subtopic: string, country: string) =>
    api.post('/game/start', { room_id: roomId, topic, subtopic, country }),
  submitAnswer: (roomId: string, username: string, answer: string) =>
    api.post('/game/submit_answer', { room_id: roomId, username, answer }),
  joinGame: (userId: string, roomId: string) =>
    api.post('/game/join', { user_id: userId, room_id: roomId }),
};

export const roomService = {
  getRooms: () => api.get('/rooms'),
  getRoom: (roomId: string) => api.get(`/rooms/${roomId}`),
  createRoom: (name: string, genre: string) => 
    api.post('/rooms', { name, genre }),
  joinRoom: (userId: string, roomId: string) =>
    api.post('/rooms/join', { user_id: userId, room_id: roomId }),
  leaveRoom: (userId: string, roomId: string) =>
    api.post('/rooms/leave', { user_id: userId, room_id: roomId }),
};

export const leaderboardService = {
  getGlobalLeaderboard: () => api.get('/classement_general'),
  getRoomLeaderboard: (roomId: string) => api.get(`/classement_room/${roomId}`),
  getGameLeaderboard: (gameId: string) => api.get(`/classement_game/${gameId}`),
};