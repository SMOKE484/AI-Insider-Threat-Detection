"use client";

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

function CardHeader({
  icon, title, iconColor = "#0d7c7c",
}: {
  icon: string; title: string; iconColor?: string;
}) {
  return (
    <div style={{
      padding:      "12px 18px",
      borderBottom: "1px solid #f3f4f6",
      display:      "flex",
      alignItems:   "center",
      gap:          8,
    }}>
      <i className={`fas ${icon}`} style={{ color: iconColor, fontSize: 14 }} />
      <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{title}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display:        "flex",
      justifyContent: "space-between",
      alignItems:     "baseline",
      padding:        "8px 0",
      borderBottom:   "1px solid #f9fafb",
      gap:            12,
    }}>
      <span style={{ fontSize: 12, color: "#6b7280", flexShrink: 0, width: "35%" }}>{label}</span>
      <span style={{ fontSize: 13, color: "#111827", fontWeight: 500, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function BulletRow({
  icon, title, desc, iconColor,
}: {
  icon: string; title: string; desc: string; iconColor: string;
}) {
  return (
    <div style={{
      display:      "flex",
      gap:          12,
      padding:      "8px 0",
      borderBottom: "1px solid #f9fafb",
    }}>
      <i
        className={`fas ${icon}`}
        style={{
          color:     iconColor,
          fontSize:  13,
          marginTop: 2,
          flexShrink:0,
          width:     16,
          textAlign: "center",
        }}
      />
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{title}</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2, lineHeight: 1.55 }}>{desc}</div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 1100 }}>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Project info */}
        <Card>
          <CardHeader icon="fa-graduation-cap" title="Project Information" />
          <div style={{ padding: "4px 18px 12px" }}>
            <InfoRow label="Module"      value="COS720 — Computer Information & Security I" />
            <InfoRow label="Institution" value="University of Pretoria" />
            <InfoRow label="Lecturer"    value="Mr S.M. Makura" />
            <InfoRow label="Due Date"    value="19 May 2026" />
            <InfoRow label="Dataset"     value="Kaggle Insider Threat Dataset · 118,614 records" />
            <InfoRow label="Model"       value="Random Forest · 100 estimators · max_depth=10" />
            <InfoRow label="Imbalance"   value="SMOTE oversampling applied to training set" />
            <InfoRow label="Features"    value="17 behavioural & employee profile indicators" />
          </div>
        </Card>

        {/* Research foundation */}
        <Card>
          <CardHeader icon="fa-book-open" title="Research Foundation" />
          <div style={{ padding: "14px 18px" }}>
            {/* Paper citation card */}
            <div style={{
              background:  "#f0f9ff",
              border:      "1px solid #bae6fd",
              borderLeft:  "4px solid #0d7c7c",
              borderRadius:8,
              padding:     "12px 14px",
              marginBottom:14,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0d7c7c" }}>
                Shoderu, Baror, Makura & Modupe (2025)
              </div>
              <div style={{ fontSize: 12, color: "#374151", fontStyle: "italic", marginTop: 3, lineHeight: 1.5 }}>
                Digital Forensic Readiness to Mitigate Insider Threats in the SaaS Cloud Environment
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                The Indonesian Journal of Computer Science, 14(6)
              </div>
            </div>

            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.8 }}>
              The paper&apos;s{" "}
              <strong style={{ color: "#111827" }}>DFR-BUST framework</strong> identifies
              that most ML-based detection systems focus purely on accuracy and lack
              forensic explainability. This prototype directly addresses that gap by
              embedding{" "}
              <strong style={{ color: "#111827" }}>plain-language explanations</strong>{" "}
              alongside every classification decision — bridging detection and investigation.
            </p>

            <div style={{
              marginTop: 12, background: "#f9fafb",
              borderRadius: 6, padding: "8px 12px",
              fontSize: 12, color: "#6b7280", lineHeight: 1.6,
            }}>
              <strong style={{ color: "#111827" }}>Literature gap addressed:</strong>{" "}
              No existing work aligned forensic readiness with anomaly-based monitoring
              under ISO 27043 principles. This project&apos;s explainability feature
              directly addresses that gap.
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Ethical considerations */}
        <Card style={{ borderTop: "3px solid #d97706" }}>
          <CardHeader icon="fa-scale-balanced" title="Ethical Considerations" iconColor="#d97706" />
          <div style={{ padding: "4px 18px 12px" }}>
            <BulletRow
              icon="fa-shield-check"
              iconColor="#0d7c7c"
              title="Excluded sensitive features"
              desc="Employee nationality and medical history were deliberately removed from the model to prevent discriminatory profiling."
            />
            <BulletRow
              icon="fa-user-check"
              iconColor="#0d7c7c"
              title="Human oversight required"
              desc="This system supports investigators — it does not replace them. All flagged cases require human review before action."
            />
            <BulletRow
              icon="fa-file-contract"
              iconColor="#0d7c7c"
              title="Policy requirement"
              desc="Employee monitoring should only occur under a clearly communicated, documented organisational security policy."
            />
            <BulletRow
              icon="fa-eye-slash"
              iconColor="#0d7c7c"
              title="Decision support only"
              desc="Risk scores must never serve as the sole basis for disciplinary or legal action against an employee."
            />
          </div>
        </Card>

        {/* Limitations */}
        <Card style={{ borderTop: "3px solid #dc2626" }}>
          <CardHeader icon="fa-triangle-exclamation" title="Known Limitations" iconColor="#dc2626" />
          <div style={{ padding: "4px 18px 12px" }}>
            <BulletRow
              icon="fa-circle-xmark"
              iconColor="#dc2626"
              title="281 false negatives"
              desc="Sophisticated insiders who deliberately mirror normal behavioural patterns may evade detection entirely."
            />
            <BulletRow
              icon="fa-bell-slash"
              iconColor="#dc2626"
              title="910 false positives"
              desc="Risk of analyst alert fatigue if deployed without decision threshold tuning and triage workflows."
            />
            <BulletRow
              icon="fa-database"
              iconColor="#dc2626"
              title="Synthetic training data"
              desc="Model was trained on synthetic records — real-world performance may vary significantly by environment."
            />
            <BulletRow
              icon="fa-sliders"
              iconColor="#d97706"
              title="CSV encoding limitation"
              desc="Upload mode uses a fresh LabelEncoder per file. Production should reuse saved training encoders for consistency."
            />
          </div>
        </Card>
      </div>
    </div>
  );
}