export default function SafetyRecommendations({ recommendations }) {
  if (!recommendations.length) {
    return (
      <div className="rounded-md border border-safe/30 bg-safe/[0.06] px-4 py-3.5 text-[12px] text-safe">
        ✓ No critical risk drivers detected — maintain routine inspection and speed enforcement.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((r) => (
        <div key={r.key} className="rounded-md border border-white/10 bg-raised/60 p-4">
          <div className="flex items-center justify-between gap-2">
            <h5 className="font-display text-[13px] uppercase tracking-wide text-ink">{r.title}</h5>
            <span className="font-mono text-[10px] font-semibold text-muted">+{r.points} pts</span>
          </div>
          <ul className="mt-2.5 space-y-1.5">
            {r.actions.map((a) => (
              <li key={a} className="flex items-start gap-2 text-[12px] leading-relaxed text-muted">
                <span className="mt-[7px] h-px w-3 shrink-0 bg-white/30" />
                {a}
              </li>
            ))}
          </ul>
          <div className="hairline mt-3 flex items-center justify-between pt-2.5 font-mono text-[10.5px]">
            <span className="text-faint">
              est. cost <span className="tabular text-muted">{r.cost}</span>
            </span>
            <span className="text-safe">↓ ~{r.reduction}% risk</span>
          </div>
        </div>
      ))}
    </div>
  );
}