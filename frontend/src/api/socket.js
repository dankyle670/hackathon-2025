import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://127.0.0.1:8080";

export const socket = io(SOCKET_URL, {
  transports: ["websocket"], // ✅ Utiliser directement WebSockets
  withCredentials: true,
  path: "/socket.io/",
});
