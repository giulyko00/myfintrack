// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // Runtime config
  runtimeConfig: {
    // The private keys which are only available server-side
    // Keys within public are also exposed client-side
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    }
  },
  
  // Modules
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxt/devtools',
  ],
  
  // CSS
  css: [
    '@/assets/css/main.css',
  ],
  
  // Build configuration
  build: {
    transpile: ['chart.js'],
  },
  
  // Vue configuration
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => ['chart'].includes(tag),
    },
  },
  
  // Auto-import components
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  
  // TypeScript
  typescript: {
    strict: true,
    typeCheck: true,
  },
  
  // Source directory
  srcDir: 'src/',
  
  // Server configuration
  devServer: {
    port: 3000,
    host: '0.0.0.0',
  },
})
