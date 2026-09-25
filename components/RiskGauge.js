import { useId } from "react";
import { riskLevel, LEVEL_STYLES } from "@/lib/risk";

const TICKS = [
  { f: 0, label: "0" },
  { f: 0.3, label: "30" },
  { f: 0.6, label: "60" },
  { f: 1, label: "100" },
];

export default function RiskGauge({ score, size = 104 }) {
  const id = useId();
  const level = riskLevel(score);
  const st = LEVEL_STYLES[level.key];
  const r = 50;
  const cx = 60;
  const cy = 56;
  const arcLen = Math.PI * r;
  const filled = (score / 100) * arcLen;
  const gradId = `g${id.replace(/:/g, "")}`;

  const pos = (f) => {
    const a = (1 - f) * Math.PI;
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
  };

  return (
    <div className="inline-flex flex-col items-center">
      <svg width={size} height={size * 0.6} viewBox="0 0 120 68" className="overflow-visible">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={st.hex} stopOpacity="0.35" />
            <stop offset="100%" stopColor={st.hex} />
          </linearGradient>
        </defs>

        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#1e1e1c"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${arcLen}`}
          style={{ transition: "stroke-dasharray 0.7s cubic-bezier(0.4,0,0.2,1)" }}
        />

        {TICKS.map((t) => {
          const p = pos(t.f);
          const start = pos(Math.max(0, t.f - 0.012));
          const end = pos(Math.min(1, t.f + 0.012));
          return (
            <g key={t.label}>
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="#4a4a44"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <text
                x={p.x}
                y={p.y + 12}
                textAnchor="middle"
                style={{ fontSize: 7, fontWeight: 500 }}
                className="fill-muted"
              >
                {t.label}
              </text>
            </g>
          );
        })}

        <text
          x={cx}
          y={cy + 2}
          textAnchor="middle"
          className="tabular fill-ink"
          style={{ fontSize: 24, fontWeight: 700 }}
        >
          {score}
        </text>
      </svg>
      <span
        className={`mt-1 flex items-center gap-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-widest ${st.text}`}
      >
        <span className={`h-1 w-1 rounded-full ${st.dot}`} />
        {level.label}
      </span>
    </div>
  );
}