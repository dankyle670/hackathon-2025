import os
import sys
import random
from datetime import datetime, timedelta
from faker import Faker
import bcrypt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


from models import User, Room, Game, Score, UserStats, Badge, UserBadge
from extensions import db
from config import Config


fake = Faker('fr_FR')


def setup_db():
    print("🔌 Connexion à la base de données...")
    if '--reset' in sys.argv:
        print("⚠️ Réinitialisation de la base de données demandée...")
        try:
            engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
            from models import db
            print(" Base de données réinitialisée avec succès.")
        except Exception as e:
            print(f" Erreur lors de la réinitialisation de la base de données: {e}")
            sys.exit(1)

    try:
        engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
        Session = sessionmaker(bind=engine)
        session = Session()
        return session
    except Exception as e:
        print(f" Erreur lors de la connexion à la base de données: {e}")
        sys.exit(1)


def create_users(session, count=20):
    print(f"👤 Création de {count} utilisateurs...")
    users = []
    
    for i in range(count):
        username = fake.user_name() + str(random.randint(1, 999))
        email = fake.email()
        password = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        user = User(
            username=username,
            email=email,
            password=password,
            profile_picture=f"avatar_{random.randint(1, 10)}.jpg",
        )
        users.append(user)
    
    session.add_all(users)
    session.commit()
    print(f"✅ {count} utilisateurs créés avec succès.")
    return users

# Fonction pour générer des badges
def create_badges(session):
    print("🏆 Création des badges...")
    badges = [
        Badge(name="Débutant", description="A joué sa première partie", icon="badge_beginner.png"),
        Badge(name="Expert", description="A gagné 10 parties", icon="badge_expert.png"),
        Badge(name="Mélomane", description="A joué 100 parties", icon="badge_music_lover.png"),
        Badge(name="Virtuose", description="A obtenu un score parfait", icon="badge_virtuoso.png"),
        Badge(name="Fidèle", description="A joué tous les jours pendant une semaine", icon="badge_faithful.png")
    ]
    
    session.add_all(badges)
    session.commit()
    print(f"✅ {len(badges)} badges créés avec succès.")
    return badges

# Fonction pour générer des rooms
def create_rooms(session, count=5):
    print(f"🏠 Création de {count} rooms...")
    rooms = []
    
    genres = ["Pop", "Rock", "Hip-Hop", "Classique", "Jazz", "Electro", "Mix"]
    
    for i in range(count):
        name = f"Room {fake.word().capitalize()}"
        genre = random.choice(genres)
        # active_users = random.randint(0, 8)
        
        room = Room(
            name=name,
            genre=genre,
            # created_at=fake.date_time_between(start_date='-3m', end_date='now')
        )
        rooms.append(room)
    
    session.add_all(rooms)
    session.commit()
    print(f"✅ {count} rooms créées avec succès.")
    return rooms

# Fonction pour générer des jeux
def create_games(session, rooms, count_per_room=3):
    print(f"🎮 Création de jeux pour {len(rooms)} rooms...")
    games = []
    
    for room in rooms:
        for _ in range(count_per_room):
            status = random.choice(["waiting", "playing", "finished"])
            # started_at = fake.date_time_between(start_date='-2m', end_date='now')
            
            # Si le jeu est terminé, ajouter une date de fin
            # finished_at = None
            # if status == "finished":
            #     finished_at = started_at + timedelta(minutes=random.randint(15, 60))
            
            game = Game(
                room_id=room.id,
                status=status,
                # started_at=started_at,
                # finished_at=finished_at,
                # current_song=fake.sentence(nb_words=4),
                # question_type=random.choice(["titre", "artiste", "année"]),
                # time_left=random.randint(0, 30)
            )
            games.append(game)
    
    session.add_all(games)
    session.commit()
    print(f"✅ {len(games)} jeux créés avec succès.")
    return games

# Fonction pour générer des scores
def create_scores(session, users, games):
    print("📊 Création des scores...")
    scores = []
    
    # Pour chaque jeu, attribuer des scores à un nombre aléatoire d'utilisateurs
    for game in games:
        # Choisir aléatoirement entre 2 et 8 utilisateurs pour ce jeu
        game_users = random.sample(users, random.randint(2, min(8, len(users))))
        
        for user in game_users:
            # Générer un score entre 0 et 100
            score_value = random.randint(0, 100)
            
            score = Score(
                user_id=user.id,
                game_id=game.id,
                score=score_value,
                # created_at=game.started_at + timedelta(minutes=random.randint(5, 30))
            )
            scores.append(score)
    
    session.add_all(scores)
    session.commit()
    print(f"✅ {len(scores)} scores créés avec succès.")
    return scores

# Fonction pour générer des statistiques utilisateurs
def create_user_stats(session, users, scores):
    print("📈 Création des statistiques utilisateurs...")
    user_stats = []
    
    # Calculer les statistiques pour chaque utilisateur
    for user in users:
        user_scores = [s for s in scores if s.user_id == user.id]
        total_games = len(set(s.game_id for s in user_scores))
        total_points = sum(s.score for s in user_scores)
        
        # Estimer le nombre de réponses correctes (10 points par réponse correcte)
        total_correct = total_points // 10
        
        stats = UserStats(
            user_id=user.id,
            total_games=total_games,
            total_correct=total_correct,
            total_points=total_points,
            # updated_at=datetime.utcnow()
        )
        user_stats.append(stats)
    
    session.add_all(user_stats)
    session.commit()
    print(f"✅ {len(user_stats)} statistiques utilisateurs créées avec succès.")
    return user_stats

# Fonction pour attribuer des badges aux utilisateurs
def create_user_badges(session, users, badges):
    print("🎖️ Attribution des badges aux utilisateurs...")
    user_badges = []
    
    for user in users:
        # Attribuer aléatoirement entre 0 et 3 badges à chaque utilisateur
        num_badges = random.randint(0, 3)
        if num_badges > 0:
            selected_badges = random.sample(badges, num_badges)
            
            for badge in selected_badges:
                user_badge = UserBadge(
                    user_id=user.id,
                    badge_id=badge.id,
                    earned_at=fake.date_time_between(start_date='-6m', end_date='now')
                )
                user_badges.append(user_badge)
    
    session.add_all(user_badges)
    session.commit()
    print(f"✅ {len(user_badges)} badges attribués aux utilisateurs avec succès.")
    return user_badges

# Fonction pour attribuer des gagnants aux jeux terminés
def set_game_winners(session, games, scores):
    print("🏆 Définition des gagnants pour les jeux terminés...")
    updated_games = 0
    
    for game in games:
        if game.status == "finished":
            # Récupérer les scores pour ce jeu
            game_scores = [s for s in scores if s.game_id == game.id]
            
            if game_scores:
                # Trouver le score le plus élevé
                max_score = max(game_scores, key=lambda s: s.score)
                
                # Définir le gagnant
                game.winner_id = max_score.user_id
                updated_games += 1
    
    session.commit()
    print(f"✅ {updated_games} gagnants définis pour les jeux terminés.")

# Fonction principale pour exécuter le seeder
def run_seeder():
    print("🚀 Démarrage du seeder MusicQuiz...")
    
    # Configurer la base de données
    session = setup_db()
    
    # Créer les données
    users = create_users(session, count=20)
    badges = create_badges(session)
    rooms = create_rooms(session, count=5)
    games = create_games(session, rooms, count_per_room=3)
    scores = create_scores(session, users, games)
    set_game_winners(session, games, scores)
    user_stats = create_user_stats(session, users, scores)
    user_badges = create_user_badges(session, users, badges)
    
    print("✅ Seeding terminé avec succès!")
    print(f"📊 Résumé:")
    print(f"  - {len(users)} utilisateurs")
    print(f"  - {len(badges)} badges")
    print(f"  - {len(rooms)} rooms")
    print(f"  - {len(games)} jeux")
    print(f"  - {len(scores)} scores")
    print(f"  - {len(user_stats)} statistiques utilisateurs")
    print(f"  - {len(user_badges)} badges attribués")

if __name__ == "__main__":
    run_seeder()