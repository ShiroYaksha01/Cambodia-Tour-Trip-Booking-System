<template>
  <main class="page">
    <div class="card">
      <p class="eyebrow">Access blocked</p>
      <h1>Unauthorized</h1>
      <p class="message">You do not have permission to access this page.</p>

      <div class="actions">
        <RouterLink class="primary" :to="dashboardTarget">Go to dashboard</RouterLink>
        <button type="button" class="secondary" @click="resetRole">Reset saved role</button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { clearCurrentUserRole, getCurrentUserRole } from '../utils/auth'

const router = useRouter()

const dashboardTarget = computed(() => {
  const role = getCurrentUserRole()

  if (role === 'admin') {
    return '/admin/dashboard'
  }

  if (role === 'provider') {
    return '/provider/dashboard'
  }

  return '/customer/dashboard'
})

function resetRole() {
  clearCurrentUserRole()
  router.push('/login')
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  box-sizing: border-box;
  background:
    radial-gradient(circle at top, rgba(13, 75, 69, 0.08), transparent 22%),
    linear-gradient(180deg, #f7f8f6 0%, #eef2ef 100%);
}

.card {
  width: min(100%, 560px);
  padding: 36px 32px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(16, 51, 61, 0.08);
  box-shadow: 0 24px 54px rgba(16, 51, 61, 0.12);
  text-align: center;
}

.eyebrow {
  margin: 0 0 8px;
  color: #6a7b76;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.72rem;
  font-weight: 700;
}

h1 {
  margin: 0;
  color: #10333d;
  font-size: clamp(2.4rem, 5vw, 4rem);
  line-height: 1;
}

.message {
  margin: 16px 0 0;
  color: #4d626b;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 24px;
}

.primary,
.secondary {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid transparent;
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary {
  background: linear-gradient(135deg, #0d4b45, #f3c85f);
  color: #0b3035;
}

.secondary {
  background: transparent;
  color: #0f6e70;
  border-color: rgba(15, 110, 112, 0.28);
}
</style>
