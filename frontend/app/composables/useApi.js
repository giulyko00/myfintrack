import { ref } from 'vue'
import ApiService from '~/services/api'

export const useApi = () => {
  const isLoading = ref(false)
  const error = ref(null)
  
  // Create a new instance of ApiService
  const apiService = new ApiService()
  
  /**
   * Make an API request with loading and error handling
   * @param {Function} apiCall - The API method to call
   * @param {Array} params - Parameters to pass to the API method
   * @returns {Promise} - The response from the API
   */
  const callApi = async (apiCall, ...params) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiCall.apply(apiService, params)
      return response
    } catch (err) {
      error.value = err.message || 'An unexpected error occurred'
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // Transaction methods
  const getTransactions = () => callApi(apiService.getTransactions)
  const addTransaction = (transaction) => callApi(apiService.addTransaction, transaction)
  const updateTransaction = (id, transaction) => callApi(apiService.updateTransaction, id, transaction)
  const deleteTransaction = (id) => callApi(apiService.deleteTransaction, id)
  
  // Category methods
  const getCategories = () => callApi(apiService.getCategories)
  
  return {
    isLoading,
    error,
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getCategories
  }
}
