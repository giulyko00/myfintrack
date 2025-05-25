import { defineConfig } from 'tailwindcss'

export default defineConfig({
  // Nuxt UI uses content but also requires safelist for dynamically generated classes
  content: [
    './app/**/*.{js,ts,vue}',
    './components/**/*.{js,ts,vue}',
    './layouts/**/*.{js,ts,vue}',
    './pages/**/*.{js,ts,vue}',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './node_modules/@nuxt/ui-templates/**/*.{js,ts,vue}',
    './node_modules/@nuxt/ui/dist/**/*.{js,mjs}',
  ],
  // Explicitly configure dark mode to use class
  darkMode: 'class',
  theme: {
    extend: {
      // Let Nuxt UI handle colors through CSS variables
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          950: 'var(--color-primary-950)',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
})
