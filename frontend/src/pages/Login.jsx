import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../style/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); 
  const [loading, setLoading] = useState(false); 

  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(""); 
    setLoading(true); 

    try {
      await login(email, password);
      console.log("Token stocké après login:", localStorage.getItem("token")); // Ajout crucial
    } catch (error) {
      setErrorMessage("⚠️ Identifiants incorrects. Veuillez réessayer.");
    }

    setLoading(false); 
  };

  return (
    <div className="login-container">
      <h2>🔒 Connexion</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {errorMessage && <p className="error-message">{errorMessage}</p>} {/* ✅ Affiche l'erreur */}
        <button type="submit" disabled={loading}>
          {loading ? "Connexion en cours..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
};

export default Login;
