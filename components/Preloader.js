"use client";

import { useEffect, useState } from "react";

export default function Preloader({ onDone, work }) {
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let raf;
    const t0 = performance.now();
    const DUR = 1300;
    const tick = (now) => {
      const p = Math.min((now - t0) / DUR, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setPct(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setTimeout(() => setLeaving(true), 450);
        setTimeout(onDone, 450 + 700);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <div className={`boot${leaving ? " is-leaving" : ""}`} aria-hidden={leaving}>
      <div className="boot-mark">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3z" strokeLinejoin="round" />
          <path d="M8.5 12l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="font-display text-[22px] uppercase tracking-wide text-white">
        RoadSafe<sup className="ml-1 text-[11px] text-faint">®</sup>
        <span className="text-muted"> Intelligence</span>
      </div>
      <div className="tabular font-mono text-6xl font-light text-ink">{pct}</div>
      <div className="boot-progress">
        <i style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
      <div className="kicker">{work}</div>
    </div>
  );
}