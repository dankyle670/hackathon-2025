import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [userId, setUserId] = useState(localStorage.getItem("id") || null);

  console.log("🔍 AuthContext chargé :", { user, token, userId });

  // 📌 Charger le profil utilisateur si un token est présent
  useEffect(() => {
    if (token && !user) {
      console.log("🔄 Vérification du profil...");
      axios
        .get("http://127.0.0.1:8080/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          console.log("✅ Profil reçu après connexion :", res.data);
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        })
        .catch((error) => {
          console.error("❌ Erreur de récupération du profil :", error);
          logout();
        });
    }
  }, [token]);

  // 📌 Fonction de connexion (Login)
  const login = async (email, password) => {
    try {
      const { data } = await axios.post("http://127.0.0.1:8080/api/auth/login", {
        email,
        password,
      });

      console.log("🔓 Réponse API (login) :", data);

      const { token, refresh_token, id, username } = data;

      if (!token || !refresh_token || !id) {
        throw new Error("❌ Réponse API invalide, vérifiez les clés.");
      }

      // ✅ Stockage sécurisé des données
      localStorage.setItem("token", token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("id", id);
      localStorage.setItem("user", JSON.stringify({ id, username }));

      setToken(token);
      setUser({ id, username });
      setUserId(id);

      console.log("✅ Token stocké après login :", token);
    } catch (error) {
      console.error("❌ Erreur lors de la connexion :", error.response?.data || error);
      alert(error.response?.data?.error || "Identifiants incorrects.");
    }
  };

  // 📌 Fonction d'inscription (Register)
  const register = async (username, email, password) => {
    try {
      const { data } = await axios.post("http://127.0.0.1:8080/api/auth/register", {
        username,
        email,
        password,
      });

      console.log("✅ Inscription réussie :", data);

      // ✅ Connexion automatique après inscription
      await login(email, password);
    } catch (error) {
      console.error("❌ Erreur lors de l'inscription :", error.response?.data || error);
      alert(error.response?.data?.error || "Impossible de s'inscrire.");
    }
  };

  // 📌 Fonction de déconnexion (Logout)
  const logout = () => {
    console.log("🚪 Déconnexion en cours...");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("id");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setUserId(null);
    console.log("✅ Déconnexion réussie !");
  };

  return (
    <AuthContext.Provider value={{ user, token, userId, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
