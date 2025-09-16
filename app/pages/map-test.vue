<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useSupabase } from '~/composables/useSupabase';

const coords = ref<{ lat: number; lng: number } | null>(null);
const map = ref<any>(null);
const marker = ref<any>(null);
let baseLat = 0;
let baseLng = 0;

onMounted(async () => {
	const supabase = useSupabase();

	// Fetch latest weather reading
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

	baseLat = data.lat;
	baseLng = data.lon;
	coords.value = { lat: baseLat, lng: baseLng };

	// Load Leaflet dynamically
	const L = await import('leaflet');
	await import('leaflet/dist/leaflet.css');

	map.value = L.map('map').setView([coords.value.lat, coords.value.lng], 12);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
	}).addTo(map.value);

	marker.value = L.marker([coords.value.lat, coords.value.lng])
		.addTo(map.value)
		.bindPopup(`Weather station<br/>Lat: ${coords.value.lat}, Lng: ${coords.value.lng}`)
		.openPopup();

	// Simulate movement for demo
	let counter = 0;
	setInterval(() => {
		counter++;
		coords.value = {
			lat: baseLat + counter * 0.0005, // ≈ 20 m north per update
			lng: baseLng + Math.sin(counter / 5) * 0.0005, // small east/west wiggle
		};
	}, 5000); // every 5 seconds for demo
});

// Update marker whenever coords change
watch(coords, (newCoords) => {
	if (newCoords && marker.value && map.value) {
		marker.value.setLatLng([newCoords.lat, newCoords.lng]);
		map.value.panTo([newCoords.lat, newCoords.lng]);
	}
});
</script>

<template>
	<div class="p-6">
		<h1 class="text-2xl font-bold mb-4">Moving map Example</h1>

		<client-only>
			<div
				v-if="coords"
				id="map"
				class="w-full h-[500px] rounded-xl shadow-md"></div>
			<p v-else>Loading map...</p>
		</client-only>
	</div>
</template>

<style scoped>
#map {
	width: 700px;
	height: 700px;
}
</style>
