import { computeRisk, WEIGHTS, FACTOR_LABELS, riskLevel } from "@/lib/risk";

export async function POST(request) {
  try {
    const body = await request.json();
    const segment = body?.segment ?? body;
    if (!segment) {
      return Response.json({ ok: false, error: "Missing segment payload" }, { status: 400 });
    }
    const t0 = Date.now();
    const result = computeRisk(segment);
    return Response.json({
      ok: true,
      score: result.score,
      level: result.level.label,
      label: result.label,
      breakdown: result.breakdown,
      weights: WEIGHTS,
      factorLabels: FACTOR_LABELS,
      band: riskLevel(result.score).label,
      evaluatedAt: new Date().toISOString(),
      latencyMs: Date.now() - t0,
    });
  } catch (err) {
    return Response.json({ ok: false, error: "Invalid request payload" }, { status: 400 });
  }
}