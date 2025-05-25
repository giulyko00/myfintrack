<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="border-b border-gray-200 dark:border-gray-800">
      <div class="container flex items-center justify-between py-4">
        <h1 class="text-xl font-bold">MyFinTrack</h1>
        <div class="flex items-center gap-4">
          <UButton
            icon="i-heroicons-moon"
            color="gray"
            variant="ghost"
            aria-label="Toggle dark mode"
            @click="toggleColorMode"
          />
          <UButton
            icon="i-heroicons-arrow-right-on-rectangle"
            color="gray"
            variant="ghost"
            aria-label="Logout"
            @click="logout"
          />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container py-8">
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
          <div class="text-2xl font-bold">€{{ formatCurrency(totalBalance) }}</div>
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
          <div class="text-2xl font-bold text-emerald-500">€{{ formatCurrency(monthlyIncome) }}</div>
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
          <div class="text-2xl font-bold text-red-500">€{{ formatCurrency(monthlyExpenses) }}</div>
          <template #footer>
            <p class="text-xs text-gray-500">{{ currentMonthName }}</p>
          </template>
        </UCard>
      </div>

      <!-- Transactions Section -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold">Recent Transactions</h2>
        <UButton 
          color="primary" 
          icon="i-heroicons-plus" 
          label="Add Transaction"
          @click="isAddTransactionModalOpen = true"
        />
      </div>

      <!-- Transaction List -->
      <UCard v-if="transactions.length">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b dark:border-gray-700">
                <th class="py-3 px-4 font-medium">Date</th>
                <th class="py-3 px-4 font-medium">Category</th>
                <th class="py-3 px-4 font-medium">Description</th>
                <th class="py-3 px-4 font-medium text-right">Amount</th>
                <th class="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in transactions" :key="transaction.id" class="border-b dark:border-gray-700">
                <td class="py-3 px-4">{{ formatDate(transaction.date) }}</td>
                <td class="py-3 px-4">
                  <UBadge 
                    :color="transaction.type === 'income' ? 'emerald' : 'red'" 
                    :label="transaction.category"
                  />
                </td>
                <td class="py-3 px-4">{{ transaction.description }}</td>
                <td class="py-3 px-4 text-right" :class="transaction.type === 'income' ? 'text-emerald-500' : 'text-red-500'">
                  {{ transaction.type === 'income' ? '+' : '-' }}€{{ formatCurrency(Math.abs(transaction.amount)) }}
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
      </UCard>

      <UAlert
        v-else
        icon="i-heroicons-information-circle"
        title="No transactions found"
        description="Add your first transaction to get started."
        color="primary"
        variant="soft"
        class="mt-4"
      />
      
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

      <!-- Add Transaction Modal -->
      <UModal v-model="isAddTransactionModalOpen" :ui="{ width: 'sm:max-w-md' }">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold">Add New Transaction</h3>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark"
                class="-my-1"
                @click="isAddTransactionModalOpen = false"
              />
            </div>
          </template>

          <form @submit.prevent="saveTransaction">
            <div class="space-y-4">
              <!-- Transaction Type -->
              <div>
                <UFormGroup label="Transaction Type" name="type">
                  <URadioGroup
                    v-model="newTransaction.type"
                    :options="[
                      { label: 'Income', value: 'income' },
                      { label: 'Expense', value: 'expense' }
                    ]"
                    orientation="horizontal"
                  />
                </UFormGroup>
              </div>

              <!-- Amount -->
              <UFormGroup label="Amount" name="amount">
                <UInputAddon>€</UInputAddon>
                <UInput
                  v-model="newTransaction.amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </UFormGroup>

              <!-- Category -->
              <UFormGroup label="Category" name="category">
                <USelect
                  v-model="newTransaction.category"
                  :options="categoryOptions"
                  placeholder="Select a category"
                  required
                />
              </UFormGroup>

              <!-- Date -->
              <UFormGroup label="Date" name="date">
                <UDatePicker v-model="newTransaction.date" />
              </UFormGroup>

              <!-- Description -->
              <UFormGroup label="Description" name="description">
                <UTextarea
                  v-model="newTransaction.description"
                  placeholder="Enter description"
                />
              </UFormGroup>
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <UButton
                color="gray"
                variant="soft"
                label="Cancel"
                @click="isAddTransactionModalOpen = false"
              />
              <UButton
                type="submit"
                color="primary"
                label="Save Transaction"
                :loading="isSaving"
              />
            </div>
          </form>
        </UCard>
      </UModal>
    </main>
  </div>
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
onMounted(async () => {
  // Check authentication
  if (!authStore.isAuthenticated) {
    await authStore.checkAuth()
    if (!authStore.isAuthenticated) {
      router.push('/auth/login')
      return
    }
  }
  
  // Fetch transactions
  await transactionsStore.fetchTransactions()
})

// Get transactions from the store
const transactions = computed(() => transactionsStore.getAllTransactions)

// Summary data from the store
const totalBalance = computed(() => transactionsStore.getTotalBalance)
const monthlyIncome = computed(() => transactionsStore.getMonthlyIncome)
const monthlyExpenses = computed(() => transactionsStore.getMonthlyExpenses)

const currentMonthName = computed(() => {
  return new Date().toLocaleString('default', { month: 'long' })
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
const newTransaction = ref({
  type: 'expense',
  amount: null,
  category: null,
  date: new Date(),
  description: ''
})

// Category options from the store
const categoryOptions = computed(() => {
  return transactionsStore.getCategoriesForType(newTransaction.value.type)
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
  isSaving.value = true
  
  try {
    await transactionsStore.addTransaction({
      ...newTransaction.value,
      // Convert amount to number if it's a string
      amount: typeof newTransaction.value.amount === 'string' 
        ? parseFloat(newTransaction.value.amount) 
        : newTransaction.value.amount
    })
    
    // Reset form
    newTransaction.value = {
      type: 'expense',
      amount: null,
      category: null,
      date: new Date(),
      description: ''
    }
    
    isAddTransactionModalOpen.value = false
  } catch (error) {
    console.error('Failed to save transaction:', error)
  } finally {
    isSaving.value = false
  }
}

function editTransaction(transaction) {
  // Clone the transaction to avoid modifying the original directly
  newTransaction.value = {
    ...transaction,
    // Ensure date is a Date object
    date: transaction.date instanceof Date ? transaction.date : new Date(transaction.date)
  }
  
  isAddTransactionModalOpen.value = true
}

async function deleteTransaction(id) {
  if (confirm('Are you sure you want to delete this transaction?')) {
    try {
      await transactionsStore.deleteTransaction(id)
    } catch (error) {
      console.error('Failed to delete transaction:', error)
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
