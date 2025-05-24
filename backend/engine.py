import numpy as np
import random
from sklearn.metrics.pairwise import cosine_similarity

import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from db import tracks_col, users_col

NOISE_STD = 0.015
TOP_N = 100
SAMPLE_K = 5

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

    top_similar = [track_id for track_id, _ in similarity_pairs if track_id not in input_track_ids and track_id not in seen_ids][:TOP_N]

    sampled = random.sample(top_similar, k=min(SAMPLE_K, len(top_similar)))

    recommendations = []

    for tid in sampled:
        doc = next(item for item in all_tracks if item["track_id"] == tid)
        doc["similarity_score"] = round(similarities[track_ids.index(tid)], 4)
        doc.pop("_id", None)
        recommendations.append(doc)

    return recommendations

def store_recommendations(username, input_ids, new_recommendations):
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

    return new_recommendations

def user_signup(username, email, password):

    if users_col.find_one({"username": username}):
        raise ValueError("Username already exists.")
    
    users_col.insert_one({
        "username": username,
        "email": email,
        "password": password,
        "recommendation_history": {}
    })
    return f"User '{username}' signed up successfully."

def user_login(username, password):
    user = users_col.find_one({"username": username})
    if not user:
        raise ValueError("User not found.")
    
    if user.get("password") != password:
        raise ValueError("Incorrect Password.")
    
    return f"User '{username}' logged in successfully."

def previous_recommendations(username, track_names):

    track_ids = [get_track_vector(name)[1] for name in track_names]
    combination_key = "_".join(map(str, sorted(track_ids)))

    user = users_col.find_one({"username": username})
    if not user:
        raise ValueError("User not found.")
    
    recommended_ids = user.get("recommendation_history", {}).get(combination_key, [])
    if not recommended_ids:
        return []
    
    recommend_tracks = []
    for tid in recommended_ids:
        doc = tracks_col.find_one({"track_id": tid}, {
            "_id": 0,
            "track_id": 1,
            "track_name": 1,
            "artists": 1,
            "track_genre": 1
        })
        if doc:
            recommend_tracks.append(doc)

    return recommend_tracks

if __name__ == "__main__":
    print("!!WELCOME!!")

    while True:
        print("\nSelect an option: ")
        print("1. Sign Up")
        print("2. Log in")
        print("3. Get Recommendations")
        print("4. View Previous Recommendations.")
        print("5. Exit")

        choice = input("Enter choice (1-5): ").strip()

        try:
            
            if choice == "1":
                username = input("Enter username: ").strip()
                email = input("Enter email: ").strip()
                password = input("Enter password: ").strip()
                msg = user_signup(username, email, password)
                print(msg)

            elif choice == "2":
                username = input("Enter username: ").strip()
                password = input("Enter password: ").strip()
                msg = user_login(username, password)
                print(msg)

            elif choice == "3":
                username = input("Enter username: ").strip()
                track_inputs = [input(f"Enter track name {i+1}: ").strip() for i in range(3)]

                input_vector = compute_mean_vector(track_inputs)
                input_ids = [get_track_vector(name)[1] for name in track_inputs]

                combination_key = "_".join(map(str, sorted(input_ids)))
                user_doc = users_col.find_one({"username": username})
                seen_ids = user_doc.get("recommendation_history", {}).get(combination_key, []) if user_doc else []

                recommendations = recommend_tracks(input_vector, input_ids, seen_ids)
                final_output = store_recommendations(username, input_ids, recommendations)

                if not final_output:
                    print("\nAll Caught Up.")
                else:
                    print(f"\n Recommendations for {username}:")
                    for idx, track in enumerate(final_output, 1):
                        print(f"{idx}. {track['track_name']} by {track['artists']} (Genre: {track['track_genre']})")

            elif choice == "4":
                username = input("Enter username: ").strip()
                track_inputs = [input(f"Enter track name {i+1}: ").strip() for i in range(3)]
                history = previous_recommendations(username, track_inputs)

                if not history:
                    print("No previous recommendations for .this combination.")
                else:
                    print(f"\nPrevious Recommendations for {username}:")
                    for idx, track in enumerate(history, 1):
                        print(f"{idx}. {track['track_name']} by {track['artists']} (Genre: {track['track_genre']})")

            elif choice == "5":
                print("Exiting.")
                break
                
            else:
                print("Invalid option. Try again.")

        except ValueError as ve:
            print(f"\nError: {ve}")
        except Exception as e:
            print(f"\nUnexpected error: {str(e)}")
