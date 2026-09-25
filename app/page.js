"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { segments, cities, totalAccidents } from "@/data/indiaRoadData";
import { computeRisk, buildRecommendations, riskLevel, LEVEL_STYLES } from "@/lib/risk";
import CitySelector from "@/components/CitySelector";
import SegmentCard from "@/components/SegmentCard";
import RiskBreakdown from "@/components/RiskBreakdown";
import SafetyRecommendations from "@/components/SafetyRecommendations";
import ConditionSimulator from "@/components/ConditionSimulator";
import CompareView from "@/components/CompareView";
import PredictivePanel from "@/components/PredictivePanel";
import Preloader from "@/components/Preloader";
import Reveal from "@/components/Reveal";
import { getWeatherForCity } from "@/lib/weatherApi";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "lab", label: "Condition Lab" },
  { key: "compare", label: "Compare" },
  { key: "forecast", label: "Forecast" },
];

function ShieldMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3z" strokeLinejoin="round" />
      <path d="M8.5 12l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function useCountUp(target, active, dur = 950) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return undefined;
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setV(target * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, dur]);
  return v;
}

function KpiNum({ value, active, decimals = 0, className }) {
  const v = useCountUp(value, active);
  return <span className={className}>{v.toFixed(decimals)}</span>;
}

export default function Page() {
  const [booted, setBooted] = useState(false);
  const [tab, setTab] = useState("overview");
  const [activeCity, setActiveCity] = useState(cities[0]);
  const [selectedId, setSelectedId] = useState(null);
  const [liveWeather, setLiveWeather] = useState(null);

  useEffect(() => {
    let alive = true;
    setLiveWeather(null);
    getWeatherForCity(activeCity).then((w) => {
      if (alive && w) setLiveWeather(w);
    });
    return () => {
      alive = false;
    };
  }, [activeCity]);

  // sliding tab pill
  const navRef = useRef(null);
  const tabRefs = useRef([]);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  useEffect(() => {
    const measure = () => {
      const idx = TABS.findIndex((t) => t.key === tab);
      const el = tabRefs.current[idx];
      if (el && navRef.current) setPill({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [tab]);

  const stats = useMemo(() => {
    const scores = segments.map((s) => computeRisk(s).score);
    return {
      avg: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      high: scores.filter((s) => s > 60).length,
      fatal: segments.reduce((t, s) => t + s.fatalities30, 0),
    };
  }, []);

  const citySegments = segments.filter((s) => s.city === activeCity);
  const selected = selectedId
    ? segments.find((s) => s.id === selectedId)
    : citySegments[0] ?? segments[0];
  const selectedRisk = computeRisk(selected);
  const avgLevel = riskLevel(stats.avg);
  const avgTone = LEVEL_STYLES[avgLevel.key];

  return (
    <main>
      {!booted && (
        <Preloader
          onDone={() => setBooted(true)}
          work={`scanning ${segments.length} segments · india`}
        />
      )}
      <div className="scanner" aria-hidden="true">
        <span className="scanline" />
      </div>

      <div className="mx-auto max-w-[1340px] px-5 pb-16 pt-7 sm:px-8 lg:px-10">
        {/* ===== Header ===== */}
        <Reveal active={booted}>
          <header className="mb-10">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white transition-all duration-300 hover:border-white/50">
                  <ShieldMark />
                </div>
                <div>
                  <h1 className="font-display text-[26px] uppercase leading-none tracking-tight text-white">
                    RoadSafe<sup className="ml-0.5 align-super text-[13px] text-faint">®</sup>
                    <span className="text-muted"> Intelligence</span>
                  </h1>
                  <p className="kicker mt-1.5 !text-[9.5px] text-faint">
                    Location-based road-risk intelligence · India
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2.5">
                <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 font-mono text-[11px] text-muted">
                  <span className="dot-pulse text-safe" />
                  LIVE MONITOR
                  <span className="text-faint">·</span>
                  <span className="tabular text-ink">{totalAccidents} crashes / 30d</span>
                </div>
                {liveWeather && (
                  <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 font-mono text-[11px] text-muted">
                    <span className="tabular text-ink">
                      {activeCity} · {liveWeather.temp}°C
                    </span>
                    <span className="text-faint">·</span>
                    <span className="tabular">{liveWeather.label}</span>
                    <span className="text-faint">·</span>
                    <span>{liveWeather.wind} km/h</span>
                    <span className="rounded border border-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-warn">
                      live
                    </span>
                  </div>
                )}
              </div>
            </div>
          </header>
        </Reveal>

        {/* ===== KPI strip ===== */}
        <div className="hairline" />
        <section className="grid grid-cols-2 lg:grid-cols-4">
          <Reveal active={booted}>
            <div className="border-b border-white/10 py-6 pr-6 lg:border-b-0 lg:pr-8">
              <div className="kicker">National Avg. Risk</div>
              <div className="mt-3 flex items-baseline gap-2">
                <KpiNum
                  value={stats.avg}
                  active={booted}
                  decimals={1}
                  className={`tabular font-display text-7xl leading-none ${avgTone.text}`}
                />
                <span className="font-mono text-[11px] text-faint">/100</span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="relative h-px w-40 bg-white/10">
                  <div className="absolute -top-[3px] left-[30%] h-[7px] w-[1px] bg-white/30" />
                  <div className="absolute -top-[3px] left-[60%] h-[7px] w-[1px] bg-white/30" />
                  <div
                    className="absolute -top-[3px] h-[7px] w-[2px] transition-all duration-1000 ease-out"
                    style={{ left: `${Math.min(stats.avg, 100)}%`, background: avgTone.hex }}
                  />
                </div>
                <span className="font-mono text-[10px] text-faint">threshold 60</span>
              </div>
            </div>
          </Reveal>

          {[
            { label: "Cities Network", value: cities.length, decimals: 0, sub: "Tier 1 · Tier 2" },
            { label: "Road Segments", value: segments.length, decimals: 0, sub: "national model" },
            { label: "High-Risk Stretches", value: stats.high, decimals: 0, sub: `${stats.fatal} fatal / 30d`, tone: "text-risk" },
          ].map((k, i) => (
            <Reveal key={k.label} active={booted} delay={90 + i * 70}>
              <div className="border-b border-white/10 px-6 py-6 first:pl-0 lg:border-b-0 lg:border-l lg:border-white/10">
                <div className="kicker">{k.label}</div>
                <KpiNum
                  value={k.value}
                  active={booted}
                  decimals={k.decimals}
                  className={`tabular mt-3 block font-display text-6xl leading-none lg:text-5xl ${k.tone ?? "text-white"}`}
                />
                <div className="mt-3 font-mono text-[10.5px] uppercase tracking-wider text-faint">{k.sub}</div>
              </div>
            </Reveal>
          ))}
        </section>
        <div className="hairline" />

        {/* ===== Tabs ===== */}
        <Reveal active={booted} delay={160}>
          <nav
            ref={navRef}
            className="relative mb-8 mt-8 flex gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur"
          >
            <span
              className="absolute bottom-1 top-1 z-0 rounded-full bg-white transition-all duration-300 ease-out"
              style={{ left: pill.left, width: pill.width }}
            />
            {TABS.map((t, i) => (
              <button
                key={t.key}
                ref={(el) => (tabRefs.current[i] = el)}
                onClick={() => setTab(t.key)}
                className={`relative z-10 flex-1 rounded-full px-3 py-2 font-display text-[12px] uppercase tracking-wide transition-colors duration-200 active:scale-[0.98] ${
                  tab === t.key ? "text-black" : "text-muted hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </Reveal>

        {/* ===== Active tab ===== */}
        <div key={tab} className="tab-in">
          {tab === "overview" && (
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Reveal active={booted} delay={200}>
                  <CitySelector activeCity={activeCity} onSelect={setActiveCity} />
                </Reveal>
                <div key={activeCity} className="mt-5 grid gap-3 sm:grid-cols-2">
                  {citySegments.map((s, i) => (
                    <Reveal key={s.id} active={booted} delay={220 + i * 75}>
                      <SegmentCard
                        segment={s}
                        selected={s.id === selected?.id}
                        onSelect={selectSegment}
                      />
                    </Reveal>
                  ))}
                </div>
              </div>

              <Reveal active={booted} delay={340} className="lg:col-span-1">
                <aside className="space-y-6">
                  <div className="panel p-5">
                    <div className="mb-3 flex items-baseline justify-between gap-3">
                      <h4 className="font-display text-[13px] uppercase tracking-wide text-ink">
                        Risk Decomposition
                      </h4>
                      <span className="kicker !text-[9px]">{selected.city}</span>
                    </div>
                    <p className="mb-5 truncate text-[12px] text-muted">{selected.name}</p>
                    <RiskBreakdown breakdown={selectedRisk.breakdown} levelKey={selectedRisk.level.key} />
                  </div>
                  <div className="panel p-5">
                    <h4 className="mb-4 font-display text-[13px] uppercase tracking-wide text-ink">
                      Suggested Interventions
                    </h4>
                    <SafetyRecommendations recommendations={buildRecommendations(selectedRisk.breakdown)} />
                  </div>
                </aside>
              </Reveal>
            </div>
          )}

          {tab === "lab" && (
            <section>
              <div className="mb-5">
                <h3 className="font-display text-2xl uppercase tracking-wide text-white">Condition Lab</h3>
                <p className="mt-1 max-w-xl text-[12.5px] text-muted">
                  Shift conditions on <span className="text-ink">{selected.city} — {selected.name}</span> and watch the risk model respond in real time.
                </p>
              </div>
              <ConditionSimulator key={selected.id} segment={selected} />
            </section>
          )}

          {tab === "compare" && <CompareView />}

          {tab === "forecast" && <PredictivePanel />}
        </div>

        <footer className="mt-14 hairline pt-4 text-center font-mono text-[10px] uppercase tracking-widest text-faint">
          risk model · traffic 30 · weather 25 · visibility 20 · road 15 · speed 10 /100
        </footer>
      </div>
    </main>
  );

  function selectSegment(seg) {
    setSelectedId(seg.id);
  }
}