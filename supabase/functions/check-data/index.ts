import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

serve(async (req)=>{
  try {
    const payload = await req.json();
    const reading = payload.record;
    const { data: alertSettings, error: alertErr } = await supabase.from("alert_settings").select("*").eq("active", true);
    if (alertErr) throw alertErr;
    //In the future add checks for other alert types
    for (const alert of alertSettings){
      if (alert.alert_type === "temperature_high" && reading.temperature_c > alert.threshold_max) {
        const { error: logErr } = await supabase.from("alert_logs").insert({
          alert_type: alert.alert_type,
          readings_id: reading.id,
          message: `High temperature: ${reading.temperature_c}°C`,
          sent: null,
          sent_to: null,
          device_id: reading.device_id
        });
        if (logErr) {
          console.error("Error inserting alert_log:", logErr);
          throw logErr;
        }
      }
    }
    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (e) {
    if (e instanceof Error) {
      console.error("Error processing data:", e);
      return new Response(JSON.stringify({
        error: e.message,
        stack: e.stack
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      });
    } else {
      console.error("Unknown error:", e);
      return new Response(JSON.stringify({
        error: "Unknown error occurred"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
  }
});
