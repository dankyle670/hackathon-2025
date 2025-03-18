import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/buttons/Button";

const Results = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold">🏆 Résultats</h1>
      <p className="mt-4 text-xl">Ton score final : 🎯 XX points</p>
      <Button text="🔄 Rejouer" onClick={() => navigate("/game")} />
      <Button text="🏠 Retour à l'accueil" onClick={() => navigate("/")} />
    </div>
  );
};

export default Results;