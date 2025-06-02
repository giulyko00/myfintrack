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
    '/**': { middleware: ['auth'] },
    '/auth/**': { middleware: [] }
  },

  // Optimize routing behavior
  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true
  },
  
  // Router configuration
  router: {
    options: {
      strict: false,
      scrollBehaviorType: 'smooth'
    }
  },

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-27',

  app: {
    // Simplify transitions to avoid routing issues
    pageTransition: false,
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