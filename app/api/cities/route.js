import { segments, cities, CITY_COORDS, totalAccidents } from "@/data/indiaRoadData";
import { computeRisk } from "@/lib/risk";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cityParam = searchParams.get("city");

  const withRisk = (s) => {
    const r = computeRisk(s);
    return { ...s, score: r.score, level: r.level.label, topFactor: r.breakdown[0]?.label ?? null };
  };

  if (cityParam) {
    const list = segments.filter((s) => s.city === cityParam);
    if (list.length === 0) {
      return Response.json({ ok: false, error: `Unknown city: ${cityParam}` }, { status: 404 });
    }
    return Response.json({ ok: true, city: cityParam, segments: list.map(withRisk) });
  }

  const summary = cities
    .map((city) => {
      const list = segments.filter((s) => s.city === city);
      const scores = list.map((s) => computeRisk(s).score);
      const high = scores.filter((s) => s > 60).length;
      return {
        city,
        segments: list.length,
        avgRisk: Math.round((scores.reduce((a, b) => a + b, 0) / list.length) * 10) / 10,
        highRisk: high,
        lat: CITY_COORDS[city]?.[0] ?? null,
        lon: CITY_COORDS[city]?.[1] ?? null,
      };
    })
    .sort((a, b) => b.avgRisk - a.avgRisk);

  return Response.json({
    ok: true,
    network: "India · 15 cities · 60 monitored stretches",
    totalAccidents,
    totalSegments: segments.length,
    totalCities: cities.length,
    cities: summary,
  });
}