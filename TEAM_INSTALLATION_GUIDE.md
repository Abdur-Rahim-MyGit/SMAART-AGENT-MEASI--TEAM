# 🚀 SMAART Career Intelligence Platform - Team Installation Guide

Welcome to the SMAART Career Intelligence Platform! This document provides step-by-step instructions for developers joining the team to successfully install and run the project on their local machines.

## 📋 Prerequisites

Before you begin, ensure your machine has the following tools installed:

1. **[Node.js](https://nodejs.org/)** (v18.0 or higher) - Required for Frontend and Backend.
2. **[Python](https://www.python.org/downloads/)** (v3.9 or higher) - Required for the ML Microservice. 
   - *Note for Windows users:* Ensure you check "Add Python to PATH" during installation.
3. **[Git](https://git-scm.com/)** - For version control.
4. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Optional) - Only if you prefer running via containers instead of locally.

---

## 💻 1. Clone the Repository

First, clone the project to your local machine:

```bash
git clone https://github.com/Abdur-Rahim-MyGit/SMAART-AGENT-MEASI--TEAM.git
cd SMAART-AGENT-MEASI--TEAM
```

*(Note: Ensure you are on the `main` branch to get the latest stable code.)*

---

## ⚙️ 2. Environment Setup & Installation

### Option A: The "One-Click" Windows Setup (Recommended for Windows)
We have provided a batch script that automatically sets up the Python virtual environment and installs all NPM packages across the project tools.

1. Open the project root folder in File Explorer.
2. Double-click the file named **`setup_windows.bat`**.
3. Wait for the terminal to finish installing everything.

### Option B: Manual Setup (For Mac / Linux / Independent Developers)
If you are on Mac/Linux or prefer manual installation, run the following commands sequentially:

**1. Setup the ML Microservice (Python)**
```bash
cd ml-service
python -m venv .venv
# Activate virtual environment
# On Mac/Linux: source .venv/bin/activate
# On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

**2. Setup the Node.js Backend API**
```bash
cd backend
npm install
cd ..
```

**3. Setup the React Frontend**
```bash
cd frontend
npm install
cd ..
```

---

## ▶️ 3. Running the Application

### Option A: The "One-Click" Windows Start
1. Open the project root folder.
2. Double-click the file named **`start_windows.bat`**.
3. This will open three separate command windows, starting the Backend, Frontend, and ML Service simultaneously.

### Option B: Manual Start
You will need to open **3 separate terminal windows** inside the project root:

**Terminal 1 (Start the Python AI microservice):**
```bash
cd ml-service
# Activate virtual environment
# On Mac/Linux: source .venv/bin/activate
# On Windows: .venv\Scripts\activate
python app.py
```
*(Runs on `http://localhost:5001`)*

**Terminal 2 (Start the Node API Backend):**
```bash
cd backend
npm run dev
```
*(Runs on `http://localhost:5000`)*

**Terminal 3 (Start the React Frontend):**
```bash
cd frontend
npm run dev
```
*(Runs on `http://localhost:5173`)*

---

## 🐳 4. Running via Docker (Alternative)

If you prefer using Docker to emulate the production environment, ensure Docker Engine is running and execute:

```bash
docker-compose up --build
```
This will build and spin up all three containers (Frontend, Backend, ML-Service) via the configuration defined in `docker-compose.yml`.

---

## 🛠 Troubleshooting Common Issues

- **Port already in use:** If a port (e.g., 5000 or 5173) is already being used on your computer, you will need to kill the process running on that port or change the port assignment in the respective `.env` files.
- **Python libraries failing to install:** Ensure your Python version is at least 3.9 and you have activated the virtual environment before running `pip install`.
- **"command not found: npm"**: Ensure Node.js is correctly installed and added to your system's PATH.

If you encounter unique errors during onboarding, please consult the lead developer or check the existing issues in the repository. Happy coding!
