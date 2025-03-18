import React, { useState } from "react";
import socket from "../api/socket";

const QuestionBox = ({ roomId, userId }) => {
  const [answer, setAnswer] = useState("");

  const submitAnswer = () => {
    if (!answer.trim()) return;

    socket.emit("submit_answer", {
      room_id: roomId,
      username: `user_${userId}`,
      answer: answer,
    });

    setAnswer("");
  };

  return (
    <div className="question-box">
      <input
        type="text"
        placeholder="Devine la musique..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <button onClick={submitAnswer}>Envoyer</button>
    </div>
  );
};

export default QuestionBox;
