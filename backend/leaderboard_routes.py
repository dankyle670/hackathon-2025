from flask import Blueprint, jsonify, request
from extensions import db
from models import User, Room, Score, Game, UserStats
from sqlalchemy import func, desc

leaderboard_bp = Blueprint("leaderboard", __name__)

# Route pour le classement général
@leaderboard_bp.route("/classement_general", methods=["GET"])
def global_leaderboard():
    # Requête pour obtenir le classement global
    leaderboard = db.session.query(
        User.id,
        User.username,
        User.profile_picture,
        func.sum(Score.score).label('total_score'),
        func.count(func.distinct(Score.game_id)).label('games_played')
    ).join(
        Score, User.id == Score.user_id
    ).group_by(
        User.id
    ).order_by(
        desc('total_score')
    ).limit(100).all()  # Limiter à 100 pour éviter les problèmes de performance
    
    # Formater les résultats
    results = []
    for idx, (user_id, username, profile_pic, score, games) in enumerate(leaderboard, 1):
        results.append({
            "rank": idx,
            "user_id": user_id,
            "username": username,
            "profile_picture": profile_pic,
            "total_score": score,
            "games_played": games
        })
    
    # Retourner uniquement JSON pour React
    return jsonify({"leaderboard": results})

# Route pour le classement par room
@leaderboard_bp.route("/classement_room/<int:room_id>", methods=["GET"])
def room_leaderboard(room_id):
    # Vérifier si la room existe
    room = Room.query.get(room_id)
    if not room:
        return jsonify({"error": "Room introuvable"}), 404
    
    # Obtenir les parties associées à cette room
    games = Game.query.filter_by(room_id=room_id).all()
    game_ids = [game.id for game in games]
    
    if not game_ids:
        return jsonify({"error": "Aucune partie trouvée pour cette room"}), 404
    
    # Requête pour obtenir le classement de la room
    room_scores = db.session.query(
        User.id,
        User.username,
        User.profile_picture,
        func.sum(Score.score).label('room_score'),
        func.count(func.distinct(Score.game_id)).label('games_played')
    ).join(
        Score, User.id == Score.user_id
    ).filter(
        Score.game_id.in_(game_ids)
    ).group_by(
        User.id
    ).order_by(
        desc('room_score')
    ).all()
    
    # Formater les résultats
    results = []
    for idx, (user_id, username, profile_pic, score, games) in enumerate(room_scores, 1):
        results.append({
            "rank": idx,
            "user_id": user_id,
            "username": username,
            "profile_picture": profile_pic,
            "room_score": score,
            "games_played": games
        })
    
    # Retourner uniquement JSON pour React
    return jsonify({
        "room_name": room.name,
        "room_genre": room.genre,
        "leaderboard": results
    })

# Route pour le classement d'une partie spécifique
@leaderboard_bp.route("/classement_game/<int:game_id>", methods=["GET"])
def game_leaderboard(game_id):
    # Vérifier si la partie existe
    game = Game.query.get(game_id)
    if not game:
        return jsonify({"error": "Partie introuvable"}), 404
    
    # Requête pour obtenir le classement de la partie
    scores = db.session.query(
        User.id,
        User.username,
        User.profile_picture,
        Score.score.label('game_score')
    ).join(
        Score, User.id == Score.user_id
    ).filter(
        Score.game_id == game_id
    ).order_by(
        desc(Score.score)
    ).all()
    
    # Formater les résultats
    results = []
    for idx, (user_id, username, profile_pic, score) in enumerate(scores, 1):
        results.append({
            "rank": idx,
            "user_id": user_id,
            "username": username,
            "profile_picture": profile_pic,
            "score": score
        })
    
    # Retourner uniquement JSON pour React
    room = Room.query.get(game.room_id)
    return jsonify({
        "game_id": game_id,
        "room_id": game.room_id,
        "room_name": room.name if room else None,
        "leaderboard": results
    })