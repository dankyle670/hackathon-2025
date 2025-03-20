import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const API_URL = 'http://localhost:8080/api';

// Configuration de l'instance axios avec intercepteur pour le token
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Configuration du socket
let socket: Socket | null = null;

export const initSocket = () => {
  if (!socket) {
    socket = io('http://localhost:8080', {
      path: '/socket.io',
      auth: {
        token: localStorage.getItem('token'),
      },
    });
    
    socket.on('connect', () => {
      console.log('Connecté au serveur Socket.IO');
    });
    
    socket.on('error', (error) => {
      console.error('Erreur Socket.IO:', error);
    });
  }
  return socket;
};

export const authService = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: { username: string; email: string; password: string }) =>
    api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },
};

export const gameService = {
  getTopics: () => api.get('/game/topics'),
  // Correction ici: utiliser api au lieu de axios et corriger le chemin
  getGameStatus: (roomId: string) => api.get(`/game_status/${roomId}`),
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