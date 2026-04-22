<!-- <script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <HelloWorld />
</template> -->


<template>
  <nav class = "navbar">
    <RouterLink to="/welcome">welcome_page</RouterLink>
    <RouterLink to="/register">register_page</RouterLink>
  </nav>

  <RouterView />
</template>

<style>
  .navbar{
    font-size: 20px;
    display: flex;
    gap: 24px;
  }
</style>