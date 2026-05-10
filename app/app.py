import streamlit as st
import pandas as pd
import numpy as np
import pickle
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from streamlit_option_menu import option_menu
from sklearn.preprocessing import LabelEncoder

# ── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="ThreatSense AI",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
<link rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root {
  --bg:#080c14;--surface:#0d1421;--surface2:#111a2e;--border:#1e2d4a;
  --cyan:#00e5ff;--cyan-dim:#00b8cc;--red:#ff3b5c;--green:#00e676;
  --amber:#ffab00;--text:#e8f0fe;--muted:#6b7fa3;
  --font:'Syne',sans-serif;--mono:'DM Mono',monospace;
}
html,body,[class*="css"]{font-family:var(--font)!important;background-color:var(--bg)!important;color:var(--text)!important;}
#MainMenu,footer,header{visibility:hidden;}
.block-container{padding:1.5rem 2rem 2rem!important;max-width:1400px!important;}
[data-testid="stSidebar"]{background:var(--surface)!important;border-right:1px solid var(--border)!important;}
[data-testid="stSidebar"] .block-container{padding:1rem!important;}
[data-testid="stNumberInput"] input,[data-testid="stSelectbox"]>div>div{background:var(--surface2)!important;border:1px solid var(--border)!important;color:var(--text)!important;border-radius:8px!important;font-family:var(--mono)!important;}
.stButton>button{background:linear-gradient(135deg,var(--cyan) 0%,var(--cyan-dim) 100%)!important;color:var(--bg)!important;font-family:var(--font)!important;font-weight:700!important;font-size:0.95rem!important;border:none!important;border-radius:10px!important;padding:0.6rem 1.4rem!important;letter-spacing:0.05em!important;width:100%!important;}
.stButton>button:hover{transform:translateY(-2px)!important;box-shadow:0 0 24px rgba(0,229,255,0.4)!important;}
[data-testid="stFileUploader"]{background:var(--surface2)!important;border:1.5px dashed var(--border)!important;border-radius:12px!important;}
hr{border-color:var(--border)!important;margin:1.2rem 0!important;}
::-webkit-scrollbar{width:6px;height:6px;}
::-webkit-scrollbar-track{background:var(--bg);}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px;}
</style>
""", unsafe_allow_html=True)

# ── Model loading ─────────────────────────────────────────────────────────────
MODEL_PATH   = "../models/rf_model.pkl"
FEATURE_PATH = "../models/feature_names.pkl"

@st.cache_resource
def load_model():
    with open(MODEL_PATH, "rb") as f: return pickle.load(f)

@st.cache_resource
def load_features():
    with open(FEATURE_PATH, "rb") as f: return pickle.load(f)

def card(icon_html, title, value, subtitle="", color="cyan", size="normal"):
    c = {"cyan":"#00e5ff","red":"#ff3b5c","green":"#00e676","amber":"#ffab00"}[color]
    fs = "2.2rem" if size == "large" else "1.5rem"
    st.markdown(f"""
    <div style="background:#0d1421;border:1px solid #1e2d4a;border-radius:14px;
                padding:1.2rem 1.4rem;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;width:3px;height:100%;background:{c};border-radius:3px 0 0 3px;"></div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
        <span style="color:{c};font-size:1.1rem;">{icon_html}</span>
        <span style="color:#6b7fa3;font-size:0.78rem;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.08em;">{title}</span>
      </div>
      <div style="font-size:{fs};font-weight:800;color:{c};line-height:1.1;">{value}</div>
      <div style="color:#6b7fa3;font-size:0.8rem;margin-top:4px;">{subtitle}</div>
    </div>""", unsafe_allow_html=True)

def section_header(icon_html, title, subtitle=""):
    st.markdown(f"""
    <div style="margin:1.5rem 0 1rem 0;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="color:#00e5ff;font-size:1.3rem;">{icon_html}</span>
        <span style="font-size:1.25rem;font-weight:800;letter-spacing:-0.01em;">{title}</span>
      </div>
      {"<p style='color:#6b7fa3;font-size:0.85rem;margin:4px 0 0 32px;'>"+subtitle+"</p>" if subtitle else ""}
    </div>""", unsafe_allow_html=True)

def risk_gauge(score):
    color = "#ff3b5c" if score >= 70 else "#ffab00" if score >= 40 else "#00e676"
    label = "HIGH RISK" if score >= 70 else "MEDIUM RISK" if score >= 40 else "LOW RISK"
    angle = -90 + (score / 100) * 180
    fig, ax = plt.subplots(figsize=(5, 2.8))
    fig.patch.set_facecolor("#0d1421"); ax.set_facecolor("#0d1421")
    ax.set_xlim(-1.2, 1.2); ax.set_ylim(-0.1, 1.2); ax.axis("off")
    theta = np.linspace(np.pi, 0, 200)
    ax.plot(np.cos(theta), np.sin(theta), color="#1e2d4a", linewidth=18, solid_capstyle="round")
    fill = np.linspace(np.pi, np.pi - (score/100)*np.pi, 200)
    ax.plot(np.cos(fill), np.sin(fill), color=color, linewidth=18, solid_capstyle="round")
    rad = np.radians(angle + 90)
    ax.annotate("", xy=(0.72*np.cos(rad), 0.72*np.sin(rad)), xytext=(0,0),
                arrowprops=dict(arrowstyle="-|>", color="white", lw=2, mutation_scale=16))
    ax.plot(0, 0, "o", color="white", markersize=7, zorder=5)
    ax.text(0, 0.32, f"{score}%", ha="center", va="center", fontsize=26, fontweight="bold", color=color, fontfamily="monospace")
    ax.text(0, 0.05, label,       ha="center", va="center", fontsize=9,  fontweight="bold", color=color, fontfamily="monospace")
    ax.text(-1.05, -0.08, "0",    ha="center", color="#6b7fa3", fontsize=8)
    ax.text( 1.05, -0.08, "100",  ha="center", color="#6b7fa3", fontsize=8)
    ax.text( 0,     1.08, "RISK", ha="center", color="#6b7fa3", fontsize=7, fontfamily="monospace")
    plt.tight_layout(pad=0)
    return fig

def feature_bar_chart(feature_names, values, baselines):
    fig, ax = plt.subplots(figsize=(7, 4.5))
    fig.patch.set_facecolor("#0d1421"); ax.set_facecolor("#0d1421")
    y_pos  = np.arange(len(feature_names))
    colors = ["#ff3b5c" if v > baselines[i] else "#00e5ff" for i, v in enumerate(values)]
    ax.barh(y_pos, values, color=colors, alpha=0.85, height=0.55, zorder=3)
    ax.set_yticks(y_pos)
    ax.set_yticklabels(feature_names, color="#e8f0fe", fontsize=9, fontfamily="monospace")
    ax.tick_params(colors="#6b7fa3", labelsize=8)
    ax.spines[:].set_visible(False)
    ax.set_xlabel("Feature Value", color="#6b7fa3", fontsize=8)
    ax.tick_params(axis="x", colors="#6b7fa3")
    ax.grid(axis="x", color="#1e2d4a", linewidth=0.5, zorder=0)
    red_p  = mpatches.Patch(color="#ff3b5c", label="Above baseline (suspicious)")
    cyan_p = mpatches.Patch(color="#00e5ff", label="Within baseline (normal)")
    ax.legend(handles=[red_p, cyan_p], loc="lower right", framealpha=0, labelcolor="#e8f0fe", fontsize=7.5)
    plt.tight_layout()
    return fig

RISK_EXPLANATIONS = {
    "total_files_burned":          ('<i class="fas fa-compact-disc"></i>',   "Files Burned to Disc",       "Unusually high disc burn activity — a classic data exfiltration indicator."),
    "total_printed_pages":         ('<i class="fas fa-print"></i>',           "Total Pages Printed",        "Excessive printing compared to baseline suggests document exfiltration."),
    "num_printed_pages_off_hours": ('<i class="fas fa-moon"></i>',            "Off-Hours Printing",         "Printing outside normal hours is a strong behavioural anomaly."),
    "entry_during_weekend":        ('<i class="fas fa-calendar-xmark"></i>',  "Weekend Facility Access",    "Physical access during weekends deviates from established work patterns."),
    "num_entries":                 ('<i class="fas fa-door-open"></i>',       "Building Entry Count",       "Abnormal entry frequency may indicate unusual on-site behaviour."),
    "num_unique_campus":           ('<i class="fas fa-building"></i>',        "Multi-Campus Access",        "Accessing multiple campuses beyond role requirements."),
    "is_abroad":                   ('<i class="fas fa-plane"></i>',           "Currently Abroad",           "Employee abroad — cross-referenced with access anomalies."),
    "hostility_country_level":     ('<i class="fas fa-earth-africa"></i>',    "Travel Destination Risk",    "Travel to a geopolitically sensitive region flagged."),
    "burned_from_other":           ('<i class="fas fa-user-xmark"></i>',      "Burning Other Users' Files", "Burning files owned by other employees is a critical risk indicator."),
    "is_contractor":               ('<i class="fas fa-id-badge"></i>',        "Contractor Status",          "Contractors have elevated risk profiles due to limited loyalty constraints."),
    "has_criminal_record":         ('<i class="fas fa-scale-unbalanced"></i>',"Criminal History",           "Prior criminal record noted in employee profile."),
    "has_foreign_citizenship":     ('<i class="fas fa-passport"></i>',        "Foreign Citizenship",        "Dual citizenship flagged in combination with other risk indicators."),
    "employee_classification":     ('<i class="fas fa-lock"></i>',            "Security Clearance Level",   "Security clearance level noted for context."),
    "employee_seniority_years":    ('<i class="fas fa-briefcase"></i>',       "Years of Seniority",         "Seniority cross-referenced with behavioural deviation."),
}

SAMPLE_PROFILES = {
    "Normal Employee — John Smith":   dict(employee_department=2,employee_campus=1,employee_position=10,employee_seniority_years=5,is_contractor=0,employee_classification=1,has_foreign_citizenship=0,has_criminal_record=0,total_printed_pages=5,num_printed_pages_off_hours=0,total_files_burned=2,burned_from_other=0,is_abroad=0,hostility_country_level=0,num_entries=1,num_unique_campus=1,entry_during_weekend=0),
    "Suspicious Employee — Jane Doe": dict(employee_department=5,employee_campus=0,employee_position=25,employee_seniority_years=2,is_contractor=1,employee_classification=3,has_foreign_citizenship=1,has_criminal_record=0,total_printed_pages=120,num_printed_pages_off_hours=45,total_files_burned=80,burned_from_other=1,is_abroad=1,hostility_country_level=2,num_entries=3,num_unique_campus=3,entry_during_weekend=1),
    "Medium Risk — Alex Nkosi":       dict(employee_department=3,employee_campus=2,employee_position=15,employee_seniority_years=8,is_contractor=0,employee_classification=2,has_foreign_citizenship=0,has_criminal_record=1,total_printed_pages=38,num_printed_pages_off_hours=8,total_files_burned=22,burned_from_other=0,is_abroad=0,hostility_country_level=1,num_entries=2,num_unique_campus=2,entry_during_weekend=1),
}

MEAN_VALS = [7.4,12.77,0.38,0.05,0.73,0.6,0.04,0.005,0.74,0.14,0.16,0.05,1.89,12.4,0.007,0,0.05]

try:
    model    = load_model()
    features = load_features()
except Exception as e:
    st.error(f"Could not load model: {e}")
    st.stop()

mean_map = dict(zip(features, MEAN_VALS))

# ── Header ────────────────────────────────────────────────────────────────────
st.markdown("""
<div style="display:flex;align-items:center;gap:16px;padding:1rem 0 0.5rem 0;
            border-bottom:1px solid #1e2d4a;margin-bottom:1.5rem;">
  <div style="background:linear-gradient(135deg,#00e5ff,#0077ff);border-radius:14px;
              width:52px;height:52px;display:flex;align-items:center;justify-content:center;
              font-size:1.6rem;flex-shrink:0;box-shadow:0 0 24px rgba(0,229,255,0.3);color:#080c14;">
    <i class="fas fa-shield-halved"></i>
  </div>
  <div>
    <div style="font-size:1.7rem;font-weight:800;letter-spacing:-0.02em;
                background:linear-gradient(90deg,#00e5ff,#ffffff);
                -webkit-background-clip:text;-webkit-text-fill-color:transparent;">
      ThreatSense AI
    </div>
    <div style="color:#6b7fa3;font-size:0.82rem;font-family:'DM Mono',monospace;letter-spacing:0.06em;text-transform:uppercase;">
      AI-Powered Insider Threat Detection &nbsp;·&nbsp; COS720 · University of Pretoria
    </div>
  </div>
  <div style="margin-left:auto;background:#0d1421;border:1px solid #1e2d4a;border-radius:8px;
              padding:0.45rem 1rem;font-size:0.75rem;font-family:'DM Mono',monospace;color:#00e676;">
    <i class="fas fa-circle" style="font-size:0.45rem;"></i> &nbsp;SYSTEM ONLINE
  </div>
</div>
""", unsafe_allow_html=True)

# ── Sidebar ───────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("""
    <div style="text-align:center;padding:1rem 0 1rem 0;">
      <div style="background:linear-gradient(135deg,#00e5ff,#0077ff);border-radius:14px;
                  width:52px;height:52px;display:flex;align-items:center;justify-content:center;
                  font-size:1.6rem;margin:0 auto 10px auto;color:#080c14;
                  box-shadow:0 0 24px rgba(0,229,255,0.3);">
        <i class="fas fa-shield-halved"></i>
      </div>
      <div style="font-size:1.1rem;font-weight:800;color:#00e5ff;">ThreatSense AI</div>
      <div style="color:#6b7fa3;font-size:0.72rem;font-family:'DM Mono',monospace;">COS720 · University of Pretoria</div>
    </div>""", unsafe_allow_html=True)

    selected_tab = option_menu(None,
        options=["Analyse Employee","Model Metrics","About"],
        icons=["search","bar-chart-line","book"],
        default_index=0,
        styles={
            "container":        {"padding":"0","background-color":"#0d1421","border-radius":"12px"},
            "icon":             {"color":"#6b7fa3","font-size":"14px"},
            "nav-link":         {"font-size":"0.85rem","font-family":"Syne,sans-serif","color":"#a0b0c8","border-radius":"8px","padding":"9px 14px","margin":"2px 0"},
            "nav-link-selected":{"background-color":"#111a2e","color":"#00e5ff","font-weight":"700","border":"1px solid #1e2d4a"},
            "menu-icon":        {"display":"none"},
        })

    st.divider()
    st.markdown("""<div style="color:#6b7fa3;font-size:0.72rem;font-family:'DM Mono',monospace;
        text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">
        <i class="fas fa-sliders"></i> &nbsp;Input Mode</div>""", unsafe_allow_html=True)

    input_mode = option_menu(None,
        options=["Sample Profile","Upload CSV","Manual Entry"],
        icons=["person-badge","file-earmark-arrow-up","pencil-square"],
        default_index=0,
        styles={
            "container":        {"padding":"0","background-color":"#0d1421","border-radius":"10px"},
            "icon":             {"color":"#6b7fa3","font-size":"13px"},
            "nav-link":         {"font-size":"0.8rem","font-family":"DM Mono,monospace","color":"#6b7fa3","border-radius":"6px","padding":"7px 12px","margin":"1px 0"},
            "nav-link-selected":{"background-color":"#111a2e","color":"#00e5ff","font-weight":"600","border":"1px solid #1e2d4a"},
            "menu-icon":        {"display":"none"},
        })

    st.divider()
    st.markdown("""
    <div style="color:#6b7fa3;font-size:0.75rem;padding:0.3rem 0;line-height:1.9;">
      <div style="color:#00e5ff;font-weight:700;margin-bottom:8px;"><i class="fas fa-circle-info"></i> &nbsp;Model Summary</div>
      <i class="fas fa-tree" style="color:#00e676;"></i> &nbsp;<b style="color:#e8f0fe;">Random Forest</b> · 100 trees<br>
      <i class="fas fa-database" style="color:#00e5ff;"></i> &nbsp;118,614 training records<br>
      <i class="fas fa-bullseye" style="color:#ffab00;"></i> &nbsp;Accuracy: <b style="color:#e8f0fe;">94.98%</b><br>
      <i class="fas fa-magnifying-glass" style="color:#ff3b5c;"></i> &nbsp;Recall: <b style="color:#e8f0fe;">78.00%</b><br>
      <i class="fas fa-scale-balanced" style="color:#00e5ff;"></i> &nbsp;F1-Score: <b style="color:#e8f0fe;">62.58%</b>
    </div>""", unsafe_allow_html=True)
    st.divider()
    st.markdown("""<div style="color:#6b7fa3;font-size:0.7rem;font-family:'DM Mono',monospace;text-align:center;">
      <i class="fas fa-shield"></i> &nbsp;COS720 · 2026 · Mr S.M. Makura</div>""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════════════════════
# TAB 1 — ANALYSE
# ══════════════════════════════════════════════════════════════════════════════
if selected_tab == "Analyse Employee":
    input_data = None

    # ── Sample ────────────────────────────────────────────────────────────────
    if input_mode == "Sample Profile":
        section_header('<i class="fas fa-user-check"></i>', "Select Employee Profile",
                       "Choose a pre-built behavioural profile to test the system")
        selected   = st.selectbox("Profile", list(SAMPLE_PROFILES.keys()), label_visibility="collapsed")
        input_data = pd.DataFrame([SAMPLE_PROFILES[selected]], columns=features)
        st.markdown(f"""
        <div style="background:#0d1421;border:1px solid #1e2d4a;border-radius:12px;padding:1rem 1.2rem;margin:0.8rem 0;">
          <div style="color:#6b7fa3;font-size:0.78rem;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">
            <i class="fas fa-list-ul"></i> Profile Preview
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            {"".join([f'<span style="background:#111a2e;border:1px solid #1e2d4a;border-radius:6px;padding:3px 10px;font-size:0.78rem;font-family:DM Mono,monospace;color:#e8f0fe;"><span style="color:#6b7fa3;">{k}:</span> {v}</span>' for k,v in SAMPLE_PROFILES[selected].items()])}
          </div>
        </div>""", unsafe_allow_html=True)

    # ── Upload CSV — with auto-encoding fix ───────────────────────────────────
    elif input_mode == "Upload CSV":
        section_header('<i class="fas fa-cloud-arrow-up"></i>', "Upload Behavioural Data",
                       "Raw or pre-encoded CSVs accepted — string columns are automatically encoded")
        uploaded = st.file_uploader("Drop CSV here", type=["csv"], label_visibility="collapsed")
        if uploaded:
            df_up = pd.read_csv(uploaded)

            # Drop columns not used by the model
            drop_cols = [c for c in ["late_exit_flag", "trip_day_number",
                                     "has_medical_history", "employee_origin_country", "is_malicious"]
                         if c in df_up.columns]
            df_up = df_up.drop(columns=drop_cols)

            # Encode any remaining text/object columns
            for col in df_up.select_dtypes(include="object").columns:
                df_up[col] = LabelEncoder().fit_transform(df_up[col].astype(str))

            # Add any missing feature columns with 0
            for f in features:
                if f not in df_up.columns:
                    df_up[f] = 0

            st.markdown(f"""
            <div style="background:#0d1421;border:1px solid #00e676;border-radius:10px;
                        padding:0.6rem 1rem;color:#00e676;font-size:0.82rem;
                        font-family:'DM Mono',monospace;margin-bottom:0.8rem;">
              <i class="fas fa-circle-check"></i> &nbsp;{len(df_up)} record(s) loaded · analysing first row
            </div>""", unsafe_allow_html=True)
            st.dataframe(df_up[features].head(5), use_container_width=True)
            input_data = df_up[features].iloc[[0]]

    # ── Manual Entry ──────────────────────────────────────────────────────────
    else:
        section_header('<i class="fas fa-pen"></i>', "Manual Data Entry",
                       "Enter behavioural attributes for a single employee")
        manual = {}
        c1, c2, c3 = st.columns(3)
        with c1:
            manual["employee_department"]   = st.number_input("Dept (0-10)",       0, 10,  0)
            manual["employee_campus"]       = st.number_input("Campus (0-2)",       0,  2,  0)
            manual["employee_position"]     = st.number_input("Position (0-47)",    0, 47,  0)
        with c2:
            manual["employee_seniority_years"]  = st.number_input("Seniority (yrs)", 0, 31, 5)
            manual["employee_classification"]   = st.number_input("Clearance (1-4)", 1,  4, 1)
            manual["is_contractor"]             = st.number_input("Is Contractor",   0,  1, 0)
        with c3:
            manual["total_printed_pages"]         = st.number_input("Pages Printed",    0, 728,  0)
            manual["num_printed_pages_off_hours"] = st.number_input("Off-Hrs Printing", 0, 253,  0)
            manual["total_files_burned"]          = st.number_input("Files Burned",     0, 186,  0)
        c4, c5 = st.columns(2)
        with c4:
            manual["burned_from_other"]       = st.selectbox("Burned Others' Files", [0,1])
            manual["has_criminal_record"]     = st.selectbox("Criminal Record",       [0,1])
            manual["has_foreign_citizenship"] = st.selectbox("Foreign Citizenship",   [0,1])
            manual["is_abroad"]               = st.selectbox("Currently Abroad",      [0,1])
        with c5:
            manual["hostility_country_level"] = st.selectbox("Country Hostility (0-3)", [0,1,2,3])
            manual["num_entries"]             = st.number_input("Num Entries",           0, 4, 1)
            manual["num_unique_campus"]       = st.number_input("Unique Campus Access",  0, 3, 1)
            manual["entry_during_weekend"]    = st.selectbox("Weekend Entry",            [0,1])
        input_data = pd.DataFrame([manual], columns=features)

    st.divider()

    # ── Analyse button — NOTE: st.button() cannot render HTML, plain text only ─
    analyse_btn = st.button("RUN THREAT ANALYSIS", use_container_width=True)

    if analyse_btn and input_data is not None:
        proba        = model.predict_proba(input_data)[0]
        prediction   = model.predict(input_data)[0]
        confidence   = float(proba[1]) * 100
        is_malicious = prediction == 1
        result_color = "red" if is_malicious else "green"
        result_icon  = '<i class="fas fa-triangle-exclamation"></i>' if is_malicious else '<i class="fas fa-shield-check"></i>'
        result_label = "MALICIOUS INSIDER DETECTED" if is_malicious else "NORMAL BEHAVIOUR"
        result_hex   = "#ff3b5c" if is_malicious else "#00e676"

        st.markdown(f"""
        <div style="background:{'#2d0a12' if is_malicious else '#0a2d14'};
                    border:1px solid {result_hex};border-radius:16px;
                    padding:1.5rem 2rem;margin:1.2rem 0;
                    box-shadow:0 0 32px {'rgba(255,59,92,0.15)' if is_malicious else 'rgba(0,230,118,0.1)'};
                    display:flex;align-items:center;gap:1.2rem;">
          <div style="font-size:2.5rem;color:{result_hex};">{result_icon}</div>
          <div>
            <div style="font-size:1.4rem;font-weight:800;color:{result_hex};">{result_label}</div>
            <div style="color:#6b7fa3;font-size:0.82rem;font-family:'DM Mono',monospace;margin-top:4px;">
              Confidence: <b style="color:{result_hex};">{confidence:.1f}%</b>
              &nbsp;·&nbsp; Random Forest Classifier &nbsp;·&nbsp; 100 estimators
            </div>
          </div>
        </div>""", unsafe_allow_html=True)

        k1,k2,k3,k4 = st.columns(4)
        with k1: card('<i class="fas fa-tag"></i>',     "Classification",    "MALICIOUS" if is_malicious else "NORMAL", "", result_color, "large")
        with k2: card('<i class="fas fa-percent"></i>', "Confidence Score",  f"{confidence:.1f}%",   "Malicious probability", result_color)
        with k3: card('<i class="fas fa-check"></i>',   "Normal Probability",f"{proba[0]*100:.1f}%", "Benign likelihood")
        with k4: card('<i class="fas fa-virus"></i>',   "Threat Probability",f"{proba[1]*100:.1f}%", "Malicious likelihood", "red" if proba[1]>0.4 else "cyan")

        st.divider()
        section_header('<i class="fas fa-gauge-high"></i>', "Risk Assessment Dashboard")
        col_gauge, col_bars = st.columns([1, 1.6])

        with col_gauge:
            st.markdown("""<div style="color:#6b7fa3;font-size:0.78rem;font-family:'DM Mono',monospace;text-align:center;margin-bottom:4px;">
            <i class="fas fa-gauge"></i> THREAT RISK METER</div>""", unsafe_allow_html=True)
            st.pyplot(risk_gauge(int(confidence)), use_container_width=True)

        with col_bars:
            st.markdown("""<div style="color:#6b7fa3;font-size:0.78rem;font-family:'DM Mono',monospace;margin-bottom:4px;">
            <i class="fas fa-chart-bar"></i> BEHAVIOURAL FEATURE VALUES</div>""", unsafe_allow_html=True)
            st.pyplot(feature_bar_chart(
                features,
                [float(input_data.iloc[0][f]) for f in features],
                [mean_map.get(f, 0) for f in features]
            ), use_container_width=True)

        st.divider()
        section_header('<i class="fas fa-brain"></i>', "AI Explainability",
                       "Plain-language explanation of key risk indicators — designed for non-technical managers")

        imp_map = dict(zip(features, model.feature_importances_))
        vals_d  = dict(zip(features, input_data.iloc[0].values))
        flagged = [(f, float(vals_d[f]), imp_map[f]) for f in features
                   if float(vals_d[f]) > mean_map.get(f,0)*1.5 and imp_map[f]>0.01]
        flagged.sort(key=lambda x: x[2], reverse=True)

        if flagged:
            st.markdown(f"""
            <div style="background:#12090c;border:1px solid #ff3b5c;border-radius:12px;padding:1rem 1.4rem;margin-bottom:1rem;">
              <div style="color:#ff3b5c;font-weight:800;margin-bottom:6px;">
                <i class="fas fa-triangle-exclamation"></i> &nbsp;{len(flagged)} Anomalous Indicator{'s' if len(flagged)>1 else ''} Detected
              </div>
              <div style="color:#6b7fa3;font-size:0.83rem;">The following behaviours deviate significantly from the employee's expected baseline:</div>
            </div>""", unsafe_allow_html=True)

            for f, v, imp in flagged[:6]:
                icon_html, title, desc = RISK_EXPLANATIONS.get(f, ('<i class="fas fa-circle-exclamation"></i>', f.replace("_"," ").title(), "Unusual value detected."))
                sev     = "HIGH" if imp > 0.1 else "MEDIUM"
                sev_col = "#ff3b5c" if sev == "HIGH" else "#ffab00"
                st.markdown(f"""
                <div style="background:#0d1421;border:1px solid #1e2d4a;border-left:3px solid {sev_col};
                            border-radius:10px;padding:0.9rem 1.2rem;margin-bottom:0.6rem;
                            display:flex;align-items:flex-start;gap:12px;">
                  <div style="font-size:1.3rem;color:{sev_col};flex-shrink:0;">{icon_html}</div>
                  <div style="flex:1;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                      <span style="font-weight:700;font-size:0.95rem;">{title}</span>
                      <span style="background:{sev_col}22;color:{sev_col};font-size:0.7rem;font-family:'DM Mono',monospace;padding:2px 8px;border-radius:4px;font-weight:600;">{sev}</span>
                      <span style="margin-left:auto;color:{sev_col};font-family:'DM Mono',monospace;font-size:0.82rem;font-weight:700;">Value: {v:.0f}</span>
                    </div>
                    <div style="color:#a0b0c8;font-size:0.83rem;line-height:1.5;">{desc}</div>
                    <div style="margin-top:6px;">
                      <div style="height:4px;background:#1e2d4a;border-radius:2px;overflow:hidden;">
                        <div style="height:100%;width:{min(imp*400,100):.0f}%;background:{sev_col};border-radius:2px;"></div>
                      </div>
                      <div style="color:#6b7fa3;font-size:0.72rem;font-family:'DM Mono',monospace;margin-top:3px;">Model weight: {imp:.3f}</div>
                    </div>
                  </div>
                </div>""", unsafe_allow_html=True)
        else:
            st.markdown("""
            <div style="background:#07120a;border:1px solid #00e676;border-radius:12px;padding:1.2rem 1.4rem;">
              <div style="color:#00e676;font-weight:800;margin-bottom:4px;">
                <i class="fas fa-circle-check"></i> &nbsp;No Significant Anomalies Detected
              </div>
              <div style="color:#6b7fa3;font-size:0.83rem;">All behavioural indicators are within expected baseline ranges.</div>
            </div>""", unsafe_allow_html=True)

        st.divider()
        section_header('<i class="fas fa-file-lines"></i>', "Executive Summary",
                       "Plain-language summary for non-technical managers")
        fn = [RISK_EXPLANATIONS.get(f[0],("","",f[0]))[1] for f in flagged[:3]]
        if is_malicious:
            summary = f"The ThreatSense AI system has flagged this employee's recent activity as <b style='color:#ff3b5c;'>potentially malicious</b> with a confidence score of <b style='color:#ff3b5c;'>{confidence:.1f}%</b>. The analysis identified {len(flagged)} behavioural indicator(s) deviating from normal patterns. The most notable concerns are: <b style='color:#e8f0fe;'>{', '.join(fn) if fn else 'multiple deviations from baseline'}</b>.<br><br><b>Recommended action:</b> Escalate to the security team for further investigation. Do not alert the employee. Preserve all digital activity logs immediately in accordance with your Digital Forensic Readiness policy."
        else:
            summary = f"The ThreatSense AI system has assessed this employee's recent activity as <b style='color:#00e676;'>normal and within expected parameters</b>. The system is <b style='color:#00e676;'>{proba[0]*100:.1f}% confident</b> that no malicious intent is present.<br><br><b>Recommended action:</b> No immediate action required. Continue routine monitoring as per standard security policy."

        st.markdown(f"""
        <div style="background:#0d1421;border:1px solid #1e2d4a;border-radius:14px;
                    padding:1.4rem 1.6rem;line-height:1.8;color:#a0b0c8;font-size:0.88rem;">
          {summary}
        </div>""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════════════════════
# TAB 2 — MODEL METRICS
# ══════════════════════════════════════════════════════════════════════════════
if selected_tab == "Model Metrics":
    section_header('<i class="fas fa-chart-line"></i>', "Model Performance Metrics",
                   "Evaluation results from the held-out test set (23,723 records)")
    m1,m2,m3,m4 = st.columns(4)
    with m1: card('<i class="fas fa-bullseye"></i>',        "Accuracy",  "94.98%", "Overall correct predictions", "cyan",  "large")
    with m2: card('<i class="fas fa-crosshairs"></i>',      "Precision", "52.26%", "Of flagged — truly malicious", "amber")
    with m3: card('<i class="fas fa-magnifying-glass"></i>',"Recall",    "78.00%", "Actual threats detected",      "green")
    with m4: card('<i class="fas fa-scale-balanced"></i>',  "F1-Score",  "62.58%", "Precision-recall balance",     "cyan")

    st.divider()
    cl, cr = st.columns(2)

    with cl:
        section_header('<i class="fas fa-table"></i>', "Confusion Matrix")
        cm_df = pd.DataFrame({"Normal (Predicted)":{"Normal (Actual)":21536,"Malicious (Actual)":281},
                               "Malicious (Predicted)":{"Normal (Actual)":910,"Malicious (Actual)":996}})
        st.dataframe(cm_df, use_container_width=True)
        st.markdown("""
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;">
          <div style="background:#071a0c;border:1px solid #00e676;border-radius:8px;padding:8px 12px;">
            <div style="color:#00e676;font-weight:700;font-size:0.82rem;"><i class="fas fa-circle-check"></i> True Positives: 996</div>
            <div style="color:#6b7fa3;font-size:0.75rem;">Threats correctly detected</div>
          </div>
          <div style="background:#12090c;border:1px solid #ff3b5c;border-radius:8px;padding:8px 12px;">
            <div style="color:#ff3b5c;font-weight:700;font-size:0.82rem;"><i class="fas fa-circle-xmark"></i> False Negatives: 281</div>
            <div style="color:#6b7fa3;font-size:0.75rem;">Missed threats — critical</div>
          </div>
          <div style="background:#120c04;border:1px solid #ffab00;border-radius:8px;padding:8px 12px;">
            <div style="color:#ffab00;font-weight:700;font-size:0.82rem;"><i class="fas fa-triangle-exclamation"></i> False Positives: 910</div>
            <div style="color:#6b7fa3;font-size:0.75rem;">Normal flagged as malicious</div>
          </div>
          <div style="background:#071a0c;border:1px solid #00e676;border-radius:8px;padding:8px 12px;">
            <div style="color:#00e676;font-weight:700;font-size:0.82rem;"><i class="fas fa-circle-check"></i> True Negatives: 21,536</div>
            <div style="color:#6b7fa3;font-size:0.75rem;">Normal correctly cleared</div>
          </div>
        </div>""", unsafe_allow_html=True)

    with cr:
        section_header('<i class="fas fa-code-compare"></i>', "Decision Tree vs Random Forest")
        comp = pd.DataFrame({"Metric":["Accuracy","Precision","Recall","F1-Score"],
                              "Decision Tree":["90.72%","33.91%","76.27%","46.95%"],
                              "Random Forest":["94.98%","52.26%","78.00%","62.58%"]})
        st.dataframe(comp, hide_index=True, use_container_width=True)
        st.markdown("""
        <div style="background:#0d1421;border:1px solid #1e2d4a;border-radius:12px;padding:1rem 1.2rem;margin-top:10px;color:#a0b0c8;font-size:0.83rem;line-height:1.7;">
          <b style="color:#00e5ff;"><i class="fas fa-circle-check"></i> Why Random Forest was chosen:</b><br>
          Outperforms the Decision Tree on every metric. The +18% precision improvement reduces
          analyst alert fatigue, its ensemble of 100 trees generalises better on this
          imbalanced dataset, and native feature importance enables the explainability
          required by the project specification.
        </div>""", unsafe_allow_html=True)

    st.divider()
    section_header('<i class="fas fa-tree"></i>', "Feature Importance (Top 10)",
                   "Which behavioural features drive the model's decisions most")
    fi_df = pd.DataFrame({"Feature":features,"Importance":model.feature_importances_}).sort_values("Importance",ascending=False).head(10)
    fig2,ax2 = plt.subplots(figsize=(10,4))
    fig2.patch.set_facecolor("#0d1421"); ax2.set_facecolor("#0d1421")
    ax2.bar(fi_df["Feature"], fi_df["Importance"],
            color=["#00e5ff" if i<3 else "#1e2d4a" for i in range(len(fi_df))], zorder=3)
    ax2.spines[:].set_visible(False)
    ax2.tick_params(axis="x",rotation=35,colors="#e8f0fe",labelsize=8)
    ax2.tick_params(axis="y",colors="#6b7fa3",labelsize=8)
    ax2.set_ylabel("Importance Score",color="#6b7fa3",fontsize=8)
    ax2.grid(axis="y",color="#1e2d4a",linewidth=0.5,zorder=0)
    plt.tight_layout()
    st.pyplot(fig2, use_container_width=True)

# ══════════════════════════════════════════════════════════════════════════════
# TAB 3 — ABOUT
# ══════════════════════════════════════════════════════════════════════════════
if selected_tab == "About":
    c1,c2 = st.columns(2)
    with c1:
        section_header('<i class="fas fa-graduation-cap"></i>', "Project Information")
        st.markdown("""
        <div style="background:#0d1421;border:1px solid #1e2d4a;border-radius:14px;padding:1.4rem;line-height:2;">
          <table style="width:100%;font-size:0.85rem;border-collapse:collapse;">
            <tr><td style="color:#6b7fa3;width:40%;padding:4px 0;">Module</td><td style="color:#e8f0fe;font-weight:600;">COS720 – Computer Information & Security I</td></tr>
            <tr><td style="color:#6b7fa3;padding:4px 0;">Institution</td><td style="color:#e8f0fe;font-weight:600;">University of Pretoria</td></tr>
            <tr><td style="color:#6b7fa3;padding:4px 0;">Lecturer</td><td style="color:#e8f0fe;font-weight:600;">Mr S.M. Makura</td></tr>
            <tr><td style="color:#6b7fa3;padding:4px 0;">Submission</td><td style="color:#e8f0fe;font-weight:600;">19 May 2026</td></tr>
            <tr><td style="color:#6b7fa3;padding:4px 0;">Dataset</td><td style="color:#e8f0fe;font-weight:600;">Kaggle Insider Threat Dataset · 118,614 records</td></tr>
            <tr><td style="color:#6b7fa3;padding:4px 0;">Model</td><td style="color:#e8f0fe;font-weight:600;">Random Forest · 100 estimators · max_depth=10</td></tr>
            <tr><td style="color:#6b7fa3;padding:4px 0;">Imbalance</td><td style="color:#e8f0fe;font-weight:600;">SMOTE oversampling applied</td></tr>
          </table>
        </div>""", unsafe_allow_html=True)

    with c2:
        section_header('<i class="fas fa-book-open"></i>', "Research Foundation")
        st.markdown("""
        <div style="background:#0d1421;border:1px solid #1e2d4a;border-radius:14px;padding:1.4rem;color:#a0b0c8;font-size:0.85rem;line-height:1.8;">
          This system is grounded in the findings of:<br><br>
          <b style="color:#00e5ff;">Shoderu, Baror, Makura & Modupe (2025)</b> —
          <i>Digital Forensic Readiness to Mitigate Insider Threats in the SaaS Cloud Environment</i>,
          The Indonesian Journal of Computer Science, 14(6).<br><br>
          The paper's DFR-BUST framework identifies that most ML detection systems focus purely
          on accuracy and lack forensic explainability. This prototype directly addresses that gap
          by embedding <b style="color:#e8f0fe;">human-readable explanations</b> alongside every
          classification decision.
        </div>""", unsafe_allow_html=True)

    st.divider()
    section_header('<i class="fas fa-scale-balanced"></i>', "Ethical Considerations & Limitations")
    e1,e2 = st.columns(2)
    with e1:
        st.markdown("""
        <div style="background:#0d1421;border:1px solid #ffab00;border-left:3px solid #ffab00;border-radius:12px;padding:1.2rem 1.4rem;font-size:0.84rem;color:#a0b0c8;line-height:1.8;">
          <div style="color:#ffab00;font-weight:800;margin-bottom:8px;"><i class="fas fa-gavel"></i> Ethical Considerations</div>
          • Nationality and medical history <b style="color:#e8f0fe;">deliberately excluded</b> to avoid discriminatory profiling.<br>
          • System should <b style="color:#e8f0fe;">support</b> investigators, not replace them.<br>
          • All flagged cases require human review before any action.<br>
          • Employees should be monitored only under a clear, communicated policy.
        </div>""", unsafe_allow_html=True)
    with e2:
        st.markdown("""
        <div style="background:#0d1421;border:1px solid #ff3b5c;border-left:3px solid #ff3b5c;border-radius:12px;padding:1.2rem 1.4rem;font-size:0.84rem;color:#a0b0c8;line-height:1.8;">
          <div style="color:#ff3b5c;font-weight:800;margin-bottom:8px;"><i class="fas fa-triangle-exclamation"></i> Known Limitations</div>
          • 281 false negatives — insiders who mimic normal behaviour may evade detection.<br>
          • 910 false positives could cause analyst alert fatigue.<br>
          • Model trained on synthetic data — real-world performance may vary.<br>
          • Lower decision threshold could improve recall at cost of precision.
        </div>""", unsafe_allow_html=True)