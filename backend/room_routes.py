from flask import Blueprint, jsonify, request
from extensions import db
from models import Room, User, Game  # ✅ Ajout de Game

room_bp = Blueprint("room", __name__)

# 📌 Récupérer toutes les rooms disponibles avec l'ID de la game en cours
@room_bp.route("/rooms", methods=["GET"])
def get_rooms():
    rooms = Room.query.all()
    room_list = []

    for room in rooms:
        game = Game.query.filter_by(room_id=room.id, status="playing").first()
        room_list.append({
            "id": room.id,
            "name": room.name,
            "genre": room.genre,
            "status": room.status,
            "players": [user.id for user in room.users],
            "game_id": game.id if game else None  # ✅ Ajout de l'ID de la partie en cours
        })

    print("🔍 API GET /rooms appelée - Nombre de rooms :", len(room_list))
    return jsonify({"rooms": room_list})

# 📌 Récupérer une room spécifique
@room_bp.route("/rooms/<int:room_id>", methods=["GET"])
def get_room(room_id):
    room = Room.query.get(room_id)
    if not room:
        return jsonify({"error": "Room introuvable"}), 404

    game = Game.query.filter_by(room_id=room.id, status="playing").first()

    return jsonify({
        "id": room.id,
        "name": room.name,
        "genre": room.genre,
        "status": room.status,
        "players": [user.id for user in room.users],
        "game_id": game.id if game else None  # ✅ Récupération de la game
    })

# 📌 Créer une nouvelle room
@room_bp.route("/rooms", methods=["POST"])
def create_room():
    data = request.get_json()
    room_name = data.get("name")

    if not room_name:
        return jsonify({"error": "Le nom de la room est requis"}), 400

    existing_room = Room.query.filter_by(name=room_name).first()
    if existing_room:
        return jsonify({"error": "Ce nom de room existe déjà"}), 400

    new_room = Room(name=room_name, genre=data.get("genre", "Mix"))
    db.session.add(new_room)
    db.session.commit()

    print(f"✅ Room créée : {new_room.name}")  # ✅ Debug console
    return jsonify({"message": "Room créée avec succès", "room_id": new_room.id})

# 📌 Un joueur rejoint une Room et est ajouté à la BDD
@room_bp.route("/rooms/join", methods=["POST"])
def join_room():
    data = request.get_json()
    user_id = data.get("user_id")
    room_id = data.get("room_id")

    user = User.query.get(user_id)
    room = Room.query.get(room_id)

    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    if not room:
        return jsonify({"error": "Room introuvable"}), 404

    user.room_id = room.id  # ✅ Ajoute l'utilisateur à la room
    db.session.commit()

    print(f"✅ {user.username} a rejoint la room {room.name}")  # Debug console
    return jsonify({"message": f"{user.username} a rejoint {room.name}", "players": room.active_users})

# 📌 Un joueur quitte une Room et est retiré de la BDD
@room_bp.route("/rooms/leave", methods=["POST"])
def leave_room():
    data = request.get_json()
    user_id = data.get("user_id")
    room_id = data.get("room_id")

    user = User.query.get(user_id)
    room = Room.query.get(room_id)

    if not user or not room:
        return jsonify({"error": "Utilisateur ou room introuvable"}), 404

    user.room_id = None  # ✅ Retire l'utilisateur de la room
    db.session.commit()

    print(f"❌ {user.username} a quitté la room {room.name}")  # Debug console
    return jsonify({"message": f"{user.username} a quitté {room.name}", "players": room.active_users})
