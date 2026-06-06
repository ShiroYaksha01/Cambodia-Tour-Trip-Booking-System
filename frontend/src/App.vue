<template>
  <router-view />
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { useTheme } from './composables/useTheme';

const route = useRoute();
const { isDarkMode } = useTheme();

watch([isDarkMode, () => route.path], ([dark, path]) => {
  // Determine if current route is a customer-facing page
  const isCustomerPage = 
    path === '/' || 
    path.startsWith('/customer') || 
    path.startsWith('/service') || 
    path.startsWith('/booking') || 
    path.startsWith('/payment');

  if (dark && isCustomerPage) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, { immediate: true });
</script>

<style>
/* Global styles are in style.css */
</style>
