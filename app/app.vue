<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
	<div>
		<NuxtRouteAnnouncer />
		<div class="p-4">
			<h2 class="text-xl font-bold">Latest Reading</h2>
			<div v-if="latest">
				<pre>{{ latest.test_data }}</pre>
				<p class="text-gray-500">Fetched at: {{ latest.created_at }}</p>
			</div>
			<p v-else>Loading...</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useLatestReading } from './composables/useLatestRecord';

const { latest } = useLatestReading();
</script>
