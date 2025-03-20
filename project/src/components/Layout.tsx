import React from 'react';
import { Link } from 'react-router-dom';
import { CircleUser, Trophy, Home } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#003399]">
      <nav className="bg-[#FFCC00] p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-[#003399] flex items-center gap-2">
            <span>Euro Match</span>
          </Link>
          
          <div className="flex gap-4">
            <Link to="/" className="text-[#003399] hover:text-[#002266] flex items-center gap-1">
              <Home size={20} />
              <span>Accueil</span>
            </Link>
            <Link to="/leaderboard/" className="text-[#003399] hover:text-[#002266] flex items-center gap-1">
              <Trophy size={20} />
              <span>Classement</span>
            </Link>
            <Link to="/profile" className="text-[#003399] hover:text-[#002266] flex items-center gap-1">
              <CircleUser size={20} />
              <span>Profil</span>
            </Link>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
      
      <footer className="bg-[#002266] text-white py-4 mt-auto">
        <div className="container mx-auto text-center">
          <p>© 2025 Euro Match - Quiz sur l'Europe</p>
        </div>
      </footer>
    </div>
  );
};