import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
  },

  actions: {
    async login({ email, password }) {
      try {
        const { data } = await $fetch('/api/auth/jwt/create/', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        this.accessToken = data.access;
        this.refreshToken = data.refresh;
        this.isAuthenticated = true;

        // Fetch user data
        await this.fetchUser();

        // Save tokens to localStorage
        if (process.client) {
          localStorage.setItem('accessToken', this.accessToken);
          localStorage.setItem('refreshToken', this.refreshToken);
        }

        return { success: true };
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error?.data || 'Login failed' };
      }
    },

    async register(userData) {
      try {
        await $fetch('/api/auth/users/', {
          method: 'POST',
          body: JSON.stringify(userData),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        // Auto-login after registration
        return await this.login({
          email: userData.email,
          password: userData.password,
        });
      } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error?.data || 'Registration failed' };
      }
    },

    async logout() {
      try {
        // Call logout endpoint if needed
        await $fetch('/api/auth/token/logout/', {
          method: 'POST',
          headers: this.getAuthHeader(),
        });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.clearAuth();
        const router = useRouter();
        await router.push('/login');
      }
    },

    async fetchUser() {
      try {
        const { data } = await $fetch('/api/auth/users/me/', {
          headers: this.getAuthHeader(),
        });
        this.user = data;
        return data;
      } catch (error) {
        console.error('Failed to fetch user:', error);
        this.clearAuth();
        throw error;
      }
    },

    getAuthHeader() {
      return {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      };
    },

    clearAuth() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.isAuthenticated = false;
      
      if (process.client) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    },

    async refreshAccessToken() {
      if (!this.refreshToken) {
        this.clearAuth();
        return null;
      }

      try {
        const { data } = await $fetch('/api/auth/jwt/refresh/', {
          method: 'POST',
          body: JSON.stringify({ refresh: this.refreshToken }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        this.accessToken = data.access;
        
        if (process.client) {
          localStorage.setItem('accessToken', this.accessToken);
        }
        
        return data.access;
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.clearAuth();
        return null;
      }
    },

    async initAuth() {
      if (process.client) {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken && refreshToken) {
          this.accessToken = accessToken;
          this.refreshToken = refreshToken;
          this.isAuthenticated = true;

          try {
            await this.fetchUser();
          } catch (error) {
            console.error('Failed to fetch user on init:', error);
            this.clearAuth();
          }
        }
      }
    },
  },
});
