import React from "react";
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
import PlayerSearchChat from "./pages/PlayerSearchChat";
import Header from "./components/Header";

/* 🎨 Importation de tous les styles */
import "./style/App.css";
import "./style/index.css";

function App() {
  return (
    <>
      <Header />
      <Routes> {/* ✅ PAS DE BrowserRouter ICI */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/room/:id" element={<Room />} />
        <Route path="/room/:id/genres" element={<GenreSelection />} />
        <Route path="/game/:id" element={<Game />} />
        <Route path="/search-players" element={<PlayerSearchChat />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </>
  );
}

export default App;