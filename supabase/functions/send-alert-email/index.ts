import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! 
);
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

serve(async (req: Request) =>  {
  try {
    const payload = await req.json();
    const {id, device_id, alert_type, message} = payload.record;
    const { data: settings, error: settingsErr } = await supabase
      .from("alert_settings")
      .select("cooldown_interval, email")
      .eq("active", true)
      .eq("alert_type", alert_type)
      .single();
     if (settingsErr || !settings) {
      console.error("Settings error", settingsErr);
      return new Response("No settings", { status: 400 });
    }

    const cooldownMinutes = settings.cooldown_interval;

    //Check recent alerts for this device and type - pick last sent if exists
    const { data: recentAlert, error: recentError } = await supabase
    .from("alert_logs")
    .select("id, sent_at")
    .eq("device_id", device_id)
    .eq("alert_type", alert_type)
    .eq("sent", true)
    .order("sent_at", { ascending: false }) //latest sent alert
    .limit(1);

    if (recentError) {
      console.error("Check error", recentError);
      return new Response("DB error", { status: 500 });
    }

    //Check cooldown
    if (
    recentAlert.length > 0 &&
    new Date(recentAlert[0].sent_at).getTime() >
      Date.now() - cooldownMinutes * 60 * 1000 // convert minutes to ms
    ) {
      //Update sent to false since we are not sending due to cooldown
      await supabase.from("alert_logs").update({sent: false}).eq("id", id);
      // Still in cooldown - return without sending email
      return new Response("Cooldown active", { status: 200 });
    }
    //Send email alert via Resend
    const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "mervin@kwik.se",
      to: settings.email,
      subject: "High Temperature Alert",
      html: `<p>${message}</p>`,
    }),
  });
    if (!response.ok) {
    console.error("Email send failed", await response.text());
    return new Response("Send failed", { status: 500 });
  }

  // Update alert log
  await supabase.from("alert_logs").update({
    sent: true,
    sent_at: new Date().toISOString(),
    sent_to: settings.email,
  }).eq("id", id);

  return new Response("Alert sent", { status: 200 });

  } catch (e) {
    console.error("Error sending alert email:", e);
    return new Response("Error sending alert email", { status: 500 });
  }
});