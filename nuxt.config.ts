// https://nuxt.com/docs/api/configuration/nuxt-config
import tsconfigPaths from 'vite-tsconfig-paths'
export default defineNuxtConfig({
  modules: ['@unocss/nuxt'],
  nitro: {
    preset: 'vercel',
  },
  vite: {
    plugins: [tsconfigPaths()],
  },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
    },
  },
})
