import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.5";
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
const jsonHeaders = { "Content-Type": "application/json" };
serve(async (req)=>{
  try {
    const payload = await req.json();
    const reading = payload.record;
    //Fetch active alert settings
    const { data: alertSettings, error: alertErr } = await supabase
    .from("alert_settings")
    .select("*")
    .eq("active", true);

    if (alertErr) throw new Error(`Error fetching alert settings: ${alertErr.message}`);

    //In the future add checks for other alert types
    for (const alert of alertSettings){
      if (alert.alert_type === "temperature_high" && reading.temperature_c > alert.threshold_max) {
        const { data: previous_alert, error: prevErr }  = await supabase
          .from("alert_logs")
          .select("*")
          .eq("alert_type", alert.alert_type)
          .eq("sent", true)
          .order("triggered_at", { ascending: false })
          .limit(1);
          console.log( "Previous alert fetched:", previous_alert );

        if (prevErr) throw new Error(`Error fetching previous alert: ${prevErr.message}`);

        if (previous_alert && previous_alert[0].is_active === true) {
          console.log("Fetched prev, checking interval.");
          //Check the time of the last alert, if within the cooldown period, skip
          const lastAlertTime = new Date(previous_alert[0].triggered_at).getTime();
          const currentTime = Date.now();
          const cooldownPeriod = alert.cooldown_interval * 60 * 1000;
          if (currentTime - lastAlertTime < cooldownPeriod) {
          console.log("Alert already active, and within cooldown interval; skipping.");
          continue;
          }
        }
        const { error: logErr } = await supabase.from("alert_logs").insert({
          alert_type: alert.alert_type,
          readings_id: reading.id,
          message: `High temperature: ${reading.temperature_c}°C`,
          sent: null,
          sent_to: null,
          device_id: reading.device_id,
          is_active: true
        });
        if (logErr) {
          console.error("Error inserting alert_log:", logErr);
          throw logErr;
        }
         console.log(`Alert created and sent? for device ${reading.device_id} at ${reading.temperature_c}°C`);
      }
    }
    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200,
      headers: jsonHeaders
    });
  } catch (e) {
    console.error("Error processing request:", e);
     const errorResponse =
      e instanceof Error
        ? { error: e.message, stack: e.stack }
        : { error: "Unknown error occurred" };

    return new Response(JSON.stringify(errorResponse), { status: 500, headers: jsonHeaders });
  }
});
