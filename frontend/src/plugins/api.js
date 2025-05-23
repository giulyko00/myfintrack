export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const router = useRouter();

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (authStore.accessToken) {
      headers.Authorization = `Bearer ${authStore.accessToken}`;
    }

    return headers;
  };

  // Helper function to handle API errors
  const handleApiError = async (error) => {
    // Handle 401 Unauthorized errors
    if (error.status === 401) {
      try {
        // Try to refresh the token
        await authStore.refreshAccessToken();
        
        // Retry the original request with the new token
        const retryResponse = await $fetch(error.request, {
          headers: {
            ...error.request.options.headers,
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        });
        
        return retryResponse;
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, log the user out
        await authStore.logout();
        await router.push('/auth/login');
      }
    }
    
    // For other errors, just rethrow
    throw error;
  };

  // Add $api to the Nuxt app
  nuxtApp.provide('api', {
    // GET request
    async get(url, options = {}) {
      try {
        return await $fetch(url, {
          ...options,
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            ...options.headers,
          },
        });
      } catch (error) {
        return handleApiError(error);
      }
    },

    // POST request
    async post(url, body, options = {}) {
      try {
        return await $fetch(url, {
          ...options,
          method: 'POST',
          body,
          headers: {
            ...getAuthHeaders(),
            ...options.headers,
          },
        });
      } catch (error) {
        return handleApiError(error);
      }
    },

    // PUT request
    async put(url, body, options = {}) {
      try {
        return await $fetch(url, {
          ...options,
          method: 'PUT',
          body,
          headers: {
            ...getAuthHeaders(),
            ...options.headers,
          },
        });
      } catch (error) {
        return handleApiError(error);
      }
    },

    // PATCH request
    async patch(url, body, options = {}) {
      try {
        return await $fetch(url, {
          ...options,
          method: 'PATCH',
          body,
          headers: {
            ...getAuthHeaders(),
            ...options.headers,
          },
        });
      } catch (error) {
        return handleApiError(error);
      }
    },

    // DELETE request
    async delete(url, options = {}) {
      try {
        return await $fetch(url, {
          ...options,
          method: 'DELETE',
          headers: {
            ...getAuthHeaders(),
            ...options.headers,
          },
        });
      } catch (error) {
        return handleApiError(error);
      }
    },
  });
});
