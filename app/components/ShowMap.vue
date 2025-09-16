<script setup lang="ts">
import { onMounted, watch, ref } from 'vue';

interface Props {
	lat: number;
	lng: number;
	zoom?: number;
}
const props = defineProps<Props>();
const map = ref<any>(null);
const marker = ref<any>(null);

onMounted(async () => {
	const L = await import('leaflet');
	await import('leaflet/dist/leaflet.css');
	map.value = L.map('map').setView([props.lat, props.lng], props.zoom ?? 12);

	// OSM tile layer (for dev/test)
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
	}).addTo(map.value);

	// Marker
	marker.value = L.marker([props.lat, props.lng])
		.addTo(map.value)
		.bindPopup(`Weather station<br/>Lat: ${props.lat}, Lng: ${props.lng}`)
		.openPopup();
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
