from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request
from extensions import db
from models import Room, User, Game, Score
from sqlalchemy import func, desc
from flask_cors import CORS
import eventlet

socketio = SocketIO()

# Dictionnaire pour suivre les utilisateurs actifs dans les rooms
active_rooms = {}

def init_socketio(app):
    global socketio
    # Mise à jour pour permettre les connexions depuis le frontend React (multiples origines)
    socketio.init_app(app, cors_allowed_origins="*", path="/socket.io")

    @socketio.on("connect")
    def handle_connect():
        print(f"✅ Client connecté : {request.sid}")
        # Envoyer un événement de confirmation de connexion pour React
        emit("connection_established", {"sid": request.sid})

    @socketio.on("disconnect")
    def handle_disconnect():
        print(f"❌ Client déconnecté : {request.sid}")

        # Récupérer l'utilisateur par `session_id`
        user = User.query.filter_by(session_id=request.sid).first()
        if user:
            print(f"🚪 Déconnexion de {user.username}, sortie de la room {user.room_id}")
            handle_leave_room({"room_id": user.room_id, "username": user.username})

    @socketio.on("create_room")
    def handle_create_room(data):
        room_name = data.get("room_name")
        username = data.get("username")

        if not room_name or not username:
            emit("error", {"error": "Données invalides"})
            return
        
        new_room = Room(name=room_name)
        db.session.add(new_room)
        db.session.commit()

        print(f"🆕 Room créée: {room_name} (ID: {new_room.id})")
        emit("room_created", {"room_id": new_room.id, "room_name": new_room.name}, broadcast=True)

    @socketio.on("join_room")
    def handle_join_room(data):
        room_id = data.get("room_id")
        username = data.get("username")

        if not room_id or not username:
            emit("error", {"error": "Données invalides"})
            return
        
        room = Room.query.get(room_id)
        if not room:
            emit("error", {"error": "Room introuvable"})
            return

        join_room(room_id)
        user = User.query.filter_by(username=username).first()

        if not user:
            user = User(username=username, email=f"{username}@temp.com", password="temporary", room_id=room_id, session_id=request.sid)
            db.session.add(user)
        else:
            user.room_id = room_id
            user.session_id = request.sid  # ✅ Mise à jour du session_id
        db.session.commit()

        # Ajouter l'utilisateur à la liste des rooms actives
        if room_id not in active_rooms:
            active_rooms[room_id] = set()
        active_rooms[room_id].add(username)

        print(f"✅ {username} a rejoint la room {room_id}")
        emit("join_confirmation", {"room_id": room_id, "username": username}, room=room_id)

    @socketio.on("leave_room")
    def handle_leave_room(data):
        room_id = data.get("room_id")
        username = data.get("username")

        if not room_id or not username:
            return

        leave_room(room_id)
        user = User.query.filter_by(username=username).first()
        
        if user:
            user.room_id = None  # ✅ Ne pas supprimer, juste le retirer de la room
            user.session_id = None  # ✅ Suppression du session_id
            db.session.commit()

        # Gérer les utilisateurs actifs et le nettoyage des rooms vides
        if room_id in active_rooms and username in active_rooms[room_id]:
            active_rooms[room_id].remove(username)
            
            # ✅ Si plus personne dans la room, suppression après 5 minutes
            if len(active_rooms[room_id]) == 0:
                print(f"⏳ Room {room_id} vide. Programmation de la suppression dans 5 minutes.")
                eventlet.spawn_after(300, delete_empty_room, room_id)  # ⏳ Supprime après 5 min

    def delete_empty_room(room_id):
        # Vérifier si la room existe toujours et si elle est toujours vide
        if room_id in active_rooms and len(active_rooms[room_id]) == 0:
            room = Room.query.get(room_id)
            if room:
                db.session.delete(room)
                db.session.commit()
                del active_rooms[room_id]
                print(f"🗑️ Room {room_id} supprimée après 5 minutes d'inactivité.")
                emit("room_deleted", {"room_id": room_id}, broadcast=True)

    @socketio.on("start_game")
    def handle_start_game(data):
        room_id = data.get("room_id")
        if not room_id or room_id not in active_rooms:
            emit("error", {"error": "Room invalide"})
            return
        
        print(f"🎮 Démarrage du jeu dans la room {room_id}")
        emit("game_started", {"room_id": room_id}, room=room_id)

        eventlet.sleep(60)  # Attendre 60 secondes avant de relancer une partie
        if room_id in active_rooms and len(active_rooms[room_id]) > 0:  # Vérifier s'il y a toujours des joueurs
            print(f"🔄 Nouvelle partie démarrée dans la room {room_id}")
            emit("new_round", {"room_id": room_id}, room=room_id)

    return socketio

def update_leaderboard(room_id):
    """
    Met à jour et envoie le classement pour une room spécifique
    """
    # Obtenir les parties associées à cette room
    games = Game.query.filter_by(room_id=room_id).all()
    if not games:
        return
    
    game_ids = [game.id for game in games]
    
    # Requête pour obtenir le classement de la room
    room_scores = db.session.query(
        User.id,
        User.username,
        User.profile_picture,
        func.sum(Score.score).label('room_score')
    ).join(
        Score, User.id == Score.user_id
    ).filter(
        Score.game_id.in_(game_ids)
    ).group_by(
        User.id
    ).order_by(
        desc('room_score')
    ).limit(10).all()
    
    # Formater les résultats
    results = []
    for idx, (user_id, username, profile_pic, score) in enumerate(room_scores, 1):
        results.append({
            "rank": idx,
            "user_id": user_id,
            "username": username,
            "profile_picture": profile_pic,
            "score": score
        })
    
    # Envoyer le classement mis à jour via Socket.IO
    socketio.emit("leaderboard_update", {"leaderboard": results}, room=room_id)