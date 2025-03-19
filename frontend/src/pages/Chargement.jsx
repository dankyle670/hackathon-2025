import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom"; 
import "../style/chargement.css";

const Chargement = () => {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            navigate("/"); // ✅ Redirection vers la racine
          }, 500);
          return 100;
        }
        return oldProgress + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-bar" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="loading-text">Loading...</p>
      
      {/* Texte ajouté entre l'image et les boutons */}
      <div className="text-between">
        <p>Learn, Connect, Donate</p>
      </div>
    </div>
  );
};

export default Chargement;
