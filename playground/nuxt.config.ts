import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['../src/module', '@vueuse/nuxt'],
  devtools: { enabled: true },

  compatibilityDate: '2025-02-15',
})
