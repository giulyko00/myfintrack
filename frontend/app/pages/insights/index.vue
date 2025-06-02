<template>
  <div>
    <NuxtLayout>
    <div class="container py-8">
      <!-- Loading indicator -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <UProgress animation="carousel" indeterminate color="primary" />
      </div>
      
      <div v-else>
        <!-- Header with Generate button -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">Financial Insights</h2>
          <UButton
            color="primary"
            icon="i-heroicons-sparkles"
            :loading="isGenerating"
            type="button"
            @click="(e) => { e.preventDefault(); e.stopPropagation(); generateInsights(); }"
          >
            Generate New Insights
          </UButton>
        </div>
        
        <!-- No insights message -->
        <div v-if="!insights.length" class="py-12">
          <UCard>
            <div class="text-center py-8">
              <UIcon name="i-heroicons-light-bulb" class="text-5xl text-amber-500 mb-4" />
              <h3 class="text-xl font-medium mb-2">No insights yet</h3>
              <p class="text-gray-500 mb-6">Generate AI-powered insights based on your financial data to get personalized recommendations.</p>
              <UButton
                color="primary"
                icon="i-heroicons-sparkles"
                :loading="isGenerating"
                type="button"
                @click="(e) => { e.preventDefault(); e.stopPropagation(); generateInsights(); }"
              >
                Generate Insights
              </UButton>
            </div>
          </UCard>
        </div>
        
        <!-- Insights display -->
        <div v-else class="grid grid-cols-1 gap-6">
          <!-- Insight cards -->
          <UCard 
            v-for="insight in insights" 
            :key="insight.id" 
            :ui="{ body: { base: 'flex-1' } }"
            class="overflow-hidden transition-colors duration-300"
            :class="{
              'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800': !insight.is_read,
              'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800': insight.is_read
            }"
          >
            <div class="flex flex-col md:flex-row">
              <!-- Insight icon section -->
              <div class="md:w-16 md:shrink-0 md:border-r md:border-gray-200 dark:md:border-gray-700 flex items-center justify-center p-4">
                <UIcon 
                  :name="getInsightIcon(insight.insight_type)" 
                  class="text-2xl" 
                  :class="getInsightIconColor(insight.insight_type)" 
                />
              </div>
              
              <!-- Insight content -->
              <div class="flex-1 p-4">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-lg font-semibold">{{ insight.title }}</h3>
                      <UBadge v-if="!insight.is_read" color="primary" size="xs">New</UBadge>
                    </div>
                    <p class="text-xs text-gray-500">{{ formatDate(insight.created_at) }}</p>
                  </div>
                  <UBadge 
                    :color="getInsightTypeColor(insight.insight_type)" 
                    size="sm"
                    class="whitespace-nowrap"
                  >
                    {{ insight.insight_type_display }}
                  </UBadge>
                </div>
                
                <p class="text-gray-700 dark:text-gray-300 mb-4">{{ insight.content }}</p>
                
                <!-- Insight data visualization -->
                <div v-if="insight.data && getInsightDataType(insight)" class="mt-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <!-- Spending Pattern Insight -->
                  <div v-if="insight.insight_type === 'SPENDING'" class="flex flex-col md:flex-row gap-4">
                    <div class="md:w-1/2">
                      <div class="flex items-center gap-2 mb-2">
                        <UBadge 
                          :color="getCategoryColor(insight.data.category)" 
                          class="h-4 w-4 rounded-full p-0"
                        />
                        <span class="font-medium">{{ insight.data.category_display }}</span>
                      </div>
                      <div class="text-3xl font-bold">${{ formatCurrency(insight.data.amount) }}</div>
                      <div class="text-sm text-gray-500">in the last {{ insight.data.time_period }}</div>
                    </div>
                    <div class="md:w-1/2">
                      <div class="text-sm mb-2">Percentage of Total Spending</div>
                      <UProgress 
                        :value="insight.data.percentage" 
                        :color="getProgressColor(insight.data.percentage)" 
                        size="lg"
                      />
                      <div class="text-right text-sm mt-1 font-medium">{{ insight.data.percentage }}%</div>
                    </div>
                  </div>
                  
                  <!-- Budget Alert Insight -->
                  <div v-else-if="insight.insight_type === 'BUDGET'" class="flex flex-col gap-2">
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center gap-2">
                        <UBadge 
                          :color="getCategoryColor(insight.data.category)" 
                          class="h-4 w-4 rounded-full p-0"
                        />
                        <span class="font-medium">{{ insight.data.category_display }}</span>
                      </div>
                      <div class="text-sm">${{ formatCurrency(insight.data.budget_amount) }}</div>
                    </div>
                    <UProgress 
                      :value="insight.data.usage_percentage" 
                      :color="getProgressColor(insight.data.usage_percentage)" 
                    />
                    <div class="flex justify-between text-sm mt-1">
                      <span>{{ insight.data.usage_percentage }}% Used</span>
                      <span>{{ insight.data.period_display }}</span>
                    </div>
                  </div>
                  
                  <!-- Savings Opportunity Insight -->
                  <div v-else-if="insight.insight_type === 'SAVINGS'" class="flex flex-col md:flex-row gap-4">
                    <div class="md:w-1/2">
                      <div class="text-sm mb-1">Transactions in {{ insight.data.category_display }}</div>
                      <div class="text-3xl font-bold">{{ insight.data.transaction_count }}</div>
                      <div class="text-sm text-gray-500">in the last {{ insight.data.time_period }}</div>
                    </div>
                    <div class="md:w-1/2">
                      <div class="text-sm mb-1">Total Amount</div>
                      <div class="text-3xl font-bold">${{ formatCurrency(insight.data.total_amount) }}</div>
                      <div class="text-sm text-gray-500">potential savings opportunity</div>
                    </div>
                  </div>
                  
                  <!-- General Advice Insight -->
                  <div v-else-if="insight.insight_type === 'GENERAL'" class="flex flex-col gap-4">
                    <div class="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div class="text-sm mb-1">Income</div>
                        <div class="text-xl font-bold text-emerald-500">${{ formatCurrency(insight.data.income) }}</div>
                      </div>
                      <div>
                        <div class="text-sm mb-1">Expenses</div>
                        <div class="text-xl font-bold text-red-500">${{ formatCurrency(insight.data.expenses) }}</div>
                      </div>
                      <div>
                        <div class="text-sm mb-1">Savings</div>
                        <div class="text-xl font-bold" :class="insight.data.savings >= 0 ? 'text-blue-500' : 'text-red-500'">
                          ${{ formatCurrency(insight.data.savings) }}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div class="text-sm mb-1">Savings Rate</div>
                      <UProgress 
                        :value="Math.max(0, insight.data.savings_rate)" 
                        :color="getSavingsRateColor(insight.data.savings_rate)" 
                      />
                      <div class="text-right text-sm mt-1">{{ formatNumber(insight.data.savings_rate) }}%</div>
                    </div>
                  </div>
                </div>
                
                <!-- Mark as read button (if not read) -->
                <div v-if="!insight.is_read" class="mt-4 flex justify-end">
                  <UButton
                    color="gray"
                    variant="soft"
                    size="sm"
                    @click="markAsRead(insight.id)"
                  >
                    Mark as read
                  </UButton>
                </div>
              </div>
            </div>
          </UCard>
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

// Check if running in browser
const isBrowser = process.client

// Initialize Puter
const initPuter = () => {
  if (!isBrowser || !window.puter) {
    console.error('Puter SDK not loaded')
    return null
  }
  return window.puter
}

// Router
const router = useRouter()

// API
const { isLoading, error, getTransactions, getSummary, getMonthlyStats, getCategoryStats } = useApi()

// Insights state
const insights = ref([])
const isGenerating = ref(false)

// Track previous insights to avoid repetition
const previousInsights = ref([])

// Save insights to local storage
function saveInsightsToLocalStorage() {
  try {
    localStorage.setItem('myfintrack.insights', JSON.stringify(insights.value))
  } catch (e) {
    console.error('Error saving insights to local storage:', e)
  }
}

// Initialize on component mount
onMounted(async () => {
  // Check authentication
  const token = localStorage.getItem('auth.accessToken')
  if (!token) {
    router.push('/auth/login')
    return
  }
  
  // Try to load insights from local storage first
  const savedInsights = localStorage.getItem('myfintrack.insights')
  if (savedInsights) {
    try {
      const parsed = JSON.parse(savedInsights)
      if (parsed && Array.isArray(parsed) && parsed.length > 0) {
        insights.value = parsed
        return // Skip API call if we have saved insights
      }
    } catch (e) {
      console.error('Error loading saved insights:', e)
    }
  }
  
  // If no saved insights, fetch from API
  await fetchInsights()
})

// Fetch insights
async function fetchInsights() {
  try {
    // Since we don't have a specific insights API yet, we'll generate placeholder insights
    // In a real implementation, we would add a getInsights() method to the API service
    
    // Get some transaction data to build insights from
    const transactions = await getTransactions()
    const summary = await getSummary()
    const monthlyStats = await getMonthlyStats('3months')
    const categoryStats = await getCategoryStats('3months')
    
    if (transactions && transactions.length > 0) {
      insights.value = generatePlaceholderInsights(transactions, summary, monthlyStats, categoryStats)
    } else {
      insights.value = []
    }
  } catch (error) {
    console.error('Error fetching insights:', error)
  }
}

// Generate placeholder insights based on actual user data
function generatePlaceholderInsights(transactions, summary, monthlyStats, categoryStats) {
  const placeholderInsights = []
  const today = new Date()
  
  // 1. Spending Pattern Insight
  if (categoryStats && categoryStats.length > 0) {
    // Find top spending category
    const topCategory = [...categoryStats].sort((a, b) => b.total - a.total)[0]
    
    if (topCategory) {
      const percentage = Math.round((topCategory.total / summary.total_expenses) * 100)
      
      placeholderInsights.push({
        id: 1,
        insight_type: 'SPENDING',
        insight_type_display: 'Spending Pattern',
        title: `${percentage}% of your spending is on ${topCategory.category_display}`,
        content: `Over the past 3 months, you've spent $${topCategory.total.toFixed(2)} on ${topCategory.category_display}, which is ${percentage}% of your total expenses. Consider if this aligns with your financial goals.`,
        is_read: false,
        created_at: today.toISOString(),
        data: {
          category: topCategory.category,
          category_display: topCategory.category_display,
          amount: topCategory.total,
          percentage: percentage,
          time_period: '3 months'
        }
      })
    }
  }
  
  // 2. Budget Alert
  if (summary && summary.category_expenses && summary.category_expenses.length > 0) {
    // Get a random category for the demo
    const randomCategory = summary.category_expenses[Math.floor(Math.random() * summary.category_expenses.length)]
    
    if (randomCategory) {
      const budgetAmount = randomCategory.total * 1.2 // Simulate a budget 20% higher than actual spending
      const usagePercentage = Math.round((randomCategory.total / budgetAmount) * 100)
      
      placeholderInsights.push({
        id: 2,
        insight_type: 'BUDGET',
        insight_type_display: 'Budget Alert',
        title: `Budget almost reached for ${randomCategory.category}`,
        content: `You've used ${usagePercentage}% of your $${budgetAmount.toFixed(2)} budget for ${randomCategory.category}. Be mindful of your spending in this category for the rest of the period.`,
        is_read: false,
        created_at: new Date(today.getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        data: {
          category: randomCategory.category,
          category_display: randomCategory.category,
          budget_amount: budgetAmount,
          usage_percentage: usagePercentage,
          period: 'MONTHLY',
          period_display: 'Monthly'
        }
      })
    }
  }
  
  // 3. Savings Opportunity
  if (transactions && transactions.length > 0) {
    // Group transactions by category
    const categoryCounts = {}
    const categoryAmounts = {}
    
    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        if (!categoryCounts[tx.category]) {
          categoryCounts[tx.category] = 0
          categoryAmounts[tx.category] = 0
        }
        categoryCounts[tx.category]++
        categoryAmounts[tx.category] += Math.abs(tx.amount)
      }
    })
    
    // Find category with most transactions
    let maxCategory = null
    let maxCount = 0
    
    for (const category in categoryCounts) {
      if (categoryCounts[category] > maxCount) {
        maxCategory = category
        maxCount = categoryCounts[category]
      }
    }
    
    if (maxCategory && maxCount >= 3) {
      placeholderInsights.push({
        id: 3,
        insight_type: 'SAVINGS',
        insight_type_display: 'Savings Opportunity',
        title: `Potential savings in ${maxCategory}`,
        content: `You made ${maxCount} ${maxCategory} transactions last month, totaling $${categoryAmounts[maxCategory].toFixed(2)}. Consider consolidating these purchases or finding alternatives to reduce this expense.`,
        is_read: true, // This one is already read
        created_at: new Date(today.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        data: {
          category: maxCategory,
          category_display: maxCategory,
          transaction_count: maxCount,
          total_amount: categoryAmounts[maxCategory],
          time_period: '1 month'
        }
      })
    }
  }
  
  // 4. General Financial Advice
  if (monthlyStats && monthlyStats.length > 0) {
    // Calculate average income and expenses
    let totalIncome = 0
    let totalExpenses = 0
    
    monthlyStats.forEach(month => {
      totalIncome += month.income
      totalExpenses += month.expenses
    })
    
    const avgIncome = totalIncome / monthlyStats.length
    const avgExpenses = totalExpenses / monthlyStats.length
    const savings = avgIncome - avgExpenses
    const savingsRate = avgIncome > 0 ? (savings / avgIncome) * 100 : 0
    
    // Determine advice based on savings rate
    let title = ''
    let content = ''
    
    if (savingsRate < 0) {
      title = 'Spending exceeds income'
      content = 'Your expenses have exceeded your income over the last 3 months. Review your spending and consider creating a budget to help manage your finances.'
    } else if (savingsRate < 10) {
      title = 'Low savings rate'
      content = 'Your savings rate is below 10%. Financial experts recommend saving at least 20% of your income. Consider identifying areas where you can reduce expenses.'
    } else if (savingsRate < 20) {
      title = 'Good progress on savings'
      content = 'You\'re saving between 10-20% of your income, which is good progress. Try to increase this to 20% or more for long-term financial security.'
    } else {
      title = 'Excellent savings rate'
      content = 'You\'re saving over 20% of your income, which is excellent! Consider investing these savings for long-term growth.'
    }
    
    placeholderInsights.push({
      id: 4,
      insight_type: 'GENERAL',
      insight_type_display: 'General Advice',
      title: title,
      content: content,
      is_read: false,
      created_at: new Date(today.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      data: {
        income: avgIncome,
        expenses: avgExpenses,
        savings: savings,
        savings_rate: savingsRate,
        time_period: '3 months'
      }
    })
  }
  
  return placeholderInsights
}

// Generate a single new insight using Puter AI
async function generateInsights() {
  if (isGenerating.value) return
  
  try {
    isGenerating.value = true
    
    // Get recent transactions and summary data
    const [transactions, summary, monthlyStats, categoryStats] = await Promise.all([
      getTransactions({ limit: 50, ordering: '-date' }),
      getSummary(),
      getMonthlyStats('3months'),
      getCategoryStats('3months')
    ])

    // Filter out income transactions for better insights
    const expenses = transactions.filter(tx => tx.amount < 0)
    
    // Format transactions for the AI prompt
    const formattedTransactions = expenses.map(tx => ({
      date: tx.date,
      amount: Math.abs(tx.amount),
      category: tx.category,
      description: tx.description
    }))

    // Calculate financial summary
    const totalIncome = monthlyStats.reduce((sum, month) => sum + month.income, 0)
    const totalExpenses = monthlyStats.reduce((sum, month) => sum + month.expenses, 0)
    const avgIncome = monthlyStats.length > 0 ? totalIncome / monthlyStats.length : 0
    const avgExpenses = monthlyStats.length > 0 ? totalExpenses / monthlyStats.length : 0
    const savings = avgIncome - avgExpenses
    const savingsRate = avgIncome > 0 ? (savings / avgIncome) * 100 : 0

    // Initialize Puter
    const puter = initPuter()
    if (!puter) {
      throw new Error('Puter SDK not available. Please refresh the page and try again.')
    }

    // Collect previous suggestions to avoid repetition
    const previousSuggestions = previousInsights.value.map(insight => insight.content).join('\n\n')
    
    // Generate insight using Puter AI with context about previous insights
    const rawResponse = await puter.ai.chat(`
      You are a financial expert assistant. Analyze the following transactions and provide ONE detailed, personalized insight or recommendation:
      
      Transactions (last 3 months):
      ${JSON.stringify(formattedTransactions, null, 2)}
      
      Financial Summary:
      - Average Monthly Income: $${avgIncome.toFixed(2)}
      - Average Monthly Expenses: $${avgExpenses.toFixed(2)}
      - Average Monthly Savings: $${savings.toFixed(2)}
      - Savings Rate: ${savingsRate.toFixed(1)}%
      
      IMPORTANT INSTRUCTIONS:
      1. Provide ONE specific, actionable financial insight or tip
      2. Focus on a DIFFERENT aspect than previous insights
      3. Keep your response concise (2-3 sentences)
      4. Make it practical and tailored to this specific financial situation
      5. DO NOT repeat previous insights
      
      Previous insights (DO NOT REPEAT THESE):
      ${previousSuggestions || "No previous insights yet."}
    `)

    // Extract the actual content from the AI response
    let aiContent = ''
    try {
      // Check if response is a string that contains JSON
      if (typeof rawResponse === 'string') {
        // If it starts with a curly brace, try to parse it as JSON
        if (rawResponse.trim().startsWith('{')) {
          const parsedResponse = JSON.parse(rawResponse)
          // Extract content from the parsed response
          if (parsedResponse?.message?.content) {
            aiContent = parsedResponse.message.content
          } else {
            // Fallback if structure is different
            aiContent = rawResponse
          }
        } else {
          // If it's not JSON, use as is
          aiContent = rawResponse
        }
      } else if (typeof rawResponse === 'object') {
        // If it's already an object, try to extract content
        if (rawResponse?.message?.content) {
          aiContent = rawResponse.message.content
        } else {
          // Fallback to stringifying if structure is unknown
          aiContent = JSON.stringify(rawResponse)
        }
      } else {
        // Fallback for any other type
        aiContent = String(rawResponse)
      }
    } catch (error) {
      console.error('Error parsing AI response:', error)
      aiContent = 'Unable to parse AI response. Please try again.'
    }

    console.log('Raw AI response:', rawResponse)
    console.log('Extracted AI content:', aiContent)

    // Create a new insight from the extracted content
    const newInsight = {
      id: Date.now(),
      insight_type: 'AI_INSIGHT',
      insight_type_display: 'AI Insight',
      title: 'Financial Insight',
      content: aiContent,
      is_read: false,
      created_at: new Date().toISOString(),
      data: {
        income: avgIncome,
        expenses: avgExpenses,
        savings: savings,
        savings_rate: savingsRate,
        time_period: '3 months'
      }
    }
    
    // Add to previous insights to track
    previousInsights.value.push({
      id: newInsight.id,
      content: aiContent
    })
    
    // Limit tracked insights to prevent prompt from getting too large
    if (previousInsights.value.length > 5) {
      previousInsights.value.shift()
    }
    
    // Add the new insight to the existing ones
    insights.value.unshift(newInsight)
    
    // Save to local storage
    saveInsightsToLocalStorage()
    
  } catch (error) {
    console.error('Error generating AI insights:', error)
    // Show error message as a new insight
    const errorInsight = {
      id: Date.now(),
      insight_type: 'AI_INSIGHT',
      insight_type_display: 'AI Insight',
      title: 'Unable to Generate Insight',
      content: 'We couldn\'t generate a new financial insight at this time. Please try again later.',
      is_read: false,
      created_at: new Date().toISOString(),
      data: null
    }
    insights.value.unshift(errorInsight)
    
    // Save to local storage
    saveInsightsToLocalStorage()
  } finally {
    isGenerating.value = false
  }
}

// Mark insight as read
async function markAsRead(insightId) {
  try {
    // Since we don't have a specific mark as read API yet, we'll simulate it
    // In a real implementation, we would add a markInsightAsRead() method to the API service
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Update local data
    const insight = insights.value.find(i => i.id === insightId)
    if (insight) {
      insight.is_read = true
    }
  } catch (error) {
    console.error('Error marking insight as read:', error)
  }
}

// Helper to get insight icon based on type
function getInsightIcon(type) {
  switch (type) {
    case 'SPENDING':
      return 'i-heroicons-chart-pie'
    case 'BUDGET':
      return 'i-heroicons-exclamation-triangle'
    case 'SAVINGS':
      return 'i-heroicons-banknotes'
    case 'GENERAL':
      return 'i-heroicons-light-bulb'
    case 'AI_INSIGHT':
      return 'i-heroicons-sparkles'
    default:
      return 'i-heroicons-question-mark-circle'
  }
}

// Helper to get insight icon color based on type
function getInsightIconColor(type) {
  switch (type) {
    case 'SPENDING':
      return 'text-blue-500'
    case 'BUDGET':
      return 'text-amber-500'
    case 'SAVINGS':
      return 'text-emerald-500'
    case 'GENERAL':
      return 'text-violet-500'
    case 'AI_INSIGHT':
      return 'text-pink-500'
    default:
      return 'text-gray-500'
  }
}

// Helper to get insight type color
function getInsightTypeColor(type) {
  switch (type) {
    case 'SPENDING':
      return 'blue'
    case 'BUDGET':
      return 'amber'
    case 'SAVINGS':
      return 'emerald'
    case 'GENERAL':
      return 'violet'
    case 'AI_INSIGHT':
      return 'pink'
    default:
      return 'gray'
  }
}

// Helper to get insight data type
function getInsightDataType(insight) {
  if (!insight.data || Object.keys(insight.data).length === 0) {
    return null
  }
  return insight.insight_type
}

// Helper to get color for progress bars
function getProgressColor(percentage) {
  if (percentage >= 90) return 'red'
  if (percentage >= 75) return 'amber'
  if (percentage >= 50) return 'yellow'
  return 'emerald'
}

// Helper to get savings rate color
function getSavingsRateColor(rate) {
  if (rate < 0) return 'red'
  if (rate < 10) return 'amber'
  if (rate < 20) return 'yellow'
  return 'emerald'
}

// Helper to get category color (simple hash function for consistent colors)
function getCategoryColor(category) {
  const colors = ['blue', 'emerald', 'amber', 'red', 'purple', 'pink', 'indigo', 'teal']
  const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

// Format currency
function formatCurrency(value) {
  if (value === undefined || value === null) return '0.00'
  return parseFloat(value).toFixed(2)
}

// Format number
function formatNumber(value) {
  if (value === undefined || value === null) return '0'
  return parseFloat(value).toFixed(1)
}

// Format date
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}
</script>
