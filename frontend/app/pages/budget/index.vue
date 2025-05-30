<template>
  <div>
    <NuxtLayout>
    <div class="container py-8">
      <!-- Loading indicator -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <UProgress animation="carousel" indeterminate color="primary" />
      </div>
      
      <div v-else>
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-base font-semibold">Total Budget</h3>
                <UIcon name="i-heroicons-banknotes" class="text-emerald-500" />
              </div>
            </template>
            <div class="text-2xl font-bold">${{ formatCurrency(budgetSummary.total_budget) }}</div>
            <template #footer>
              <p class="text-xs text-gray-500">Current Month</p>
            </template>
          </UCard>
          
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-base font-semibold">Monthly Expenses</h3>
                <UIcon name="i-heroicons-arrow-trending-down" class="text-red-500" />
              </div>
            </template>
            <div class="text-2xl font-bold text-red-500">${{ formatCurrency(budgetSummary.total_expenses) }}</div>
            <template #footer>
              <p class="text-xs text-gray-500">{{ currentMonthName }}</p>
            </template>
          </UCard>
          
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-base font-semibold">Remaining Budget</h3>
                <UIcon name="i-heroicons-calculator" class="text-blue-500" />
              </div>
            </template>
            <div class="text-2xl font-bold text-blue-500">${{ formatCurrency(budgetSummary.remaining_budget) }}</div>
            <template #footer>
              <p class="text-xs text-gray-500">{{ currentMonthName }}</p>
            </template>
          </UCard>
        </div>

        <!-- Overall Budget Progress -->
        <UCard class="mb-8">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold">Overall Budget Usage</h3>
            </div>
          </template>
          <div class="py-4">
            <div class="flex items-center justify-between mb-2">
              <span>{{ budgetSummary.overall_usage_percentage }}%</span>
              <span>${{ formatCurrency(budgetSummary.total_expenses) }} of ${{ formatCurrency(budgetSummary.total_budget) }}</span>
            </div>
            <!-- Custom progress bar for better visibility -->
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                class="h-3 rounded-full" 
                :class="{
                  'bg-red-500': budgetSummary.overall_usage_percentage >= 90,
                  'bg-orange-500': budgetSummary.overall_usage_percentage >= 75 && budgetSummary.overall_usage_percentage < 90,
                  'bg-yellow-500': budgetSummary.overall_usage_percentage >= 50 && budgetSummary.overall_usage_percentage < 75,
                  'bg-green-500': budgetSummary.overall_usage_percentage < 50
                }"
                :style="{ width: budgetSummary.overall_usage_percentage + '%' }"
              ></div>
            </div>
          </div>
        </UCard>

        <!-- Category Budgets -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold">Category Budgets</h3>
              <UButton size="sm" @click="openAddBudgetModal">
                Add Budget
              </UButton>
            </div>
          </template>
          
          <div v-if="budgetSummary.budgets && budgetSummary.budgets.length > 0" class="divide-y divide-gray-200 dark:divide-gray-700">
            <div v-for="budget in budgetSummary.budgets" :key="budget.id" class="py-4">
              <div class="flex items-center justify-between mb-2">
                <div>
                  <span class="font-medium">{{ budget.category_display }}</span>
                  <UBadge size="xs" class="ml-2" :color="budget.period === 'MONTHLY' ? 'blue' : 'violet'">
                    {{ budget.period_display }}
                  </UBadge>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm">${{ formatCurrency(budget.amount) }}</span>
                  <UButton 
                    color="gray" 
                    variant="ghost" 
                    icon="i-heroicons-pencil-square" 
                    size="xs"
                    @click="editBudget(budget)"
                  />
                  <UButton 
                    color="red" 
                    variant="ghost" 
                    icon="i-heroicons-trash" 
                    size="xs"
                    @click="confirmDeleteBudget(budget)"
                  />
                </div>
              </div>
              <div class="flex items-center justify-between mb-1 text-sm">
                <span>{{ budget.usage_percentage }}%</span>
              </div>
              <!-- Custom progress bar for better visibility -->
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                <div 
                  class="h-2.5 rounded-full" 
                  :class="{
                    'bg-red-500': budget.usage_percentage >= 90,
                    'bg-orange-500': budget.usage_percentage >= 75 && budget.usage_percentage < 90,
                    'bg-yellow-500': budget.usage_percentage >= 50 && budget.usage_percentage < 75,
                    'bg-green-500': budget.usage_percentage < 50
                  }"
                  :style="{ width: budget.usage_percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
          
          <div v-else class="py-8 text-center text-gray-500">
            <UIcon name="i-heroicons-banknotes" class="text-4xl mx-auto mb-2" />
            <p>No budgets set yet. Add your first budget to start tracking!</p>
          </div>
        </UCard>
      </div>

      <!-- Add/Edit Budget Modal (Custom Implementation) -->
      <div v-if="isAddBudgetModalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Overlay con blur leggero solo per lo sfondo -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4">
          <!-- Header -->
          <div class="flex items-center justify-between border-b dark:border-gray-700 p-4">
            <h3 class="text-lg font-semibold">{{ isEditing ? 'Edit Budget' : 'Add New Budget' }}</h3>
            <button 
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              @click="isAddBudgetModalOpen = false"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-4">
            <form @submit.prevent="saveBudget">
              <!-- Form Error Alert -->
              <div v-if="formError" class="p-3 mb-4 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-lg">
                {{ formError }}
              </div>

              <!-- Form Fields -->
              <div class="grid grid-cols-1 gap-4 mb-4">
                <!-- Category -->
                <div>
                  <label class="block text-sm font-medium mb-1">Category <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <select 
                      v-model="newBudget.category"
                      class="w-full py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                      required
                    >
                      <option value="" disabled>Select category</option>
                      <option v-for="option in expenseCategories" :key="option.value" :value="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                      <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                <!-- Amount -->
                <div>
                  <label class="block text-sm font-medium mb-1">Amount <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span class="text-gray-500 dark:text-gray-400">$</span>
                    </div>
                    <input
                      v-model="newBudget.amount"
                      type="text"
                      placeholder="0.00"
                      class="w-full pl-7 py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <!-- Period -->
                <div class="w-full bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <div class="mb-1">Budget Period</div>
                  <div class="flex justify-center gap-6">
                    <label class="inline-flex items-center">
                      <input type="radio" class="form-radio" v-model="newBudget.period" value="MONTHLY">
                      <span class="ml-2">Monthly</span>
                    </label>
                    <label class="inline-flex items-center">
                      <input type="radio" class="form-radio" v-model="newBudget.period" value="YEARLY">
                      <span class="ml-2">Yearly</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  @click="isAddBudgetModalOpen = false"
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
                  {{ isEditing ? 'Update Budget' : 'Save Budget' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal (Custom Implementation) -->
      <div v-if="isDeleteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Overlay con blur leggero solo per lo sfondo -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
          <!-- Header -->
          <div class="flex items-center justify-between border-b dark:border-gray-700 p-4">
            <h3 class="text-lg font-semibold">Delete Budget</h3>
            <button 
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              @click="isDeleteModalOpen = false"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Body -->
          <div class="p-4">
            <p class="text-gray-700 dark:text-gray-300">Are you sure you want to delete this budget? This action cannot be undone.</p>
            
            <!-- Actions -->
            <div class="flex justify-end gap-2 mt-6">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                @click="isDeleteModalOpen = false"
              >
                Cancel
              </button>
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                @click="deleteBudget"
                :disabled="isDeleting"
              >
                <span v-if="isDeleting" class="inline-block mr-2">
                  <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useRouter } from 'vue-router'

// Router
const router = useRouter()

// API
const { isLoading, error, getCategories, getBudgets, getBudgetSummary, addBudget, updateBudget, deleteBudget: deleteBudgetApi } = useApi()

// Budget state
const budgetSummary = ref({
  total_budget: 0,
  total_expenses: 0,
  remaining_budget: 0,
  overall_usage_percentage: 0,
  budgets: []
})

// Form state
const isAddBudgetModalOpen = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const formError = ref('')
const newBudget = ref({
  id: null,
  category: '',
  amount: '',
  period: 'MONTHLY'
})

// Delete confirmation state
const isDeleteModalOpen = ref(false)
const budgetToDelete = ref(null)
const isDeleting = ref(false)

// Date formatting
const currentDate = new Date()
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const currentMonthName = computed(() => monthNames[currentDate.getMonth()])

// Get expense categories
const expenseCategories = ref([])

// Fetch budget data on component mount
onMounted(async () => {
  // Check authentication
  const token = localStorage.getItem('auth.accessToken')
  if (!token) {
    router.push('/auth/login')
    return
  }
  
  // Load data
  await Promise.all([
    fetchBudgetSummary(),
    fetchCategories()
  ])
})

// Fetch budget summary and individual budgets
async function fetchBudgetSummary() {
  try {
    // Get budget summary from the API
    const summaryResponse = await getBudgetSummary()
    
    // Get individual budgets
    const budgetsResponse = await getBudgets()
    
    // Update the budget summary with real data
    budgetSummary.value = {
      total_budget: summaryResponse.total_budget || 0,
      total_expenses: summaryResponse.total_expenses || 0,
      remaining_budget: summaryResponse.remaining_budget || 0,
      overall_usage_percentage: summaryResponse.overall_usage_percentage || 0,
      budgets: budgetsResponse.map(budget => ({
        id: budget.id,
        category: budget.category,
        category_display: budget.category_display || budget.category,
        amount: budget.amount,
        spent: budget.spent || 0,
        remaining: budget.remaining || (budget.amount - (budget.spent || 0)),
        usage_percentage: budget.usage_percentage || Math.min(100, Math.round(((budget.spent || 0) / (budget.amount || 1)) * 100)),
        period: budget.period || 'monthly'
      }))
    }
  } catch (error) {
    console.error('Error fetching budget data:', error)
    // Fallback to default values if the API call fails
    budgetSummary.value = {
      total_budget: 0,
      total_expenses: 0,
      remaining_budget: 0,
      overall_usage_percentage: 0,
      budgets: []
    }
  }
}

// Fetch expense categories
async function fetchCategories() {
  try {
    const response = await getCategories()
    expenseCategories.value = response.expense
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

// Helper to get color for budget progress bar
function getBudgetProgressColor(percentage) {
  if (percentage >= 90) return 'red'
  if (percentage >= 75) return 'orange'
  if (percentage >= 50) return 'yellow'
  return 'green'
}

// Format currency
function formatCurrency(value) {
  if (!value) return '0.00'
  return parseFloat(value).toFixed(2)
}

// Open add budget modal
function openAddBudgetModal() {
  isEditing.value = false
  resetBudgetForm()
  isAddBudgetModalOpen.value = true
}

// Edit budget
function editBudget(budget) {
  isEditing.value = true
  newBudget.value = {
    id: budget.id,
    category: budget.category,
    amount: budget.amount,
    period: budget.period
  }
  isAddBudgetModalOpen.value = true
}

// Reset budget form
function resetBudgetForm() {
  newBudget.value = {
    id: null,
    category: '',
    amount: '',
    period: 'MONTHLY'
  }
  formError.value = ''
}

// Save budget
async function saveBudget() {
  try {
    isSaving.value = true
    formError.value = ''
    
    // Validate required fields
    if (!newBudget.value.category) {
      formError.value = 'Please select a category'
      return
    }
    
    if (!newBudget.value.amount || parseFloat(newBudget.value.amount) <= 0) {
      formError.value = 'Please enter a valid amount'
      return
    }
    
    // Get category display name
    const category = expenseCategories.value.find(cat => cat.value === newBudget.value.category)
    const categoryDisplay = category ? category.label : newBudget.value.category
    
    // Prepare budget object for API
    const budgetData = {
      category: newBudget.value.category,
      amount: parseFloat(newBudget.value.amount),
      period: newBudget.value.period || 'MONTHLY'
    }
    
    let savedBudget
    
    if (isEditing.value && newBudget.value.id) {
      // Update existing budget
      savedBudget = await updateBudget(newBudget.value.id, budgetData)
      console.log('Budget updated:', savedBudget)
    } else {
      // Create new budget
      savedBudget = await addBudget(budgetData)
      console.log('New budget created:', savedBudget)
    }
    
    // Refresh budget data to show the updated information
    await fetchBudgetSummary()
    
    // Close modal and reset form
    isAddBudgetModalOpen.value = false
    resetBudgetForm()
    
  } catch (error) {
    console.error('Error saving budget:', error)
    formError.value = 'Failed to save budget. Please try again.'
  } finally {
    isSaving.value = false
  }
}

// Confirm delete budget
function confirmDeleteBudget(budget) {
  budgetToDelete.value = budget
  isDeleteModalOpen.value = true
}

// Delete budget
async function deleteBudget() {
  try {
    isDeleting.value = true
    
    if (!budgetToDelete.value || !budgetToDelete.value.id) {
      console.error('No budget selected for deletion')
      return
    }
    
    // Call the API to delete the budget
    await deleteBudgetApi(budgetToDelete.value.id)
    console.log('Budget deleted successfully:', budgetToDelete.value.id)
    
    // Refresh budget data to reflect the current state
    await fetchBudgetSummary()
    
    // Close modal and reset
    isDeleteModalOpen.value = false
    budgetToDelete.value = null
    
  } catch (error) {
    console.error('Error deleting budget:', error)
  } finally {
    isDeleting.value = false
  }
}
</script>
