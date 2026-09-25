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

async function fetchViaProxy(city) {
  const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("proxy failed");
  const data = await res.json();
  return {
    temp: data.tempC,
    humidity: data.humidity,
    wind: data.windKmh,
    label: data.condition,
    code: null,
    via: "server",
  };
}

async function fetchDirect(city) {
  const coord = CITY_COORDS[city];
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${coord[0]}&longitude=${coord[1]}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`
  );
  if (!res.ok) throw new Error("direct failed");
  const cur = (await res.json()).current;
  if (!cur) throw new Error("empty");
  return {
    temp: Math.round(cur.temperature_2m),
    humidity: cur.relative_humidity_2m,
    wind: Math.round(cur.wind_speed_10m),
    label: CODE_LABEL[cur.weather_code] ?? "Variable",
    code: cur.weather_code,
    via: "direct",
  };
}

export async function getWeatherForCity(cityName) {
  if (!CITY_COORDS[cityName]) return null;
  try {
    return await fetchViaProxy(cityName);
  } catch {
    try {
      return await fetchDirect(cityName);
    } catch {
      return null;
    }
  }
}