const COORDS = {
  Delhi: [28.6139, 77.209],
  Mumbai: [19.076, 72.8777],
  Bengaluru: [12.9716, 77.5946],
  Chennai: [13.0827, 80.2707],
  Hyderabad: [17.385, 78.4867],
  Kolkata: [22.5726, 88.3639],
  Pune: [18.5204, 73.8567],
  Jaipur: [26.9124, 75.7873],
  Lucknow: [26.8467, 80.9462],
  Ahmedabad: [23.0225, 72.5714],
  Surat: [21.1702, 72.8311],
  Vadodara: [22.3072, 73.1812],
  Indore: [22.7196, 75.8577],
  Nagpur: [21.1458, 79.0882],
  Kochi: [9.9312, 76.2673],
};

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

export async function getWeatherForCity(cityName) {
  const coord = COORDS[cityName];
  if (!coord) return null;
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coord[0]}&longitude=${coord[1]}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const cur = data.current;
    if (!cur) return null;
    return {
      temp: Math.round(cur.temperature_2m),
      humidity: cur.relative_humidity_2m,
      wind: Math.round(cur.wind_speed_10m),
      label: CODE_LABEL[cur.weather_code] ?? "Variable",
      code: cur.weather_code,
    };
  } catch {
    return null;
  }
}