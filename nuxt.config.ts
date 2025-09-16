// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	// modules: ['@nuxt/test-utils', '@nuxt/ui', '@nuxt/eslint', '@nuxtjs/supabase'],
	runtimeConfig: {
		supabaseUrl: process.env.SUPABASE_URL,
		supabaseKey: process.env.SUPABASE_KEY,
		public: {
			supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
			supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
		},
	},
	pages: true,
});
