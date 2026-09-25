import { CITY_COORDS } from "@/data/indiaRoadData";

const CODE_LABEL = {
  0: "Clear",
  1: "Mostly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Light Drizzle",
  53: "Drizzle",
  55: "Heavy Drizzle",
  61: "Light Rain",
  63: "Rain",
  65: "Heavy Rain",
  71: "Light Snow",
  73: "Snow",
  75: "Heavy Snow",
  80: "Rain Showers",
  81: "Rain Showers",
  82: "Violent Showers",
  95: "Thunderstorm",
  96: "Storm + Hail",
  99: "Storm + Hail",
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const coord = CITY_COORDS[city];
  if (!coord) {
    return Response.json({ ok: false, error: `Unknown city: ${city}` }, { status: 404 });
  }
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coord[0]}&longitude=${coord[1]}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) throw new Error("upstream failed");
    const data = await res.json();
    const cur = data.current;
    if (!cur) throw new Error("empty payload");
    return Response.json({
      ok: true,
      city,
      fetchedAt: new Date().toISOString(),
      source: "open-meteo",
      tempC: Math.round(cur.temperature_2m),
      humidity: cur.relative_humidity_2m,
      windKmh: Math.round(cur.wind_speed_10m),
      condition: CODE_LABEL[cur.weather_code] ?? "Variable",
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: "Weather upstream unavailable", fallback: "mock conditions remain active" },
      { status: 502 }
    );
  }
}