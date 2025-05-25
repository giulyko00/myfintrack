<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
    <UCard class="w-full max-w-md text-center">
      <div class="space-y-4">
        <div class="flex flex-col items-center space-y-2">
          <h1 class="text-3xl font-bold">MyFinTrack</h1>
          <p class="text-gray-500 dark:text-gray-400">Personal Finance & Trading Journal</p>
        </div>
        
        <div v-if="isLoading" class="flex justify-center py-4">
          <UProgress animation="carousel" indeterminate color="primary" />
        </div>
        
        <div v-else class="space-y-4 py-4">
          <p class="text-sm">{{ redirectMessage }}</p>
          
          <div class="flex justify-center gap-4">
            <UButton 
              v-if="!isAuthenticated" 
              color="primary" 
              label="Login" 
              icon="i-heroicons-arrow-right-circle" 
              to="/auth/login" 
            />
            <UButton 
              v-else 
              color="primary" 
              label="Go to Dashboard" 
              icon="i-heroicons-chart-bar" 
              to="/dashboard" 
            />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const isLoading = ref(true)

// Check authentication status on mount
onMounted(async () => {
  try {
    await authStore.checkAuth()
  } finally {
    isLoading.value = false
  }
})

const isAuthenticated = computed(() => authStore.isAuthenticated)

const redirectMessage = computed(() => {
  return isAuthenticated.value
    ? 'You are logged in. Proceed to your dashboard.'
    : 'Welcome to MyFinTrack. Please log in to continue.'
})
</script>
