import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../style/Signup.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useContext(AuthContext);

  const handleSignup = (e) => {
    e.preventDefault();
    register(username, email, password);
  };

  return (
    <div className="signup-container">
      <h2>📝 Inscription</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
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
        <button type="submit">Créer un compte</button>
      </form>
    </div>
  );
};

export default Signup;
