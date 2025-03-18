from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request
from extensions import db
from models import Room, User
import eventlet

socketio = SocketIO()

# Dictionnaire pour suivre les utilisateurs actifs dans les rooms
active_rooms = {}

def init_socketio(app):
    global socketio
    socketio.init_app(app, cors_allowed_origins="*", path="socket.io")

    @socketio.on("connect")
    def handle_connect():
        print(f"✅ Client connecté : {request.sid}")

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
            user = User(username=username, room_id=room_id, session_id=request.sid)
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

        if room_id in active_rooms and username in active_rooms[room_id]:
            active_rooms[room_id].remove(username)
            
            # ✅ Si plus personne dans la room, suppression après 5 minutes
            if not active_rooms[room_id]:
                del active_rooms[room_id]
                eventlet.spawn_after(300, delete_empty_room, room_id)  # ⏳ Supprime après 5 min

    def delete_empty_room(room_id):
        if room_id not in active_rooms:  # Vérifier si la room est toujours vide
            Room.query.filter_by(id=room_id).delete()
            db.session.commit()
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
        if room_id in active_rooms and active_rooms[room_id]:  # Vérifier s'il y a toujours des joueurs
            print(f"🔄 Nouvelle partie démarrée dans la room {room_id}")
            emit("new_round", {"room_id": room_id}, room=room_id)

    return socketio
