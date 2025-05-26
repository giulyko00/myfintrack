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
    const token = localStorage.getItem('auth.accessToken');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `JWT ${token}`;
    }
    
    return headers;
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
    try {
      console.log('Fetching transactions from API...');
      const response = await this.request('GET', 'transactions/');
      
      console.log('API Response:', response);
      
      // Check if response is valid
      if (!response) {
        console.error('Empty response from API');
        return [];
      }
      
      // Transform backend data format to frontend format
      if (Array.isArray(response)) {
        console.log(`Processing ${response.length} transactions`);
        return response.map(transaction => {
          // Add logging for debugging
          if (!transaction.id) console.warn('Transaction missing ID:', transaction);
          if (!transaction.date) console.warn('Transaction missing date:', transaction);
          
          return {
            id: transaction.id,
            date: transaction.date,
            // Map transaction_type IN/EX to income/expense
            type: transaction.transaction_type === 'IN' ? 'income' : 'expense',
            // Use the actual category from backend
            category: transaction.category_display || transaction.category,
            description: transaction.description || '',
            // Ensure positive amount
            amount: Math.abs(parseFloat(transaction.amount || 0))
          };
        });
      } else {
        console.warn('Response is not an array:', typeof response);
        // Handle case where response might be an object with results property
        if (response && response.results && Array.isArray(response.results)) {
          console.log(`Processing ${response.results.length} transactions from results property`);
          return response.results.map(transaction => ({
            id: transaction.id,
            date: transaction.date,
            type: transaction.transaction_type === 'IN' ? 'income' : 'expense',
            category: transaction.category_display || transaction.category,
            description: transaction.description || '',
            amount: Math.abs(parseFloat(transaction.amount || 0))
          }));
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error in getTransactions:', error);
      throw error;
    }
  }

  async addTransaction(transaction) {
    // Format date as YYYY-MM-DD as required by Django
    let formattedDate;
    if (transaction.date instanceof Date) {
      const d = transaction.date;
      formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } else if (typeof transaction.date === 'string') {
      // If it's already a string, ensure it's in YYYY-MM-DD format
      formattedDate = transaction.date.split('T')[0];
    } else {
      // Fallback to today
      const today = new Date();
      formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }

    // Map frontend format to backend format
    const backendTransaction = {
      amount: parseFloat(transaction.amount),
      transaction_type: transaction.type === 'income' ? 'IN' : 'EX',
      category: transaction.category,
      description: transaction.description || '',
      date: formattedDate
    };
    
    const response = await this.request('POST', 'transactions/', backendTransaction);
    
    // Transform the response back to frontend format
    return {
      id: response.id,
      date: response.date,
      type: response.transaction_type === 'IN' ? 'income' : 'expense',
      category: response.category_display || response.category,
      description: response.description,
      amount: Math.abs(parseFloat(response.amount))
    };
  }

  async updateTransaction(id, transaction) {
    // Format date as YYYY-MM-DD as required by Django
    let formattedDate;
    if (transaction.date instanceof Date) {
      const d = transaction.date;
      formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } else if (typeof transaction.date === 'string') {
      // If it's already a string, ensure it's in YYYY-MM-DD format
      formattedDate = transaction.date.split('T')[0];
    } else {
      // Fallback to today
      const today = new Date();
      formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }
    
    // Map frontend format to backend format
    const backendTransaction = {
      amount: parseFloat(transaction.amount),
      transaction_type: transaction.type === 'income' ? 'IN' : 'EX',
      category: transaction.category,
      description: transaction.description || '',
      date: formattedDate
    };
    
    const response = await this.request('PUT', `transactions/${id}/`, backendTransaction);
    
    // Transform the response back to frontend format
    return {
      id: response.id,
      date: response.date,
      type: response.transaction_type === 'IN' ? 'income' : 'expense',
      category: response.category_display || response.category,
      description: response.description,
      amount: Math.abs(parseFloat(response.amount))
    };
  }

  async deleteTransaction(id) {
    return this.request('DELETE', `transactions/${id}/`);
  }

  // Summary and Statistics API methods
  async getSummary() {
    return this.request('GET', 'transactions/summary/');
  }

  async getMonthlyStats() {
    return this.request('GET', 'transactions/monthly_summary/');
  }

  // Categories API methods
  async getCategories() {
    try {
      // First try to get categories from the dedicated categories endpoint
      const response = await this.request('GET', 'categories/');
      console.log('Categories response from /categories/', response);
      if (response && (response.income || response.expense)) {
        return response;
      }
      throw new Error('Invalid response format from categories endpoint');
    } catch (error) {
      console.log('Error from first categories endpoint:', error.message);
      // If that fails, try the transactions/categories endpoint
      try {
        const response = await this.request('GET', 'transactions/categories/');
        console.log('Categories response from /transactions/categories/', response);
        if (response && (response.income || response.expense)) {
          return response;
        }
        throw new Error('Invalid response format from transactions/categories endpoint');
      } catch (secondError) {
        console.error('Failed to fetch categories from both endpoints:', secondError);
        // Return default categories structure with correct mapping
        const defaultCategories = {
          income: [
            { label: 'Salary', value: 'SALARY' },
            { label: 'Freelance', value: 'FREELANCE' },
            { label: 'Investment', value: 'INVESTMENT' },
            { label: 'Gift', value: 'GIFT' },
            { label: 'Other Income', value: 'OTHER_INC' }
          ],
          expense: [
            { label: 'Housing', value: 'HOUSING' },
            { label: 'Food', value: 'FOOD' },
            { label: 'Transportation', value: 'TRANSPORT' },
            { label: 'Health', value: 'HEALTH' },
            { label: 'Entertainment', value: 'ENTERTAIN' },
            { label: 'Education', value: 'EDUCATION' },
            { label: 'Shopping', value: 'SHOPPING' },
            { label: 'Utilities', value: 'UTILITIES' },
            { label: 'Travel', value: 'TRAVEL' },
            { label: 'Other Expense', value: 'OTHER_EXP' }
          ]
        };
        console.log('Using default categories:', defaultCategories);
        return defaultCategories;
      }
    }
  }

  // Authentication API methods
  async login(credentials) {
    // We support both email and username for authentication
    const payload = {
      username: credentials.email, // Djoser might require username instead of email
      email: credentials.email,    // Keep email for safety
      password: credentials.password
    };
    return this.request('POST', 'auth/jwt/create/', payload);
  }

  async refreshToken(refresh) {
    return this.request('POST', 'auth/jwt/refresh/', { refresh });
  }

  async verifyToken(token) {
    return this.request('POST', 'auth/jwt/verify/', { token });
  }

  async register(userData) {
    return this.request('POST', 'auth/users/', userData);
  }

  async getUserInfo() {
    return this.request('GET', 'auth/users/me/');
  }
}
