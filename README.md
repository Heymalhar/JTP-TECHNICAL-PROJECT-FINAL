# Dynamic Music Recommendation System

This repository hosts the official implementation of the **Dynamic Music Recommendation System** developed as part of the technical project round for JTP Co. LTD.

Created by **Malhar Pandya**  
📧 malhar.pce21@sot.pdpu.ac.in

---

## 📌 Project Overview

This project provides a personalized music recommendation experience using **cosine similarity** to dynamically match user preferences with music content. It is designed to deliver real-time, adaptive song recommendations based on user interaction data and song features.

---

## 📁 Repository Structure

- `frontend/` – Contains the Next.js frontend application.
- `backend/` – Contains the Flask backend server logic and recommendation engine.
- `database/` – Holds configuration related to MongoDB and data storage.

---

## ⚙️ Installation & User Manual

Follow the steps below to install and run the project locally:

1. **Download and Extract**
   - Download the repository as a `.zip` file and extract it.

2. **requirements.txt**
   - Make sure you have installed all the python dependencies mentioned in the file 'requirements.txt'. You can use the command given below for the same.
     ```
     pip install -r requirements.txt
     ```

3. **Create a `.env` File**
   - In the root (parent) directory of the project, create a file named `.env`.
   - Add your MongoDB connection string in the following format:
     ```
     MONGO_PASS=your_mongodb_connection_string_here
     ```

4. **Start the Frontend**
   - Open a terminal and navigate to the `frontend` directory:
     ```
     cd frontend
     ```
   - Install required dependencies:
     ```
     npm install next
     ```
   - Start the development server:
     ```
     npm run dev
     ```

5. **Start the Backend**
   - Open another terminal window.
   - Navigate to the `backend` directory:
     ```
     cd backend
     ```
   - Run the Flask application:
     ```
     python app.py
     ```

6. **Access the Application**
   - Visit the following URL in your browser to start using the system:
     ```
     http://localhost:3000
     ```

---

## 📦 Tech Stack

- **Frontend:** Next.js (React.js)
- **Backend:** Python (Flask)
- **Database:** MongoDB
- **Recommendation Algorithm:** Cosine Similarity
- **Dataset Source:** Kaggle (https://www.kaggle.com/datasets/maharshipandya/-spotify-tracks-dataset)

---

## 🚧 Project Status

This project is under active development as part of the hiring process at **JTP Co. LTD**. It is not intended for production use at this stage.

---

## 📬 Contact

For any queries or further information, feel free to reach out:

**Malhar Pandya**  
📧 malhar.pce21@sot.pdpu.ac.in
