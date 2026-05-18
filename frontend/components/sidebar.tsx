"use client";
import { TabType } from "@/app/page";

const NAV = [
  { id: "analyse", icon: "fa-magnifying-glass-chart", label: "Analyse Employee" },
  { id: "metrics", icon: "fa-chart-bar",              label: "Model Metrics"    },
  { id: "about",   icon: "fa-circle-info",            label: "About"            },
] as const;

const STATS = [
  { label: "Algorithm",  value: "Random Forest" },
  { label: "Training",   value: "118,614 rows"  },
  { label: "Accuracy",   value: "94.98%"        },
  { label: "Recall",     value: "78.00%"        },
  { label: "F1-Score",   value: "62.58%"        },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
}: {
  activeTab: TabType;
  setActiveTab: (t: TabType) => void;
}) {
  return (
    <div style={{
      width:        240,
      background:   "#ffffff",
      borderRight:  "1px solid #e5e7eb",
      display:      "flex",
      flexDirection:"column",
      flexShrink:   0,
      height:       "100vh",
    }}>

      {/* ── Logo area — dark teal so black-bg logo blends cleanly ── */}
      <div style={{
        height:       64,
        padding:      "0 20px",
        background:   "#0a5f5f",
        borderBottom: "1px solid #084f4f",
        display:      "flex",
        alignItems:   "center",
        gap:          10,
        flexShrink:   0,
      }}>
        {/* Logo image — save your logo.png to frontend/public/logo.png */}
        <img
          src="/ThreatSense_Logo.png"
          alt="ThreatSense"
          style={{ height: 38, width: "auto", objectFit: "contain" }}
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", lineHeight: 1.2 }}>
            ThreatSense
          </div>
          <div style={{ fontSize: 9, color: "#7dd3d0", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            AI Threat Detection
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <div style={{ padding: "14px 10px", flex: 1 }}>
        <div style={{
          fontSize:       10,
          color:          "#9ca3af",
          textTransform:  "uppercase",
          letterSpacing:  "0.08em",
          fontWeight:     600,
          padding:        "0 8px 8px",
        }}>
          Navigation
        </div>

        {NAV.map(({ id, icon, label }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id as TabType)}
              style={{
                width:       "100%",
                display:     "flex",
                alignItems:  "center",
                gap:         10,
                padding:     "10px 12px",
                borderRadius:8,
                border:      "none",
                cursor:      "pointer",
                background:  active ? "#0d7c7c" : "transparent",
                color:       active ? "#ffffff" : "#4b5563",
                fontSize:    14,
                fontWeight:  active ? 600 : 400,
                textAlign:   "left",
                marginBottom:3,
                transition:  "background 0.15s ease, color 0.15s ease",
              }}
              onMouseEnter={e => {
                if (!active)
                  (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6";
              }}
              onMouseLeave={e => {
                if (!active)
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              <i
                className={`fas ${icon}`}
                style={{
                  fontSize:   13,
                  width:      18,
                  textAlign:  "center",
                  color:      active ? "#ffffff" : "#0d7c7c",
                  flexShrink: 0,
                }}
              />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Model summary ── */}
      <div style={{ padding: "14px 20px", borderTop: "1px solid #e5e7eb" }}>
        <div style={{
          fontSize:      10,
          color:         "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight:    600,
          marginBottom:  10,
        }}>
          Model Summary
        </div>

        {STATS.map(({ label, value }) => (
          <div
            key={label}
            style={{
              display:        "flex",
              justifyContent: "space-between",
              alignItems:     "center",
              marginBottom:   6,
            }}
          >
            <span style={{ fontSize: 12, color: "#6b7280" }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{value}</span>
          </div>
        ))}

        <div style={{
          marginTop:   12,
          paddingTop:  10,
          borderTop:   "1px solid #f3f4f6",
          fontSize:    11,
          color:       "#9ca3af",
          textAlign:   "center",
          lineHeight:  1.6,
        }}>
        <br />
          
        </div>
      </div>
    </div>
  );
}
