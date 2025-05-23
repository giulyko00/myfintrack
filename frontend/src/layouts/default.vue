<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Navigation -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <NuxtLink to="/" class="text-xl font-bold text-blue-600 dark:text-blue-400">
                MyFinTrack
              </NuxtLink>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NuxtLink 
                v-for="link in navLinks" 
                :key="link.to"
                :to="link.to"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                :class="{ 'border-blue-500 text-gray-900 dark:text-white': $route.path.startsWith(link.to) }"
              >
                {{ link.label }}
              </NuxtLink>
            </div>
          </div>
          
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <!-- Theme Toggle -->
            <button 
              @click="toggleTheme"
              class="p-2 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <svg v-if="isDark" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
              </svg>
              <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
            
            <!-- Profile dropdown -->
            <div class="ml-3 relative">
              <div>
                <button 
                  @click="isProfileMenuOpen = !isProfileMenuOpen"
                  class="bg-white dark:bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  id="user-menu"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span class="sr-only">Open user menu</span>
                  <div class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {{ userInitials }}
                  </div>
                </button>
              </div>
              <!-- Profile dropdown panel -->
              <div 
                v-show="isProfileMenuOpen" 
                v-click-outside="() => isProfileMenuOpen = false"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu"
              >
                <NuxtLink 
                  to="/profile" 
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" 
                  role="menuitem"
                  @click="isProfileMenuOpen = false"
                >
                  Your Profile
                </NuxtLink>
                <NuxtLink 
                  to="/settings" 
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" 
                  role="menuitem"
                  @click="isProfileMenuOpen = false"
                >
                  Settings
                </NuxtLink>
                <a 
                  href="#" 
                  @click.prevent="logout"
                  class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700" 
                  role="menuitem"
                >
                  Sign out
                </a>
              </div>
            </div>
          </div>
          
          <!-- Mobile menu button -->
          <div class="-mr-2 flex items-center sm:hidden">
            <button 
              @click="isMobileMenuOpen = !isMobileMenuOpen"
              type="button" 
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu" 
              :aria-expanded="isMobileMenuOpen"
            >
              <span class="sr-only">Open main menu</span>
              <svg 
                class="block h-6 w-6" 
                :class="{'hidden': isMobileMenuOpen, 'block': !isMobileMenuOpen}" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg 
                class="hidden h-6 w-6" 
                :class="{'block': isMobileMenuOpen, 'hidden': !isMobileMenuOpen}" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu, show/hide based on menu state. -->
      <div v-show="isMobileMenuOpen" class="sm:hidden" id="mobile-menu">
        <div class="pt-2 pb-3 space-y-1">
          <NuxtLink 
            v-for="link in navLinks" 
            :key="`mobile-${link.to}`"
            :to="link.to"
            class="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium dark:text-gray-300 dark:hover:bg-gray-700"
            :class="{'bg-blue-50 border-blue-500 text-blue-700 dark:bg-gray-700 dark:text-blue-300': $route.path.startsWith(link.to)}"
            @click="isMobileMenuOpen = false"
          >
            {{ link.label }}
          </NuxtLink>
        </div>
        <div class="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center px-4">
            <div class="flex-shrink-0">
              <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {{ userInitials }}
              </div>
            </div>
            <div class="ml-3">
              <div class="text-base font-medium text-gray-800 dark:text-white">{{ user?.name || 'User' }}</div>
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ user?.email || '' }}</div>
            </div>
            <button 
              @click="toggleTheme"
              class="ml-auto flex-shrink-0 p-2 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <svg v-if="isDark" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
              </svg>
              <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>
          <div class="mt-3 space-y-1">
            <NuxtLink 
              to="/profile" 
              class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              @click="isMobileMenuOpen = false"
            >
              Your Profile
            </NuxtLink>
            <NuxtLink 
              to="/settings" 
              class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              @click="isMobileMenuOpen = false"
            >
              Settings
            </NuxtLink>
            <a 
              href="#" 
              @click.prevent="logout"
              class="block px-4 py-2 text-base font-medium text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Sign out
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="py-6 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div class="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {{ new Date().getFullYear() }} MyFinTrack. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useThemeStore } from '~/stores/theme';
import { useAuthStore } from '~/stores/auth';

const themeStore = useThemeStore();
const authStore = useAuthStore();
const route = useRoute();

const isMobileMenuOpen = ref(false);
const isProfileMenuOpen = ref(false);

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/reports', label: 'Reports' },
];

const isDark = computed(() => themeStore.isDark);
const user = computed(() => authStore.user);

const userInitials = computed(() => {
  if (!user.value?.name) return 'U';
  return user.value.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
});

const toggleTheme = () => {
  themeStore.toggleTheme();
};

const logout = async () => {
  isMobileMenuOpen.value = false;
  isProfileMenuOpen.value = false;
  await authStore.logout();
  navigateTo('/auth/login');
};

// Close mobile menu when route changes
watch(() => route.path, () => {
  isMobileMenuOpen.value = false;
});

// Close menus when clicking outside
const handleClickOutside = (event) => {
  if (isProfileMenuOpen.value && !event.target.closest('#user-menu')) {
    isProfileMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  // Initialize theme
  themeStore.initTheme();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Add any custom styles here */
</style>
