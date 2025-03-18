from datetime import datetime
from extensions import db, bcrypt

#  Modèle User : Stocke les joueurs inscrits
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False, unique=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Date d'inscription
    profile_picture = db.Column(db.String(255), default="default.jpg")  # URL de l'avatar
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=True)  # ✅ Relation avec une Room
    session_id = db.Column(db.String(100), nullable=True)  # ✅ ID de session SocketIO

    def __init__(self, username, email, password, profile_picture="default.jpg"):
        self.username = username
        self.email = email
        self.set_password(password)  # ✅ Hashage du mot de passe
        self.profile_picture = profile_picture

    def set_password(self, password):
        """ ✅ Hash le mot de passe avant de le stocker """
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """ ✅ Vérifie si le mot de passe correspond au hash stocké """
        return bcrypt.check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.username} ({self.email})>"



class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    genre = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(20), default="waiting")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    active_users = db.Column(db.Integer, default=0)  # ✅ Nombre de joueurs actifs

    users = db.relationship("User", backref="room", lazy=True, cascade="all, delete-orphan")

    def __init__(self, name, genre=None):
        self.name = name
        self.genre = genre

    def add_user(self, user):
        """ ✅ Ajoute un joueur dans la Room """
        if user.room_id is None:
            user.room_id = self.id
            self.active_users += 1
            db.session.commit()

    def remove_user(self, user):
        """ ✅ Retire un joueur de la Room """
        if user.room_id == self.id:
            user.room_id = None
            self.active_users = max(0, self.active_users - 1)  # ✅ Empêche un nombre négatif
            db.session.commit()

    def __repr__(self):
        return f"<Room {self.name} - {self.genre} - {self.active_users} joueurs>"



class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    current_song = db.Column(db.String(200), nullable=True)
    question_type = db.Column(db.String(50), nullable=True)
    time_left = db.Column(db.Integer, default=30)
    finished_at = db.Column(db.DateTime, nullable=True)
    winner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    status = db.Column(db.String(20), default="waiting")
    started_at = db.Column(db.DateTime, default=datetime.utcnow)

    winner = db.relationship("User", foreign_keys=[winner_id])

    def __init__(self, room_id, status="waiting"):
        self.room_id = room_id
        self.status = status  # ✅ Ajout d'un statut initial

    def __repr__(self):
        return f"<Game Room {self.room_id}, Status: {self.status}>"


# 📌 Modèle Score : Stocke les scores des joueurs dans chaque partie
class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable=False)
    score = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref=db.backref("scores", cascade="all, delete-orphan"))
    game = db.relationship("Game", backref=db.backref("scores", cascade="all, delete-orphan"))

    def __init__(self, user_id, game_id, score=0):
        self.user_id = user_id
        self.game_id = game_id
        self.score = score

    def __repr__(self):
        return f"<Score {self.score} - User {self.user_id} - Game {self.game_id}>"


# Modèle pour les statistiques globales
class UserStats(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    total_games = db.Column(db.Integer, default=0)
    total_correct = db.Column(db.Integer, default=0)
    total_points = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = db.relationship("User", backref=db.backref("stats", uselist=False))
    
    def __repr__(self):
        return f"<UserStats {self.user_id} - {self.total_points} points>"
    
    

class Badge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    icon = db.Column(db.String(255), nullable=False)
    
    def __repr__(self):
        return f"<Badge {self.name}>"

class UserBadge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    badge_id = db.Column(db.Integer, db.ForeignKey('badge.id'), nullable=False)
    earned_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship("User", backref=db.backref("badges", lazy=True))
    badge = db.relationship("Badge")
    
    def __repr__(self):
        return f"<UserBadge {self.user_id} - {self.badge_id}>"