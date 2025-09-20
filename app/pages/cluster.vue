<script setup lang="ts">
import { onMounted, ref } from 'vue';

const map = ref<any>(null);

onMounted(async () => {
	const L = await import('leaflet');
	await import('leaflet/dist/leaflet.css');
	await import('leaflet.markercluster');
	await import('leaflet.markercluster/dist/MarkerCluster.Default.css');
	map.value = L.map('map').setView([59.3293, 18.0686], 12);
	// Base tiles
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
	}).addTo(map.value);

	// Example coordinates (your main + Ringvägen + some extras)
	const locations = [
		{ lat: 59.45, lng: 18.05, label: 'Weather station' },
		{ lat: 59.43, lng: 18.051, label: 'Weather station 2' },
		{ lat: 59.44, lng: 18.055, label: 'Weather station 3' },
		{ lat: 59.3127, lng: 18.0863, label: 'Ringvägen' },
		{ lat: 59.3293, lng: 18.0686, label: 'Stockholm Central' },
		{ lat: 59.3346, lng: 18.0632, label: 'Gamla Stan' },
	];

	// Cluster group
	const markers = L.markerClusterGroup();

	// Loop through all locations and add circle markers
	locations.forEach((loc) => {
		const marker = L.circleMarker([loc.lat, loc.lng], {
			radius: 8,
			color: 'blue',
			fillColor: 'blue',
			fillOpacity: 0.8,
		}).bindPopup(loc.label);

		markers.addLayer(marker);
	});

	// Add cluster group to map
	map.value.addLayer(markers);
});
</script>

<template>
	<div>
		<h2>Cluster test</h2>
		<div id="map" />
	</div>
</template>

<style scoped>
#map {
	width: 700px;
	height: 700px;
}
</style>
