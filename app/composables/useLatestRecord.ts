import { ref, onMounted, onUnmounted } from "vue";
import type { Database } from "../../types/database.types";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import { useSupabase } from "./useSupabase";

type Reading = Database["public"]["Tables"]["weather_readings"]["Row"];

export function useLatestReading() {
  const supabase = useSupabase();
  const latest = ref<Reading | null>(null);

  const fetchLatest = async () => {
    const { data, error } = await supabase
      .from("weather_readings")
      .select("*")
      .order("observed_at", { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      latest.value = data;
    }
  };

  onMounted(async () => {
    await fetchLatest();

    const channel = supabase
      .channel("realtime:readings")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "weather_readings" },
        (payload: RealtimePostgresChangesPayload<Reading>) => { latest.value = payload.new as Reading;
         
        }
      )
      .subscribe((status: string) => {console.log("Subscription status:", status);});

    onUnmounted(() => {
      supabase.removeChannel(channel);
    });
  });

  return { latest };
}
