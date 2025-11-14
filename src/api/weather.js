import { OPENWEATHER_API_KEY } from "@env";

const BASE = "https://api.openweathermap.org/data/2.5";
const apiKey = OPENWEATHER_API_KEY;

function toUrl(path, params) {
  const qs = new URLSearchParams(params).toString();
  return `${BASE}${path}?${qs}`;
}

export async function getWeatherByCoords({ lat, lon, units = "metric" }) {
  if (!apiKey) throw new Error("Missing OPENWEATHER_API_KEY");
  const url = toUrl("/weather", { lat, lon, units, appid: apiKey });
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function getWeatherByCity({ q, units = "metric" }) {
  if (!apiKey) throw new Error("Missing OPENWEATHER_API_KEY");
  if (!q?.trim()) throw new Error("Please enter a city name");

  const url = toUrl("/weather", { q: q.trim(), units, appid: apiKey });
  const res = await fetch(url);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 404) throw new Error(err?.message || "City not found");
    throw new Error(err?.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function getForecastByCoords({ lat, lon, units = "metric" }) {
  if (!apiKey) throw new Error("Missing OPENWEATHER_API_KEY");

  const url = toUrl("/forecast", { lat, lon, units, appid: apiKey });
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || `Forecast request failed (${res.status})`);
  }
  const data = await res.json();
  return data.list;
}
