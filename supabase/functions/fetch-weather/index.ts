import { createClient } from "npm:@supabase/supabase-js@2.39.5";
import type { Record } from "../../../types/types";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const lat = 59.33;
const lon = 18.07;

async function fetchCurrentWeather() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch weather: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  // The API returns { current_weather: { temperature, windspeed, winddirection, weathercode, time } }
  return data.current_weather;
}
async function insertWeatherRecord(record: Record) {
  const { data, error } = await supabase.from("weather_readings").insert([
    record
  ]);
  if (error) {
    throw error;
  }
  return data;
}
Deno.serve(async (req: { url: string | URL; })=>{
  try {
    // Optional: allow overriding lat/lon via query parameters
    const url = new URL(req.url);
    const qLat = parseFloat(url.searchParams.get("lat") ?? "");
    const qLon = parseFloat(url.searchParams.get("lon") ?? "");
    const useLat = !isNaN(qLat) ? qLat : lat;
    const useLon = !isNaN(qLon) ? qLon : lon;
    const weather = await fetchCurrentWeather();
    // Build the record to insert
    const record = {
      lat: useLat,
      lon: useLon,
      temperature_c: weather.temperature,
      windspeed: weather.windspeed,
      winddirection: weather.winddirection,
      weathercode: weather.weathercode,
      observed_at: weather.time,
      test_data: Math.floor(Math.random() * 100),
      device_id: 1 // Hardcoded for now
    };
    await insertWeatherRecord(record);
    return new Response(JSON.stringify({
      success: true,
      record
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (e) {
    console.error("Insert failed", e);
    return new Response(JSON.stringify({
      success: false,
      error: e instanceof Error ? e.message : JSON.stringify(e)
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
});
