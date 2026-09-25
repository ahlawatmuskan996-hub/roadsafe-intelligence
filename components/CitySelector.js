import { segments, totalAccidents } from "@/data/indiaRoadData";
import { computeRisk } from "@/lib/risk";

export default function CitySelector({ activeCity, onSelect }) {
  const cityStats = (city) => {
    const list = segments.filter((s) => s.city === city);
    const scores = list.map((s) => computeRisk(s).score);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / list.length);
    const highCount = list.filter((s) => computeRisk(s).score > 60).length;
    return { count: list.length, avg, highCount };
  };

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h3 className="font-display text-lg uppercase tracking-wide text-white">Network Coverage</h3>
          <p className="kicker mt-1 !text-[9.5px]">
            {segments.length} monitored stretches · {totalAccidents} crashes / 30 days
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5">
        {[...new Set(segments.map((s) => s.city))].map((city) => {
          const st = cityStats(city);
          const active = city === activeCity;
          const tone =
            st.avg <= 30 ? "text-safe" : st.avg <= 60 ? "text-warn" : "text-risk";
          return (
            <button
              key={city}
              onClick={() => onSelect(city)}
              className={`group rounded-md border px-3 py-2.5 text-left transition-all duration-200 active:scale-[0.985] ${
                active
                  ? "border-white bg-white text-black"
                  : "border-white/10 bg-panel text-ink hover:-translate-y-0.5 hover:border-white/30 hover:bg-raised"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`truncate text-[12.5px] font-medium ${active ? "text-black" : "text-ink"}`}>
                  {city}
                </span>
                <span className={`tabular font-mono text-xs font-semibold ${active ? "text-black/60" : tone}`}>
                  {st.avg}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-wider">
                <span className={active ? "text-black/50" : "text-faint"}>
                  {st.count} seg
                </span>
                {st.highCount > 0 && (
                  <span className={`flex items-center gap-1 ${active ? "text-black/70" : "text-risk"}`}>
                    <span className="dot-pulse" />
                    {st.highCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}