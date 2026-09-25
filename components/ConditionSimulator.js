"use client";

import { useState } from "react";
import {
  computeRisk,
  buildRecommendations,
  impactMessage,
  WEATHER_OPTIONS,
  VISIBILITY_OPTIONS,
  ROAD_OPTIONS,
  LEVEL_STYLES,
} from "@/lib/risk";
import RiskGauge from "./RiskGauge";
import RiskBreakdown from "./RiskBreakdown";
import SafetyRecommendations from "./SafetyRecommendations";

export default function ConditionSimulator({ segment }) {
  const base = computeRisk(segment);
  const [state, setState] = useState({
    weather: segment.weather,
    visibility: segment.visibility,
    roadCondition: segment.roadCondition,
    trafficDensity: segment.trafficDensity,
    speedCompliance: segment.speedCompliance,
  });

  const current = computeRisk({ ...segment, ...state });
  const delta = current.score - base.score;
  const recs = buildRecommendations(current.breakdown);
  const st = LEVEL_STYLES[current.level.key];

  if (!segment) return null;

  const Select = ({ label, value, onChange, options }) => (
    <label className="block">
      <span className="kicker mb-1 block">{label}</span>
      <select value={value} onChange={onChange} className="quiet-input">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );

  const Slider = ({ label, value, onInput, suffix }) => (
    <label className="block">
      <span className="mb-1 flex justify-between">
        <span className="kicker">{label}</span>
        <span className="tabular font-mono text-[11px] text-ink">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={suffix === "%" ? 10 : 20}
        max={suffix === "%" ? 95 : 100}
        value={value}
        onChange={onInput}
        className="h-[3px] w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#f3f3ee]"
      />
    </label>
  );

  const isBase = JSON.stringify(state) === JSON.stringify({
    weather: segment.weather,
    visibility: segment.visibility,
    roadCondition: segment.roadCondition,
    trafficDensity: segment.trafficDensity,
    speedCompliance: segment.speedCompliance,
  });

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      {/* Controls */}
      <div className="panel p-5 lg:col-span-2">
        <h4 className="mb-0.5 text-[13.5px] font-medium text-ink">{segment.name}</h4>
        <p className="mb-5 font-mono text-[10.5px] text-faint">
          {segment.city} · baseline risk{" "}
          <span className="tabular text-muted">{base.score}</span>
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Select
              label="Weather"
              value={state.weather}
              onChange={(e) => setState({ ...state, weather: e.target.value })}
              options={WEATHER_OPTIONS}
            />
            <Select
              label="Visibility"
              value={state.visibility}
              onChange={(e) => setState({ ...state, visibility: e.target.value })}
              options={VISIBILITY_OPTIONS}
            />
            <Select
              label="Road"
              value={state.roadCondition}
              onChange={(e) => setState({ ...state, roadCondition: e.target.value })}
              options={ROAD_OPTIONS}
            />
          </div>
          <Slider
            label="Traffic Density"
            value={state.trafficDensity}
            onInput={(e) => setState({ ...state, trafficDensity: Number(e.target.value) })}
          />
          <Slider
            label="Speed Compliance"
            value={state.speedCompliance}
            suffix="%"
            onInput={(e) => setState({ ...state, speedCompliance: Number(e.target.value) })}
          />
        </div>

        <button
          onClick={() =>
            setState({
              weather: segment.weather,
              visibility: segment.visibility,
              roadCondition: segment.roadCondition,
              trafficDensity: segment.trafficDensity,
              speedCompliance: segment.speedCompliance,
            })
          }
          disabled={isBase}
          className="mt-5 w-full rounded-md border border-white/15 bg-white/[0.04] px-3 py-2 text-[12px] font-medium text-ink transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset to observed conditions
        </button>
      </div>

      {/* Live results */}
      <div className="space-y-5 lg:col-span-3">
        <div className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <RiskGauge score={current.score} size={118} />
              <div>
                <div className="kicker">Live Risk Score</div>
                <div className={`mt-1 font-display text-[26px] uppercase leading-none tracking-wide ${st.text}`}>
                  {current.level.label}
                </div>
                <div className="mt-2 font-mono text-[11px] text-faint">
                  baseline {base.score} ·{" "}
                  <span
                    className={
                      delta > 0
                        ? "font-semibold text-risk"
                        : delta < 0
                        ? "font-semibold text-safe"
                        : "text-faint"
                    }
                  >
                    {delta > 0 ? `▲ +${delta}` : delta < 0 ? `▼ ${delta}` : "no change"}
                  </span>
                </div>
              </div>
            </div>
            {delta !== 0 && (
              <div
                className={`max-w-[230px] rounded-md border p-3 text-[11.5px] leading-relaxed ${
                  delta > 0
                    ? "border-risk/40 bg-risk/[0.06] text-risk"
                    : "border-safe/40 bg-safe/[0.06] text-safe"
                }`}
              >
                {impactMessage(base.score, current.score)}
              </div>
            )}
          </div>
          <div className="mt-5">
            <RiskBreakdown breakdown={current.breakdown} levelKey={current.level.key} />
          </div>
        </div>

        <div className="panel p-5">
          <h4 className="mb-4 font-display text-[13px] uppercase tracking-wide text-ink">
            Recommended Interventions
          </h4>
          <SafetyRecommendations recommendations={recs} />
        </div>
      </div>
    </div>
  );
}