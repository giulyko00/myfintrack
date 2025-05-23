import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore();
  const router = useRouter();
  
  // Only run on client-side
  if (process.client) {
    // Initialize auth state
    await authStore.initAuth();
    
    // Add route guard for protected routes
    router.beforeEach(async (to, from, next) => {
      const isAuthenticated = authStore.isAuthenticated;
      const isAuthRoute = to.path.startsWith('/auth');
      
      // If the user is not authenticated and tries to access a protected route
      if (!isAuthenticated && !isAuthRoute) {
        return next('/auth/login');
      }
      
      // If the user is authenticated and tries to access an auth route
      if (isAuthenticated && isAuthRoute) {
        return next('/dashboard');
      }
      
      next();
    });
    
    // Handle token refresh before it expires
    let refreshTimeout;
    
    const scheduleTokenRefresh = () => {
      if (authStore.isAuthenticated && authStore.accessToken) {
        // Clear any existing timeout
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
        }
        
        // Get token expiration time (JWT tokens have exp claim in seconds)
        try {
          const token = authStore.accessToken.split('.')[1];
          const payload = JSON.parse(atob(token));
          const expiresIn = (payload.exp * 1000) - Date.now() - 60000; // Refresh 1 minute before expiry
          
          if (expiresIn > 0) {
            refreshTimeout = setTimeout(async () => {
              try {
                await authStore.refreshAccessToken();
                scheduleTokenRefresh(); // Schedule next refresh
              } catch (error) {
                console.error('Failed to refresh token:', error);
                authStore.logout();
              }
            }, expiresIn);
          } else {
            // Token already expired or about to expire, refresh immediately
            authStore.refreshAccessToken().catch(() => {
              authStore.logout();
            });
          }
        } catch (error) {
          console.error('Error parsing token:', error);
        }
      }
    };
    
    // Schedule initial token refresh
    scheduleTokenRefresh();
    
    // Watch for auth state changes to reschedule token refresh
    watch(() => authStore.isAuthenticated, (newVal) => {
      if (newVal) {
        scheduleTokenRefresh();
      } else if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    });
    
    // Clean up on unmount
    onUnmounted(() => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    });
  }
});
