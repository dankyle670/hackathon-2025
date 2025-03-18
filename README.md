# 🎵 Blind Test - Full Stack App (React + Flask + MySQL)

**Blind Test** est une application web interactive de **blind test musical** permettant aux utilisateurs de deviner des morceaux en temps réel. L'application est construite avec **React** pour le frontend, **Flask** pour le backend, et **MySQL** pour la gestion des scores et utilisateurs.

---

## 🚀 Fonctionnalités

✅ **Mode Solo & Multijoueur** – Jouer seul ou défier d'autres joueurs.  
✅ **Génération aléatoire d'extraits musicaux** – API YouTube/Spotify ou fichiers locaux.
✅ **Système de score et classement** – Suivi des performances des joueurs.  
✅ **Connexion utilisateur** – Enregistrement et authentification avec Flask.
✅ **Interface interactive et responsive** – Animations et effets modernes avec React.

---

## 📁 Structure du Projet

```
/Blind_test
│── /backend (Flask API)
│   ├── app.py  # Serveur Flask
│   ├── models.py  # Modèle de base de données MySQL
│   ├── routes.py  # Routes API pour gérer les musiques et scores
│   ├── config.py  # Configuration de la BDD
│   ├── requirements.txt  # Dépendances Python
│── /frontend (React)
│   ├── /src/
│   │   ├── /components  # Composants UI
│   │   ├── /pages  # Pages principales (Accueil, Jeu, Résultats)
│   │   ├── App.js  # Fichier principal React
│   │   ├── api.js  # Gestion des requêtes API Flask
│   │   ├── styles.css  # Styles CSS
│── README.md  # Documentation
│── .gitignore  # Fichiers à ignorer par Git
```

---

## ⚙️ Installation & Lancement

### **1️⃣ Backend (Flask + MySQL)**
Dans le dossier **backend/**, installe les dépendances et configure la base de données :

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # (Mac/Linux)
pip install -r requirements.txt
```

Créer la base de données dans MySQL :
```sql
CREATE DATABASE blind_test;
```
Configurer la connexion MySQL dans `config.py` :
```python
DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "password"
DB_NAME = "blind_test"
```

Lancer le serveur Flask :
```bash
python app.py
```
L'API tournera sur **http://127.0.0.1:5000**.

---

### **2️⃣ Frontend (React)**
Dans le dossier **frontend/**, installe les dépendances et démarre React :

```bash
cd frontend
npm install
npm start
```
L'application React tournera sur **http://localhost:3000**.

---

## 🔗 Routes API (Flask)

| Méthode | Route            | Description |
|---------|-----------------|-------------|
| GET     | /get_song       | Récupérer un extrait musical |
| POST    | /submit_score   | Enregistrer un score utilisateur |
| GET     | /leaderboard    | Récupérer le classement |
| POST    | /register       | Inscription utilisateur |
| POST    | /login          | Connexion utilisateur |

---

## 📌 Technologies Utilisées

- **Frontend** : React, React Router, TailwindCSS, Framer Motion
- **Backend** : Flask, Flask-CORS, Flask-SocketIO
- **Base de Données** : MySQL (SQLAlchemy pour ORM)
- **API & WebSockets** : Communication entre Flask et React

---

## 🎯 Fonctionnalités à Ajouter

🔹 Mode Battle Royale (dernier joueur en lice gagne).
🔹 Sélection de playlists personnalisées.
🔹 Amélioration des animations et effets sonores.

---

## 🤝 Contributions

Les contributions sont les bienvenues !

1. **Fork** le repo
2. Crée une **branche** (`git checkout -b feature/amélioration`)
3. **Commit** (`git commit -m "Ajout d'une nouvelle feature"`)
4. **Push** (`git push origin feature/amélioration`)
5. Fais une **Pull Request** 🎉

---

## 📜 Licence

Ce projet est sous licence **MIT** – Utilisation et modification libre.

---

💡 **Profite du Blind Test et amuse-toi !** 🎵🔥

