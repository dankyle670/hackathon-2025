import React, { useState } from "react";
import { Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import Game from "./pages/Game";
import Rooms from "./pages/Rooms";
import Room from "./pages/Room";
import GenreSelection from "./components/GenreSelection";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Results from "./pages/Results";
import Chat from "./pages/Chat";
import Header from "./components/Header";
import "./style/App.css";
import "./style/index.css";
import Chargement from "./pages/Chargement";

function App() {
  const [loading, setLoading] = useState(true);

  // Simuler un délai de chargement pour l'écran de chargement
  setTimeout(() => {
    setLoading(false);
  }, 5000); // 3 secondes de délai pour afficher l'écran de chargement

  return (
    <>
      <Header />
      <Routes>
        {loading ? (
          <Route path="/" element={<Chargement />} />
        ) : (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/room/:id" element={<Room />} />
            <Route path="/room/:id/genres" element={<GenreSelection />} />
            <Route path="/game/:id" element={<Game />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/results" element={<Results />} />
          </>
        )}
      </Routes>
    </>
  );
}

export default App;
