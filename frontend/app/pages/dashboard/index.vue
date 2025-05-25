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
const colorMode = useColorMode()

// Mock data for now - will be replaced with API calls
const transactions = ref([
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
  }
])

// Computed properties for summary cards
const totalBalance = computed(() => {
  return transactions.value.reduce((total, transaction) => {
    return transaction.type === 'income' 
      ? total + transaction.amount 
      : total - transaction.amount
  }, 0)
})

const monthlyIncome = computed(() => {
  const currentMonth = new Date().getMonth()
  return transactions.value
    .filter(t => t.type === 'income' && t.date.getMonth() === currentMonth)
    .reduce((total, t) => total + t.amount, 0)
})

const monthlyExpenses = computed(() => {
  const currentMonth = new Date().getMonth()
  return transactions.value
    .filter(t => t.type === 'expense' && t.date.getMonth() === currentMonth)
    .reduce((total, t) => total + t.amount, 0)
})

const currentMonthName = computed(() => {
  return new Date().toLocaleString('default', { month: 'long' })
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

// Category options based on transaction type
const categoryOptions = computed(() => {
  if (newTransaction.value.type === 'income') {
    return [
      { label: 'Salary', value: 'Salary' },
      { label: 'Freelance', value: 'Freelance' },
      { label: 'Investments', value: 'Investments' },
      { label: 'Other Income', value: 'Other Income' }
    ]
  } else {
    return [
      { label: 'Food', value: 'Food' },
      { label: 'Transport', value: 'Transport' },
      { label: 'Utilities', value: 'Utilities' },
      { label: 'Entertainment', value: 'Entertainment' },
      { label: 'Housing', value: 'Housing' },
      { label: 'Shopping', value: 'Shopping' },
      { label: 'Health', value: 'Health' },
      { label: 'Other Expense', value: 'Other Expense' }
    ]
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

function saveTransaction() {
  isSaving.value = true
  
  // Simulate API call
  setTimeout(() => {
    const id = Math.max(0, ...transactions.value.map(t => t.id)) + 1
    transactions.value.unshift({
      id,
      ...newTransaction.value
    })
    
    // Reset form
    newTransaction.value = {
      type: 'expense',
      amount: null,
      category: null,
      date: new Date(),
      description: ''
    }
    
    isSaving.value = false
    isAddTransactionModalOpen.value = false
  }, 1000)
}

function editTransaction(transaction) {
  // Will implement later
  console.log('Edit transaction', transaction)
}

function deleteTransaction(id) {
  // Will implement later
  console.log('Delete transaction', id)
}

function logout() {
  // Will implement with auth store later
  console.log('Logout')
}
</script>
