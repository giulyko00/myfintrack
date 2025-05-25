<template>
  <!-- Pagina vuota che reindirizza al login -->
</template>

<script setup>
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()

onMounted(() => {
  // Reindirizza automaticamente alla pagina di login
  router.push('/auth/login')
})
</script>
