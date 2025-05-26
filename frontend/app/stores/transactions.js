import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    transactions: [],
    categories: {
      income: [
        { label: 'Salary', value: 'Salary' },
        { label: 'Freelance', value: 'Freelance' },
        { label: 'Investments', value: 'Investments' },
        { label: 'Other Income', value: 'Other Income' }
      ],
      expense: [
        { label: 'Food', value: 'Food' },
        { label: 'Transport', value: 'Transport' },
        { label: 'Utilities', value: 'Utilities' },
        { label: 'Entertainment', value: 'Entertainment' },
        { label: 'Housing', value: 'Housing' },
        { label: 'Shopping', value: 'Shopping' },
        { label: 'Health', value: 'Health' },
        { label: 'Other Expense', value: 'Other Expense' }
      ]
    },
    loading: false,
    error: null,
    filters: {
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      type: 'all', // 'all', 'income', 'expense'
      category: 'all'
    }
  }),

  getters: {
    getAllTransactions: (state) => state.transactions,
    
    getFilteredTransactions: (state) => {
      return state.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date)
        const monthMatch = state.filters.month === 'all' || transactionDate.getMonth() === state.filters.month
        const yearMatch = state.filters.year === 'all' || transactionDate.getFullYear() === state.filters.year
        const typeMatch = state.filters.type === 'all' || transaction.type === state.filters.type
        const categoryMatch = state.filters.category === 'all' || transaction.category === state.filters.category
        
        return monthMatch && yearMatch && typeMatch && categoryMatch
      })
    },
    
    getTotalBalance: (state) => {
      return state.transactions.reduce((total, transaction) => {
        return transaction.type === 'income' 
          ? total + transaction.amount 
          : total - transaction.amount
      }, 0)
    },
    
    getMonthlyIncome: (state) => {
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      
      return state.transactions
        .filter(t => {
          const date = new Date(t.date)
          return t.type === 'income' && 
                 date.getMonth() === currentMonth &&
                 date.getFullYear() === currentYear
        })
        .reduce((total, t) => total + t.amount, 0)
    },
    
    getMonthlyExpenses: (state) => {
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      
      return state.transactions
        .filter(t => {
          const date = new Date(t.date)
          return t.type === 'expense' && 
                 date.getMonth() === currentMonth &&
                 date.getFullYear() === currentYear
        })
        .reduce((total, t) => total + t.amount, 0)
    },
    
    getCategoriesForType: (state) => (type) => {
      return type === 'income' ? state.categories.income : state.categories.expense
    },
    
    getCategoryList: (state) => {
      return [...state.categories.income, ...state.categories.expense]
    },
    
    getMonthlyStats: (state) => {
      // Get data for the last 6 months
      const today = new Date()
      const monthsData = []
      
      for (let i = 0; i < 6; i++) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const monthName = month.toLocaleString('default', { month: 'short' })
        
        // Filter transactions for this month
        const monthlyTransactions = state.transactions.filter(t => {
          const date = new Date(t.date)
          return date.getMonth() === month.getMonth() && 
                 date.getFullYear() === month.getFullYear()
        })
        
        // Calculate totals
        const income = monthlyTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
          
        const expense = monthlyTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)
          
        monthsData.unshift({
          month: monthName,
          income,
          expense,
          balance: income - expense
        })
      }
      
      return monthsData
    },
    
    getCategoryStats: (state) => {
      const categoryTotals = {}
      
      // Initialize categories
      state.categories.expense.forEach(cat => {
        categoryTotals[cat.value] = 0
      })
      
      // Calculate spending by category for current month
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      
      state.transactions
        .filter(t => {
          const date = new Date(t.date)
          return t.type === 'expense' && 
                 date.getMonth() === currentMonth &&
                 date.getFullYear() === currentYear
        })
        .forEach(t => {
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount
        })
      
      // Convert to array for chart display
      return Object.entries(categoryTotals)
        .filter(([_, amount]) => amount > 0)
        .map(([category, amount]) => ({ category, amount }))
    }
  },

  actions: {
    async fetchTransactions() {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const response = await api.getTransactions()
        
        // Process the transactions to ensure dates are Date objects
        const transactions = Array.isArray(response) ? response : []
        this.transactions = transactions.map(transaction => ({
          ...transaction,
          date: transaction.date ? new Date(transaction.date) : new Date(),
          // Ensure amount is a number
          amount: parseFloat(transaction.amount)
        }))

        // Sort transactions by date (newest first)
        this.transactions.sort((a, b) => b.date - a.date)
        
        // If API is not available yet, fall back to mock data
        if (this.transactions.length === 0) {
          // Default mock data for development
          this.transactions = [
            {
              id: 1,
              date: new Date('2025-05-22'),
              category: 'Salary',
              description: 'Monthly salary',
              amount: 2500,
              type: 'income'
            },
            {
              id: 2,
              date: new Date('2025-05-20'),
              category: 'Food',
              description: 'Grocery shopping',
              amount: 85.50,
              type: 'expense'
            },
            {
              id: 3,
              date: new Date('2025-05-18'),
              category: 'Transport',
              description: 'Fuel',
              amount: 45.00,
              type: 'expense'
            },
            {
              id: 4,
              date: new Date('2025-05-15'),
              category: 'Utilities',
              description: 'Electricity bill',
              amount: 75.20,
              type: 'expense'
            },
            {
              id: 5,
              date: new Date('2025-05-10'),
              category: 'Freelance',
              description: 'Web development project',
              amount: 600,
              type: 'income'
            },
            {
              id: 6,
              date: new Date('2025-04-25'),
              category: 'Salary',
              description: 'Monthly salary',
              amount: 2500,
              type: 'income'
            }
          ]
        }
      } catch (error) {
        this.error = error.message || 'Failed to fetch transactions'
        console.error('Error fetching transactions:', error)
        
        // Fallback to empty array on error
        this.transactions = []
      } finally {
        this.loading = false
      }
    },
    
    async fetchCategories() {
      try {
        const api = useApi()
        const response = await api.getCategories()
        
        if (response && response.income && response.expense) {
          this.categories = response
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Categories are already defined in state, so no need for fallback
      }
    },
    
    async addTransaction(transaction) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        
        // Format the transaction for the API
        const formattedTransaction = {
          ...transaction,
          // Format date as ISO string if it's a Date object
          date: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date
        }
        
        // Send to API
        const response = await api.addTransaction(formattedTransaction)
        
        // Process the returned transaction
        const newTransaction = {
          ...response,
          // Ensure date is a Date object
          date: response.date ? new Date(response.date) : new Date(),
          // Ensure amount is a number
          amount: parseFloat(response.amount)
        }
        
        // Add to state
        this.transactions.unshift(newTransaction)
        
        return newTransaction
      } catch (error) {
        this.error = error.message || 'Failed to add transaction'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateTransaction(id, updates) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        
        // Format the updates for the API
        const formattedUpdates = {
          ...updates,
          // Format date as ISO string if it's a Date object
          date: updates.date instanceof Date ? updates.date.toISOString() : updates.date
        }
        
        // Send to API
        const response = await api.updateTransaction(id, formattedUpdates)
        
        // Find the transaction in the state
        const index = this.transactions.findIndex(t => t.id === id)
        
        if (index === -1) {
          // If not found in state, fetch all transactions
          await this.fetchTransactions()
          return response
        }
        
        // Update the transaction in state
        this.transactions[index] = {
          ...this.transactions[index],
          ...response,
          // Ensure date is a Date object
          date: response.date ? new Date(response.date) : this.transactions[index].date,
          // Ensure amount is a number
          amount: parseFloat(response.amount)
        }
        
        return this.transactions[index]
      } catch (error) {
        this.error = error.message || 'Failed to update transaction'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteTransaction(id) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        
        // Send delete request to API
        const response = await api.deleteTransaction(id)
        
        // Find the transaction in state
        const index = this.transactions.findIndex(t => t.id === id)
        
        if (index !== -1) {
          // Remove from state
          this.transactions.splice(index, 1)
        }
        
        return response
      } catch (error) {
        this.error = error.message || 'Failed to delete transaction'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    setFilter(filter, value) {
      this.filters[filter] = value
    },
    
    resetFilters() {
      this.filters = {
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        type: 'all',
        category: 'all'
      }
    }
  }
})
