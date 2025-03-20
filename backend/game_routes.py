from flask import Blueprint, request, jsonify
from flask_socketio import emit, join_room
from extensions import db, socketio
from models import Game, Score, User, Room, UserStats
from spotify_service import get_random_track
from socket_manager import socketio, update_leaderboard
import os
import openai
import eventlet
from datetime import datetime  # Ajout de l'import manquant


# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

game_bp = Blueprint("game", __name__)

# Define available topics, subtopics, and European countries
topics = {
    "Science": ["Physics", "Biology", "Chemistry", "Astronomy"],
    "History": ["World War I", "World War II", "Ancient Civilizations", "Modern History"],
    "Geography": [],  # No subtopics, quiz will be about Geography + country
    "Technology": ["Artificial Intelligence", "Programming", "Cybersecurity"],
    "Sports": [],  # No subtopics, quiz will be about Sports + country
    "Music": ["Classical", "Pop", "Rock", "Jazz"]
}
EUROPEAN_COUNTRIES = [
    "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic",
    "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary",
    "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands",
    "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden"
]


 
@game_bp.route("/topics", methods=["GET"])
def get_topics():
    return jsonify({"topics": list(topics.keys())})


# Route to get subtopics for a selected topic
@game_bp.route("/subtopics", methods=["POST"])
def get_subtopics():
    data = request.get_json()
    selected_topic = data.get("topic")
    
    if not selected_topic or selected_topic not in topics:
        return jsonify({"error": "Invalid topic"}), 400 
    return jsonify({"subtopics": topics[selected_topic]})

# Route to get list of available European countries
@game_bp.route("/countries", methods=["GET"])
def get_european_countries():
    return jsonify({"countries": EUROPEAN_COUNTRIES})

# Function to generate a quiz question
def generate_question(topic, subtopic, country):
    prompt = f"Create a multiple-choice quiz question about {topic} in {country}. "
    if subtopic:
        prompt += f"Specifically, focus on {subtopic}. "
    prompt += "Provide 4 answer choices labeled A, B, C, and D. Clearly indicate the correct answer at the end."

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a quiz generator that creates country-specific questions."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f" Error generating question: {e}")
        return None

# Route to generate a quiz question
@game_bp.route("/generate_question", methods=["POST"])
def generate_question_route():
    data = request.get_json()
    topic = data.get("topic")
    subtopic = data.get("subtopic", "")
    country = data.get("country")

    if topic not in topics:
        return jsonify({"error": "Invalid topic"}), 400
    if not subtopic and topics[topic]:
        return jsonify({"error": "Subtopic is required for this topic"}), 400
    if country not in EUROPEAN_COUNTRIES:
        return jsonify({"error": "Invalid country"}), 400

    question = generate_question(topic, subtopic, country)
    if question:
        return jsonify({"question": question})
    else:
        return jsonify({"error": "Failed to generate a question"}), 500

#  Démarrer une partie dans une room
@game_bp.route("/start", methods=["POST"])
def start_game():
    data = request.get_json()
    print("📥 Requête reçue pour démarrer une partie:", data)

    room_id = data.get("room_id")
    topic = data.get("topic")
    subtopic = data.get("subtopic", "")
    country = data.get("country")

    # Log pour vérifier les données
    print(f"➡️ room_id: {room_id}, topic: {topic}, subtopic: {subtopic}, country: {country}")

    if not room_id or not topic or not country:
        print("❌ Erreur : Données obligatoires manquantes.")
        return jsonify({"error": "Données obligatoires manquantes"}), 400

    room = Room.query.get(room_id)
    if not room:
        return jsonify({"error": "Room introuvable"}), 404

    existing_game = Game.query.filter_by(room_id=room_id, status="playing").first()
    if existing_game:
        return jsonify({"error": "Une partie est déjà en cours"}), 400

    new_game = Game(room_id=room_id, status="playing")
    db.session.add(new_game)
    db.session.commit()

    eventlet.spawn(start_round, new_game.id, room_id, topic, subtopic, country)

    return jsonify({"message": "Partie démarrée", "game_id": new_game.id})




def start_round(game_id, room_id, topic, subtopic, country):
    game = Game.query.get(game_id)
    if not game:
        return

    track = get_random_track()  
    if not track:
        socketio.emit("error", {"error": "Impossible de récupérer un morceau"}, room=room_id)
        return
    # Sauvegarde du morceau actuel dans la partie
    game.current_song = track["title"]
    db.session.commit()

    print(f"🎵 Nouveau round : {track['title']} - {track['artist']}")

    # Envoi de la musique et question aux joueurs
    socketio.emit("new_round", {
        "song_title": track["title"],
        "song_artist": track["artist"],
        "song_preview": track["preview_url"],  
        "question": "Quel est le titre de cette chanson ?"  
    }, room=room_id)

    # Lancer le timer de 30 secondes
    eventlet.spawn_after(30, end_round, game.id, room_id)

# 📌 Fin d'un round
def end_round(game_id, room_id, topic, subtopic, country):
    game = Game.query.get(game_id)
    if not game or game.status != "playing":
        return

    print(f"🔚 Fin du round pour la room {room_id}")

    winner = check_winner(game.id)
    if winner:
        game.status = "finished"
        game.finished_at = datetime.utcnow()
        game.winner_id = winner.id
        db.session.commit()
        
        winner_stats = UserStats.query.filter_by(user_id=winner.id).first()
        if winner_stats:
            winner_stats.total_games += 1
            db.session.commit()
        
        socketio.emit("game_over", {
            "winner": winner.username,
            "score": winner.score,  # Erreur - winner n'a pas d'attribut score
            "leaderboard_url": f"/api/classement_game/{game.id}"
        }, room=room_id)
        return

    # Démarrer un nouveau round
    start_round(game.id, room_id, topic, subtopic, country)

# 📌 Vérifier si un joueur a gagné (100 points)
def check_winner(game_id):
    scores = Score.query.filter_by(game_id=game_id).order_by(Score.score.desc()).all()
    if scores and scores[0].score >= 100:  
        return User.query.get(scores[0].user_id)
    return None

# Dans game_routes.py, modifiez la fonction handle_submit_answer
@game_bp.route("/submit_answer", methods=["POST"])
def submit_answer():
    data = request.get_json()
    room_id = data.get("room_id")
    username = data.get("username")
    answer = data.get("answer")

    user = User.query.filter_by(username=username).first()
    if not user:
        emit("error", {"error": "Utilisateur introuvable"}, room=room_id)
        return
        return jsonify({"error": "User not found"}), 404

    game = Game.query.filter_by(room_id=room_id, status="playing").first()
    if not game:
        emit("error", {"error": "Aucune partie en cours"}, room=room_id)
        return
        return jsonify({"error": "No active game"}), 400

    # Vérification de la réponse
    correct = answer.lower() == game.current_song.lower()
    if correct:
        score = Score.query.filter_by(user_id=user.id, game_id=game.id).first()
        if not score:
            score = Score(user_id=user.id, game_id=game.id, score=0)
            db.session.add(score)
        score.score += 10
        
        # Mise à jour des statistiques globales
        user_stats = UserStats.query.filter_by(user_id=user.id).first()
        if not user_stats:
            user_stats = UserStats(user_id=user.id)
            db.session.add(user_stats)
        
        user_stats.total_correct += 1
        user_stats.total_points += 10
        
        db.session.commit()
        print(f"✅ {username} a trouvé la bonne réponse ! +10 points")
    else:
        print(f"❌ {username} a donné une mauvaise réponse.")

    # Mettre à jour les scores
    scores = Score.query.filter_by(game_id=game.id).all()
    score_data = [{"username": User.query.get(s.user_id).username, "score": s.score} for s in scores]

    socketio.emit("update_scores", {"scores": score_data}, room=room_id)
    update_leaderboard(room_id)  

# 📌 Forcer la fin d'une partie
@game_bp.route("/force_end", methods=["POST"])
def force_end_game():
    data = request.get_json()
    room_id = data.get("room_id")

    game = Game.query.filter_by(room_id=room_id, status="playing").first()
    if not game:
        return jsonify({"error": "Aucune partie en cours"}), 404

    game.status = "finished"
    db.session.commit()
    
    print(f"🛑 Partie forcée à l'arrêt pour la room {room_id}")
    return jsonify({"message": "La partie a été terminée manuellement."})

# 📌 Rejoindre une partie depuis une room
@game_bp.route("/join", methods=["POST"])
def join_game():
    data = request.get_json()
    user_id = data.get("user_id")
    room_id = data.get("room_id")

    user = User.query.get(user_id)
    room = Room.query.get(room_id)

    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    if not room:
        return jsonify({"error": "Room introuvable"}), 404

    # 🔹 Vérifier s'il y a une partie en cours dans cette room
    game = Game.query.filter_by(room_id=room_id, status="playing").first()

    if not game:
        return jsonify({"error": "Aucune partie en cours"}), 404

    # 🔹 Vérifie si une chanson est en cours et envoie l'info au joueur
    if game.current_song:
        socketio.emit("ne   w_round", {
            "song_title": game.current_song,
            "question": "Quel est le titre de cette chanson ?"
        }, room=user.id)

    # 🔹 Vérifier si le joueur a déjà un score dans cette partie
    score = Score.query.filter_by(user_id=user.id, game_id=game.id).first()
    if not score:
        score = Score(user_id=user.id, game_id=game.id, score=0)
        db.session.add(score)
        db.session.commit()

    print(f"✅ {user.username} a rejoint la partie dans la room {room.name}")

    return jsonify({
        "message": f"{user.username} a rejoint la partie",
        "game_id": game.id,
        "room_name": room.name,
        "current_song": game.current_song
    })
    
    
def init_game_routes(app):
    app.register_blueprint(game_bp, url_prefix="/api/game")