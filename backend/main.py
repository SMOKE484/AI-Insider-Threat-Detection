from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import UploadFile, File
import pickle
import pandas as pd
import io
import numpy as np
import os

app = FastAPI(title="ThreatSense AI API")

allowed_origins = [
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in allowed_origins if o],
    allow_methods=["*"],
    allow_headers=["*"],
)

print("CORS allowed origins:", [o for o in allowed_origins if o])

# ── Load model and features once at startup ───────────────────────────────────
with open("models/rf_model.pkl", "rb") as f:
    model = pickle.load(f)

with open("models/feature_names.pkl", "rb") as f:
    features = pickle.load(f)

BASELINES = {
    "employee_department": 5, "employee_campus": 1, "employee_position": 24,
    "employee_seniority_years": 12, "is_contractor": 0, "employee_classification": 2,
    "has_foreign_citizenship": 0, "has_criminal_record": 0, "total_printed_pages": 13,
    "num_printed_pages_off_hours": 0, "total_files_burned": 9, "burned_from_other": 0,
    "is_abroad": 0, "hostility_country_level": 0, "num_entries": 1,
    "num_unique_campus": 1, "entry_during_weekend": 0,
}

FEATURE_META = {
    "total_files_burned":          {"label": "Files Burned to Disc",       "description": "Volumes of data burned to removable media — a primary exfiltration vector."},
    "total_printed_pages":         {"label": "Pages Printed",              "description": "Total documents sent to printer — high volumes suggest document theft."},
    "num_printed_pages_off_hours": {"label": "Off-Hours Printing",         "description": "Printing outside business hours is a strong behavioural anomaly."},
    "entry_during_weekend":        {"label": "Weekend Facility Entry",     "description": "Physical access on weekends deviates from established work patterns."},
    "num_entries":                 {"label": "Building Entry Count",       "description": "Number of physical entry events exceeds expected baseline."},
    "num_unique_campus":           {"label": "Multi-Campus Access",        "description": "Accessing more campuses than role requires."},
    "is_abroad":                   {"label": "International Travel",       "description": "Currently abroad — cross-referenced with simultaneous access events."},
    "hostility_country_level":     {"label": "Destination Risk Level",     "description": "Travel to geopolitically sensitive region flagged."},
    "burned_from_other":           {"label": "Burned Others' Files",       "description": "Burning files owned by other employees is a critical risk indicator."},
    "is_contractor":               {"label": "Contractor Status",          "description": "External contractors present elevated risk."},
    "has_criminal_record":         {"label": "Criminal Record",            "description": "Prior criminal history on file."},
    "has_foreign_citizenship":     {"label": "Dual Citizenship",           "description": "Foreign citizenship flagged alongside other anomalies."},
    "employee_classification":     {"label": "Security Clearance",         "description": "Clearance level context noted alongside access behaviour."},
    "employee_seniority_years":    {"label": "Years of Service",           "description": "Tenure cross-referenced with behavioural deviation."},
}

# ── Request model ─────────────────────────────────────────────────────────────
class EmployeeData(BaseModel):
    employee_department: int = 0
    employee_campus: int = 0
    employee_position: int = 0
    employee_seniority_years: int = 5
    is_contractor: int = 0
    employee_classification: int = 1
    has_foreign_citizenship: int = 0
    has_criminal_record: int = 0
    total_printed_pages: int = 0
    num_printed_pages_off_hours: int = 0
    total_files_burned: int = 0
    burned_from_other: int = 0
    is_abroad: int = 0
    hostility_country_level: int = 0
    num_entries: int = 1
    num_unique_campus: int = 1
    entry_during_weekend: int = 0

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ThreatSense AI API is running"}

@app.post("/predict")
def predict(data: EmployeeData):
    # Build dataframe in correct feature order
    row = pd.DataFrame([data.dict()], columns=features)

    # Run model
    proba      = model.predict_proba(row)[0]
    prediction = model.predict(row)[0]
    confidence = float(proba[1]) * 100

    # Build feature importances
    importances = dict(zip(features, model.feature_importances_))
    values      = data.dict()

    # Find flagged anomalies
    flagged = []
    for f in features:
        v        = float(values[f])
        baseline = BASELINES.get(f, 0)
        imp      = importances[f]
        if v > baseline * 1.5 and imp > 0.01:
            meta = FEATURE_META.get(f, {"label": f, "description": ""})
            flagged.append({
                "feature":     f,
                "label":       meta["label"],
                "description": meta["description"],
                "value":       v,
                "baseline":    baseline,
                "importance":  round(imp, 4),
                "severity":    "HIGH" if imp > 0.1 else "MEDIUM",
            })

    flagged.sort(key=lambda x: x["importance"], reverse=True)

    # Feature importance list for chart
    feature_chart = [
        {"feature": f, "importance": round(float(model.feature_importances_[i]), 4)}
        for i, f in enumerate(features)
    ]
    feature_chart.sort(key=lambda x: x["importance"], reverse=True)

    return {
        "prediction":    "Malicious" if prediction == 1 else "Normal",
        "confidence":    round(confidence, 2),
        "normal_prob":   round(float(proba[0]) * 100, 2),
        "threat_prob":   round(float(proba[1]) * 100, 2),
        "flagged":       flagged[:6],
        "feature_chart": feature_chart,
        "risk_level":    "HIGH" if confidence >= 70 else "MEDIUM" if confidence >= 40 else "LOW",
    }

@app.post("/predict-csv")
async def predict_csv(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))

    # Drop unused columns
    drop_cols = [c for c in ["late_exit_flag","trip_day_number",
                              "has_medical_history","employee_origin_country",
                              "is_malicious"] if c in df.columns]
    df = df.drop(columns=drop_cols)

    # Encode text columns
    from sklearn.preprocessing import LabelEncoder
    for col in df.select_dtypes(include="object").columns:
        df[col] = LabelEncoder().fit_transform(df[col].astype(str))

    # Fill missing features with 0
    for f in features:
        if f not in df.columns:
            df[f] = 0

    # Take first row
    row = df[features].iloc[[0]]

    proba      = model.predict_proba(row)[0]
    prediction = model.predict(row)[0]
    confidence = float(proba[1]) * 100
    importances = dict(zip(features, model.feature_importances_))
    values      = row.iloc[0].to_dict()

    flagged = []
    for f in features:
        v        = float(values[f])
        baseline = BASELINES.get(f, 0)
        imp      = importances[f]
        if v > baseline * 1.5 and imp > 0.01:
            meta = FEATURE_META.get(f, {"label": f, "description": ""})
            flagged.append({
                "feature":     f,
                "label":       meta["label"],
                "description": meta["description"],
                "value":       v,
                "baseline":    baseline,
                "importance":  round(imp, 4),
                "severity":    "HIGH" if imp > 0.1 else "MEDIUM",
            })

    flagged.sort(key=lambda x: x["importance"], reverse=True)

    feature_chart = [
        {"feature": f, "importance": round(float(model.feature_importances_[i]), 4)}
        for i, f in enumerate(features)
    ]
    feature_chart.sort(key=lambda x: x["importance"], reverse=True)

    return {
        "prediction":    "Malicious" if prediction == 1 else "Normal",
        "confidence":    round(confidence, 2),
        "normal_prob":   round(float(proba[0]) * 100, 2),
        "threat_prob":   round(float(proba[1]) * 100, 2),
        "flagged":       flagged[:6],
        "feature_chart": feature_chart,
        "risk_level":    "HIGH" if confidence >= 70 else "MEDIUM" if confidence >= 40 else "LOW",
        "rows_in_file":  len(df),
    }

@app.get("/health")
def health():
    return {"status": "ok", "model": "Random Forest", "features": len(features)}