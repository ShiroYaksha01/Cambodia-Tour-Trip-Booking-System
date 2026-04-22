<!-- <script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <HelloWorld />
</template> -->
<script setup>
import Register from "./views/register_page.vue";
import VerifyEmail from "./views/verify_email_page.vue";
import { RouterView } from "vue-router";
</script>
<template>
  <!-- <nav class = "navbar">
    <RouterLink to="/welcome">welcome_page</RouterLink>
    <RouterLink to="/register">register_page</RouterLink>
  </nav>
-->
  <RouterView />
  <!-- <Register /> -->
  <!-- <VerifyEmail /> -->
</template>

<style>
.navbar {
  font-size: 20px;
  display: flex;
  gap: 24px;
}
</style>
