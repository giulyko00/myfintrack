// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxt/eslint'
  ],

  // Global middleware configuration
  routeRules: {
    '/**': { middleware: ['auth'] }
  },

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-27',

  app: {
    // Apply global page transitions - only use one transition to avoid DOM conflicts
    pageTransition: { name: 'page', mode: 'out-in' },
    // Disable layout transitions to avoid DOM manipulation conflicts
    layoutTransition: false,
    head: {
      title: 'MyFinTrack - Personal Finance Tracker',
      meta: [
        { name: 'description', content: 'Track your personal finances and trading activities with MyFinTrack' }
      ],
      script: [
        { 
          src: 'https://js.puter.com/v2/',
          defer: true,
          tagPosition: 'head'
        }
      ]
    }
  },

  // Setup API URL for backend connection
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
    }
  }
})