# =====================================
# Code to Upload the dataset to MongoDB
# =====================================
# Needs to be run only once, and has been run, which it already has

import pandas as pd
import numpy as np
from pymongo import MongoClient
from sklearn.preprocessing import MinMaxScaler, LabelEncoder

import os
from dotenv import load_dotenv

load_dotenv()

mongo_pass = os.getenv('MONGO_PASS')

MONGO_URI = f"mongodb+srv://malhar311002:{mongo_pass}@jtp-technical-project.kjpcv6p.mongodb.net/"
DATABASE_NAME = "music_db"
COLLECTION_NAME = "tracks"

FEATURE_COLUMNS = [
    'popularity', 'duration_ms', 'explicit', 'danceability', 'energy', 'key', 'loudness', 'mode', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo', 'time_signature'
]

CATEGORICAL_COLUMNS = ['explicit', 'mode']
ENCODE_COLUMNS = ['track_genre', 'artists', 'album_name']

df = pd.read_csv('music.csv')

df['explicit'] = df['explicit'].astype(int)
df['mode'] = df['mode'].astype(int)

for col in ENCODE_COLUMNS:
    encoder = LabelEncoder()
    encoded_col = f"{col}_encoded"
    df[encoded_col] = encoder.fit_transform(df[col])
    FEATURE_COLUMNS.append(encoded_col)

scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(df[FEATURE_COLUMNS].values)
df['normalized_vector'] = X_scaled.tolist()

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=30000, socketTimeoutMS=30000)
db = client[DATABASE_NAME]
collection = db[COLLECTION_NAME]

collection.drop()

records = df.to_dict(orient='records')
BATCH_SIZE = 500
num_records = len(records)

print(f"Inserting {num_records} records in batches...")

for i in range(0, num_records, BATCH_SIZE):
    batch = records[i:i + BATCH_SIZE]
    try:
        collection.insert_many(batch)
        print(f"Inserted batch {i} to {i+len(batch) - 1}")
    except Exception as e:
        print(f"Error: {e}")

print("Ingestion Successful ✅")