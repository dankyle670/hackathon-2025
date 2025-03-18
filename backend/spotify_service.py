import requests
import base64
from config import Config

def get_spotify_token():
    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": "Basic " + base64.b64encode(f"{Config.SPOTIFY_CLIENT_ID}:{Config.SPOTIFY_CLIENT_SECRET}".encode()).decode(),
        "Content-Type": "application/x-www-form-urlencoded",
    }
    data = {"grant_type": "client_credentials"}
    response = requests.post(url, headers=headers, data=data)
    return response.json().get("access_token")

def get_random_track(genre="pop"):
    token = get_spotify_token()
    url = f"https://api.spotify.com/v1/recommendations?seed_genres={genre}&limit=1"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    track = response.json().get("tracks", [])[0]

    if track:
        return {
            "title": track["name"],
            "artist": track["artists"][0]["name"],
            "album": track["album"]["name"],
            "preview_url": track["preview_url"],  # Lien de l'extrait musical
        }
    return None
