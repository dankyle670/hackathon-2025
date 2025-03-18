import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // ✅ Utilisation du contexte
import axios from "axios";
import "../style/Profile.css";

function Profile() {
  const { token } = useContext(AuthContext); // ✅ Récupère le token et l'utilisateur
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bannerColor, setBannerColor] = useState("#6A4BBC");
  const [bannerShape, setBannerShape] = useState("rounded");
  const [avatar, setAvatar] = useState(null);

  // 📌 Charger les informations du profil utilisateur
  useEffect(() => {
    if (token) {
      axios
        .get("http://127.0.0.1:8080/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUsername(res.data.username);
          setEmail(res.data.email);
        })
        .catch((error) => {
          console.error("⚠️ Erreur lors de la récupération du profil :", error);
        });
    }
  }, [token]);

  // 📌 Changer l'avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  // 📌 Changer la couleur de la bannière
  const handleColorChange = (e) => {
    setBannerColor(e.target.value);
  };

  // 📌 Changer la forme de la bannière
  const handleShapeChange = (e) => {
    setBannerShape(e.target.value);
  };

  return (
    <div className="profile-container">
      {/* Bannière personnalisable */}
      <div
        className={`profile-banner ${bannerShape}`}
        style={{ backgroundColor: bannerColor }}
      >
        <div className="avatar-container">
          <label htmlFor="avatar-upload">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="avatar" />
            ) : (
              <span className="upload-text">📷</span>
            )}
          </label>
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
        </div>
        <span className="username">{username || "Utilisateur"}</span>
      </div>

      {/* Options de personnalisation */}
      <div className="profile-settings">
        <div className="setting-option">
          <label>🎨 Couleur :</label>
          <input
            type="color"
            value={bannerColor}
            onChange={handleColorChange}
            className="color-picker"
          />
        </div>
        <div className="setting-option">
          <label>📏 Forme :</label>
          <select
            value={bannerShape}
            onChange={handleShapeChange}
            className="styled-dropdown"
          >
            <option value="rounded">Arrondi</option>
            <option value="square">Carré</option>
          </select>
        </div>
      </div>

      {/* Informations utilisateur */}
      <div className="profile-info">
        <h2>👤 {username || "Utilisateur"}</h2>
        <p>📧 {email || "Email non disponible"}</p>
      </div>
    </div>
  );
}

export default Profile;
