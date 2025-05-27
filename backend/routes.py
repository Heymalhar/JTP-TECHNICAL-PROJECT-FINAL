from flask import Blueprint, request, jsonify
from engine import (
    get_track_vector,
    compute_mean_vector,
    recommend_tracks,
    store_recommendations,
    user_signup,
    user_login,
    previous_recommendations
)
from db import tracks_col, users_col

routes = Blueprint("routes", __name__)

@routes.route("/api/signup", methods=["POST"])
def signup():
    
    try:
        data = request.get_json()
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not email or not password:
            return jsonify({"error": "username, email and password are required mandatorily"}), 400
        
        msg = user_signup(username, email, password)
        return jsonify({"message": msg}), 201
    
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 409
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@routes.route("/api/login", methods=["POST"])
def login():

    try:
        data = request.get_json()
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "username and password are required"}), 400
        
        msg = user_login(username, password)
        return jsonify({"message": msg}), 200
    
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 401
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@routes.route("/api/recommend", methods=["POST"])
def recommend():
    try:
        data = request.get_json()
        username = data.get("username")
        track_names = data.get("track_names")

        if not username or not track_names or len(track_names) < 3:
            return jsonify({"error": "username and exactly 3 track names are required"}), 400
        
        input_vector = compute_mean_vector(track_names)

        input_ids = []
        input_artists = set()
        input_genres = set()

        for name in track_names:
            vector, track_id = get_track_vector(name)
            input_ids.append(track_id)

            track_doc = tracks_col.find_one({"track_id": track_id}, {"artists": 1, "track_genre": 1})
            if track_doc:
                if isinstance(track_doc.get("artists"), list):
                    input_artists.update(track_doc["artists"])
                else:
                    input_artists.add(track_doc.get("artists"))
                
                input_genres.add(track_doc.get("track_genre"))
        
        combination_key = "_".join(map(str, sorted(input_ids)))
        user_doc = users_col.find_one({"username": username})
        seen_ids = user_doc.get("recommendation_history", {}).get(combination_key, []) if user_doc else []

        recommendations = recommend_tracks(
            input_vector,
            input_ids,
            seen_ids,
            input_artists=input_artists,
            input_genres=input_genres,
            alpha=0.5,
            beta=0.1,
            gamma=0.4
        )

        final_output = store_recommendations(username, input_ids, recommendations)

        return jsonify({"recommendations": final_output}), 200
    
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 404
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

    
@routes.route("/api/history", methods=["POST"])
def history():
    
    try:
        data = request.get_json()
        username = data.get("username")
        track_names = data.get("track_names")

        if not username or not track_names or len(track_names) < 3:
            return jsonify({"error": "username and exactly 3 track_names are required"}), 400
        
        history_records = previous_recommendations(username, track_names)

        if not history_records:
            return jsonify({"message": "No previous recommendations found for this combination."}), 200
        
        return jsonify({"history": history_records}), 200
    
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
    
@routes.route("/api/tracks", methods=["GET"])
def fetch_tracks():
    query_str = request.args.get("query", "").strip()
    search_filter = {"track_name": {"$regex": query_str, "$options": "i"}} if query_str else {}

    cursor = tracks_col.find(search_filter, {"track_name": 1, "_id": 0}).limit(50)
    track_names = [doc["track_name"] for doc in cursor]

    return jsonify({"tracks": track_names}), 200
