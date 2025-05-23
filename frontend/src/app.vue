<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UNotifications />
  </div>
</template>

<script setup>
import { useThemeStore } from '~/stores/theme';
import { onMounted } from 'vue';

const themeStore = useThemeStore();

// Apply theme and set up event listeners only on client-side
onMounted(() => {
  if (process.client) {
    // Initialize theme
    themeStore.initTheme();
    
    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (themeStore.theme === 'system') {
        themeStore.setTheme('system');
      }
    });
  }
});
</script>

<style>
/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
