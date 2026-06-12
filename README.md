# NIFTY-50 AI Investment Platform

A premium, AI-powered investment intelligence platform that transforms historical NIFTY-50 market data into actionable insights. 

Built strictly using the provided NIFTY-50 historical datasets, this platform fulfills all mandatory requirements of the "Data-Driven Investment Intelligence" problem statement, and incorporates an advanced Time-Series Forecasting Module (Optional Task D).

## Architecture

This project uses a modern, decoupled architecture for a premium user experience:

- **Backend**: Python FastAPI. Handles heavy data processing, feature engineering (Technical Indicators), Risk Assessment, Portfolio Construction, and AI Forecasting.
- **Frontend**: React + Vite. Features a stunning, custom glassmorphism design system using Vanilla CSS and highly interactive charts powered by Recharts.
- **AI Engine**: Facebook Prophet. Used for predicting 30-day future price trends with confidence intervals.

## Prerequisites

- Python 3.8+
- Node.js (v18+)
- The `NIFTY-50` dataset extracted into `C:\Users\swapa\OneDrive\Documents\cult\NIFTY-50`

## Installation

### 1. Backend Setup
Navigate to the root directory and install Python dependencies:
```bash
pip install -r requirements.txt
```

### 2. Frontend Setup
Navigate to the `frontend` directory and install Node dependencies:
```bash
cd frontend
npm install
```

## Running the Application

You need to start both the Backend API and the Frontend Dev Server.

**Terminal 1: Start the Backend**
```bash
# From the root directory
python api/main.py
```
*The API will run on http://localhost:8000*

**Terminal 2: Start the Frontend**
```bash
# From the frontend directory
npm run dev
```
*The React app will typically run on http://localhost:5173*
