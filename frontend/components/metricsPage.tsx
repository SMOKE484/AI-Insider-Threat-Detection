"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const FEATURE_IMPORTANCE = [
  { feature: "total_files_burned",          importance: 0.449 },
  { feature: "total_printed_pages",         importance: 0.228 },
  { feature: "num_printed_pages_off_hours", importance: 0.091 },
  { feature: "employee_position",           importance: 0.052 },
  { feature: "num_unique_campus",           importance: 0.038 },
  { feature: "employee_department",         importance: 0.035 },
  { feature: "employee_seniority_years",    importance: 0.032 },
  { feature: "hostility_country_level",     importance: 0.018 },
  { feature: "is_contractor",              importance: 0.016 },
  { feature: "employee_classification",     importance: 0.014 },
];

// ── Shared components ─────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background:   "#ffffff",
      border:       "1px solid #e5e7eb",
      borderRadius: 12,
      overflow:     "hidden",
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{
      padding:      "12px 18px",
      borderBottom: "1px solid #f3f4f6",
      display:      "flex",
      alignItems:   "center",
      gap:          8,
    }}>
      <i className={`fas ${icon}`} style={{ color: "#0d7c7c", fontSize: 14 }} />
      <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{title}</span>
    </div>
  );
}

function KpiCard({
  icon, label, value, sub, color, iconBg,
}: {
  icon: string; label: string; value: string;
  sub: string; color: string; iconBg: string;
}) {
  return (
    <Card>
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: iconBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <i className={`fas ${icon}`} style={{ color, fontSize: 18 }} />
          </div>
          <span style={{
            fontSize: 11, color: "#9ca3af",
            textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600,
          }}>
            {label}
          </span>
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>{sub}</div>
      </div>
    </Card>
  );
}

// ── Custom tooltip for recharts ───────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#ffffff", border: "1px solid #e5e7eb",
      borderRadius: 8, padding: "8px 12px", fontSize: 12,
    }}>
      <div style={{ color: "#111827", fontWeight: 600, marginBottom: 2 }}>
        {label?.replace(/_/g, " ")}
      </div>
      <div style={{ color: "#0d7c7c", fontWeight: 700 }}>
        {payload[0].value.toFixed(3)}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function MetricsPage() {
  return (
    <div style={{ maxWidth: 1200 }}>

      {/* ── KPI row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        <KpiCard icon="fa-bullseye"        label="Accuracy"  value="94.98%" sub="Overall correct predictions" color="#0d7c7c" iconBg="#e6f7f7" />
        <KpiCard icon="fa-crosshairs"      label="Precision" value="52.26%" sub="Of flagged — truly malicious" color="#d97706" iconBg="#fffbeb" />
        <KpiCard icon="fa-magnifying-glass"label="Recall"    value="78.00%" sub="Actual threats detected"      color="#16a34a" iconBg="#f0fdf4" />
        <KpiCard icon="fa-scale-balanced"  label="F1-Score"  value="62.58%" sub="Precision-recall balance"     color="#0d7c7c" iconBg="#e6f7f7" />
      </div>

      {/* ── Main grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>

        {/* Feature importance */}
        <Card>
          <CardHeader icon="fa-chart-bar" title="Feature Importance — Random Forest" />
          <div style={{ padding: "16px" }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={FEATURE_IMPORTANCE}
                layout="vertical"
                margin={{ left: 10, right: 40, top: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="feature"
                  tick={{ fill: "#374151", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={175}
                  tickFormatter={v => v.replace(/_/g, " ")}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]} fill="#3b82f6"
                  label={{
                    position: "right",
                    fill: "#64748b",
                    fontSize: 10,
                    formatter: (v: unknown) => Number(v ?? 0).toFixed(3),
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
            <div style={{
              marginTop: 12, fontSize: 12, color: "#6b7280",
              background: "#f9fafb", borderRadius: 6,
              padding: "8px 12px", lineHeight: 1.6,
            }}>
              <strong style={{ color: "#111827" }}>Key insight:</strong>{" "}
              <code style={{ background: "#f3f4f6", padding: "1px 5px", borderRadius: 3,
                fontSize: 11 }}>total_files_burned</code> and{" "}
              <code style={{ background: "#f3f4f6", padding: "1px 5px", borderRadius: 3,
                fontSize: 11 }}>total_printed_pages</code>{" "}
              together account for over 67% of model decisions — the clearest behavioural signals of data exfiltration.
            </div>
          </div>
        </Card>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Confusion matrix */}
          <Card>
            <CardHeader icon="fa-table-cells" title="Confusion Matrix — Test Set" />
            <div style={{ padding: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label:"True Positives",  val:"996",    desc:"Threats correctly detected",  color:"#16a34a", bg:"#f0fdf4", border:"#bbf7d0" },
                  { label:"False Negatives", val:"281",    desc:"Missed threats — critical",   color:"#dc2626", bg:"#fef2f2", border:"#fecaca" },
                  { label:"False Positives", val:"910",    desc:"False alarms",                color:"#d97706", bg:"#fffbeb", border:"#fde68a" },
                  { label:"True Negatives",  val:"21,536", desc:"Normal correctly cleared",    color:"#16a34a", bg:"#f0fdf4", border:"#bbf7d0" },
                ].map(({ label, val, desc, color, bg, border }) => (
                  <div key={label} style={{
                    background: bg, border: `1px solid ${border}`,
                    borderRadius: 8, padding: "12px 14px",
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color, marginTop: 3 }}>{label}</div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 12, fontSize: 11, color: "#6b7280",
                borderTop: "1px solid #f3f4f6", paddingTop: 10,
              }}>
                Total test records: <strong style={{ color: "#111827" }}>23,723</strong>
                {" · "}20% stratified split{" · "}SMOTE on training
              </div>
            </div>
          </Card>

          {/* Model comparison */}
          <Card>
            <CardHeader icon="fa-code-compare" title="Decision Tree vs Random Forest" />
            <div style={{ padding: "16px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    {["Metric", "Decision Tree", "Random Forest ✓"].map(h => (
                      <th key={h} style={{
                        padding:       "6px 8px",
                        textAlign:     "left",
                        fontSize:      10,
                        color:         "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontWeight:    600,
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Accuracy",  "90.72%", "94.98%"],
                    ["Precision", "33.91%", "52.26%"],
                    ["Recall",    "76.27%", "78.00%"],
                    ["F1-Score",  "46.95%", "62.58%"],
                  ].map(([metric, dt, rf]) => (
                    <tr key={metric} style={{ borderBottom: "1px solid #f9fafb" }}>
                      <td style={{ padding: "9px 8px", fontSize: 13, color: "#374151" }}>{metric}</td>
                      <td style={{ padding: "9px 8px", fontSize: 13, color: "#9ca3af" }}>{dt}</td>
                      <td style={{ padding: "9px 8px", fontSize: 13, color: "#16a34a", fontWeight: 700 }}>{rf}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{
                marginTop: 10, background: "#f9fafb",
                borderRadius: 6, padding: "8px 12px",
                fontSize: 12, color: "#6b7280", lineHeight: 1.7,
              }}>
                <strong style={{ color: "#0d7c7c" }}>Why Random Forest:</strong>{" "}
                Outperforms the Decision Tree on every metric. The +18% precision
                improvement reduces analyst alert fatigue, and native feature importance
                enables the explainability required by the project specification.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}