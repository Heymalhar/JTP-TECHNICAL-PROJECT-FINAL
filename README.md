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
- `backend/` – Contains the Flask backend server logic and recommendation engine, along with the MongoDB configuration.

---

## ⚙️ Installation & User Manual

Follow the steps below to install and run the project locally:

1. **Download and Extract**
   - Download the repository as a `.zip` file and extract it.

2. **Required Software and Tools**
   - Make sure you have these applications installed in your system:
     i.   Docker Desktop (To manage the containers)
     ii.  MongoDB Compass (To access the data)
     iii. Any IDE to interact with the project (Preferrably VSCode or IntelliJ IDEA)

3. **Setting up Docker Containers**
   - Open the Docker Desktop application on your system.
   - For the first time using this service, you need to setup the containers and access the application using this command
     ```
     docker compose up --build
     ```
   - After this, for the rest of the times accessing the service, use this command
     ```
     docker compose up
     ```

5. **Accessing and using the service**
   - Once the docker setup is done, open a browser and navigate to
     ```
     localhost:3000
     ```
   - You will now be able to access the service effortlessly.

6. **Accessing the Database**
   - To view the data created and managed by the service, open MongoDB Compass.
   - Add a new connection by entering this URI
     ```
     mongodb://localhost:27018
     ```
   - Once the connection gets set up, you can view the data under it.

---

## 📦 Tech Stack

- **Frontend:** Next.js (React.js)
- **Backend:** Python (Flask, Scikit Learn)
- **Database:** MongoDB Compass
- **Containers:** Docker Desktop
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
