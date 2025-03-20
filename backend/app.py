import os
import eventlet
eventlet.monkey_patch()  # ✅ Nécessaire pour le bon fonctionnement avec eventlet

from flask import Flask, render_template
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv  # ✅ Charger .env
from config import Config  # ✅ Importer Config correctement
from extensions import db, bcrypt, socketio
from routes import auth
from socket_manager import init_socketio
from room_routes import room_bp
from game_routes import game_bp  # ✅ Importer les routes du jeu

# 📌 Charger les variables d'environnement
load_dotenv()

# 📌 Initialisation de l'application Flask
app = Flask(__name__)
app.config.from_object(Config)  # ✅ Utiliser Config

# ✅ Vérifier que la durée du token est bien définie
print(f"🕒 Durée du token JWT : {app.config['JWT_ACCESS_TOKEN_EXPIRES']}")

# ✅ Active CORS pour autoriser uniquement les requêtes du frontend (localhost:3000)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# 📌 Initialisation des extensions
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)  # ✅ Initialisation correcte du JWT

# 📌 Initialisation de SocketIO
socketio = init_socketio(app)

# 📌 Enregistrement des routes
app.register_blueprint(auth, url_prefix="/api/auth")  
app.register_blueprint(music, url_prefix="/api")
app.register_blueprint(room_bp, url_prefix="/api")
app.register_blueprint(game_bp, url_prefix="/api")  

# 📌 Page d'accueil simple (pour test)
@app.route('/')
def index():
    return render_template('index.html')

# 📌 Création des tables de la base de données
with app.app_context():
    try:
        db.create_all()
        print("✅ Base de données initialisée avec succès.")
    except Exception as e:
        print(f"⚠️ Erreur lors de l'initialisation de la base de données : {e}")

# 📌 Lancement du serveur Flask avec WebSocket (SocketIO)
if __name__ == '__main__':
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8080))

    print(f"🚀 Serveur démarré sur http://{host}:{port}")
    socketio.run(app, host=host, port=port, debug=True, )
