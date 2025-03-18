import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/BackButton.css';

function BackButton() {
  const navigate = useNavigate();
  return (
    <button className="back-button" onClick={() => navigate(-1)}>🔙 Retour</button>
  );
}

export default BackButton;
