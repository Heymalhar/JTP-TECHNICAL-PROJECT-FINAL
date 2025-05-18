import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.metrics.pairwise import cosine_similarity
import random

FEATURE_COLUMNS = [
    'popularity', 'duration_ms', 'explicit', 'danceability', 'energy',
    'key', 'loudness', 'mode', 'speechiness', 'acousticness',
    'instrumentalness', 'liveness', 'valence', 'tempo', 'time_signature'
]
CATEGORICAL_COLUMNS = ['explicit', 'mode']
IDENTITY_COLUMNS = ['artists', 'track_genre']

df = pd.read_csv('music.csv')

df['explicit'] = df['explicit'].astype(int)
df['mode'] = df['mode'].astype(int)

label_encoder_genre = LabelEncoder()
df['track_genre_encoded'] = label_encoder_genre.fit_transform(df['track_genre'])

label_encoder_artists = LabelEncoder()
df['artists_encoded'] = label_encoder_artists.fit_transform(df['artists'])

FEATURE_COLUMNS.append('track_genre_encoded')
FEATURE_COLUMNS.append('artists_encoded')

scaler = MinMaxScaler()
X = scaler.fit_transform(df[FEATURE_COLUMNS].values)

def recommend_with_noise(input_index, noise_std=0.01, top_n=50, sample_k=10):
    if input_index >= len(X):
        raise IndexError("Input index out of bounds.")
    
    original_vector = X[input_index]
    
    noisy_vector = original_vector + np.random.normal(0, noise_std, size=original_vector.shape)
    
    similarity_scores = cosine_similarity([noisy_vector], X).flatten()
    
    sorted_indices = np.argsort(similarity_scores)[::-1]
    sorted_indices = [idx for idx in sorted_indices if idx != input_index]
    top_indices = sorted_indices[:top_n]
    
    sampled_indices = random.sample(top_indices, k=min(sample_k, len(top_indices)))
    
    return df.loc[sampled_indices, ['track_name', 'artists', 'track_genre', 'popularity']]

if __name__ == "__main__":

    track_index = 38237
    
    print(f"\nOriginal Track:\n{df.loc[track_index, ['track_name', 'artists', 'track_genre']]}")
    
    print("\nRecommended Tracks (dynamic output):")
    recommendations = recommend_with_noise(
        input_index=track_index,
        noise_std=0.015,
        top_n=50,
        sample_k=10
    )
    
    print(recommendations.to_string(index=False))