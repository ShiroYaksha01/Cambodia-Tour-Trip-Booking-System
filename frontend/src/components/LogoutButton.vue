<template>
  <button class="logout-button" @click="logout">
    <span class="mr-2">🚪</span> Sign Out
  </button>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { clearAuthData } from "../utils/auth";

const router = useRouter();

function logout() {
  clearAuthData();
  router.push({ name: "login" });
}
</script>

<style scoped>
.logout-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.25rem;
  border: 1px solid #5f6d74/20;
  border-radius: 0.75rem;
  background: white;
  color: #69757a;
  font-weight: 700;
  font-size: 0.85rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-button:hover {
  background: #fdfdfd;
  color: #1d2427;
  border-color: #0e7f76/30;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(10, 109, 102, 0.08);
}
</style>
