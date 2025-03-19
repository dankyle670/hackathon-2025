import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/Home.css"; // Styles spécifiques à la page d'accueil

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="loading-screen">
      {/* Ajout des boutons Login et Register */}
      <div className="button-container">
        <button
          className="home-button home-login-button"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
        <button
          className="home-button home-register-button"
          onClick={() => navigate("/signup")}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Home;
