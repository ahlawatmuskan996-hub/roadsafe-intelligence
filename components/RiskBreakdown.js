import { LEVEL_STYLES } from "@/lib/risk";

export default function RiskBreakdown({ breakdown, levelKey = "moderate" }) {
  const maxPoints = Math.max(...breakdown.map((f) => f.points), 1);
  const st = LEVEL_STYLES[levelKey];

  return (
    <div className="space-y-3.5">
      {breakdown.map((f) => (
        <div key={f.key}>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[12px] text-muted">{f.label}</span>
            <span className="tabular font-mono text-[11px] text-faint">
              {f.value} <span className="text-faint">·</span>{" "}
              <span className={st.text}>+{f.points}</span>
            </span>
          </div>
          <div className="h-px overflow-hidden bg-white/10">
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${(f.points / maxPoints) * 100}%`, background: st.hex }}
            />
          </div>
        </div>
      ))}
      <p className="pt-1 text-[10px] text-faint">
        Contribution in points toward the out-of-100 risk score.
      </p>
    </div>
  );
}