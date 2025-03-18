import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [userId, setUserId] = useState(localStorage.getItem("id") || null);

  // ✅ Assurer que le token est bien récupéré au chargement de la page
  useEffect(() => {
    if (!token) {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        console.log("🔄 Token récupéré depuis localStorage :", storedToken);
        setToken(storedToken);
      }
    }

    if (token) {
      axios
        .get("http://127.0.0.1:8080/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
          setUserId(res.data.id);
          localStorage.setItem("id", res.data.id);
        })
        .catch((error) => {
          console.error("⚠️ Token expiré ou invalide, déconnexion forcée");
          logout();
        });
    }
  }, [token]);

  // ✅ Fonction de connexion
  const login = async (email, password) => {
    try {
      const { data } = await axios.post("http://127.0.0.1:8080/api/auth/login", {
        email,
        password,
      });

      console.log("🔓 Réponse API (login) :", data);

      const { token, id, username } = data;

      if (!token || !id) {
        throw new Error("❌ Réponse API invalide, vérifiez les clés.");
      }

      // ✅ Assurer que le token est bien stocké dans localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("id", id);
      setToken(token);
      setUser({ id, username });

      console.log("✅ Token stocké après login :", localStorage.getItem("token"));
    } catch (error) {
      console.error("❌ Erreur lors de la connexion :", error.response?.data || error);
      alert(error.response?.data?.error || "Identifiants incorrects.");
    }
  };

  // ✅ Fonction de déconnexion
  const logout = () => {
    console.log("🚪 Déconnexion en cours...");
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    setToken(null);
    setUser(null);
    setUserId(null);
    console.log("✅ Déconnexion réussie !");
  };

  return (
    <AuthContext.Provider value={{ user, token, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
