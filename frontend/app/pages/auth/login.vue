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
        <form @submit.prevent="login" class="space-y-4">
          <UFormGroup label="Email" name="email">
            <UInput
              v-model="email"
              type="email"
              placeholder="email@example.com"
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
            <UCheckbox v-model="rememberMe" label="Remember me" name="remember" />
            <UButton
              variant="link"
              color="primary"
              to="#"
              label="Forgot password?"
            />
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


      </div>

      <template #footer>
        <div class="text-center text-sm">
          Don't have an account?
          <UButton
            variant="link"
            color="primary"
            to="#"
            label="Create an account"
          />
        </div>
      </template>
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
