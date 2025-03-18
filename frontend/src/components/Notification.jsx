import React from "react";
import "../style/Notification.css";

const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  return (
    <div className={`notification ${type}`}>
      <p>{message}</p>
      <button onClick={onClose}>✖</button>
    </div>
  );
};

export default Notification;
