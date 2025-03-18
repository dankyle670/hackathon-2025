from flask import Blueprint, request, jsonify
from flask_socketio import emit, join_room
from extensions import db, socketio
from models import Game, Score, User, Room, UserStats
from spotify_service import get_random_track
from socket_manager import socketio, update_leaderboard
import eventlet
from datetime import datetime  # Ajout de l'import manquant

game_bp = Blueprint("game", __name__)

# 📌 Démarrer une partie dans une room
@game_bp.route("/game/start", methods=["POST"])
def start_game():
    data = request.get_json()
    room_id = data.get("room_id")

    room = Room.query.get(room_id)
    if not room:
        return jsonify({"error": "Room introuvable"}), 404

    # Vérifier si une partie est déjà en cours
    existing_game = Game.query.filter_by(room_id=room_id, status="playing").first()
    if existing_game:
        return jsonify({"error": "Une partie est déjà en cours"}), 400

    # Création d'une nouvelle partie
    new_game = Game(room_id=room_id, status="playing")
    db.session.add(new_game)
    db.session.commit()

    print(f"🎮 Nouvelle partie créée dans la room {room.name}")

    eventlet.spawn(start_round, new_game.id, room_id)

    return jsonify({"message": "Partie démarrée", "game_id": new_game.id})



def start_round(game_id, room_id):
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
def end_round(game_id, room_id):
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
    start_round(game.id, room_id)

# 📌 Vérifier si un joueur a gagné (100 points)
def check_winner(game_id):
    scores = Score.query.filter_by(game_id=game_id).order_by(Score.score.desc()).all()
    if scores and scores[0].score >= 100:  
        return User.query.get(scores[0].user_id)
    return None

# Dans game_routes.py, modifiez la fonction handle_submit_answer
@socketio.on("submit_answer")
def handle_submit_answer(data):
    room_id = data.get("room_id")
    username = data.get("username")
    answer = data.get("answer")

    user = User.query.filter_by(username=username).first()
    if not user:
        emit("error", {"error": "Utilisateur introuvable"}, room=room_id)
        return

    game = Game.query.filter_by(room_id=room_id, status="playing").first()
    if not game:
        emit("error", {"error": "Aucune partie en cours"}, room=room_id)
        return

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
@game_bp.route("/game/force_end", methods=["POST"])
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
@game_bp.route("/game/join", methods=["POST"])
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
        socketio.emit("new_round", {
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