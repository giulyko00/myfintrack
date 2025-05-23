import { useAuthStore } from '~/stores/auth';

export const useApi = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const router = useRouter();

  const handleError = async (error) => {
    if (error.status === 401) {
      try {
        // Try to refresh the token
        await authStore.refreshAccessToken();
        
        // Retry the original request with the new token
        return await $fetch(error.request, {
          headers: {
            ...error.request.options.headers,
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        });
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, log the user out
        await authStore.logout();
        await router.push('/login');
      }
    }
    
    // For other errors, just rethrow
    throw error;
  };

  // GET request
  const get = async (url, options = {}) => {
    try {
      return await $fetch(url, {
        ...options,
        method: 'GET',
        headers: {
          ...options.headers,
          ...(authStore.accessToken && { 
            Authorization: `Bearer ${authStore.accessToken}` 
          }),
        },
      });
    } catch (error) {
      return handleError(error);
    }
  };

  // POST request
  const post = async (url, body, options = {}) => {
    try {
      return await $fetch(url, {
        ...options,
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          ...(authStore.accessToken && { 
            Authorization: `Bearer ${authStore.accessToken}` 
          }),
        },
      });
    } catch (error) {
      return handleError(error);
    }
  };

  // PUT request
  const put = async (url, body, options = {}) => {
    try {
      return await $fetch(url, {
        ...options,
        method: 'PUT',
        body,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          ...(authStore.accessToken && { 
            Authorization: `Bearer ${authStore.accessToken}` 
          }),
        },
      });
    } catch (error) {
      return handleError(error);
    }
  };

  // PATCH request
  const patch = async (url, body, options = {}) => {
    try {
      return await $fetch(url, {
        ...options,
        method: 'PATCH',
        body,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          ...(authStore.accessToken && { 
            Authorization: `Bearer ${authStore.accessToken}` 
          }),
        },
      });
    } catch (error) {
      return handleError(error);
    }
  };

  // DELETE request
  const del = async (url, options = {}) => {
    try {
      return await $fetch(url, {
        ...options,
        method: 'DELETE',
        headers: {
          ...options.headers,
          ...(authStore.accessToken && { 
            Authorization: `Bearer ${authStore.accessToken}` 
          }),
        },
      });
    } catch (error) {
      return handleError(error);
    }
  };

  return {
    get,
    post,
    put,
    patch,
    delete: del,
  };
};

export default useApi;
