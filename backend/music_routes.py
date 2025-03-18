from flask import Blueprint, jsonify
from spotify_service import get_random_track  # Assure-toi que ce fichier existe et fonctionne

music = Blueprint("music", __name__)

@music.route("/get_song", methods=["GET"])
def get_song():
    track = get_random_track("pop")  # Exemple : récupérer une musique aléatoire de genre pop
    if track:
        return jsonify({
            "title": track["title"],
            "artist": track["artist"],
            "album": track["album"],
            "preview_url": track["preview_url"]  # Lien vers un extrait de la musique
        })
    return jsonify({"error": "Aucune musique trouvée"}), 404
