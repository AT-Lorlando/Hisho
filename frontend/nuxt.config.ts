// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from "@tailwindcss/vite";
import dotenv from 'dotenv'
const env = dotenv.config()

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  experimental: {
    asyncContext: true,
  },
  devtools: { enabled: true },
  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/ui', 'shadcn-nuxt', '@nuxt/icon', '@pinia/nuxt'],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  routeRules: {
    '/api/v1/**': { proxy: `${env.parsed?.API_URL}/**` }
  },
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui'
  },
  icon: {
    serverBundle: {
      collections: ['uil','lucide']
    }
  }
})