<template>
  <div>
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold">{{ title }}</h3>
          <div class="flex items-center gap-2">
            <USelect
              v-model="chartType"
              :options="chartTypeOptions"
              size="sm"
              :ui="{ width: 'w-32' }"
            />
          </div>
        </div>
      </template>
      
      <div class="h-60">
        <canvas ref="chartRef"></canvas>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  title: {
    type: String,
    default: 'Financial Overview'
  },
  data: {
    type: Array,
    required: true
  },
  labels: {
    type: Array,
    required: true
  },
  datasets: {
    type: Array,
    required: true
  },
  colors: {
    type: Array,
    default: () => ['#10B981', '#EF4444', '#3B82F6']
  }
})

const chartRef = ref(null)
const chartInstance = ref(null)
const chartType = ref('bar')

const chartTypeOptions = [
  { label: 'Bar', value: 'bar' },
  { label: 'Line', value: 'line' }
]

// Chart configuration
const chartConfig = computed(() => {
  return {
    type: chartType.value,
    data: {
      labels: props.labels,
      datasets: props.datasets.map((dataset, index) => ({
        ...dataset,
        backgroundColor: typeof props.colors[index % props.colors.length] === 'string' 
          ? props.colors[index % props.colors.length] + '80' // Add transparency
          : props.colors[index % props.colors.length],
        borderColor: props.colors[index % props.colors.length],
        borderWidth: 1.5,
        tension: 0.4,
        fill: chartType.value === 'line' ? false : undefined
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: 'USD',
                  maximumFractionDigits: 0
                }).format(context.parsed.y);
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '€' + value;
            }
          }
        }
      }
    }
  }
})

// Initialize chart
function initChart() {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
  
  if (chartRef.value) {
    chartInstance.value = new Chart(chartRef.value, chartConfig.value)
  }
}

// Watch for data changes
watch(() => props.data, initChart, { deep: true })
watch(chartType, initChart)

onMounted(() => {
  initChart()
})
</script>
