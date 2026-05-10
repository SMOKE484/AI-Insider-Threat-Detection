"use client";
import { useState } from "react";
import Sidebar from "@/components/sidebar";
import AnalysePage from "@/components/analysePage";
import MetricsPage from "@/components/metricsPage";
import AboutPage from "@/components/aboutPage";

export type TabType = "analyse" | "metrics" | "about";

const PAGE_META: Record<TabType, { title: string; sub: string }> = {
  analyse: {
    title: "Analyst Dashboard",
    sub:   "Analyse employee behavioural data for potential insider threats",
  },
  metrics: {
    title: "Model Evaluation",
    sub:   "Random Forest · 118,614 training records · SMOTE balanced",
  },
  about: {
    title: "About & Documentation",
    sub:   "Project information, research foundation and ethical considerations",
  },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("analyse");
  const meta = PAGE_META[activeTab];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f0f2f5" }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── Top bar (matches AMSA style) ── */}
        <div style={{
          background:    "#ffffff",
          borderBottom:  "1px solid #e5e7eb",
          height:        64,
          padding:       "0 28px",
          display:       "flex",
          alignItems:    "center",
          justifyContent:"space-between",
          flexShrink:    0,
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
              {meta.title}
            </h1>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{meta.sub}</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Online badge */}
            <div style={{
              display:    "flex",
              alignItems: "center",
              gap:         6,
              background:  "#f0fdf4",
              border:      "1px solid #bbf7d0",
              borderRadius:20,
              padding:     "5px 12px",
              fontSize:    12,
              color:       "#16a34a",
              fontWeight:  600,
            }}>
              <span style={{
                width:8, height:8, borderRadius:"50%",
                background:"#16a34a", display:"inline-block",
              }} />
              System Online
            </div>

            {/* User info */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#111827" }}>
                  Security Analyst
                </div>
                <div style={{ fontSize:11, color:"#9ca3af" }}>COS720 · UP</div>
              </div>
              <div style={{
                width:36, height:36, borderRadius:"50%",
                background:"#0d7c7c", color:"white",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:15, fontWeight:700, flexShrink:0,
              }}>
                S
              </div>
            </div>
          </div>
        </div>

        {/* ── Page content ── */}
        <div style={{ flex:1, overflow:"auto", padding:"24px 28px" }}>
          {activeTab === "analyse" && <AnalysePage />}
          {activeTab === "metrics" && <MetricsPage />}
          {activeTab === "about"   && <AboutPage />}
        </div>
      </div>
    </div>
  );
}