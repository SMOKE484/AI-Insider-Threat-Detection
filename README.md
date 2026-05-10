# 🛡️ ThreatSense AI — Insider Threat Detection

An AI-powered web application that analyses employee behavioural data to detect potential insider threats. Built as part of COS720 at the University of Pretoria.

🌐 **Live Demo:** https://ai-insider-threat-detection.vercel.app

---

## 🔍 What It Does

ThreatSense takes employee activity data — such as files burned to disc, off-hours printing, physical access patterns, and travel behaviour — and runs it through a trained Random Forest classifier to produce a threat risk score. The analyst dashboard shows:

- 🚨 A risk level (LOW / MEDIUM / HIGH) with confidence percentage
- 🔎 Flagged behavioural anomalies ranked by importance
- 📊 Feature importance chart for model transparency
- 📁 Support for both manual input and bulk CSV upload

The model was trained on 118,614 records with SMOTE balancing to handle class imbalance, achieving **94.98% accuracy** and **78% recall**.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| 🖥️ Frontend | Next.js, TypeScript, Recharts |
| ⚙️ Backend | FastAPI, Python |
| 🤖 ML Model | Random Forest (scikit-learn) |
| 📦 Data Processing | pandas, NumPy, SMOTE |
| 📓 Notebooks | Jupyter (data cleaning, training, testing) |

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- Python 3.10+

### 1. Clone the repo

```bash
git clone https://github.com/SMOKE484/AI-Insider-Threat-Detection.git
cd AI-Insider-Threat-Detection
```

### 2. Start the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### 3. Start the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check API status |
| POST | `/predict` | Predict from manual input (JSON) |
| POST | `/predict-csv` | Predict from uploaded CSV file |

---

## 📁 Project Structure

```
├── backend/
│   ├── main.py              # FastAPI app
│   ├── requirements.txt
│   └── models/              # Trained model files (.pkl)
├── frontend/
│   ├── app/                 # Next.js app router
│   ├── components/          # Dashboard pages and UI
│   ├── lib/api.ts           # API client
│   └── types/               # TypeScript types
└── notebooks/
    ├── dataCleaning.ipynb
    ├── modelTraining.ipynb
    └── testingScenarios.ipynb
```

---

## 👨‍💻 Authors

Mr S.M. Makura · COS720 · University of Pretoria · 2026
