<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { clearCurrentUserRole, getCurrentUserRole } from './utils/auth'

const router = useRouter()
const role = computed(() => getCurrentUserRole())

function logout() {
  clearCurrentUserRole()
  void router.push('/login')
}
</script>

<template>
  <div class="layout">
    <header class="topbar">
      <h1>Cambodia Tour Trip Booking</h1>
      <nav class="actions">
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/login">Login</RouterLink>
        <button v-if="role" type="button" @click="logout">Logout ({{ role }})</button>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  padding: 1rem;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.75rem;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

button {
  padding: 0.25rem 0.6rem;
}
</style>
