/**
 * API Service for MyFinTrack
 * Handles all API requests to the backend
 */

export default class ApiService {
  constructor() {
    this.config = useRuntimeConfig();
    this.baseUrl = this.config.public.apiBaseUrl;
  }

  /**
   * Get the authorization headers for API requests
   */
  getHeaders() {
    const token = localStorage.getItem('auth.token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  /**
   * Make a request to the API
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request data (for POST, PUT)
   * @returns {Promise} - Response from the API
   */
  async request(method, endpoint, data = null) {
    const url = `${this.baseUrl}/${endpoint}`;
    
    const options = {
      method,
      headers: this.getHeaders()
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }
      
      // Check if response is empty
      const text = await response.text();
      if (!text) return {};
      
      // Parse JSON response
      return JSON.parse(text);
    } catch (error) {
      console.error(`API Error (${method} ${endpoint}):`, error);
      throw error;
    }
  }

  // Transactions API methods
  async getTransactions() {
    return this.request('GET', 'transactions');
  }

  async addTransaction(transaction) {
    return this.request('POST', 'transactions', transaction);
  }

  async updateTransaction(id, transaction) {
    return this.request('PUT', `transactions/${id}`, transaction);
  }

  async deleteTransaction(id) {
    return this.request('DELETE', `transactions/${id}`);
  }

  // Categories API methods
  async getCategories() {
    return this.request('GET', 'categories');
  }
}
