<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 bg-white dark:bg-gray-900">
      <div class="container flex items-center justify-between py-4">
        <div class="flex items-center gap-2">
          <NuxtLink to="/dashboard" class="text-xl font-bold">MyFinTrack</NuxtLink>
        </div>
        <nav class="hidden md:flex items-center space-x-6">
          <NuxtLink 
            to="/dashboard" 
            class="text-sm font-medium hover:text-primary-600 dark:hover:text-primary-400"
            active-class="text-primary-600 dark:text-primary-400"
            prefetch
          >
            Dashboard
          </NuxtLink>
          <NuxtLink 
            to="/budget" 
            class="text-sm font-medium hover:text-primary-600 dark:hover:text-primary-400"
            active-class="text-primary-600 dark:text-primary-400"
            prefetch
          >
            Budget Planner
          </NuxtLink>
          <NuxtLink 
            to="/insights" 
            class="text-sm font-medium hover:text-primary-600 dark:hover:text-primary-400"
            active-class="text-primary-600 dark:text-primary-400"
            prefetch
          >
            Financial Insights
          </NuxtLink>
        </nav>
        <div class="flex items-center gap-4">
          <UButton
            icon="i-heroicons-moon"
            color="gray"
            variant="ghost"
            aria-label="Toggle dark mode"
            @click="toggleColorMode"
          />
          <!-- User avatar dropdown with logout option -->
          <div v-if="authStore.isAuthenticated" class="relative user-menu-container">
            <UButton
              color="gray"
              variant="ghost"
              trailing-icon="i-heroicons-chevron-down"
              @click="toggleUserMenu"
            >
              <template #leading>
                <UAvatar
                  :src="avatarUrl"
                  :alt="userName"
                  size="sm"
                />
              </template>
              <span class="text-sm">{{ userName[0].toUpperCase() + userName.slice(1) }}</span>
            </UButton>
            
            <!-- Menu dropdown custom implementation -->
            <div v-if="isUserMenuOpen" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700">
              <div class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">User Options</div>
              
              <button @click="goToProfile" class="w-full flex items-center px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                <UIcon name="i-heroicons-user-circle" class="mr-2" />
                Profile
              </button>
              
              <button @click="goToSettings" class="w-full flex items-center px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                <UIcon name="i-heroicons-cog-6-tooth" class="mr-2" />
                Settings
              </button>
              
              <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              
              <button @click="logout" class="w-full flex items-center px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <UIcon name="i-heroicons-arrow-right-on-rectangle" class="mr-2" />
                Sign Out
              </button>
            </div>
          </div>
          <UButton
            class="md:hidden"
            color="gray"
            variant="ghost"
            icon="i-heroicons-bars-3"
            aria-label="Menu"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          />
        </div>
      </div>
    </header>

    <!-- Mobile menu -->
    <div 
      v-if="isMobileMenuOpen" 
      class="md:hidden fixed inset-0 z-50 bg-white dark:bg-gray-900"
    >
      <div class="container py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
        <h2 class="text-xl font-bold">Menu</h2>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark"
          aria-label="Close menu"
          @click="isMobileMenuOpen = false"
        />
      </div>
      <nav class="container py-8 flex flex-col space-y-6">
        <NuxtLink 
          to="/dashboard" 
          class="text-lg font-medium"
          @click="isMobileMenuOpen = false"
          prefetch
        >
          Dashboard
        </NuxtLink>
        <NuxtLink 
          to="/budget" 
          class="text-lg font-medium"
          @click="isMobileMenuOpen = false"
          prefetch
        >
          Budget Planner
        </NuxtLink>
        <NuxtLink 
          to="/insights" 
          class="text-lg font-medium"
          @click="isMobileMenuOpen = false"
          prefetch
        >
          Financial Insights
        </NuxtLink>
        <UButton
          color="primary"
          block
          icon="i-heroicons-arrow-right-on-rectangle"
          label="Sign out"
          @click="logout"
        />
      </nav>
    </div>

    <!-- Main Content -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200 dark:border-gray-800 mt-8">
      <div class="container py-4 text-center text-sm text-gray-500">
        <p>&copy; {{ currentYear }} MyFinTrack. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const colorMode = useColorMode()
const authStore = useAuthStore()
const router = useRouter()

const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)
const currentYear = new Date().getFullYear()

// Funzione per aprire/chiudere il menu utente
function toggleUserMenu() {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

// Chiudi il menu quando si clicca al di fuori
onMounted(() => {
  document.addEventListener('click', (event) => {
    const target = event.target
    const userMenuContainer = document.querySelector('.user-menu-container')
    if (userMenuContainer && !userMenuContainer.contains(target)) {
      isUserMenuOpen.value = false
    }
  })
})

// Funzioni di navigazione
function goToProfile() {
  isUserMenuOpen.value = false
}

function goToSettings() {
  isUserMenuOpen.value = false
}

// User information
const userName = computed(() => {
  return authStore.user?.name || authStore.user?.email?.split('@')[0] || 'User'
})

// Generate avatar URL based on user's name
const avatarUrl = computed(() => {
  const name = encodeURIComponent(userName.value)
  return `https://ui-avatars.com/api/?name=${name}&background=10B981&color=fff`
})

// User menu dropdown items
const userMenuItems = computed(() => [
  [
    {
      label: 'Profile',
      icon: 'i-heroicons-user-circle',
      click: () => router.push('/profile')
    },
    {
      label: 'Settings',
      icon: 'i-heroicons-cog-6-tooth',
      click: () => router.push('/settings')
    }
  ],
  [
    {
      label: 'Sign Out',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      click: () => logout() // Ensure the logout function is called correctly
    }
  ]
])

// Toggle dark/light mode
function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Logout function
async function logout() {
  try {
    await authStore.logout()
    // Forzare un refresh completo della pagina dopo il logout
    window.location.href = '/auth/login'
    isMobileMenuOpen.value = false
  } catch (error) {
    console.error('Failed to logout:', error)
  }
}
</script>

<style>
.container {
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
  max-width: 80rem;
}

/* Aggiunge il cursore pointer a tutti gli elementi cliccabili */
button,
.u-button,
a,
[role="button"],
[type="button"],
[type="submit"],
.clickable,
.pointer {
  cursor: pointer !important;
}

/* Assicura che i menu dropdown abbiano il cursore pointer */
.user-menu-container button,
.dropdown-item {
  cursor: pointer !important;
}

.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.layout-enter-active,
.layout-leave-active {
  transition: all 0.2s;
}
.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}
</style>
