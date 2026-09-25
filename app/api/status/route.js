import { WEIGHTS, FACTOR_LABELS, riskLevel } from "@/lib/risk";
import { MODEL_META } from "@/data/indiaRoadData";

export async function GET() {
  return Response.json({
    ok: true,
    service: MODEL_META.name,
    version: MODEL_META.version,
    engine: MODEL_META.engine,
    weights: WEIGHTS,
    factorLabels: FACTOR_LABELS,
    bands: {
      safe: "0–30",
      moderate: "31–60",
      high: "61–100",
    },
    generatedAt: new Date().toISOString(),
    status: "live",
  });
}