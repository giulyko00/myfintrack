<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
    <UCard class="w-full max-w-sm" :ui="{ body: { padding: 'px-5 py-4' } }">
      <template #header>
        <div class="flex flex-col items-center space-y-2">
          <h1 class="text-2xl font-bold">MyFinTrack</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Personal Finance & Trading Journal</p>
        </div>
      </template>
      
      <div class="space-y-4 w-full">
        <!-- Test credentials -->
        <div class="text-sm p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 mb-3">
          <div class="flex items-center gap-1 mb-2 text-primary-600 dark:text-primary-400">
            <UIcon name="i-heroicons-key" class="text-xs" />
            <span class="font-semibold text-xs">Test Credentials</span>
          </div>
          <div class="grid gap-1 text-xs space-y-2"> 
            <div class="flex items-center gap-2">
              <span class="font-medium">Email:</span>
              <code class="bg-white dark:bg-gray-800 px-1 py-0.5 rounded text-primary-600 dark:text-primary-400">demo@myfintrack.com</code>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-medium">Password:</span>
              <code class="bg-white dark:bg-gray-800 px-1 py-0.5 rounded text-primary-600 dark:text-primary-400">Password123</code>
            </div>
          </div>
        </div>

        <form @submit.prevent="login" class="py-2 flex flex-col gap-2 w-full max-w-full">
          <UFormGroup label="Email" name="email" class="w-full" :ui="{ wrapper: 'w-full' }">
            <UInput
              v-model="email"
              type="email"
              placeholder="demo@myfintrack.com"
              autocomplete="email"
              required
              class="w-full"
              :ui="{ width: 'w-full' }"
            />
          </UFormGroup>

          <UFormGroup label="Password" name="password" class="w-full" :ui="{ wrapper: 'w-full' }">
            <UInput
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              class="w-full"
              :ui="{ width: 'w-full' }"
            />
          </UFormGroup>

          <div class="flex items-center justify-between py-2">
            <UCheckbox v-model="rememberMe" label="Remember me" name="remember" />
          </div>

          <UAlert
            v-if="errorMessage"
            icon="i-heroicons-exclamation-triangle"
            :title="errorMessage"
            color="red"
            variant="soft"
            class="mt-4"
          />

          <UButton
            type="submit"
            color="primary"
            block
            :loading="isLoading"
            label="Sign in"
          />
        </form>

        <div class="text-center text-xs text-gray-500 mt-3">
          <p>This is a demo. Use the test credentials to sign in.</p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

async function login() {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // In a real app, this would call the authentication API
    await authStore.login(email.value, password.value, rememberMe.value)
    router.push('/dashboard')
  } catch (error) {
    errorMessage.value = error.message || 'Failed to sign in'
  } finally {
    isLoading.value = false
  }
}
</script>
