<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { UserRole } from '../utils/auth'
import { setCurrentUserRole } from '../utils/auth'

const router = useRouter()
const route = useRoute()
const selectedRole = ref<UserRole>('customer')

function login() {
  setCurrentUserRole(selectedRole.value)

  const redirectPath = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
  void router.push(redirectPath)
}
</script>

<template>
  <section class="page">
    <h1>Login</h1>
    <p>Select a role to simulate user payload and route access.</p>

    <label for="role">Role</label>
    <select id="role" v-model="selectedRole">
      <option value="admin">Admin</option>
      <option value="provider">Provider</option>
      <option value="customer">Customer</option>
    </select>

    <button type="button" @click="login">Continue</button>
  </section>
</template>

<style scoped>
.page {
  display: grid;
  gap: 0.75rem;
  max-width: 360px;
  margin: 2rem auto;
}

select,
button {
  padding: 0.5rem;
}
</style>
