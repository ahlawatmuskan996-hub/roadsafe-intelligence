// Realistic road-safety dataset for 15 major Indian cities.
let counter = 0;

function seg(city, name, roadType, lengthKm, trafficDensity, weather, visibility, roadCondition, speedCompliance, accidents30, trend) {
  counter += 1;
  return {
    id: `${cityKey(city)}-${String(counter).padStart(2, "0")}`,
    city,
    name,
    roadType,
    lengthKm,
    trafficDensity,
    weather,
    visibility,
    roadCondition,
    speedCompliance,
    accidents30,
    trend,
    injuries30: Math.round(accidents30 * 2.6),
    fatalities30: Math.max(1, Math.round(accidents30 * 0.14)),
    vehiclesDaily: Math.round(60000 + trafficDensity * 2400),
  };
}

function cityKey(city) {
  return city.toLowerCase().replace(/[^a-z]/g, "");
}

const raw = [
  ["Delhi", "NH 48 — Dwarka Expressway (Gurugram border)", "National Highway", 14, 82, "Fog", "Low", "Under Construction", 41, 27, "Rising"],
  ["Delhi", "Ring Road — AIIMS to ITO", "Ring Road", 12, 88, "Clear", "Medium", "Good", 35, 31, "Rising"],
  ["Delhi", "Rajpath — C-Hexagon Corridor", "Urban Corridor", 6, 74, "Heat", "High", "Good", 62, 12, "Stable"],
  ["Delhi", "Outer Ring Road — Vikas Marg stretch", "Ring Road", 18, 77, "Rain", "Medium", "Fair", 44, 22, "Rising"],

  ["Mumbai", "Eastern Express Highway (Mulund–Sion)", "Expressway", 16, 85, "Rain", "Medium", "Fair", 39, 29, "Rising"],
  ["Mumbai", "Western Express Highway (Bandra–Dahisar)", "Expressway", 22, 83, "Rain", "Medium", "Good", 46, 24, "Stable"],
  ["Mumbai", "Bandra–Worli Sea Link & approach ramps", "Expressway", 9, 71, "Clear", "High", "Good", 68, 8, "Stable"],
  ["Mumbai", "JJ Flyover & CST–Nagsen Nagar corridor", "Urban Corridor", 5, 90, "Heat", "Low", "Good", 31, 26, "Rising"],

  ["Bengaluru", "Outer Ring Road (Koramangala–Marathahalli)", "Ring Road", 18, 89, "Rain", "Medium", "Damaged", 33, 25, "Rising"],
  ["Bengaluru", "Old Airport Road (Domlur–K.R. Puram)", "Urban Corridor", 8, 84, "Clear", "Medium", "Fair", 52, 14, "Stable"],
  ["Bengaluru", "Mysore Road (Gorguntepalya–Kengeri)", "State Highway", 12, 79, "Rain", "Low", "Damaged", 38, 21, "Rising"],
  ["Bengaluru", "Hebbal Flyover & Bellary Road corridor", "Urban Corridor", 10, 81, "Clear", "High", "Good", 57, 9, "Falling"],

  ["Chennai", "Rajiv Gandhi Salai / OMR (Guindy–Tidel Park)", "Urban Corridor", 15, 87, "Clear", "Medium", "Good", 47, 18, "Rising"],
  ["Chennai", "Anna Salai / Mount Road", "Urban Corridor", 7, 86, "Heat", "High", "Good", 63, 11, "Stable"],
  ["Chennai", "NH 45 — Tambaram to Chromepet", "National Highway", 11, 80, "Rain", "Low", "Fair", 42, 20, "Rising"],
  ["Chennai", "ECR — Thiruvanmiyur to Kovalam", "Coastal Road", 17, 68, "Clear", "High", "Fair", 55, 13, "Stable"],

  ["Hyderabad", "Outer Ring Road (Patancheru–Shamshabad)", "Ring Road", 24, 76, "Clear", "High", "Good", 58, 10, "Falling"],
  ["Hyderabad", "NH 65 — Jubilee Hills to Toli Chowki", "National Highway", 9, 83, "Heat", "Medium", "Fair", 41, 17, "Stable"],
  ["Hyderabad", "PVNR Expressway (Mehdipatnam–Charminar)", "Expressway", 12, 78, "Rain", "Low", "Damaged", 37, 23, "Rising"],
  ["Hyderabad", "Bengaluru Highway (LB Nagar–Kokapet)", "State Highway", 13, 81, "Clear", "Medium", "Good", 49, 15, "Stable"],

  ["Kolkata", "EM Bypass (Science City–Salt Lake)", "Ring Road", 16, 85, "Fog", "Low", "Fair", 36, 24, "Rising"],
  ["Kolkata", "NH 19 — Dankuni to Howrah Maidan", "National Highway", 10, 79, "Fog", "Low", "Damaged", 40, 21, "Rising"],
  ["Kolkata", "Park Street — Mayo Road junction", "Urban Corridor", 4, 89, "Clear", "Medium", "Good", 43, 12, "Stable"],
  ["Kolkata", "Howrah Bridge approach & Maa Flyover", "Urban Corridor", 5, 92, "Clear", "High", "Good", 38, 14, "Stable"],

  ["Pune", "Mumbai–Pune Expressway (Khandala ghat section)", "Expressway", 21, 72, "Fog", "Low", "Good", 34, 28, "Rising"],
  ["Pune", "Katraj–Khed Shivapur Road", "State Highway", 8, 74, "Rain", "Medium", "Damaged", 45, 19, "Rising"],
  ["Pune", "FC Road — Jangli Maharaj Road corridor", "Urban Corridor", 6, 87, "Heat", "Medium", "Good", 51, 10, "Stable"],
  ["Pune", "Bhosari–Alandi Road (industrial corridor)", "Urban Corridor", 9, 82, "Clear", "Medium", "Fair", 46, 16, "Stable"],

  ["Jaipur", "Ajmer Expressway (Dausa–Ajmer section)", "Expressway", 18, 70, "Heat", "High", "Good", 60, 9, "Falling"],
  ["Jaipur", "NH 21 — Amber to Amer Road", "National Highway", 11, 78, "Dust Storm", "Low", "Fair", 43, 17, "Rising"],
  ["Jaipur", "Tonk Road (Nagar Nigam–Durgapura)", "Urban Corridor", 9, 85, "Heat", "Medium", "Fair", 48, 13, "Stable"],
  ["Jaipur", "Gurgaon Road / Jaipur–Delhi highway (Sodala)", "National Highway", 12, 76, "Dust Storm", "Low", "Good", 44, 15, "Stable"],

  ["Lucknow", "Shaheed Path (Kukrail–Naka Road)", "Ring Road", 12, 80, "Fog", "Low", "Fair", 42, 20, "Rising"],
  ["Lucknow", "HPCL Kanpur Road (Charbagh–Kanpur border)", "National Highway", 14, 79, "Fog", "Low", "Damaged", 39, 22, "Rising"],
  ["Lucknow", "Ring Road (Chinhat–Telibagh)", "Ring Road", 16, 77, "Clear", "Medium", "Good", 47, 11, "Stable"],
  ["Lucknow", "Faizabad Road (Hazratganj–Chinhat)", "Urban Corridor", 8, 84, "Clear", "High", "Good", 54, 9, "Falling"],

  ["Ahmedabad", "SG Highway (Sarkhej–Gandhinagar)", "Expressway", 21, 83, "Heat", "Medium", "Good", 52, 14, "Stable"],
  ["Ahmedabad", "Narol–Naroda Highway", "Ring Road", 15, 82, "Dust Storm", "Low", "Damaged", 38, 25, "Rising"],
  ["Ahmedabad", "Sabarmati Riverfront Road", "Urban Corridor", 7, 73, "Clear", "High", "Good", 61, 7, "Falling"],
  ["Ahmedabad", "Sarkhej–Gandhinagar (Sindhu Bhavan stretch)", "Urban Corridor", 6, 86, "Heat", "Medium", "Good", 49, 12, "Stable"],

  ["Surat", "Kamrej Bypass (NH 48)", "National Highway", 12, 79, "Rain", "Medium", "Fair", 44, 18, "Rising"],
  ["Surat", "Varachha–Vesu Road", "Urban Corridor", 8, 84, "Heat", "Medium", "Good", 46, 11, "Stable"],
  ["Surat", "Sarthana–Navsari Road", "State Highway", 10, 75, "Rain", "Low", "Damaged", 41, 20, "Rising"],
  ["Surat", "Umra–Canal Road stretch", "Urban Corridor", 6, 78, "Clear", "High", "Fair", 53, 8, "Falling"],

  ["Vadodara", "Sama–Savli Road", "State Highway", 9, 76, "Heat", "Medium", "Fair", 47, 13, "Stable"],
  ["Vadodara", "Gotri–Sevasi Road", "Urban Corridor", 7, 80, "Clear", "High", "Good", 55, 9, "Falling"],
  ["Vadodara", "Airport Road — Harni stretch", "Urban Corridor", 6, 77, "Dust Storm", "Low", "Good", 45, 12, "Stable"],
  ["Vadodara", "Ajwa–Waghodiya Road", "State Highway", 11, 78, "Rain", "Medium", "Damaged", 39, 21, "Rising"],

  ["Indore", "AB Road (Vijay Nagar–Bhavarkua)", "National Highway", 12, 84, "Heat", "Medium", "Fair", 45, 15, "Stable"],
  ["Indore", "Ring Road — Rajwada to Dewas Naka", "Ring Road", 13, 82, "Clear", "Medium", "Good", 50, 12, "Stable"],
  ["Indore", "Super Corridor (Bypass stretch)", "Expressway", 9, 74, "Heat", "High", "Good", 58, 8, "Falling"],
  ["Indore", "Rau–Pithampur Road (industrial)", "State Highway", 10, 77, "Dust Storm", "Low", "Damaged", 40, 19, "Rising"],

  ["Nagpur", "Wardha Road (outer section)", "State Highway", 12, 78, "Heat", "Medium", "Fair", 43, 16, "Stable"],
  ["Nagpur", "Amravati Road (Tower junction)", "Urban Corridor", 8, 83, "Clear", "Medium", "Good", 47, 11, "Stable"],
  ["Nagpur", "Hingna Road (auto cluster)", "Urban Corridor", 9, 81, "Rain", "Low", "Damaged", 39, 22, "Rising"],
  ["Nagpur", "Kamptee Road", "State Highway", 11, 76, "Clear", "High", "Fair", 51, 10, "Falling"],

  ["Kochi", "NH 66 (Vyttila–Palarivattom)", "National Highway", 10, 85, "Rain", "Medium", "Fair", 42, 18, "Rising"],
  ["Kochi", "Ernakulam Marine Drive", "Urban Corridor", 4, 88, "Clear", "High", "Good", 49, 9, "Stable"],
  ["Kochi", "Seaport–Airport Road (Kakkanad stretch)", "Expressway", 13, 79, "Rain", "Medium", "Good", 56, 12, "Stable"],
  ["Kochi", "MG Road — JT Junction corridor", "Urban Corridor", 5, 90, "Clear", "Medium", "Good", 44, 11, "Stable"],
];

export const segments = raw.map(([city, name, roadType, lengthKm, trafficDensity, weather, visibility, roadCondition, speedCompliance, accidents30, trend]) =>
  seg(city, name, roadType, lengthKm, trafficDensity, weather, visibility, roadCondition, speedCompliance, accidents30, trend)
);

export const cities = [...new Set(segments.map((s) => s.city))];

export const totalAccidents = segments.reduce((t, s) => t + s.accidents30, 0);

export const CITY_COORDS = {
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

export const MODEL_META = {
  name: "RoadSafe Risk Engine",
  version: "2.0.0",
  engine: "5-factor weighted · traffic / weather / visibility / road / speed",
  factors: ["traffic", "weather", "visibility", "road", "speed"],
};