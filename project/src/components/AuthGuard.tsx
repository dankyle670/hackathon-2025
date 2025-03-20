import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if ((decoded as any).exp < currentTime) {
      localStorage.removeItem('token');
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  } catch (error) {
    localStorage.removeItem('token');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};