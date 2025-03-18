from flask import Blueprint, request, jsonify
from flask_socketio import emit
from extensions import db, socketio
from models import Game, Score, User, Room
import openai
import eventlet
import os

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

# Route to get list of topics
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
        print(f"⚠️ Error generating question: {e}")
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

# Route to start a new quiz game
@game_bp.route("/start", methods=["POST"])
def start_game():
    data = request.get_json()
    room_id = data.get("room_id")
    topic = data.get("topic")
    subtopic = data.get("subtopic", "")
    country = data.get("country")

    if topic not in topics:
        return jsonify({"error": "Invalid topic"}), 400
    if not topics[topic]:
        subtopic = ""
    if country not in EUROPEAN_COUNTRIES:
        return jsonify({"error": "Invalid country"}), 400

    room = Room.query.get(room_id)
    if not room:
        return jsonify({"error": "Room not found"}), 404

    existing_game = Game.query.filter_by(room_id=room_id, status="playing").first()
    if existing_game:
        return jsonify({"error": "A game is already in progress"}), 400

    new_game = Game(room_id=room_id, status="playing")
    db.session.add(new_game)
    db.session.commit()

    eventlet.spawn(start_round, new_game.id, room_id, topic, subtopic, country)

    return jsonify({"message": "Game started", "game_id": new_game.id})

# Function to start a round
def start_round(game_id, room_id, topic, subtopic, country):
    game = Game.query.get(game_id)
    if not game:
        return

    question = generate_question(topic, subtopic, country)
    if not question:
        emit("error", {"error": "Failed to generate a question"}, room=room_id)
        return

    socketio.emit("new_question", {"question": question}, room=room_id)
    eventlet.spawn_after(30, end_round, game.id, room_id, topic, subtopic, country)

# Function to end a round and start a new one
def end_round(game_id, room_id, topic, subtopic, country):
    game = Game.query.get(game_id)
    if not game or game.status != "playing":
        return
    
    winner = check_winner(game.id)
    if winner:
        socketio.emit("game_over", {"winner": winner.username, "score": winner.score}, room=room_id)
        return

    start_round(game.id, room_id, topic, subtopic, country)

# Function to check if a player has won
def check_winner(game_id):
    scores = Score.query.filter_by(game_id=game_id).order_by(Score.score.desc()).all()
    if scores and scores[0].score >= 100:
        return User.query.get(scores[0].user_id)
    return None

# Route to submit an answer (HTTP Alternative to WebSockets)
@game_bp.route("/submit_answer", methods=["POST"])
def submit_answer():
    data = request.get_json()
    room_id = data.get("room_id")
    username = data.get("username")
    answer = data.get("answer")

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    game = Game.query.filter_by(room_id=room_id, status="playing").first()
    if not game:
        return jsonify({"error": "No active game"}), 400

    correct_answer = game.current_question.split("\n")[-1]
    correct = answer.lower() in correct_answer.lower()

    if correct:
        score = Score.query.filter_by(user_id=user.id, game_id=game.id).first()
        if not score:
            score = Score(user_id=user.id, game_id=game.id, score=0)
            db.session.add(score)
        score.score += 10
        db.session.commit()

    return jsonify({"message": "Answer received", "correct": correct})

# Route to end a game manually
@game_bp.route("/end", methods=["POST"])
def end_game():
    data = request.get_json()
    room_id = data.get("room_id")

    game = Game.query.filter_by(room_id=room_id, status="playing").first()
    if not game:
        return jsonify({"error": "No active game"}), 404

    game.status = "finished"
    db.session.commit()

    return jsonify({"message": "Game ended successfully."})

# Register the blueprint
def init_game_routes(app):
    app.register_blueprint(game_bp, url_prefix="/api/game")