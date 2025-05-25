import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    getUser: (state) => state.user
  },

  actions: {
    async login(email, password, remember = false) {
      this.loading = true
      this.error = null

      try {
        // For demo purposes, using setTimeout to simulate API call
        // In a real app, this would be an API call to your Django backend
        await new Promise(resolve => setTimeout(resolve, 1000))

        // For demo, accept any login with valid email format
        if (!email.includes('@')) {
          throw new Error('Invalid email format')
        }
        
        // Mock successful login
        const userData = {
          id: 1,
          email,
          name: email.split('@')[0],
          created_at: new Date().toISOString()
        }
        
        const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2)
        
        // Save to state
        this.user = userData
        this.token = token
        
        // Save to localStorage if remember is true
        if (remember) {
          localStorage.setItem('auth.token', token)
          localStorage.setItem('auth.user', JSON.stringify(userData))
        }
        
        return userData
      } catch (error) {
        this.error = error.message || 'Authentication failed'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async logout() {
      // For demo purposes
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Clear state
      this.user = null
      this.token = null
      
      // Clear localStorage
      localStorage.removeItem('auth.token')
      localStorage.removeItem('auth.user')
    },
    
    async checkAuth() {
      // Check if we have a token in localStorage
      const token = localStorage.getItem('auth.token')
      const user = localStorage.getItem('auth.user')
      
      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
        return true
      }
      
      return false
    },
    
    async register(email, password, name) {
      this.loading = true
      this.error = null
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Validation
        if (!email.includes('@')) {
          throw new Error('Invalid email format')
        }
        
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters')
        }
        
        // Mock registration response
        const userData = {
          id: Math.floor(Math.random() * 1000),
          email,
          name: name || email.split('@')[0],
          created_at: new Date().toISOString()
        }
        
        const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2)
        
        // Save to state
        this.user = userData
        this.token = token
        
        // Save to localStorage
        localStorage.setItem('auth.token', token)
        localStorage.setItem('auth.user', JSON.stringify(userData))
        
        return userData
      } catch (error) {
        this.error = error.message || 'Registration failed'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
