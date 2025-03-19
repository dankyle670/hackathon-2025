import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../style/Signup.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState(""); // State for age
  const [nationality, setNationality] = useState(""); // State for nationality
  const { register } = useContext(AuthContext);

  const handleSignup = (e) => {
    e.preventDefault();
    // Include age and nationality in the registration function
    register(username, email, password, age, nationality);
  };

  return (
    <div className="signup-container">
      <h2>📝 Sign Up</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Username"
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nationality"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          required
        />
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default Signup;