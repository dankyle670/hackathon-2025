import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthGuard } from './components/AuthGuard';
import { Home } from './pages/Home';
import { Room } from './pages/Room';
import { RoomList } from './pages/RoomList';
import { CreateRoom } from './pages/CreateRoom';
import { Leaderboard } from './pages/Leaderboard';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';  
import { GamePage } from './pages/GamePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <AuthGuard>
            <Layout>
              <Home />
            </Layout>
          </AuthGuard>
        } />
        
        <Route path="/rooms" element={
          <AuthGuard>
            <Layout>
              <RoomList />
            </Layout>
          </AuthGuard>
        } />
        
        <Route path="/create-room" element={
          <AuthGuard>
            <Layout>
              <CreateRoom />
            </Layout>
          </AuthGuard>
        } />
        
        <Route path="/room/:id" element={
          <AuthGuard>
            <Layout>
              <Room />
            </Layout>
          </AuthGuard>
        } />
        
        <Route path="/game/:id" element={
          <AuthGuard>
            <Layout>
              <GamePage />
            </Layout>
          </AuthGuard>
        } />
        
        <Route path="/leaderboard" element={
          <AuthGuard>
            <Layout>
              <Leaderboard />
            </Layout>
          </AuthGuard>
        } />
        
        <Route path="/profile" element={
          <AuthGuard>
            <Layout>
              <Profile />
            </Layout>
          </AuthGuard>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;