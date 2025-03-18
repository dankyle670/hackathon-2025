from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from datetime import timedelta
from models import db, User

auth = Blueprint('auth', __name__)

# 📌 Route d'inscription
@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"error": "Tous les champs sont obligatoires"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email déjà utilisé"}), 400

    new_user = User(username=username, email=email, password=password)
    db.session.add(new_user)
    db.session.commit()

    print(f"✅ Utilisateur inscrit : {username} ({email})")

    access_token = create_access_token(identity=str(new_user.id), expires_delta=timedelta(hours=1))

    return jsonify({
        "message": "Utilisateur créé avec succès",
        "token": access_token,
        "id": new_user.id,
        "username": new_user.username
    }), 201


# 📌 Route de connexion
@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Identifiants invalides"}), 401

    access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(hours=1))
    refresh_token = create_refresh_token(identity=str(user.id), expires_delta=timedelta(days=30))

    return jsonify({
        "token": access_token,
        "refresh_token": refresh_token,
        "id": user.id,
        "username": user.username
    }), 200


# 📌 Route protégée nécessitant un JWT
@auth.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    try:
        print(f"🔍 Requête reçue sur /profile | Headers : {request.headers}")

        current_user_id = get_jwt_identity()
        print(f"🔑 JWT Identity récupérée : {current_user_id} | Type : {type(current_user_id)}")

        user = User.query.get(int(current_user_id))  # ✅ Conversion en entier

        if not user:
            print(f"⚠️ Tentative d'accès à un profil inexistant : ID {current_user_id}")
            return jsonify({"error": "Utilisateur non trouvé"}), 404

        print(f"✅ Profil chargé avec succès pour l'ID {current_user_id}")

        return jsonify({
            "username": user.username,
            "email": user.email
        }), 200

    except Exception as e:
        print(f"❌ Erreur dans la récupération du profil : {e}")
        return jsonify({"error": "Token invalide ou expiré"}), 401


# 📌 Route de rafraîchissement du token
@auth.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=str(current_user_id), expires_delta=timedelta(hours=1))

    return jsonify({"token": new_access_token}), 200
