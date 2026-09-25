import { forecastSegment } from "@/lib/risk";

export async function POST(request) {
  try {
    const body = await request.json();
    const segment = body?.segment ?? body;
    const days = Math.min(Math.max(Number(body?.days ?? 7), 1), 30);
    if (!segment) {
      return Response.json({ ok: false, error: "Missing segment payload" }, { status: 400 });
    }
    const forecast = forecastSegment(segment, days);
    const crossesHigh = forecast.some((d) => d.score > 60);
    return Response.json({ ok: true, days, forecast, crossesHigh });
  } catch (err) {
    return Response.json({ ok: false, error: "Invalid request payload" }, { status: 400 });
  }
}