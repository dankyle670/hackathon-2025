import axios from "axios";

// Vérifier si l'URL de l'API est bien définie
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8080/api";
console.log("🔗 API_URL:", API_URL);

// Configuration de l'instance Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token JWT si l'utilisateur est connecté
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 📌 Authentification
 */
export const loginUser = async (email, password) => {
  return api.post("/auth/login", { email, password });
};

export const registerUser = async (username, email, password) => {
  return api.post("/auth/register", { username, email, password });
};

export const getUserProfile = async () => {
  return api.get("/auth/profile");
};

/**
 * 📌 Gestion des rooms
 */
export const getRooms = async () => {
  return api.get("/rooms");
};

export const getRoom = async (room_id) => {
  return api.get(`/rooms/${room_id}`);
};

export const createRoom = async (name, genre) => {
  return api.post("/rooms", { name, genre });
};

export const joinRoom = async (user_id, room_id) => {
  return api.post("/rooms/join", { user_id, room_id });
};

export const deleteRoom = async (room_id) => {
  return api.delete(`/rooms/${room_id}`);
};

/**
 * 📌 Gestion des parties (game)
 */
export const startGame = async (room_id) => {
  return api.post("/game/start", { room_id });
};

export const joinGame = async (user_id, room_id) => {
  return api.post("/game/join", { user_id, room_id });
};

export const forceEndGame = async (room_id) => {
  return api.post("/game/force_end", { room_id });
};

/**
 * 📌 Gestion des scores
 */
export const getScores = async (game_id) => {
  return api.get(`/scores/${game_id}`);
};

export const submitAnswer = async (room_id, username, answer) => {
  return api.post("/game/submit_answer", { room_id, username, answer });
};

/**
 * 📌 Gestion du chat en partie
 */
export const getMessages = async (room_id) => {
  return api.get(`/rooms/${room_id}/messages`);
};

export const sendMessage = async (room_id, message) => {
  return api.post(`/rooms/${room_id}/messages`, message);
};

export default api;