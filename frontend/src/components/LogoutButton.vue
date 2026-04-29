<template>
  <button class="logout-button" @click="logout">Logout</button>
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
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 0.375rem;
  background: #2563eb;
  color: #ffffff;
  font-weight: 700;
  min-width: 110px;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.18);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.logout-button:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.24);
}
</style>
