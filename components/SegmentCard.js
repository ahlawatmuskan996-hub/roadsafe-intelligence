import { computeRisk, LEVEL_STYLES, forecastSegment } from "@/lib/risk";
import Sparkline from "./Sparkline";

const TREND_STYLE = { Rising: "text-risk", Stable: "text-faint", Falling: "text-faint" };
const TREND_MARK = { Rising: "▲", Stable: "◆", Falling: "▼" };

export default function SegmentCard({ segment, selected, onSelect }) {
  const { score, level, breakdown } = computeRisk(segment);
  const st = LEVEL_STYLES[level.key];
  const [top] = breakdown;
  const forecast = forecastSegment(segment, 7).map((d) => ({ v: d.score }));

  return (
    <button
      onClick={() => onSelect(segment)}
      className={`group w-full rounded-lg border text-left transition-all duration-200 active:scale-[0.985] ${
        selected
          ? "border-white/50 bg-white/[0.06]"
          : "border-white/10 bg-panel hover:-translate-y-0.5 hover:border-white/30 hover:bg-raised hover:shadow-[0_16px_40px_-24px_rgba(0,0,0,0.9)]"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="kicker !text-[9px]">
              {segment.city} · {segment.roadType}
            </div>
            <h4 className="mt-1 truncate text-[13.5px] font-medium text-ink">
              {segment.name}
            </h4>
          </div>
          <div className="shrink-0">
            <div className="flex items-baseline gap-1.5">
              <span className={`tabular font-display text-[32px] leading-none ${st.text}`}>
                {score}
              </span>
              <span className="text-[9.5px] text-faint">/100</span>
            </div>
            <div className={`mt-1 text-right font-mono text-[9.5px] font-semibold uppercase tracking-widest ${TREND_STYLE[segment.trend]}`}>
              {TREND_MARK[segment.trend]} {segment.trend}
            </div>
          </div>
        </div>

        <div className="mt-3.5">
          <div className="mb-1 flex items-center justify-between text-[9px] uppercase tracking-wider text-faint">
            <span>7-day outlook</span>
            <span className="tabular font-mono normal-case">
              peak {Math.max(...forecast.map((d) => d.v))}
            </span>
          </div>
          <Sparkline data={forecast} color={st.hex} height={28} />
        </div>

        <div className="hairline mt-3.5 flex items-center justify-between pt-2.5 font-mono text-[10.5px]">
          <span className="tabular text-muted">
            {segment.accidents30} <span className="text-faint">crash/30d</span>
          </span>
          <span className="tabular text-muted">
            {segment.fatalities30} <span className="text-faint">fatal</span>
          </span>
          <span className="hidden sm:inline">
            <span className="tabular text-muted">{segment.trafficDensity}</span>{" "}
            <span className="text-faint">traffic</span>
          </span>
          <span className="truncate pl-2 text-faint" title={`Top driver: ${top.label}`}>
            {top.label}
          </span>
        </div>
      </div>
    </button>
  );
}