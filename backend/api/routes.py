from flask import Blueprint, request, jsonify
from recommender.engine import(
    get_track_vector,
    compute_mean_vector,
    recommend_tracks,
    store_recommendations
)
from database.db import tracks_col

routes = Blueprint("routes", __name__)

@routes.route("/api/recommend", methods=["POST"])
def recommend():
    try:
        data = request.get_json()
        username = data.get("username")
        track_names = data.get("track_names")

        if not username or not track_names or len(track_names) < 1:
            return jsonify({"error": "username and all three track_names are required"}), 400
        
        input_vector = compute_mean_vector(track_names)
        input_ids = [get_track_vector(name)[1] for name in track_names]

        combination_key = "_".join(map(str, sorted(input_ids)))

        user_doc = tracks_col.database["user_info"].find_one({"username": username})
        seen_ids = user_doc.get("recommendation_history", {}).get(combination_key, []) if user_doc else []

        recommendations = recommend_tracks(input_vector, input_ids, seen_ids)
        final_output = store_recommendations(username, input_ids, recommendations)

        return jsonify({"recommendations": final_output})
    
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 404
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
    
@routes.route("/api/tracks", methods=["GET"])
def fetch_tracks():

    query_str = request.args.get("query", "").strip()
    search_filter = {"track_name": {"$regex": query_str, "$options": "i"}} if query_str else {}

    cursor = tracks_col.find(search_filter, {"track_name": 1, "_id": 0}).limit(50)
    track_names = [doc["track_name"] for doc in cursor]

    return jsonify({"tracks": track_names})