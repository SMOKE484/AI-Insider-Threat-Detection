import pandas as pd
import pickle
from sklearn.preprocessing import LabelEncoder

df = pd.read_csv("../data/insider_threat_clean_dataset.csv")

categorical_cols = ["employee_department", "employee_campus", "employee_position"]

encoders = {}
for col in categorical_cols:
    le = LabelEncoder()
    le.fit(df[col].astype(str))
    encoders[col] = le

with open("models/label_encoders.pkl", "wb") as f:
    pickle.dump(encoders, f)

print("Saved label_encoders.pkl")
for col, le in encoders.items():
    print(f"  {col}: {list(le.classes_)[:5]}{'...' if len(le.classes_) > 5 else ''}")
