"use client";

import { useMemo, useState } from "react";
import { segments } from "@/data/indiaRoadData";
import { computeRisk, LEVEL_STYLES } from "@/lib/risk";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const TOOLTIP_STYLE = {
  backgroundColor: "#11110f",
  border: "1px solid #3a3a35",
  borderRadius: 6,
  fontSize: 11,
  color: "#f3f3ee",
};
const SERIES_A = "#f3f3ee";
const SERIES_B = "#8b8b84";

export default function CompareView() {
  const opts = useMemo(() => segments.map((s) => s.id), []);
  const [aId, setAId] = useState(segments[0].id);
  const [bId, setBId] = useState(segments[1].id);

  const segA = segments.find((s) => s.id === aId);
  const segB = segments.find((s) => s.id === bId);
  const riskA = computeRisk(segA);
  const riskB = computeRisk(segB);

  const barData = riskA.breakdown.map((fa) => {
    const fb = riskB.breakdown.find((f) => f.key === fa.key);
    return { factor: fa.label, A: fa.value, B: fb ? fb.value : 0 };
  });

  const radarData = riskA.breakdown.map((fa, i) => ({
    factor: fa.label.replace(" ", "\n"),
    A: fa.value,
    B: riskB.breakdown[i].value,
  }));

  const diff = riskA.score - riskB.score;

  const verdict = () => {
    if (diff === 0)
      return "Both stretches score identically today.";
    const winner = diff < 0 ? segA : segB;
    const loser = diff < 0 ? segB : segA;
    return `${winner.name} (${winner.city}) is ${Math.abs(diff)} pts SAFER than ${loser.name} (${loser.city}).`;
  };

  const panel = (seg, risk, label) => {
    const st = LEVEL_STYLES[risk.level.key];
    const top = risk.breakdown[0];
    return (
      <div className="panel p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="kicker !text-[9px]">
              {label} · {seg.city}
            </div>
            <h4 className="mt-1 truncate text-[13px] font-medium text-ink">{seg.name}</h4>
          </div>
          <div className="shrink-0 text-right">
            <div className={`tabular font-display text-4xl leading-none ${st.text}`}>{risk.score}</div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-faint">{risk.level.label}</div>
          </div>
        </div>
        <div className="hairline mt-3.5 space-y-1.5 border-t-0 pt-3 font-mono text-[11px]">
          {[
            ["crashes / 30d", seg.accidents30],
            ["traffic load", seg.trafficDensity],
            ["weather", seg.weather],
            ["visibility", seg.visibility],
            ["top driver", `${top.label} +${top.points}`],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between">
              <span className="text-faint">{k}</span>
              <span className="tabular text-muted">{v}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h3 className="font-display text-2xl uppercase tracking-wide text-white">Head-to-Head</h3>
        <p className="kicker mt-1">Compare any two stretches — risk, factors, crash load</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <select value={aId} onChange={(e) => setAId(e.target.value)} className="quiet-input">
          {opts.map((id) => {
            const s = segments.find((x) => x.id === id);
            return (
              <option key={id} value={id}>
                {s.city} — {s.name}
              </option>
            );
          })}
        </select>
        <select value={bId} onChange={(e) => setBId(e.target.value)} className="quiet-input">
          {opts.map((id) => {
            const s = segments.find((x) => x.id === id);
            return (
              <option key={id} value={id}>
                {s.city} — {s.name}
              </option>
            );
          })}
        </select>
      </div>

      <div className="flex items-center gap-3 rounded-md border border-white/15 bg-white/[0.03] px-4 py-3">
        <span className="font-display text-lg text-white">⚑</span>
        <p className="font-display text-[13px] uppercase tracking-wide text-ink">{verdict()}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {panel(segA, riskA, "A")}
        {panel(segB, riskB, "B")}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-5">
          <h4 className="mb-4 font-display text-[13px] uppercase tracking-wide text-ink">
            Factor Comparison
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1a" />
                <XAxis dataKey="factor" tick={{ fill: "#666660", fontSize: 10 }} axisLine={{ stroke: "#2c2c28" }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#666660", fontSize: 10 }} axisLine={{ stroke: "#2c2c28" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="A" name={`A · ${segA.city}`} fill={SERIES_A} radius={[2, 2, 0, 0]} />
                <Bar dataKey="B" name={`B · ${segB.city}`} fill={SERIES_B} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <h4 className="mb-4 font-display text-[13px] uppercase tracking-wide text-ink">
            Risk Profile Radar
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="#2c2c28" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="factor" tick={{ fill: "#666660", fontSize: 9.5 }} axisLine={false} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#4a4a44", fontSize: 9 }} axisLine={{ stroke: "#2c2c28" }} />
                <Radar name={`A · ${segA.city}`} dataKey="A" stroke={SERIES_A} fill={SERIES_A} fillOpacity={0.14} />
                <Radar name={`B · ${segB.city}`} dataKey="B" stroke={SERIES_B} fill={SERIES_B} fillOpacity={0.14} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}