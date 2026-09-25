export const WEIGHTS = {
  traffic: 0.3,
  weather: 0.25,
  visibility: 0.2,
  road: 0.15,
  speed: 0.1,
};

export const WEATHER_IMPACT = {
  Clear: 8,
  Heat: 22,
  Rain: 55,
  "Dust Storm": 60,
  Fog: 70,
};

export const VISIBILITY_IMPACT = {
  High: 10,
  Medium: 40,
  Low: 70,
};

export const ROAD_IMPACT = {
  Good: 8,
  Fair: 35,
  Damaged: 65,
  "Under Construction": 70,
};

export const WEATHER_OPTIONS = ["Clear", "Heat", "Rain", "Dust Storm", "Fog"];
export const VISIBILITY_OPTIONS = ["High", "Medium", "Low"];
export const ROAD_OPTIONS = ["Good", "Fair", "Damaged", "Under Construction"];

export const FACTOR_LABELS = {
  traffic: "Traffic Density",
  weather: "Weather",
  visibility: "Visibility",
  road: "Road Condition",
  speed: "Speed Compliance",
};

const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

export function factorScores(s) {
  return {
    traffic: s.trafficDensity || 0,
    weather: WEATHER_IMPACT[s.weather] ?? 8,
    visibility: VISIBILITY_IMPACT[s.visibility] ?? 10,
    road: ROAD_IMPACT[s.roadCondition] ?? 8,
    speed: s.speedCompliance != null ? 100 - s.speedCompliance : 0,
  };
}

export function computeRisk(s) {
  const factors = factorScores(s);
  const breakdown = Object.keys(WEIGHTS)
    .map((key) => {
      const value = factors[key];
      const weight = WEIGHTS[key];
      const points = value * weight;
      return { key, label: FACTOR_LABELS[key], value, weight, points: round1(points) };
    })
    .sort((a, b) => b.points - a.points);

  const score = clamp(Math.round(breakdown.reduce((sum, f) => sum + f.points, 0)));
  const level = riskLevel(score);
  return { score, breakdown, level, label: level.label };
}

export function riskLevel(score) {
  if (score <= 30) return { label: "SAFE", key: "safe" };
  if (score <= 60) return { label: "MODERATE", key: "moderate" };
  return { label: "HIGH RISK", key: "high" };
}

export const LEVEL_STYLES = {
  safe: {
    text: "text-safe",
    bg: "bg-safe/10",
    border: "border-safe/40",
    ring: "ring-safe/50",
    dot: "bg-safe",
    bar: "bg-safe",
    hex: "#34d399",
  },
  moderate: {
    text: "text-warn",
    bg: "bg-warn/10",
    border: "border-warn/40",
    ring: "ring-warn/50",
    dot: "bg-warn",
    bar: "bg-warn",
    hex: "#ec4899",
  },
  high: {
    text: "text-risk",
    bg: "bg-risk/10",
    border: "border-risk/40",
    ring: "ring-risk/50",
    dot: "bg-risk",
    bar: "bg-risk",
    hex: "#dc2626",
  },
};

const round1 = (n) => Math.round(n * 10) / 10;

export function forecastSegment(s, days = 7) {
  const { score } = computeRisk(s);
  const drift =
    s.trend === "Rising" ? 1.9 : s.trend === "Falling" ? -2.4 : 0.35;
  const weekendBump = [0, 0, 0, 1, 3, 6, 5];
  const out = [];
  for (let i = 1; i <= days; i++) {
    const raw = score + drift * i + weekendBump[i - 1];
    const val = clamp(Math.round(raw));
    out.push({ day: `Day ${i}`, i, score: val, level: riskLevel(val).label });
  }
  return out;
}

export function isRiskRising(s) {
  if (s.trend !== "Rising") return false;
  return forecastSegment(s, 7).some((d) => d.score > 60);
}

export function buildRecommendations(breakdown) {
  const RULES = {
    traffic: {
      title: "Traffic Overload",
      actions: [
        "Re-time signals for peak-hour tidal flow",
        "Divert heavy vehicles via alternate ring routes",
        "Deploy AI-based adaptive traffic signals",
      ],
      cost: "₹1.2 Cr",
      reduction: 22,
    },
    weather: {
      title: "Weather Hazard Zone",
      actions: [
        "Install high-capacity drainage & anti-skid resurfacing",
        "Add flood/water-level sensors with driver alerts",
        "Place dynamic weather-warning signage",
      ],
      cost: "₹65 L",
      reduction: 26,
    },
    visibility: {
      title: "Low Visibility Corridor",
      actions: [
        "Upgrade to 2000-lumen LED street lighting",
        "Clear roadside vegetation & sign clutter",
        "Install reflective delineators & cat-eyes",
      ],
      cost: "₹48 L",
      reduction: 30,
    },
    road: {
      title: "Deteriorating Pavement",
      actions: [
        "Immediate pothole repair & lane restriping",
        "Apply high-friction micro-surfacing on curves",
        "Structural rehab of weak carriageway sections",
      ],
      cost: "₹80 L",
      reduction: 24,
    },
    speed: {
      title: "Speed Non-Compliance",
      actions: [
        "Deploy fixed + mobile speed cameras",
        "Reduce speed limit & add speed humps on approaches",
        "Aggressive e-challan enforcement campaigns",
      ],
      cost: "₹35 L",
      reduction: 32,
    },
  };

  const threshold = (key) =>
    key === "traffic"
      ? 45
      : key === "speed"
      ? 32
      : key === "weather"
      ? 30
      : key === "visibility"
      ? 28
      : 24;

  return breakdown
    .filter((f) => f.value >= threshold(f.key))
    .map((f) => ({
      key: f.key,
      label: FACTOR_LABELS[f.key],
      points: f.points,
      ...RULES[f.key],
    }));
}

export function impactMessage(baseScore, newScore) {
  const delta = newScore - baseScore;
  if (delta === 0) return "Conditions unchanged — risk level stays the same.";
  if (delta > 0)
    return `Risk increased by ${delta} pts (${Math.round(
      (delta / Math.max(baseScore, 1)) * 100
    )}%) — conditions worsened on this stretch.`;
  return `Risk reduced by ${Math.abs(delta)} pts (${Math.round(
    (Math.abs(delta) / Math.max(baseScore, 1)) * 100
  )}%) — conditions improved on this stretch.`;
}