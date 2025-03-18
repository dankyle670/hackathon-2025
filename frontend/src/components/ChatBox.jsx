import React, { useState, useEffect } from "react";
import socket from "../api/socket";

const ChatBox = ({ roomId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.on("chat_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("chat_message");
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("chat_message", { room_id: roomId, username: `user_${userId}`, message });
    setMessage("");
  };

  return (
    <div className="chat-box">
      <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Écris un message..." />
      <button onClick={sendMessage}>Envoyer</button>
    </div>
  );
};

export default ChatBox;
