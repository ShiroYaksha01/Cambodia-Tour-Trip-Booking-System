<template>
  <button 
    class="logout-button" 
    @click="logout" 
    :disabled="isLoading"
    aria-label="Sign out"
  >
    <span class="logout-icon" :class="{ 'spin': isLoading }">
      {{ isLoading ? '○' : '↩' }}
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
    await router.push({ name: "customer-homepage" });
    // Force a reload or update state if necessary
    window.location.reload(); 
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
  padding: 7px 9px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  color: #5d6f70;
  font-weight: 600;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: none;
}

.logout-button:hover:not(:disabled) {
  background: #eef7f6;
  border-color: rgba(15, 110, 112, 0.1);
  color: #0f6e70;
  box-shadow: none;
  transform: none;
}

.logout-button:active:not(:disabled) {
  transform: scale(0.98);
}

.logout-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.logout-icon {
  font-size: 0.88rem;
  display: inline-block;
}

.logout-icon.spin {
  animation: spin 1s linear infinite;
}

.logout-text {
  letter-spacing: 0;
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
