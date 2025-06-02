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
    const token = localStorage.getItem('auth.accessToken')
    
    if (!token) {
      // No token found, redirect to login
      return navigateTo('/auth/login')
    }
    
    // If we have a token, verify it's still valid
    const isAuthenticated = await authStore.checkAuth()
    
    // If token check failed, redirect to login
    if (!isAuthenticated) {
      return navigateTo('/auth/login')
    }
  }
})
