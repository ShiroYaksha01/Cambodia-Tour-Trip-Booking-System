<template>
  <button 
    class="logout-button" 
    @click="logout" 
    :disabled="isLoading"
    aria-label="Sign out"
  >
    <span class="logout-icon" :class="{ 'spin': isLoading }">
      {{ isLoading ? '⏳' : '🚪' }}
    </span>
    <span class="logout-text">
      {{ isLoading ? 'Signing Out...' : 'Sign Out' }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref } from "vue";
import { clearAuthData } from "../utils/auth";

const router = useRouter();
const isLoading = ref(false);

async function logout() {
  isLoading.value = true;
  try {
    clearAuthData();
    await router.push({ name: "login" });
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.logout-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid rgba(15, 110, 112, 0.15);
  border-radius: 6px;
  color: #0f6e70;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(15, 110, 112, 0.08);
}

.logout-button:hover:not(:disabled) {
  background: #f8fbfb;
  border-color: #0f6e70;
  box-shadow: 0 4px 12px rgba(15, 110, 112, 0.12);
  transform: translateY(-1px);
}

.logout-button:active:not(:disabled) {
  transform: scale(0.98);
}

.logout-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.logout-icon {
  font-size: 1rem;
  display: inline-block;
}

.logout-icon.spin {
  animation: spin 1s linear infinite;
}

.logout-text {
  letter-spacing: 0.02em;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
