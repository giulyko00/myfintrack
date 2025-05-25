<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="flex flex-col items-center space-y-2">
          <h1 class="text-2xl font-bold">MyFinTrack</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Personal Finance & Trading Journal</p>
        </div>
      </template>
      
      <div class="space-y-6">
        <!-- Credenziali di test -->
        <UCard
          class="mb-6 border-2 border-primary-100 dark:border-primary-800"
        >
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-key" class="text-primary-500" />
              <h3 class="text-base font-semibold">Credenziali di test</h3>
            </div>
          </template>
          
          <div class="space-y-2 text-sm">
            <div class="flex items-center justify-between border-b pb-2">
              <span class="font-medium">Email:</span>
              <code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">demo@myfintrack.com</code>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-medium">Password:</span>
              <code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Password123</code>
            </div>
          </div>
        </UCard>

        <form @submit.prevent="login" class="space-y-4">
          <UFormGroup label="Email" name="email">
            <UInput
              v-model="email"
              type="email"
              placeholder="demo@myfintrack.com"
              autocomplete="email"
              required
            />
          </UFormGroup>

          <UFormGroup label="Password" name="password">
            <UInput
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
            />
          </UFormGroup>

          <div class="flex items-center justify-between">
            <UCheckbox v-model="rememberMe" label="Ricordami" name="remember" />
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
            label="Accedi"
          />
        </form>

        <div class="text-center text-sm text-gray-500">
          <p>Questa è una demo. Utilizza le credenziali di test per accedere.</p>
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
