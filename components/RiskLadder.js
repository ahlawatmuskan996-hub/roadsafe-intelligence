"use client";

import { useMemo } from "react";
import { segments } from "@/data/indiaRoadData";
import { computeRisk, LEVEL_STYLES } from "@/lib/risk";

export default function RiskLadder({ onSelectSegment, onSelectCity }) {
  const ranked = useMemo(
    () =>
      segments
        .map((s) => {
          const r = computeRisk(s);
          return { s, score: r.score, level: r.level.key, top: r.breakdown[0] };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 10),
    []
  );

  const max = ranked[0]?.score ?? 60;

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-end justify-between">
        <h3 className="font-display text-lg uppercase tracking-wide text-white">
          National Risk Ladder
        </h3>
        <span className="kicker !text-[9px]">top 10 stress points · tap to inspect</span>
      </div>
      <div className="overflow-hidden rounded-lg border border-white/15">
        {ranked.map(({ s, score, level, top }, i) => {
          const st = LEVEL_STYLES[level];
          return (
            <button
              key={s.id}
              onClick={() => {
                onSelectCity(s.city);
                onSelectSegment(s);
              }}
              className="group flex w-full items-center gap-3 border-b border-white/10 bg-panel px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-raised"
            >
              <span className="w-6 shrink-0 font-display text-[13px] text-faint">{String(i + 1).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-[12px] font-medium text-ink">
                    <span className="text-faint">{s.city} ·</span> {s.name}
                  </span>
                  <span className={`shrink-0 tabular font-mono text-[12px] font-semibold ${st.text}`}>
                    {score}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="relative h-[3px] flex-1 bg-white/[0.08]">
                    <div
                      className="absolute inset-y-0 left-0 transition-all duration-700 ease-out"
                      style={{ width: `${(score / max) * 100}%`, background: st.hex }}
                    />
                  </div>
                  <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-faint">
                    {s.trend === "Rising" ? "▲" : s.trend === "Falling" ? "▼" : "—"} {top.label} +{top.points}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}