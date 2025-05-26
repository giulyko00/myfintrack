<template>
  <NuxtLayout name="default">
    <div class="container py-8">
      <!-- Loading indicator -->
      <div v-if="transactionsStore.loading" class="flex justify-center py-8">
        <UProgress animation="carousel" indeterminate color="primary" />
      </div>
      
      <div v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold">Current Balance</h3>
              <UIcon name="i-heroicons-banknotes" class="text-emerald-500" />
            </div>
          </template>
          <div class="text-2xl font-bold">${{ formatCurrency(totalBalance) }}</div>
          <template #footer>
            <p class="text-xs text-gray-500">Updated today</p>
          </template>
        </UCard>
        
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold">Income (This Month)</h3>
              <UIcon name="i-heroicons-arrow-trending-up" class="text-emerald-500" />
            </div>
          </template>
          <div class="text-2xl font-bold text-emerald-500">${{ formatCurrency(monthlyIncome) }}</div>
          <template #footer>
            <p class="text-xs text-gray-500">{{ currentMonthName }}</p>
          </template>
        </UCard>
        
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold">Expenses (This Month)</h3>
              <UIcon name="i-heroicons-arrow-trending-down" class="text-red-500" />
            </div>
          </template>
          <div class="text-2xl font-bold text-red-500">${{ formatCurrency(monthlyExpenses) }}</div>
          <template #footer>
            <p class="text-xs text-gray-500">{{ currentMonthName }}</p>
          </template>
        </UCard>
      </div>

      <!-- Recent Transactions -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold">Recent Transactions</h3>
            <UButton size="sm" @click="openAddTransactionModal">
              Add Transaction
            </UButton>
          </div>
        </template>
        
        <div v-if="transactions && transactions.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th class="py-3 px-4 font-medium text-left">Date</th>
                <th class="py-3 px-4 font-medium text-left">Category</th>
                <th class="py-3 px-4 font-medium text-left">Description</th>
                <th class="py-3 px-4 font-medium text-right">Amount</th>
                <th class="py-3 px-4 font-medium text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in transactions" :key="transaction.id" class="border-b dark:border-gray-700">
                <td class="py-3 px-4">{{ formatDate(transaction.date) }}</td>
                <td class="py-3 px-4">
                  <UBadge 
                    :color="transaction.type === 'income' ? 'emerald' : 'red'" 
                    :label="transaction.category || 'Unknown'"
                  />
                </td>
                <td class="py-3 px-4" :title="transaction.description || '-'">
                  <span class="block truncate max-w-[200px]">{{ transaction.description || '-' }}</span>
                </td>
                <td class="py-3 px-4 text-right" :class="transaction.type === 'income' ? 'text-emerald-500' : 'text-red-500'">
                  {{ transaction.type === 'income' ? '+' : '-' }}${{ formatCurrency(Math.abs(transaction.amount)) }}
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <UButton 
                      color="gray" 
                      variant="ghost" 
                      icon="i-heroicons-pencil-square" 
                      size="xs"
                      @click="editTransaction(transaction)"
                    />
                    <UButton 
                      color="red" 
                      variant="ghost" 
                      icon="i-heroicons-trash" 
                      size="xs"
                      @click="deleteTransaction(transaction.id)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else-if="transactionsStore.loading" class="py-6 text-center text-gray-500">
          <p>Loading transactions...</p>
        </div>
        
        <div v-else class="py-6 text-center">
          <UAlert
            icon="i-heroicons-information-circle"
            title="No transactions found"
            description="Add your first transaction to get started."
            color="primary"
            variant="soft"
            class="mx-auto max-w-md"
          />
        </div>
      </UCard>
      
      <!-- Financial Charts Section -->
      <div v-if="transactions.length > 0" class="mt-8">
        <h2 class="text-lg font-bold mb-4">Financial Trends</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Monthly Overview Chart -->
          <FinancialChart
            title="Monthly Overview"
            :data="transactionsStore.getMonthlyStats"
            :labels="chartData.labels"
            :datasets="chartData.datasets"
          />
          
          <!-- Expense Categories Chart -->
          <FinancialChart
            title="Expense Categories"
            :data="transactionsStore.getCategoryStats"
            :labels="categoryChartData.labels"
            :datasets="categoryChartData.datasets"
            :colors="['#EF4444', '#F97316', '#FBBF24', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280']"
          />
        </div>
      </div>
    </div>

      <!-- Loading Overlay -->
      <div v-if="isLoading" class="fixed inset-0 bg-gray-900/50 dark:bg-gray-900/70 flex items-center justify-center z-50">
        <UCard class="max-w-sm">
          <div class="flex items-center space-x-4 p-4">
            <UIcon name="i-heroicons-arrow-path" class="text-primary-500 animate-spin h-6 w-6" />
            <p>Loading dashboard data...</p>
          </div>
        </UCard>
      </div>
      
      <!-- Error Alert -->
      <UAlert v-if="showError" color="red" variant="soft" icon="i-heroicons-exclamation-triangle" class="mb-4">
        <template #title>Error Loading Data</template>
        <template #description>
          {{ errorMessage }}
          <UButton class="mt-2" size="sm" @click="() => window.location.reload()">Retry</UButton>
        </template>
      </UAlert>
      
      <!-- Add/Edit Transaction Modal (Custom Implementation) -->
      <div v-if="isAddTransactionModalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Overlay con blur leggero solo per lo sfondo -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4">
          <!-- Header -->
          <div class="flex items-center justify-between border-b dark:border-gray-700 p-4">
            <h3 class="text-lg font-semibold">{{ isEditing ? 'Edit Transaction' : 'Add New Transaction' }}</h3>
            <button 
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              @click="isAddTransactionModalOpen = false"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-4">
            <form @submit.prevent="saveTransaction">
              <!-- Transaction Type -->
              <div class="w-full bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg mb-4">
                <div class="mb-1">Transaction Type</div>
                <div class="flex justify-center gap-6">
                  <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" v-model="newTransaction.type" value="income">
                    <span class="ml-2">Income</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input type="radio" class="form-radio" v-model="newTransaction.type" value="expense">
                    <span class="ml-2">Expense</span>
                  </label>
                </div>
              </div>

              <!-- Form Error Alert -->
              <div v-if="showFormError" class="p-3 mb-4 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-lg">
                {{ formErrorMessage }}
              </div>

              <!-- Form Fields -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <!-- Amount -->
                <div>
                  <label class="block text-sm font-medium mb-1">Amount <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span class="text-gray-500 dark:text-gray-400">$</span>
                    </div>
                    <input
                      v-model="newTransaction.amount"
                      type="text"
                      placeholder="0.00"
                      class="w-full pl-7 py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <!-- Category -->
                <div>
                  <label class="block text-sm font-medium mb-1">Category <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <select 
                      v-model="newTransaction.category"
                      class="w-full py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                      required
                    >
                      <option value="" disabled>Select category</option>
                      <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                      <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                    <div v-if="!newTransaction.category" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                      Select category
                    </div>
                  </div>
                </div>

                <!-- Date -->
                <div>
                  <label class="block text-sm font-medium mb-1">Date <span class="text-red-500">*</span></label>
                  <input
                    v-model="formattedDate"
                    type="date"
                    class="w-full py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <!-- Description -->
                <div>
                  <label class="block text-sm font-medium mb-1">Description</label>
                  <input
                    v-model="newTransaction.description"
                    type="text"
                    placeholder="Enter description"
                    class="w-full py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <!-- Actions -->
              <div class="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  @click="isAddTransactionModalOpen = false"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  :disabled="isSaving"
                >
                  <span v-if="isSaving" class="inline-block mr-2">
                    <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  {{ isEditing ? 'Update Transaction' : 'Save Transaction' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FinancialChart from '~/components/FinancialChart.vue'

const colorMode = useColorMode()

// Mock data for now - will be replaced with API calls
// Use the transactions store
import { useTransactionsStore } from '~/stores/transactions'
import { useAuthStore } from '~/stores/auth'

const transactionsStore = useTransactionsStore()
const authStore = useAuthStore()
const router = useRouter()

// Load transactions on component mount
// Funzione per aggiornare tutti i dati della dashboard
async function refreshDashboardData() {
  showError.value = false
  try {
    // Load all required data in parallel
    await Promise.all([
      transactionsStore.fetchTransactions(),
      transactionsStore.fetchCategories(),
      transactionsStore.fetchSummary(),
      transactionsStore.fetchMonthlyStats()
    ])
    
    console.log('Dashboard data refreshed successfully')
    return true
  } catch (error) {
    console.error('Error refreshing dashboard data:', error)
    showError.value = true
    errorMessage.value = 'Failed to update dashboard data. Please try again later.'
    return false
  }
}

onMounted(async () => {
  // Check authentication
  if (!authStore.isAuthenticated) {
    await authStore.checkAuth()
    if (!authStore.isAuthenticated) {
      router.push('/auth/login')
      return
    }
  }
  
  // Fetch data
  isLoading.value = true
  await refreshDashboardData()
  isLoading.value = false
})

// Get transactions from the store with loading state
const isLoading = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const transactions = computed(() => transactionsStore.getAllTransactions)

// Summary data from the store
const totalBalance = computed(() => transactionsStore.getTotalBalance)
const monthlyIncome = computed(() => transactionsStore.getMonthlyIncome)
const monthlyExpenses = computed(() => transactionsStore.getMonthlyExpenses)

const currentMonthName = computed(() => {
  return new Date().toLocaleString('en-US', { month: 'long' })
})

// Chart data for monthly overview
const chartData = computed(() => {
  const monthlyStats = transactionsStore.getMonthlyStats
  return {
    labels: monthlyStats.map(stat => stat.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyStats.map(stat => stat.income),
        type: 'bar'
      },
      {
        label: 'Expenses',
        data: monthlyStats.map(stat => stat.expense),
        type: 'bar'
      },
      {
        label: 'Balance',
        data: monthlyStats.map(stat => stat.balance),
        type: 'line',
        yAxisID: 'y'
      }
    ]
  }
})

// Chart data for expense categories
const categoryChartData = computed(() => {
  const categoryStats = transactionsStore.getCategoryStats
  return {
    labels: categoryStats.map(stat => stat.category),
    datasets: [
      {
        label: 'Amount',
        data: categoryStats.map(stat => stat.amount),
        type: 'bar'
      }
    ]
  }
})

// Transaction form
const isAddTransactionModalOpen = ref(false)
const isSaving = ref(false)
const showFormError = ref(false)
const formErrorMessage = ref('')
const isEditing = ref(false)
const newTransaction = ref({
  type: 'expense',
  amount: null,
  category: null,
  date: new Date(),
  description: ''
})

// Toast notifications
const toast = useToast()

// Category options from the store
const categoryOptions = computed(() => {
  // Controlla che ci siano categorie disponibili nel tipo selezionato
  const categories = transactionsStore.getCategoriesForType(newTransaction.value.type)
  
  // Log per debug
  console.log('Categorie disponibili per', newTransaction.value.type, ':', categories)
  
  if (!categories || categories.length === 0) {
    console.warn('Nessuna categoria trovata per il tipo:', newTransaction.value.type)
  }
  
  return categories
})

// Computed property per gestire il formato della data
const formattedDate = computed({
  get() {
    // Converti la data in formato stringa YYYY-MM-DD per l'input date
    if (!newTransaction.value.date) return ''
    const date = new Date(newTransaction.value.date)
    return date.toISOString().split('T')[0]
  },
  set(val) {
    // Quando l'utente cambia la data, aggiorna il valore in newTransaction
    newTransaction.value.date = new Date(val)
  }
})

// Format helpers
function formatCurrency(value) {
  return value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB')
}

// Actions
function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

async function saveTransaction() {
  // Validate form
  if (!newTransaction.value.amount || !newTransaction.value.category) {
    showFormError.value = true
    formErrorMessage.value = 'Please fill in all required fields'
    return
  }
  
  // Validate amount format (since we're using text input now)
  const amountValue = newTransaction.value.amount.toString().replace(',', '.')
  const amount = parseFloat(amountValue)
  
  if (isNaN(amount) || amount <= 0) {
    showFormError.value = true
    formErrorMessage.value = 'Please enter a valid amount'
    return
  }
  
  isSaving.value = true
  showFormError.value = false
  
  try {
    // Prepare transaction data
    const transactionData = {
      ...newTransaction.value,
      amount,
      // Make sure category is properly formatted
      category: newTransaction.value.category, // Should be the category code value
      date: newTransaction.value.date instanceof Date 
        ? newTransaction.value.date 
        : new Date(newTransaction.value.date)
    }
    
    console.log('Saving transaction:', transactionData)
    
    // Check if we're editing or creating a new transaction
    if (newTransaction.value.id) {
      // Editing existing transaction
      await transactionsStore.updateTransaction(newTransaction.value.id, transactionData)
    } else {
      // Adding new transaction
      await transactionsStore.addTransaction(transactionData)
    }
    
    // Refresh all dashboard data after saving a transaction
    await refreshDashboardData()
    
    // Reset form
    resetTransactionForm()
    isAddTransactionModalOpen.value = false
    
    // Show success notification
    toast.add({
      title: newTransaction.value.id ? 'Transaction Updated' : 'Transaction Added',
      description: 'Your transaction has been saved successfully',
      color: 'green'
    })
  } catch (error) {
    console.error('Failed to save transaction:', error)
    showFormError.value = true
    formErrorMessage.value = error.message || 'Failed to save transaction'
  } finally {
    isSaving.value = false
  }
}

function resetTransactionForm() {
  newTransaction.value = {
    type: 'expense',
    amount: null,
    category: null,
    date: new Date(),
    description: ''
  }
  showFormError.value = false
}

function editTransaction(transaction) {
  // Assicurati che le categorie siano state caricate
  if (transactionsStore.categories.income.length === 0 || transactionsStore.categories.expense.length === 0) {
    transactionsStore.fetchCategories();
  }
  
  // Clone the transaction to avoid modifying the original directly
  newTransaction.value = {
    ...transaction,
    // Ensure date is a Date object
    date: transaction.date instanceof Date ? transaction.date : new Date(transaction.date)
  }
  
  // Log per debug
  console.log('Editing transaction with category:', transaction.category);
  
  // Forzare il reset e poi l'assegnazione della categoria
  // Il setTimeout è un modo per assicurarsi che il binding Vue sia aggiornato
  setTimeout(() => {
    // Questo codice viene eseguito dopo che il DOM è stato aggiornato
    if (transaction.category) {
      // Trova l'esatta categoria (value) dalle opzioni disponibili
      const categories = transactionsStore.getCategoriesForType(transaction.type);
      const foundCategory = categories.find(c => c.value === transaction.category || c.label === transaction.category);
      
      if (foundCategory) {
        console.log('Found matching category:', foundCategory);
        newTransaction.value.category = foundCategory.value;
      } else {
        console.log('No matching category found, using original:', transaction.category);
        newTransaction.value.category = transaction.category;
      }
    }
  }, 50);
  
  isEditing.value = true;
  isAddTransactionModalOpen.value = true;
}

function openAddTransactionModal() {
  // Assicurati che i campi del form siano reimpostati a valori predefiniti
  resetTransactionForm();
  
  // Assicurati che isEditing sia impostato a false per indicare che stiamo aggiungendo una nuova transazione
  isEditing.value = false;
  
  // Apri il modale
  isAddTransactionModalOpen.value = true;
}

async function deleteTransaction(id) {
  if (confirm('Are you sure you want to delete this transaction?')) {
    isLoading.value = true
    try {
      await transactionsStore.deleteTransaction(id)
      
      // Refresh all dashboard data after deleting a transaction
      await refreshDashboardData()
      
      toast.add({
        title: 'Transaction Deleted',
        description: 'The transaction has been removed successfully',
        color: 'green'
      })
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      toast.add({
        title: 'Error',
        description: error.message || 'Failed to delete transaction',
        color: 'red'
      })
    } finally {
      isLoading.value = false
    }
  }
}

async function logout() {
  try {
    await authStore.logout()
    router.push('/auth/login')
  } catch (error) {
    console.error('Failed to logout:', error)
  }
}
</script>