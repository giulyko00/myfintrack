import { defineStore } from 'pinia'
import ApiService from '~/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: false,
    error: null,
    // Test user credentials
    testCredentials: {
      email: 'demo@myfintrack.com',
      password: 'Password123'
    }
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    getUser: (state) => state.user,
    getTestCredentials: (state) => state.testCredentials
  },

  actions: {
    async login(email, password, remember = false) {
      this.loading = true
      this.error = null

      try {
        // Email validation
        if (!email || !email.includes('@')) {
          throw new Error('Please enter a valid email address')
        }
        
        // Password validation
        if (!password || password.length < 8) {
          throw new Error('Password must be at least 8 characters long')
        }
        
        const apiService = new ApiService()
        
        // Make real API call to authenticate
        const response = await apiService.login({
          email,
          password
        })
        
        console.log('Login response:', response)
        
        // Save tokens
        this.accessToken = response.access
        this.refreshToken = response.refresh
        
        // Save to localStorage immediately to ensure auth headers are set for the next request
        localStorage.setItem('auth.accessToken', this.accessToken)
        localStorage.setItem('auth.refreshToken', this.refreshToken)
        
        try {
          // Get user data
          const userData = await apiService.getUserInfo()
          this.user = userData
          
          // Save to localStorage
          localStorage.setItem('auth.user', JSON.stringify(userData))
        } catch (userError) {
          console.error('Error fetching user data:', userError)
          // Continue login process even if user data fetch fails
          // Create a minimal user object
          this.user = { email }
          localStorage.setItem('auth.user', JSON.stringify({ email }))
        }
        
        return this.user
      } catch (error) {
        console.error('Login error:', error)
        this.error = error.message || 'Authentication failed'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async logout() {
      // Clear state
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      
      // Clear localStorage
      localStorage.removeItem('auth.accessToken')
      localStorage.removeItem('auth.refreshToken')
      localStorage.removeItem('auth.user')
    },
    
    async checkAuth() {
      // Check if we have tokens in localStorage
      const accessToken = localStorage.getItem('auth.accessToken')
      const refreshToken = localStorage.getItem('auth.refreshToken')
      const user = localStorage.getItem('auth.user')
      
      if (!accessToken || !refreshToken) {
        return false
      }
      
      try {
        // Verify token validity
        const apiService = new ApiService()
        await apiService.verifyToken(accessToken)
        
        // Set state from localStorage
        this.accessToken = accessToken
        this.refreshToken = refreshToken
        
        if (user) {
          this.user = JSON.parse(user)
        } else {
          // Fetch user data if we have valid tokens but no user data
          const userData = await apiService.getUserInfo()
          this.user = userData
          localStorage.setItem('auth.user', JSON.stringify(userData))
        }
        
        return true
      } catch (error) {
        // Token is invalid, try to refresh
        return await this.refreshAuthToken()
      }
    },
    
    async register(email, password, name) {
      this.loading = true
      this.error = null
      
      try {
        // Validation
        if (!email.includes('@')) {
          throw new Error('Invalid email format')
        }
        
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters')
        }
        
        const apiService = new ApiService()
        
        // Register user
        await apiService.register({
          email,
          password,
          re_password: password,  // Django-Djoser requires password confirmation
          name: name || email.split('@')[0]
        })
        
        // Login after registration
        return await this.login(email, password, true)
      } catch (error) {
        console.error('Registration error:', error)
        this.error = error.message || 'Registration failed'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async refreshAuthToken() {
      if (!this.refreshToken) {
        return false
      }
      
      try {
        const apiService = new ApiService()
        const response = await apiService.refreshToken(this.refreshToken)
        
        // Update tokens
        this.accessToken = response.access
        localStorage.setItem('auth.accessToken', this.accessToken)
        
        // If the response includes a new refresh token
        if (response.refresh) {
          this.refreshToken = response.refresh
          localStorage.setItem('auth.refreshToken', this.refreshToken)
        }
        
        return true
      } catch (error) {
        console.error('Token refresh failed:', error)
        // Clear auth state on refresh failure
        this.logout()
        return false
      }
    }
  }
})
