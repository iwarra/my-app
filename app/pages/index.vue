<script setup lang="ts">
import ShowMap from '~/components/ShowMap.vue';
import { onMounted, ref } from 'vue';
import { useSupabase } from '~/composables/useSupabase';

const coords = ref<{ lat: number; lng: number } | null>(null);

onMounted(async () => {
	const supabase = useSupabase();
	const { data, error } = await supabase
		.from('weather_readings')
		.select('lat, lon')
		.order('created_at', { ascending: false })
		.limit(1)
		.single();

	if (error) {
		console.error('Supabase error:', error.message);
		return;
	}
	const baseLat = data.lat;
	const baseLng = data.lon;
	coords.value = { lat: baseLat, lng: baseLng };
	let counter = 0;

	setInterval(() => {
		counter++;
		coords.value = {
			lat: baseLat + counter * 0.0002, // ≈ 20 m north per minute
			lng: baseLng + counter * 0.0005, // wiggle east/west
		};
	}, 60000); // every 1 minute

	// Listen for changes in the table - later for realtime
	// supabase
	//   .channel('location-changes')
	//   .on(
	//     'postgres_changes',
	//     { event: '*', schema: 'public', table: 'locations' },
	//     (payload) => {
	//       if (payload.new) {
	//         coords.value = { lat: payload.new.lat, lng: payload.new.lng }
	//       }
	//     }
	//   )
	//   .subscribe()
});
</script>

<template>
	<div class="p-6">
		<h1 class="text-2xl font-bold mb-4">Map Example</h1>
		<client-only>
			<ShowMap
				v-if="coords"
				:lat="coords.lat"
				:lng="coords.lng"
				:zoom="12" />
			<p v-else>Loading map...</p>
		</client-only>
	</div>
</template>
