"use client";

import { useMemo, useState } from "react";
import { segments } from "@/data/indiaRoadData";
import { computeRisk, forecastSegment, isRiskRising } from "@/lib/risk";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

const TOOLTIP_STYLE = {
  backgroundColor: "#11110f",
  border: "1px solid #3a3a35",
  borderRadius: 6,
  fontSize: 11,
  color: "#f3f3ee",
};

export default function PredictivePanel() {
  const rising = useMemo(() => segments.filter(isRiskRising), []);
  const [focusId, setFocusId] = useState(rising[0]?.id ?? segments[0].id);
  const focus = segments.find((s) => s.id === focusId);
  const focusRisk = computeRisk(focus);
  const forecast = useMemo(() => (focus ? forecastSegment(focus, 7) : []), [focus]);
  const crossesHigh = forecast.some((d) => d.score > 60);
  const peak = Math.max(...forecast.map((d) => d.score));

  return (
    <div className="animate-fade-up grid gap-6 lg:grid-cols-3">
      <div className="panel p-5 lg:col-span-2">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl uppercase tracking-wide text-white">7-Day Projection</h3>
            <p className="mt-1 font-mono text-[11px] text-faint">
              <span className="text-muted">{focus.city}</span> · {focus.name} · current{" "}
              <span className="tabular text-ink">{focusRisk.score}</span>
            </p>
          </div>
          <select value={focusId} onChange={(e) => setFocusId(e.target.value)} className="quiet-input !w-auto">
            {segments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.city} — {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecast} margin={{ top: 10, right: 10, left: -26, bottom: 0 }}>
              <defs>
                <linearGradient id="fc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f3f3ee" stopOpacity={0.14} />
                  <stop offset="100%" stopColor="#f3f3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1a" />
              <XAxis dataKey="day" tick={{ fill: "#666660", fontSize: 10.5 }} axisLine={{ stroke: "#2c2c28" }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#666660", fontSize: 10.5 }} axisLine={{ stroke: "#2c2c28" }} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <ReferenceLine y={60} stroke="#c9513f" strokeOpacity={0.6} strokeDasharray="5 4" />
              <ReferenceLine
                y={focusRisk.score}
                stroke="#f3f3ee"
                strokeOpacity={0.5}
                strokeDasharray="4 4"
                label={{ value: "today", fill: "#9a9a92", fontSize: 10.5, position: "insideTopLeft" }}
              />
              <Area type="monotone" dataKey="score" stroke="none" fill="url(#fc)" />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#f3f3ee"
                strokeWidth={2.2}
                dot={{ r: 3.5, fill: "#f3f3ee", strokeWidth: 0 }}
                activeDot={{ r: 5.5, fill: "#f3f3ee", strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 font-mono text-[10.5px] uppercase tracking-wider">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-muted">
            trend <span className={crossesHigh ? "text-risk" : "text-ink"}>{focus.trend}</span>
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-muted">
            peak <span className="tabular text-ink">{peak}</span>
          </span>
          {crossesHigh && (
            <span className="rounded-full border border-risk/40 bg-risk/10 px-3 py-1 font-semibold text-risk">
              ⚠ crosses HIGH within 7 days
            </span>
          )}
        </div>
      </div>

      <div className="panel p-5">
        <div className="mb-1 flex items-center gap-2">
          <span className="dot-pulse text-risk" />
          <h3 className="font-display text-[13px] uppercase tracking-wide text-ink">
            Rising-Risk Alerts
          </h3>
        </div>
        <p className="kicker mb-4">Trending toward HIGH in the next 7 days</p>
        <div className="space-y-2">
          {rising.length === 0 ? (
            <div className="rounded-md border border-safe/30 bg-safe/[0.06] px-3 py-4 text-center text-[12px] text-safe">
              ✓ No stretch forecast to cross the high-risk threshold.
            </div>
          ) : (
            rising.map((s) => {
              const r = computeRisk(s);
              const pk = Math.max(...forecastSegment(s, 7).map((d) => d.score));
              const isFocus = s.id === focusId;
              return (
                <button
                  key={s.id}
                  onClick={() => setFocusId(s.id)}
                  className={`w-full rounded-md border px-3 py-2.5 text-left transition-colors ${
                    isFocus
                      ? "border-white/50 bg-white/[0.06]"
                      : "border-white/10 bg-panel hover:border-white/30 hover:bg-raised"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[12px] font-medium text-ink">{s.name}</span>
                    <span className="tabular shrink-0 font-mono text-[11px] font-semibold text-risk">
                      {r.score} → {pk}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[9.5px] uppercase tracking-wider text-faint">
                    {s.city} · {s.accidents30} crash/30d
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}