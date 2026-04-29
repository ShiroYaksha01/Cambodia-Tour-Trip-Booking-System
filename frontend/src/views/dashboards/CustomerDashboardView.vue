<template>
  <section class="page">
    <div class="page-header">
      <h1>Customer Dashboard</h1>
      <LogoutButton />
    </div>
    <p>Customer-facing routes and booking actions live here.</p>
  </section>
</template>

<script setup lang="ts">
import LogoutButton from "../../components/LogoutButton.vue";
</script>

<style scoped>
.page {
  margin: 2rem auto;
  max-width: 700px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
</style>
