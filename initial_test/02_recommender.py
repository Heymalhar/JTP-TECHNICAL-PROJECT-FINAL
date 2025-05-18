import numpy as np
from pymongo import MongoClient
from sklearn.metrics.pairwise import cosine_similarity
import random

import os
from dotenv import load_dotenv

load_dotenv()

mongo_pass = os.getenv('MONGO_PASS')

MONGO_URI = f"mongodb+srv://malhar311002:{mongo_pass}@jtp-technical-project.kjpcv6p.mongodb.net/"
DATABASE_NAME = "music_db"
TRACKS_COLLECTION = "tracks"
USERS_COLLECTION = "user_info"

NOISE_STD = 0.015
TOP_N = 100
SAMPLE_K = 5

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
tracks_col = db[TRACKS_COLLECTION]
users_col = db[USERS_COLLECTION]

def get_track_vector(track_name):
    doc = tracks_col.find_one({"track_name": track_name})
    if doc:
        return np.array(doc['normalized_vector']), doc['track_id']
    else:
        raise ValueError(f"Track '{track_name}' not found in the database.")

def compute_mean_vector(track_names):
    vectors = []
    for name in track_names:
        vec, _ = get_track_vector(name)
        vectors.append(vec)
    return np.mean(vectors, axis=0)

def recommend_tracks(input_vector, input_track_ids, seen_ids):

    noisy_vector = input_vector + np.random.normal(0, NOISE_STD, size=input_vector.shape)

    cursor = tracks_col.find({}, {
        "track_name": 1, "artists": 1, "track_genre": 1,
        "popularity": 1, "normalized_vector": 1, "track_id": 1
    })
    all_tracks = list(cursor)

    matrix = np.array([doc["normalized_vector"] for doc in all_tracks])
    track_ids = [doc["track_id"] for doc in all_tracks]

    similarities = cosine_similarity([noisy_vector], matrix).flatten()
    similarity_pairs = list(zip(track_ids, similarities))
    similarity_pairs = sorted(similarity_pairs, key=lambda x: x[1], reverse=True)

    top_similar = [track_id for track_id, _ in similarity_pairs
                   if track_id not in input_track_ids and track_id not in seen_ids][:TOP_N]

    sampled = random.sample(top_similar, k=min(SAMPLE_K, len(top_similar)))

    recommendations = []
    for tid in sampled:
        doc = next(item for item in all_tracks if item["track_id"] == tid)
        doc["similarity_score"] = round(similarities[track_ids.index(tid)], 4)
        recommendations.append(doc)

    return recommendations

def store_recommendations(username, input_ids, new_recommendations):
    """Store combination-specific recommendation history."""

    combination_key = "_".join(map(str, sorted(input_ids)))
    new_ids = [rec["track_id"] for rec in new_recommendations]

    user_doc = users_col.find_one({"username": username})

    if not user_doc:

        users_col.insert_one({
            "username": username,
            "recommendation_history": {
                combination_key: new_ids
            }
        })
        return new_recommendations

    else:
        history = user_doc.get("recommendation_history", {})
        seen_for_combo = history.get(combination_key, [])

        unseen_recommendations = [rec for rec in new_recommendations if rec["track_id"] not in seen_for_combo]

        if not unseen_recommendations:
            return []
        
        updated_seen = seen_for_combo + [rec["track_id"] for rec in unseen_recommendations]

        users_col.update_one(
            {"username": username},
            {"$set": {f"recommendation_history.{combination_key}": updated_seen}}
        )

        return unseen_recommendations

if __name__ == "__main__":
    print("Welcome!")

    username = input("username: ").strip()
    track_inputs = [input(f"Enter track name {i+1}: ").strip() for i in range(3)]

    try:
        # Compute vector and IDs
        input_vector = compute_mean_vector(track_inputs)
        input_ids = [get_track_vector(name)[1] for name in track_inputs]

        # Combination key for the current input
        combination_key = "_".join(map(str, sorted(input_ids)))

        # Fetch seen track IDs for this combination
        user_doc = users_col.find_one({"username": username})
        seen_ids = user_doc.get("recommendation_history", {}).get(combination_key, []) if user_doc else []

        # Recommend and store
        recommendations = recommend_tracks(input_vector, input_ids, seen_ids)
        final_output = store_recommendations(username, input_ids, recommendations)

        # Display
        if not final_output:
            print("\nAll Caught Up.")
        else:
            print(f"\nRecommendations for {username}:")
            for idx, track in enumerate(final_output, 1):
                print(f"{idx}. {track['track_name']} by {track['artists']} (Genre: {track['track_genre']})")

    except ValueError as ve:
        print(f"\nError: {ve}")
    except Exception as e:
        print(f"\nUnexpected error: {str(e)}")


