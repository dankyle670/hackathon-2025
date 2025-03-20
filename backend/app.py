import os
from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv  
from config import Config 
from extensions import db, bcrypt, socketio
from routes import auth
from music_routes import music
from socket_manager import init_socketio
from room_routes import room_bp
from leaderboard_routes import leaderboard_bp
from game_routes import game_bp  

# Variables d'environnement
load_dotenv()

# Initialisation de l'application Flask
app = Flask(__name__)
app.config.from_object(Config)  # ✅ Utiliser Config

# Vérifier que la durée du token est bien définie
print(f"🕒 Durée du token JWT : {app.config['JWT_ACCESS_TOKEN_EXPIRES']}")

#  Active CORS pour autoriser les requêtes du frontend React
CORS(app, supports_credentials=True, resources={r"/*": {
    "origins": ["*"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

# ✅ Ajoute une route OPTIONS pour gérer les preflight requests
@app.route("/api/<path:path>", methods=["OPTIONS"])
def options_handler(path):
    return jsonify({"message": "Preflight OK"}), 200


#  Initialisation des extensions
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)  # ✅ Initialisation correcte du JWT

# Initialisation de SocketIO
socketio = init_socketio(app)

# Enregistrement des routes
app.register_blueprint(auth, url_prefix="/api/auth")  
app.register_blueprint(music, url_prefix="/api")
app.register_blueprint(room_bp, url_prefix="/api")
app.register_blueprint(leaderboard_bp, url_prefix="/api")
app.register_blueprint(game_bp, url_prefix="/api/game")  

#  Page d'accueil retourne maintenant un JSON pour l'API
@app.route('/')
def index():
    return jsonify({
        "status": "success",
        "message": "API MusicQuiz fonctionnelle",
        "version": "1.0.0"
    })

#  API Healthcheck pour les clients React
@app.route('/api/health')
def health_check():
    return jsonify({
        "status": "ok",
        "message": "L'API fonctionne correctement"
    })

#  Création des tables de la base de données
with app.app_context():
    try:
        db.create_all()
        print("✅ Base de données initialisée avec succès.")
    except Exception as e:
        print(f"⚠️ Erreur lors de l'initialisation de la base de données : {e}")

#  Gestionnaire d'erreur 404 pour l'API
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint introuvable"}), 404

#  Gestionnaire d'erreur 500 pour l'API
@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Erreur serveur interne"}), 500

#  Lancement du serveur Flask avec WebSocket (SocketIO)
if __name__ == '__main__':
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8080))

    print(f"🚀 Serveur démarré sur http://{host}:{port}")
    socketio.run(app, host=host, port=port, debug=True)