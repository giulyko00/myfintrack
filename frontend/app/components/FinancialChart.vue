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
              @update:model-value="updateChartType"
            />
          </div>
        </div>
      </template>
      
      <!-- Use key to force re-render when data changes -->
      <div class="h-60" :key="componentKey">
        <canvas :id="chartId" ref="chartCanvas"></canvas>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount, nextTick } from 'vue'
import Chart from 'chart.js/auto'

// Generate unique ID for this chart instance
const chartId = `chart-${Date.now()}-${Math.floor(Math.random() * 10000)}`

// Reference to the canvas element
const chartCanvas = ref(null)

// Component key for forcing re-renders
const componentKey = ref(0)

// Chart instance
let chartInstance = null

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

// Chart type
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
              return '$' + value;
            }
          }
        }
      }
    }
  }
})

// Initialize the chart
function initChart() {
  // Safety check - destroy any existing chart
  if (chartInstance) {
    try {
      chartInstance.destroy();
    } catch (e) {
      console.warn('Error destroying chart:', e);
    }
    chartInstance = null;
  }
  
  // Wait for the next tick to ensure the canvas is in the DOM
  nextTick(() => {
    // Check if we have a canvas reference
    if (!chartCanvas.value) {
      console.warn('Canvas reference not available');
      return;
    }
    
    try {
      // Create the chart
      chartInstance = new Chart(chartCanvas.value, chartConfig.value);
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  });
}

// Force component re-render by incrementing the key
function forceRerender() {
  // First destroy any existing chart
  if (chartInstance) {
    try {
      chartInstance.destroy();
    } catch (e) {
      console.warn('Error destroying chart:', e);
    }
    chartInstance = null;
  }
  
  // Increment the key to force re-render
  componentKey.value++;
}

// Update chart type
function updateChartType() {
  forceRerender();
}

// Watch for data changes
watch(() => props.data, (newValue) => {
  if (newValue && newValue.length > 0) {
    forceRerender();
  }
}, { deep: true });

// Watch for datasets changes
watch(() => props.datasets, () => {
  forceRerender();
}, { deep: true });

// Initialize chart when component is mounted
onMounted(() => {
  initChart();
});

// Clean up when component is unmounted
onBeforeUnmount(() => {
  if (chartInstance) {
    try {
      chartInstance.destroy();
    } catch (e) {
      console.warn('Error destroying chart:', e);
    }
    chartInstance = null;
  }
});

// Re-initialize chart after component updates
watch(componentKey, () => {
  nextTick(() => {
    initChart();
  });
});
</script>
