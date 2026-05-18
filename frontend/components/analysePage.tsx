"use client";

import { useState, useEffect, useRef } from "react";
import { predict, predictCSV } from "@/lib/api";
import { EmployeeData, PredictionResult } from "@/types";
import RiskGauge from "@/components/riskGauge";

// ── Sample data ───────────────────────────────────────────────────────────────
const SAMPLE_PROFILES: Record<string, EmployeeData> = {
  "Normal Employee — John Smith": {
    employee_department:2,employee_campus:1,employee_position:10,
    employee_seniority_years:5,is_contractor:0,employee_classification:1,
    has_foreign_citizenship:0,has_criminal_record:0,total_printed_pages:5,
    num_printed_pages_off_hours:0,total_files_burned:2,burned_from_other:0,
    is_abroad:0,hostility_country_level:0,num_entries:1,num_unique_campus:1,
    entry_during_weekend:0,
  },
  "High Risk — Jane Doe": {
    employee_department:5,employee_campus:0,employee_position:25,
    employee_seniority_years:2,is_contractor:1,employee_classification:3,
    has_foreign_citizenship:1,has_criminal_record:0,total_printed_pages:120,
    num_printed_pages_off_hours:45,total_files_burned:80,burned_from_other:1,
    is_abroad:1,hostility_country_level:2,num_entries:3,num_unique_campus:3,
    entry_during_weekend:1,
  },
  "Medium Risk — Alex Nkosi": {
    employee_department:3,employee_campus:2,employee_position:15,
    employee_seniority_years:8,is_contractor:0,employee_classification:2,
    has_foreign_citizenship:0,has_criminal_record:1,total_printed_pages:38,
    num_printed_pages_off_hours:8,total_files_burned:22,burned_from_other:0,
    is_abroad:0,hostility_country_level:1,num_entries:2,num_unique_campus:2,
    entry_during_weekend:1,
  },
};

const SLIDER_FIELDS = [
  { key:"total_files_burned",          label:"Files Burned to Disc",    min:0,  max:186, icon:"fa-compact-disc" },
  { key:"total_printed_pages",         label:"Total Pages Printed",      min:0,  max:200, icon:"fa-print" },
  { key:"num_printed_pages_off_hours", label:"Off-Hours Printing",       min:0,  max:100, icon:"fa-moon" },
  { key:"num_entries",                 label:"Building Entries (0–4)",   min:0,  max:4,   icon:"fa-door-open" },
  { key:"num_unique_campus",           label:"Campus Access (0–3)",      min:0,  max:3,   icon:"fa-building" },
  { key:"hostility_country_level",     label:"Country Risk (0–3)",       min:0,  max:3,   icon:"fa-earth-africa" },
  { key:"employee_seniority_years",    label:"Years of Service",         min:0,  max:31,  icon:"fa-briefcase" },
  { key:"employee_classification",     label:"Clearance (1–4)",          min:1,  max:4,   icon:"fa-lock" },
] as const;

const TOGGLE_FIELDS = [
  { key:"is_contractor",           label:"Contractor",           icon:"fa-id-badge" },
  { key:"burned_from_other",       label:"Burned Others' Files", icon:"fa-user-xmark" },
  { key:"is_abroad",               label:"Currently Abroad",     icon:"fa-plane" },
  { key:"has_criminal_record",     label:"Criminal Record",      icon:"fa-scale-unbalanced" },
  { key:"has_foreign_citizenship", label:"Foreign Citizenship",  icon:"fa-passport" },
  { key:"entry_during_weekend",    label:"Weekend Entry",        icon:"fa-calendar-xmark" },
] as const;

const DEFAULT_DATA: EmployeeData = {
  employee_department:3,employee_campus:1,employee_position:15,
  employee_seniority_years:5,is_contractor:0,employee_classification:1,
  has_foreign_citizenship:0,has_criminal_record:0,total_printed_pages:0,
  num_printed_pages_off_hours:0,total_files_burned:0,burned_from_other:0,
  is_abroad:0,hostility_country_level:0,num_entries:1,num_unique_campus:1,
  entry_during_weekend:0,
};

function useIsMobile(bp = 960) {
  const [m, setM] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const on = () => setM(window.innerWidth < bp);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [bp]);
  return m;
}


function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background:"#ffffff", border:"1px solid #e5e7eb",
      borderRadius:12, overflow:"hidden", ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, badge }: { icon:string; title:string; badge?:string }) {
  return (
    <div style={{
      padding:"12px 18px", borderBottom:"1px solid #f3f4f6",
      display:"flex", alignItems:"center", justifyContent:"space-between",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <i className={`fas ${icon}`} style={{ color:"#0d7c7c", fontSize:14 }} />
        <span style={{ fontSize:14, fontWeight:600, color:"#111827" }}>{title}</span>
      </div>
      {badge && (
        <span style={{
          fontSize:11, color:"#6b7280", background:"#f3f4f6",
          borderRadius:20, padding:"2px 10px",
        }}>
          {badge}
        </span>
      )}
    </div>
  );
}

function ModeTab({ id, icon, label, active, onClick }: {
  id:string; icon:string; label:string; active:boolean; onClick:()=>void;
}) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      aria-controls={`panel-${id}`}
      id={`tab-${id}`}
      style={{
      flex:1, display:"flex", alignItems:"center", justifyContent:"center",
      gap:6, padding:"8px 0", borderRadius:8, border:"none", cursor:"pointer",
      background: active ? "#0d7c7c" : "#f3f4f6",
      color:      active ? "#ffffff" : "#6b7280",
      fontSize:13, fontWeight: active ? 600 : 400,
      transition:"all 0.15s",
    }}>
      <i className={`fas ${icon}`} style={{ fontSize:12 }} />
      {label}
    </button>
  );
}


function useCounter(target: number, duration = 1000, enabled = true) {
  const [value, setValue] = useState(0);
  const frameRef          = useRef<number>(0);

  useEffect(() => {
    if (!enabled) { setValue(0); return; }
    cancelAnimationFrame(frameRef.current);
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t   = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(parseFloat((eased * target).toFixed(1)));
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
      else setValue(target);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, enabled]);

  return value;
}

//Animated bar component
function AnimatedBar({
  targetPct, color, delay, trigger,
}: {
  targetPct: number;
  color: string;
  delay: number;
  trigger: boolean;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!trigger) { setWidth(0); return; }
    const t = setTimeout(() => setWidth(targetPct), delay);
    return () => clearTimeout(t);
  }, [trigger, targetPct, delay]);

  return (
    <div style={{ background:"#f3f4f6", borderRadius:3, height:4, overflow:"hidden" }}>
      <div style={{
        height:"100%",
        width:`${width}%`,
        background: color,
        borderRadius:3,
        transition:`width 0.7s ease-out ${delay}ms`,
      }} />
    </div>
  );
}

//Stat card with animated number 
function AnimatedStatCard({
  icon, label, value, suffix, sub, color, iconBg, animate,
}: {
  icon:string; label:string; value:number; suffix:string;
  sub:string; color:string; iconBg:string; animate:boolean;
}) {
  const counted = useCounter(value, 1200, animate);
  const display = suffix === "%" ? `${counted.toFixed(1)}%` : counted.toFixed(0);

  return (
    <div style={{
      background:"#ffffff", border:"1px solid #e5e7eb",
      borderRadius:10, padding:"16px",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <div style={{
          width:36, height:36, borderRadius:8, background:iconBg,
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
        }}>
          <i className={`fas ${icon}`} style={{ color, fontSize:15 }} />
        </div>
        <span style={{
          fontSize:11, color:"#9ca3af", textTransform:"uppercase",
          letterSpacing:"0.06em", fontWeight:600,
        }}>{label}</span>
      </div>
      <div style={{ fontSize:26, fontWeight:700, color, lineHeight:1 }}>{display}</div>
      <div style={{ fontSize:12, color:"#9ca3af", marginTop:4 }}>{sub}</div>
    </div>
  );
}

//Curated Profile Preview 
const KEY_FIELDS: Array<{ key: keyof EmployeeData; label: string; fmt?: (v: number) => string }> = [
  { key: "employee_classification",     label: "Clearance",       fmt: v => `Level ${v}` },
  { key: "employee_seniority_years",    label: "Tenure",          fmt: v => `${v} yr${v === 1 ? "" : "s"}` },
  { key: "is_contractor",               label: "Type",            fmt: v => v ? "Contractor" : "Employee" },
  { key: "total_files_burned",          label: "Files burned",    fmt: v => String(v) },
  { key: "total_printed_pages",         label: "Pages printed",   fmt: v => String(v) },
  { key: "num_printed_pages_off_hours", label: "Off-hours pages", fmt: v => String(v) },
];

function ProfilePreview({ data }: { data: EmployeeData }) {
  const [expanded, setExpanded] = useState(false);
  const extra = Object.entries(data).filter(([k]) => !KEY_FIELDS.some(f => f.key === k));

  return (
    <div style={{
      marginTop:8, background:"#f9fafb",
      border:"1px solid #f3f4f6", borderRadius:8, padding:"10px 12px",
    }}>
      <div style={{ fontSize:10, color:"#9ca3af", textTransform:"uppercase",
        letterSpacing:"0.07em", fontWeight:600, marginBottom:8 }}>
        Profile Preview
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 12px" }}>
        {KEY_FIELDS.map(({ key, label, fmt }) => (
          <div key={key} style={{
            display:"flex", justifyContent:"space-between", alignItems:"baseline",
            fontSize:11,
          }}>
            <span style={{ color:"#9ca3af" }}>{label}</span>
            <span style={{ color:"#111827", fontWeight:600 }}>
              {fmt ? fmt(data[key] as number) : String(data[key])}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          marginTop:8, background:"transparent", border:"none",
          color:"#0d7c7c", fontSize:11, fontWeight:600, cursor:"pointer",
          padding:0, display:"inline-flex", alignItems:"center", gap:4,
        }}
        aria-expanded={expanded}
      >
        <i className={`fas fa-chevron-${expanded ? "up" : "down"}`} style={{ fontSize:9 }} />
        {expanded ? "Hide" : `Show all (${extra.length} more)`}
      </button>
      {expanded && (
        <div style={{ marginTop:8, display:"flex", flexWrap:"wrap", gap:4 }}>
          {extra.map(([k, v]) => (
            <span key={k} style={{
              background:"#ffffff", border:"1px solid #e5e7eb",
              borderRadius:5, padding:"2px 8px", fontSize:10, color:"#374151",
            }}>
              <span style={{ color:"#9ca3af" }}>{k.replace(/_/g," ")}:</span> {v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

//Main component
export default function AnalysePage() {
  const isMobile                      = useIsMobile(960);
  const [mode, setMode]             = useState<"sample"|"manual"|"csv">("sample");
  const [selectedProfile, setProfile] = useState("Normal Employee — John Smith");
  const [manualData, setManual]     = useState<EmployeeData>(DEFAULT_DATA);
  const [csvFile, setCsvFile]       = useState<File | null>(null);
  const [csvRows, setCsvRows]       = useState<number | null>(null);
  const [result, setResult]         = useState<PredictionResult | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // Animation triggers
  const [barsReady,    setBarsReady]    = useState(false);
  const [summaryReady, setSummaryReady] = useState(false);
  const [countersOn,   setCountersOn]   = useState(false);

  const currentData = mode === "sample" ? SAMPLE_PROFILES[selectedProfile] : manualData;

  const handleAnalyse = async () => {
    // Reset animations
    setBarsReady(false);
    setSummaryReady(false);
    setCountersOn(false);
    setResult(null);
    setError(null);
    setLoading(true);

    try {
      let res: PredictionResult;
      if (mode === "csv") {
        if (!csvFile) { setError("Please upload a CSV file first."); setLoading(false); return; }
        const r = await predictCSV(csvFile) as PredictionResult & { rows_in_file: number };
        setCsvRows(r.rows_in_file);
        res = r;
      } else {
        res = await predict(currentData);
      }

      setResult(res);
      setLoading(false);

      // Start counters immediately when result arrives
      setCountersOn(true);

      // Bars fill shortly after
      setTimeout(() => setBarsReady(true), 300);

      // Summary fades in after bars finish
      const flagCount   = res.flagged.length;
      const summaryDelay = 300 + flagCount * 120 + 600;
      setTimeout(() => setSummaryReady(true), summaryDelay);

    } catch {
      setError("Cannot reach API. Make sure FastAPI backend is running on port 8000.");
      setLoading(false);
    }
  };

  const isMal = result?.prediction === "Malicious";
  const rc    = isMal ? "#dc2626" : "#16a34a";
  const rBg   = isMal ? "#fef2f2" : "#f0fdf4";
  const rBdr  = isMal ? "#fecaca" : "#bbf7d0";

  return (
    <div style={{
      display:"grid",
      gridTemplateColumns: isMobile ? "1fr" : "360px 1fr",
      gap:20,
      alignItems:"start",
    }}>
      {/* Small scoped polish: styled range inputs, nicer focus rings on buttons */}
      <style>{`
        input[type="range"] {
          width: 100%;
          height: 4px;
          accent-color: #0d7c7c;
          cursor: pointer;
        }
        button:focus-visible, label:focus-within {
          outline: 2px solid #0d7c7c;
          outline-offset: 2px;
          border-radius: 8px;
        }
      `}</style>

      {/* LEFT — Input panel (unchanged) */}
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <Card>
          <CardHeader icon="fa-user-shield" title="Employee Profile" />
          <div style={{ padding:"14px 16px" }}>

            {/* Mode tabs */}
            <div role="tablist" aria-label="Input mode" style={{ display:"flex", gap:6, marginBottom:16 }}>
              <ModeTab id="sample" icon="fa-address-card" label="Sample"  active={mode==="sample"} onClick={()=>setMode("sample")} />
              <ModeTab id="manual" icon="fa-sliders"      label="Manual"  active={mode==="manual"} onClick={()=>setMode("manual")} />
              <ModeTab id="csv"    icon="fa-file-arrow-up"label="CSV"     active={mode==="csv"}    onClick={()=>setMode("csv")}    />
            </div>

            {/* ── Sample ── */}
            {mode === "sample" && (
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {Object.keys(SAMPLE_PROFILES).map(name => {
                  const sel = selectedProfile === name;
                  return (
                    <button key={name} onClick={() => setProfile(name)} style={{
                      display:"flex", alignItems:"center", gap:10,
                      padding:"10px 12px", borderRadius:8, cursor:"pointer",
                      border:`1px solid ${sel ? "#0d7c7c" : "#e5e7eb"}`,
                      background: sel ? "#e6f7f7" : "#ffffff",
                      textAlign:"left", transition:"all 0.15s",
                    }}>
                      <div style={{
                        width:32, height:32, borderRadius:"50%",
                        background: sel ? "#0d7c7c" : "#f3f4f6",
                        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                      }}>
                        <i className="fas fa-user" style={{ color: sel ? "#ffffff" : "#9ca3af", fontSize:13 }} />
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color: sel ? "#0d7c7c" : "#111827" }}>{name}</div>
                        <div style={{ fontSize:11, color:"#9ca3af", marginTop:1 }}>Click to select</div>
                      </div>
                      {sel && <i className="fas fa-circle-check" style={{ color:"#0d7c7c", marginLeft:"auto", fontSize:16 }} />}
                    </button>
                  );
                })}
                {/* Curated Preview */}
                <ProfilePreview data={SAMPLE_PROFILES[selectedProfile]} />
              </div>
            )}

            {/* ── Manual ── */}
            {mode === "manual" && (
              <div>
                <div style={{ fontSize:11, color:"#9ca3af", textTransform:"uppercase",
                  letterSpacing:"0.07em", fontWeight:600, marginBottom:10 }}>
                  Behavioural Sliders
                </div>
                {SLIDER_FIELDS.map(({ key, label, min, max, icon }) => {
                  const val = manualData[key as keyof EmployeeData] as number;
                  return (
                    <div key={key} style={{ marginBottom:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between",
                        alignItems:"center", marginBottom:4 }}>
                        <label style={{ fontSize:12, color:"#374151", display:"flex",
                          alignItems:"center", gap:5 }}>
                          <i className={`fas ${icon}`} style={{ color:"#0d7c7c", fontSize:11 }} />
                          {label}
                        </label>
                        <span style={{
                          fontSize:12, fontWeight:700, color:"#0d7c7c",
                          background:"#e6f7f7", padding:"1px 8px",
                          borderRadius:4, minWidth:32, textAlign:"center",
                        }}>
                          {val}
                        </span>
                      </div>
                      <input type="range" min={min} max={max} value={val}
                        onChange={e => setManual(p => ({ ...p, [key]: Number(e.target.value) }))}
                      />
                    </div>
                  );
                })}

                <div style={{ fontSize:11, color:"#9ca3af", textTransform:"uppercase",
                  letterSpacing:"0.07em", fontWeight:600, margin:"14px 0 8px" }}>
                  Risk Flags
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  {TOGGLE_FIELDS.map(({ key, label, icon }) => {
                    const on = (manualData[key as keyof EmployeeData] as number) === 1;
                    return (
                      <button key={key}
                        onClick={() => setManual(p => ({ ...p, [key]: on ? 0 : 1 }))}
                        role="switch"
                        aria-checked={on}
                        aria-label={label}
                        style={{
                          display:"flex", alignItems:"center", gap:7,
                          padding:"8px 10px", borderRadius:8, cursor:"pointer",
                          border:`1px solid ${on ? "#0d7c7c" : "#e5e7eb"}`,
                          background: on ? "#e6f7f7" : "#ffffff",
                          fontSize:12, color: on ? "#0d7c7c" : "#6b7280",
                          fontWeight: on ? 600 : 400, transition:"all 0.15s",
                        }}>
                        <i className={`fas ${icon}`} style={{ fontSize:11 }} />
                        <span style={{ flex:1 }}>{label}</span>
                        <span style={{ fontSize:10, fontWeight:700, color: on ? "#16a34a" : "#9ca3af" }}>
                          {on ? "YES" : "NO"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── CSV ── */}
            {mode === "csv" && (
              <div>
                <label htmlFor="csv-upload" style={{
                  display:"block",
                  border:`2px dashed ${csvFile ? "#0d7c7c" : "#d1d5db"}`,
                  borderRadius:10, padding:"28px 16px", textAlign:"center",
                  cursor:"pointer", background: csvFile ? "#e6f7f7" : "#f9fafb",
                  transition:"all 0.2s",
                }}>
                  <i className="fas fa-cloud-arrow-up" style={{
                    fontSize:32, color: csvFile ? "#0d7c7c" : "#d1d5db",
                    display:"block", marginBottom:10,
                  }} />
                  {csvFile ? (
                    <>
                      <div style={{ fontWeight:600, fontSize:13, color:"#0d7c7c" }}>{csvFile.name}</div>
                      <div style={{ fontSize:11, color:"#6b7280", marginTop:2 }}>
                        {(csvFile.size/1024).toFixed(1)} KB{csvRows != null && ` · ${csvRows} records`}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize:13, fontWeight:500, color:"#374151" }}>
                        Click to upload a CSV file
                      </div>
                      <div style={{ fontSize:11, color:"#9ca3af", marginTop:3 }}>
                        Raw or pre-encoded · string columns auto-encoded
                      </div>
                    </>
                  )}
                  <input id="csv-upload" type="file" accept=".csv" style={{ display:"none" }}
                    onChange={e => { setCsvFile(e.target.files?.[0] ?? null); setCsvRows(null); }}
                  />
                </label>
                {csvFile && (
                  <div style={{
                    marginTop:8, display:"flex", alignItems:"center", gap:7,
                    background:"#f0fdf4", border:"1px solid #bbf7d0",
                    borderRadius:6, padding:"8px 12px",
                    fontSize:12, color:"#16a34a", fontWeight:500,
                  }}>
                    <i className="fas fa-circle-check" />
                    File ready — analysis will use the first row
                  </div>
                )}
                <div style={{ marginTop:10, fontSize:11, color:"#9ca3af", lineHeight:1.7 }}>
                  <i className="fas fa-circle-info" style={{ color:"#d1d5db", marginRight:5 }} />
                  Accepts the original Kaggle CSV with text department and campus names.
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Analyse button */}
        <button onClick={handleAnalyse} disabled={loading} style={{
          width:"100%", padding:"13px 0", borderRadius:10, border:"none",
          cursor: loading ? "wait" : "pointer",
          background: loading ? "#9ca3af" : "#0d7c7c",
          color:"#ffffff", fontSize:15, fontWeight:700,
          display:"flex", alignItems:"center", justifyContent:"center", gap:9,
          transition:"background 0.2s",
          boxShadow: loading ? "none" : "0 2px 8px rgba(13,124,124,0.25)",
        }}>
          <i className={`fas ${loading ? "fa-spinner fa-spin" : "fa-magnifying-glass-chart"}`} />
          {loading ? "Analysing..." : "Run Threat Analysis"}
        </button>

        {error && (
          <div style={{
            background:"#fef2f2", border:"1px solid #fecaca",
            borderRadius:8, padding:"10px 14px",
            fontSize:12, color:"#dc2626",
            display:"flex", alignItems:"flex-start", gap:8,
          }}>
            <i className="fas fa-triangle-exclamation" style={{ marginTop:1, flexShrink:0 }} />
            {error}
          </div>
        )}
      </div>

      {/* RIGHT — Results panel */}
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

        {/* Empty state */}
        {!result && !loading && (
          <Card>
            <div style={{
              padding:"60px 40px", textAlign:"center",
              display:"flex", flexDirection:"column", alignItems:"center", gap:12,
            }}>
              <div style={{
                width:72, height:72, borderRadius:"50%", background:"#f3f4f6",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <i className="fas fa-shield-halved" style={{ fontSize:30, color:"#d1d5db" }} />
              </div>
              <div>
                <h3 style={{ fontSize:16, fontWeight:600, color:"#374151" }}>No Analysis Yet</h3>
                <p style={{ fontSize:13, color:"#9ca3af", marginTop:4 }}>
                  Select a profile and click &quot;Run Threat Analysis&quot; to get started
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Results  */}
        {(result || loading) && (
          <>
            {/* Verdict Hero */}
            <Card style={{ borderLeft: `4px solid ${result ? rc : "#d1d5db"}` }}>
              <div style={{
                padding: "20px 22px",
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1fr) minmax(0,1fr)",
                gap: 16,
                alignItems: "center",
              }}>
                {/* Left — verdict identity */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: 14,
                    background: result ? rBg : "#f3f4f6",
                    border: `1px solid ${result ? rBdr : "#e5e7eb"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <i
                      className={`fas ${
                        loading ? "fa-spinner fa-spin"
                        : isMal   ? "fa-triangle-exclamation"
                                  : "fa-shield-check"
                      }`}
                      style={{ color: result ? rc : "#9ca3af", fontSize: 24 }}
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 10, color: "#9ca3af", fontWeight: 600,
                      textTransform: "uppercase", letterSpacing: "0.08em",
                      marginBottom: 4,
                    }}>
                      Verdict
                    </div>
                    <div style={{
                      fontSize: 19, fontWeight: 700,
                      color: result ? rc : "#9ca3af",
                      lineHeight: 1.25,
                    }}>
                      {loading
                        ? "Analysing behaviour…"
                        : isMal
                          ? "Malicious Activity Detected"
                          : "Normal Behaviour"}
                    </div>
                    {result && (
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                        <i className="fas fa-microchip" style={{ marginRight: 6, color: "#9ca3af" }} />
                        Random Forest · {result.flagged.length} anomaly indicator
                        {result.flagged.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>

                {/* Risk Gauge */}
                <div>
                  <RiskGauge
                    threatScore={result?.threat_prob ?? 0}
                    riskLevel={result?.risk_level}
                    isLoading={loading}
                  />
                </div>
              </div>
            </Card>

            {/*Animated KPI stat cards*/}
            {result && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))", gap:12 }}>
                <AnimatedStatCard
                  icon="fa-shield"   label="NORMAL PROB"  value={result.normal_prob}
                  suffix="%" sub="Benign likelihood"
                  color="#16a34a" iconBg="#f0fdf4" animate={countersOn}
                />
                <AnimatedStatCard
                  icon="fa-virus"    label="THREAT PROB"  value={result.threat_prob}
                  suffix="%" sub="Risk likelihood"
                  color={result.threat_prob > 40 ? "#dc2626" : "#0d7c7c"}
                  iconBg={result.threat_prob > 40 ? "#fef2f2" : "#e6f7f7"}
                  animate={countersOn}
                />
                <AnimatedStatCard
                  icon="fa-flag"     label="ANOMALIES"    value={result.flagged.length}
                  suffix="" sub="Indicators detected"
                  color="#d97706" iconBg="#fffbeb" animate={countersOn}
                />
              </div>
            )}

            {/*Anomaly indicators with animated bars*/}
            {result && (
              <Card>
                <CardHeader
                  icon="fa-magnifying-glass-chart"
                  title="Anomaly Detection & Explainability"
                  badge={`${result.flagged.length} indicator${result.flagged.length !== 1 ? "s" : ""}`}
                />
                <div style={{ padding:"12px 14px" }}>
                  {result.flagged.length === 0 ? (
                    <div style={{
                      display:"flex", alignItems:"center", gap:12,
                      background:"#f0fdf4", border:"1px solid #bbf7d0",
                      borderRadius:8, padding:"14px 16px",
                    }}>
                      <i className="fas fa-circle-check" style={{ color:"#16a34a", fontSize:20, flexShrink:0 }} />
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:"#16a34a" }}>
                          No Significant Anomalies Detected
                        </div>
                        <div style={{ fontSize:12, color:"#6b7280", marginTop:1 }}>
                          All behavioural indicators are within expected baseline ranges.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {result.flagged.map((f, idx) => {
                        const sc  = f.severity === "HIGH" ? "#dc2626" : "#d97706";
                        const sbg = f.severity === "HIGH" ? "#fef2f2" : "#fffbeb";
                        const barPct = Math.min(f.importance * 400, 100);

                        return (
                          <div key={f.feature} style={{
                            background:"#ffffff", border:"1px solid #e5e7eb",
                            borderLeft:`4px solid ${sc}`, borderRadius:8,
                            padding:"12px 14px",
                          }}>
                            {/* Header row */}
                            <div style={{
                              display:"flex", alignItems:"center",
                              gap:8, marginBottom:4,
                            }}>
                              <span style={{ fontSize:13, fontWeight:600, color:"#111827", flex:1 }}>
                                {f.label}
                              </span>
                              <span style={{
                                background:sbg, color:sc, fontSize:10,
                                fontWeight:700, padding:"2px 8px",
                                borderRadius:20, border:`1px solid ${sc}30`,
                              }}>
                                {f.severity}
                              </span>
                              <span style={{ fontSize:13, fontWeight:700, color:sc }}>
                                {f.value}{" "}
                                <span style={{ color:"#9ca3af", fontWeight:400 }}>
                                  / {f.baseline} avg
                                </span>
                              </span>
                            </div>

                            {/* Description */}
                            <div style={{
                              fontSize:12, color:"#6b7280",
                              lineHeight:1.6, marginBottom:8,
                            }}>
                              {f.description}
                            </div>

                            {/* Animated weight bar */}
                            <AnimatedBar
                              targetPct={barPct}
                              color={sc}
                              delay={idx * 120}
                              trigger={barsReady}
                            />
                            <div style={{ fontSize:10, color:"#9ca3af", marginTop:3 }}>
                              Model weight: {f.importance}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/*Executive summary */}
            {result && (
              <Card style={{
                opacity:    summaryReady ? 1 : 0,
                transform:  summaryReady ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.6s ease, transform 0.6s ease",
              }}>
                <CardHeader icon="fa-file-lines" title="Executive Summary" />
                <div style={{ padding:"14px 18px", fontSize:13, color:"#374151", lineHeight:1.85 }}>
                  {isMal ? (
                    <>
                      This employee&apos;s activity has been flagged as{" "}
                      <strong style={{ color:"#dc2626" }}>potentially malicious</strong> with a
                      confidence of{" "}
                      <strong style={{ color:"#dc2626" }}>{result.confidence}%</strong>.
                      {result.flagged.length > 0 && (
                        <> The system identified {result.flagged.length} anomalous
                        indicator{result.flagged.length > 1 ? "s" : ""}:{" "}
                        <strong style={{ color:"#111827" }}>
                          {result.flagged.slice(0,3).map(f => f.label).join(", ")}
                        </strong>.</>
                      )}
                      <br /><br />
                      <strong>Recommended action:</strong> Escalate to the security team
                      immediately. Preserve all digital activity logs. Do not alert the
                      subject. Follow your organisation&apos;s Digital Forensic Readiness policy.
                    </>
                  ) : (
                    <>
                      This employee&apos;s recent activity is assessed as{" "}
                      <strong style={{ color:"#16a34a" }}>normal and within expected parameters
                      </strong> with{" "}
                      <strong style={{ color:"#16a34a" }}>{result.normal_prob}% confidence</strong>.
                      <br /><br />
                      <strong>Recommended action:</strong> No immediate action required.
                      Continue routine monitoring as per standard security policy.
                    </>
                  )}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
