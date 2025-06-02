// Global auth middleware that runs on every page
export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware for login and register pages to avoid redirect loops
  if (to.path === '/auth/login' || to.path === '/auth/register') {
    return
  }
  
  // Check if we're in the browser (client-side)
  if (process.client) {
    // Check for token
    const token = localStorage.getItem('auth.accessToken')
    
    // If no token is found, redirect to login
    if (!token) {
      console.log('No authentication token found, redirecting to login')
      return navigateTo('/auth/login')
    }
  }
})
