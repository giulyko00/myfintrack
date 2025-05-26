import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    transactions: [],
    categories: {
      income: [],
      expense: []
    },
    summary: {
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      categoryExpenses: []
    },
    monthlyStats: [],
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
    
    // Use the summary data from the backend when available
    getTotalBalance: (state) => {
      if (state.summary.totalBalance !== undefined) {
        return state.summary.totalBalance
      }
      
      // Fallback to calculating from transactions
      return state.transactions.reduce((total, transaction) => {
        return transaction.type === 'income' 
          ? total + transaction.amount 
          : total - transaction.amount
      }, 0)
    },
    
    getMonthlyIncome: (state) => {
      if (state.summary.monthlyIncome !== undefined) {
        return state.summary.monthlyIncome
      }
      
      // Fallback to calculating from transactions
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
      if (state.summary.monthlyExpenses !== undefined) {
        return state.summary.monthlyExpenses
      }
      
      // Fallback to calculating from transactions
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
      const categories = type === 'income' ? state.categories.income : state.categories.expense
      
      // Se non ci sono categorie, restituisci le categorie predefinite
      if (!categories || categories.length === 0) {
        console.warn(`No categories found for type: ${type}, using default categories`)
        
        // Categorie predefinite come fallback
        if (type === 'income') {
          return [
            { label: 'Salary', value: 'SALARY' },
            { label: 'Freelance', value: 'FREELANCE' },
            { label: 'Investment', value: 'INVESTMENT' },
            { label: 'Gift', value: 'GIFT' },
            { label: 'Other Income', value: 'OTHER_INC' }
          ]
        } else {
          return [
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
        }
      }
      
      return categories
    },
    
    getCategoryList: (state) => {
      return [...state.categories.income, ...state.categories.expense]
    },
    
    getMonthlyStats: (state) => {
      // Use the data from the backend if available
      if (state.monthlyStats && state.monthlyStats.length > 0) {
        return state.monthlyStats
      }
      
      // Fallback to calculating from transactions
      const today = new Date()
      const monthsData = []
      
      // Creare dati per ultimi 6 mesi, in ordine cronologico (dal meno recente al più recente)
      for (let i = 5; i >= 0; i--) {
        const month = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const monthName = month.toLocaleString('en-US', { month: 'short' })
        
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
          
        monthsData.push({
          month: monthName,
          income,
          expense,
          balance: income - expense
        })
      }
      
      return monthsData
    },
    
    getCategoryStats: (state) => {
      // Use the data from the backend if available
      if (state.summary.categoryExpenses && state.summary.categoryExpenses.length > 0) {
        return state.summary.categoryExpenses.map(item => ({
          category: item.category || item.label,
          amount: parseFloat(item.total || item.amount)
        }))
      }
      
      // Fallback to calculating from transactions
      const categoryTotals = {}
      
      // Initialize categories if available
      if (state.categories.expense.length > 0) {
        state.categories.expense.forEach(cat => {
          categoryTotals[cat.value] = 0
        })
      }
      
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
        
        if (transactions.length === 0) {
          console.log('No transactions found in the database')
        }
        
        this.transactions = transactions.map(transaction => ({
          ...transaction,
          date: transaction.date ? new Date(transaction.date) : new Date(),
          // Ensure amount is a number
          amount: parseFloat(transaction.amount)
        }))

        // Sort transactions by date (newest first)
        this.transactions.sort((a, b) => b.date - a.date)
      } catch (error) {
        this.error = error.message || 'Failed to fetch transactions from the database'
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
    
    async fetchSummary() {
      try {
        const api = useApi()
        const response = await api.getSummary()
        
        if (response) {
          this.summary = {
            totalBalance: parseFloat(response.balance || 0),
            monthlyIncome: parseFloat(response.total_income || 0),
            monthlyExpenses: parseFloat(response.total_expenses || 0),
            categoryExpenses: Array.isArray(response.category_expenses) ? 
              response.category_expenses.map(item => ({
                category: item.category,
                amount: parseFloat(item.total)
              })) : []
          }
        }
      } catch (error) {
        console.error('Error fetching summary:', error)
        // Keep using calculated values from transactions
      }
    },
    
    async fetchMonthlyStats() {
      try {
        const api = useApi()
        const response = await api.getMonthlyStats()
        
        if (Array.isArray(response)) {
          console.log('Dati mensili ricevuti dal backend:', response)
          
          // Ottieni il mese e l'anno correnti
          const currentDate = new Date()
          const currentMonth = currentDate.getMonth() + 1 // JavaScript mesi sono 0-11, i dati API sono 1-12
          const currentYear = currentDate.getFullYear()
          
          // Filtra per ottenere solo gli ultimi 6 mesi fino al mese corrente
          const relevantMonths = response.filter(item => {
            // Calcola se questo mese è uno degli ultimi 6 mesi
            if (item.year < currentYear) return false // Escludi anni precedenti
            
            if (item.year === currentYear) {
              return item.month <= currentMonth && item.month > currentMonth - 6
            }
            
            return false
          })
          
          // Ordina i mesi cronologicamente
          relevantMonths.sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year
            return a.month - b.month
          })
          
          console.log('Mesi rilevanti selezionati e ordinati:', relevantMonths)
          
          // Converti i dati nel formato richiesto dal grafico
          this.monthlyStats = relevantMonths.map(item => {
            // Converti il numero del mese in nome abbreviato
            const monthName = new Date(item.year, item.month - 1, 1).toLocaleString('en-US', { month: 'short' })
            
            return {
              month: monthName,
              income: parseFloat(item.income || 0),
              expense: parseFloat(item.expenses || 0),
              balance: parseFloat(item.savings || 0)
            }
          })
          
          console.log('Dati mensili processati per il grafico:', this.monthlyStats)
        }
      } catch (error) {
        console.error('Error fetching monthly stats:', error)
        // Keep using calculated values from transactions
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
