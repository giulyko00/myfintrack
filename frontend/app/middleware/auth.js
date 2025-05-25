import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware for login and register pages
  if (to.path === '/auth/login' || to.path === '/auth/register') {
    return
  }
  
  const authStore = useAuthStore()
  
  // Check if the user is authenticated
  if (!authStore.isAuthenticated) {
    // Try to restore authentication from localStorage
    const isAuthenticated = await authStore.checkAuth()
    
    // If still not authenticated, redirect to login
    if (!isAuthenticated) {
      return navigateTo('/auth/login')
    }
  }
})
