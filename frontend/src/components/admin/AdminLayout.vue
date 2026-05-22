<script setup lang="ts">
import AdminNavbar from './AdminNavbar.vue'
import AdminSidebar from './AdminSidebar.vue'

const emit = defineEmits(['search'])
</script>

<template>
  <div class="layout">
    <AdminSidebar />

    <div class="main">
      <AdminNavbar @search="(q) => emit('search', q)" />

      <div class="page-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.layout {
  display: flex;
  height: 100vh;
  background: #f4f1ec;
  font-family: Inter, sans-serif;
  overflow: hidden;
}

.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.page-content {
  flex: 1;
  padding: 34px;
  overflow-y: auto;
}
</style>