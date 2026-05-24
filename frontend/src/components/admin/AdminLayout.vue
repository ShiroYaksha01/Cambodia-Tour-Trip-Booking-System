<script setup lang="ts">
import AdminNavbar from './AdminNavbar.vue'
import DashboardSidebar from '../dashboard/DashboardSidebar.vue'

const props = defineProps<{ breadcrumb?: string }>()
const emit = defineEmits(['search'])
</script>

<template>
  <div class="admin-shell">
    <DashboardSidebar role="admin" class="sidebar-fixed" />

    <div class="main-container">
      <AdminNavbar :breadcrumb="props.breadcrumb" @search="(q) => emit('search', q)" />

      <div class="page-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  height: 100vh;
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  gap: 18px;
  padding: 16px;
  background: black;
  box-sizing: border-box;
  overflow: hidden;
}

.sidebar-fixed {
  height: 100%;
}

.main-container {
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(180deg, #f3f3f2 0%, #f8f8f6 100%);
  border-radius: 24px;
  overflow: hidden;
}

.page-content {
  flex: 1;
  padding: 24px 30px;
  overflow-y: auto;
}
</style>