import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../style/Signup.css"; // Appliquer le style de Signup à Login

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
      console.log("Token stored after login:", localStorage.getItem("token"));
    } catch (error) {
      setErrorMessage("⚠️ Incorrect credentials. Please try again.");
    }

    setLoading(false); 
  };

  return (
    <div className="signup-container"> {/* Utilisation du même conteneur que dans Signup */}
      <h2>🔒 Login</h2>
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
