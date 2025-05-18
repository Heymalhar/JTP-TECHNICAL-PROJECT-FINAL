import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

mongo_pass = os.getenv('MONGO_PASS')
if not mongo_pass:
    raise EnvironmentError("MONGO_PASS has not been set in the environment variables.")

MONGO_URI = f"mongodb+srv://malhar311002:{mongo_pass}@jtp-technical-project.kjpcv6p.mongodb.net/"

DATABASE_NAME = "music_db"
TRACKS_COLLECTION = "tracks"
USERS_COLLECTION = "user_info"

client = MongoClient(MONGO_URI)
db = client[DATABASE_NAME]
tracks_col = db[TRACKS_COLLECTION]
users_col = db[USERS_COLLECTION]