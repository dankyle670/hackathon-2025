import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "../style/Profile.css";

function Profile() {
  const { token } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState(""); // ✅ État pour la bio
  const [avatar, setAvatar] = useState(null);
  const [bannerColor, setBannerColor] = useState("#6A4BBC");
  const [bannerShape, setBannerShape] = useState("rounded");
  const [language, setLanguage] = useState("fr"); // ✅ Langue par défaut : Français

  // 📌 Traductions disponibles
  const translations = {
    fr: {
      title: "Profil",
      bioPlaceholder: "Ajoutez une brève description...",
      uploadAvatar: "Changer de photo",
      email: "Email",
      color: "Couleur",
      shape: "Forme",
      rounded: "Arrondi",
      square: "Carré",
      language: "Langue",
    },
    en: {
      title: "Profile",
      bioPlaceholder: "Add a short description...",
      uploadAvatar: "Change Photo",
      email: "Email",
      color: "Color",
      shape: "Shape",
      rounded: "Rounded",
      square: "Square",
      language: "Language",
    },
  };

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
          setBio(res.data.bio || ""); // Charger la bio
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

      {/* Informations utilisateur */}
      <div className="profile-info">
        <h2>👤 {translations[language].title}</h2>
        <p>📧 {translations[language].email}: {email || "Non disponible"}</p>
        
        {/* ✅ Champ de biographie */}
        <textarea
          placeholder={translations[language].bioPlaceholder}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="bio-input"
        />
      </div>

      {/* Options de personnalisation */}
      <div className="profile-settings">
        <div className="setting-option">
          <label>🎨 {translations[language].color}:</label>
          <input
            type="color"
            value={bannerColor}
            onChange={(e) => setBannerColor(e.target.value)}
            className="color-picker"
          />
        </div>
        <div className="setting-option">
          <label>📏 {translations[language].shape}:</label>
          <select
            value={bannerShape}
            onChange={(e) => setBannerShape(e.target.value)}
            className="styled-dropdown"
          >
            <option value="rounded">{translations[language].rounded}</option>
            <option value="square">{translations[language].square}</option>
          </select>
        </div>
        <div className="setting-option">
          <label>🌍 {translations[language].language}:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="styled-dropdown"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default Profile;
