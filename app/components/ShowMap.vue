<script setup lang="ts">
import { onMounted, watch, ref } from 'vue';

interface Props {
	lat: number;
	lng: number;
	zoom?: number;
}
const props = defineProps<Props>();
const map = ref<any>(null);

onMounted(async () => {
	const L = await import('leaflet');
	await import('leaflet/dist/leaflet.css');
	map.value = L.map('map').setView([props.lat, props.lng], props.zoom ?? 12);

	// OSM tile layer (for dev/test)
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
	}).addTo(map.value);

	// Dot marker for main station
	L.circleMarker([props.lat, props.lng], {
		radius: 6, // size of the dot
		color: 'red', // border color
		fillColor: 'red',
		fillOpacity: 0.7,
	})
		.addTo(map.value)
		.bindPopup(`Weather station<br/>Lat: ${props.lat}, Lng: ${props.lng}`);

	// Dot marker for second location
	L.circleMarker([59.3127, 18.0863], {
		radius: 6,
		color: 'blue',
		fillColor: 'blue',
		fillOpacity: 0.8,
	})
		.addTo(map.value)
		.bindPopup('Second location');
});

//React to prop changes (from DB realtime updates)
// watch(
//   () => [props.lat, props.lng],
//   ([newLat, newLng]) => {
//     if (marker.value && map.value) {
//       marker.value.setLatLng([newLat, newLng])
//       map.value.panTo([newLat, newLng])
//     }
//   }
//)
</script>

<template>
	<div id="map" />
</template>

<style scoped>
#map {
	width: 700px;
	height: 700px;
}
</style>
