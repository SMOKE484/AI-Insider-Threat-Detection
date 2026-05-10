"use client";
import { useEffect, useRef, useState, useCallback } from "react";

/* ────────────────────────────────────────────────────────────────────────────
   RiskGauge — rewritten for a light-themed dashboard
   ───────────────────────────────────────────────────────────────────────────
   Key changes vs. the original:
   • Prop renamed `targetValue` → `threatScore` — semantically unambiguous.
     Always pass a 0–100 threat-aligned score (higher = more risk), NOT the
     model's raw confidence (which is confidence-in-prediction and inverts
     its colour meaning when the prediction is "Normal").
   • Optional `riskLevel` prop lets the backend's own classification drive the
     badge text, avoiding threshold mismatches between FE and BE.
   • Light theme matches the white cards around it instead of being an orphan.
   • Removed redundant LOW / MED / HIGH arc labels and the "CONFIDENCE" label
     — the badge at the bottom already conveys this.
   • Ease-out cubic instead of back-ease-out: no jitter overshoot on a
     security tool.
   • ARIA: role="img", aria-label, aria-valuenow/min/max so screen readers
     and automated tests can read the value.
   ────────────────────────────────────────────────────────────────────────── */

// ─── Geometry ─────────────────────────────────────────────────────────────────
const CX = 220;
const CY = 215;
const R  = 148;
const SA = -115;   // start angle (lower-left)
const EA =  115;   // end angle   (lower-right)
const SW =  22;    // stroke width

const polar = (deg: number, r = R) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return {
    x: +(CX + r * Math.cos(rad)).toFixed(2),
    y: +(CY + r * Math.sin(rad)).toFixed(2),
  };
};

const arc = (r: number, a1: number, a2: number): string => {
  if (Math.abs(a2 - a1) < 0.01) return "";
  const s = polar(a1, r);
  const e = polar(a2, r);
  const span = ((a2 - a1) + 720) % 360;
  const large = span > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
};

const v2a = (v: number) => SA + (v / 100) * (EA - SA);

// Risk bands — align with the semantic colours used elsewhere on the page
const LOW_MAX = 40;
const MED_MAX = 70;

const zoneColor = (v: number) =>
  v >= MED_MAX ? "#dc2626" : v >= LOW_MAX ? "#d97706" : "#16a34a";

const defaultLabel = (v: number) =>
  v >= MED_MAX ? "HIGH RISK" : v >= LOW_MAX ? "MEDIUM RISK" : "LOW RISK";

// Clean ease — settles precisely on target (no spring overshoot)
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// ─── Component ────────────────────────────────────────────────────────────────
export default function RiskGauge({
  threatScore,
  riskLevel,
  isLoading = false,
}: {
  /** 0–100 threat-aligned score. Higher = more risk. Pass `result.threat_prob`, NOT confidence. */
  threatScore: number;
  /** Optional override for the badge text (e.g. "HIGH", "MEDIUM"). Falls back to threshold-derived label. */
  riskLevel?: string;
  isLoading?: boolean;
}) {
  // ── Animated value (eased) ─────────────────────────────────────────────────
  const [anim, setAnim]   = useState(0);
  const frameRef          = useRef<number>(0);
  const stateRef          = useRef({ from: 0 });

  const run = useCallback((to: number) => {
    const from = stateRef.current.from;
    cancelAnimationFrame(frameRef.current);
    let t0 = 0;
    const tick = (now: number) => {
      if (!t0) t0 = now;
      const t = Math.min((now - t0) / 1200, 1);
      setAnim(from + (to - from) * easeOutCubic(t));
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
      else       { setAnim(to); stateRef.current.from = to; }
    };
    frameRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => { if (!isLoading) run(threatScore); }, [threatScore, isLoading, run]);
  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  // ── Loading indeterminate sweep ────────────────────────────────────────────
  const [pulse, setPulse] = useState(15);
  const pulseRef          = useRef<number>(0);
  useEffect(() => {
    if (!isLoading) { cancelAnimationFrame(pulseRef.current); return; }
    let t0 = 0;
    const tick = (now: number) => {
      if (!t0) t0 = now;
      setPulse(18 + 12 * Math.sin(((now - t0) % 2000) / 2000 * Math.PI * 2));
      pulseRef.current = requestAnimationFrame(tick);
    };
    pulseRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(pulseRef.current);
  }, [isLoading]);

  // ── Derived display values ─────────────────────────────────────────────────
  const live    = isLoading ? pulse : anim;
  const clipped = Math.max(0, Math.min(live, 100));
  const shown   = Math.round(clipped);
  const c       = zoneColor(clipped);

  // Badge text: prefer the backend-provided risk_level for consistency
  const badge = (() => {
    if (!riskLevel) return defaultLabel(clipped);
    const u = riskLevel.toUpperCase().trim();
    return u.endsWith("RISK") ? u : `${u} RISK`;
  })();

  const needleDeg = Math.max(SA - 3, Math.min(v2a(live), EA + 3));
  const tip       = polar(needleDeg, 132);
  const tail      = polar(needleDeg + 180, 26);

  const a40 = v2a(LOW_MAX);
  const a70 = v2a(MED_MAX);

  const TICKS = [0, 25, 50, 75, 100];
  const label0   = polar(SA, R + 28);
  const label100 = polar(EA, R + 28);

  return (
    <svg
      viewBox="0 0 440 310"
      width="100%"
      role="img"
      aria-label={
        isLoading
          ? "Calculating threat score"
          : `Threat score ${shown} out of 100, ${badge.toLowerCase()}`
      }
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={shown}
      style={{ maxWidth: 420, display: "block", margin: "0 auto" }}
    >
      {/* 1 ── Soft track ── */}
      <path
        d={arc(R, SA, EA)}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth={SW}
        strokeLinecap="round"
      />

      {/* 2 ── Zone tints — visible on white without dominating ── */}
      <path d={arc(R, SA,  a40)} fill="none" stroke="#16a34a" strokeWidth={SW} strokeLinecap="butt" opacity={0.14} />
      <path d={arc(R, a40, a70)} fill="none" stroke="#d97706" strokeWidth={SW} strokeLinecap="butt" opacity={0.14} />
      <path d={arc(R, a70, EA)}  fill="none" stroke="#dc2626" strokeWidth={SW} strokeLinecap="butt" opacity={0.14} />

      {/* 3 ── Active fill ── */}
      {clipped > 0.5 && (
        <path
          d={arc(R, SA, v2a(clipped))}
          fill="none"
          stroke={c}
          strokeWidth={SW}
          strokeLinecap="round"
        />
      )}

      {/* 4 ── Zone dividers — white notches through the track ── */}
      {[a40, a70].map((a, i) => {
        const o   = polar(a, R + 13);
        const inn = polar(a, R - 13);
        return (
          <line key={i}
            x1={o.x} y1={o.y} x2={inn.x} y2={inn.y}
            stroke="#ffffff" strokeWidth={3} strokeLinecap="round"
          />
        );
      })}

      {/* 5 ── Major tick marks ── */}
      {TICKS.map(v => {
        const a = v2a(v);
        const o = polar(a, R + 17);
        const i = polar(a, R + 9);
        return (
          <line key={v}
            x1={o.x} y1={o.y} x2={i.x} y2={i.y}
            stroke={v <= clipped ? c : "#cbd5e1"}
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      })}

      {/* 6 ── Endpoint labels (0 / 100) ── */}
      <text x={label0.x}  y={label0.y}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={11} fill="#94a3b8" fontFamily="Inter, system-ui, sans-serif">0</text>
      <text x={label100.x} y={label100.y}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={11} fill="#94a3b8" fontFamily="Inter, system-ui, sans-serif">100</text>

      {/* 7 ── Needle shadow + body ── */}
      <line x1={tail.x} y1={tail.y} x2={tip.x} y2={tip.y}
        stroke="rgba(15,23,42,0.12)" strokeWidth={5} strokeLinecap="round"
        transform="translate(1.5,2)"
      />
      <line x1={tail.x} y1={tail.y} x2={tip.x} y2={tip.y}
        stroke="#334155" strokeWidth={3} strokeLinecap="round"
      />

      {/* 8 ── Centre pin ── */}
      <circle cx={CX} cy={CY} r={13} fill="#ffffff" stroke={isLoading ? "#e2e8f0" : c} strokeWidth={2.5} />
      <circle cx={CX} cy={CY} r={5}  fill={isLoading ? "#cbd5e1" : c} />

      {/* 9 ── Big score with a "%" that scales with the number ── */}
      <text x={CX} y={CY - 42}
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
      >
        <tspan fontSize={58} fontWeight={800} fill={isLoading ? "#94a3b8" : c} letterSpacing="-2">
          {isLoading ? "—" : shown}
        </tspan>
        {!isLoading && (
          <tspan fontSize={22} fontWeight={600} fill={c} opacity={0.6} dx="3" dy="-10">%</tspan>
        )}
      </text>

      {/* 10 ── Risk badge pill — single source of truth for the label ── */}
      {isLoading ? (
        <text x={CX} y={CY + 32}
          textAnchor="middle" fontSize={12} fill="#94a3b8"
          fontFamily="Inter, system-ui, sans-serif">
          Analysing…
        </text>
      ) : (
        <>
          <rect
            x={CX - 62} y={CY + 18}
            width={124} height={26}
            rx={13}
            fill={`${c}14`}
            stroke={`${c}40`}
            strokeWidth={1}
          />
          <text x={CX} y={CY + 35}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={11} fontWeight={700} fill={c}
            fontFamily="Inter, system-ui, sans-serif"
            letterSpacing={1.4}
          >
            {badge}
          </text>
        </>
      )}
    </svg>
  );
}