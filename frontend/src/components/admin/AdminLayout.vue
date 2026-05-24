<script setup lang="ts">
import AdminNavbar from './AdminNavbar.vue'
import DashboardSidebar from '../dashboard/DashboardSidebar.vue'

const props = defineProps<{ 
  breadcrumb?: string
  searchPlaceholder?: string
}>()
const emit = defineEmits(['search'])
</script>

<template>
  <div class="admin-shell">
    <DashboardSidebar role="admin" class="sidebar-fixed" />

    <div class="main-container">
      <AdminNavbar 
        :breadcrumb="props.breadcrumb" 
        :search-placeholder="props.searchPlaceholder"
        @search="(q) => emit('search', q)" 
      />

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
  grid-template-columns: 236px minmax(0, 1fr);
  background: #ffffff;
  box-sizing: border-box;
  overflow: hidden;
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #16383a;
}

.sidebar-fixed {
  height: 100%;
}

.main-container {
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f6f8f9;
  overflow: hidden;
}

.page-content {
  flex: 1;
  padding: 24px 28px 28px;
  overflow-y: auto;
}

/* Sidebar Custom Styling Overrides (The SaaS Mockup Look) */
:deep(.sidebar-shell) {
  height: 100%;
  min-height: 100vh;
  border-radius: 0 !important;
  border: none !important;
  border-right: 1px solid #e6ecee !important;
  box-shadow: none !important;
  background: #ffffff !important;
  padding: 18px 12px !important;
  display: flex;
  flex-direction: column;
}

:deep(.sidebar-inner) {
  padding: 0 !important;
  gap: 16px !important;
}

:deep(.brand-block) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px 8px !important;
}

:deep(.brand-block p.eyebrow) {
  display: none !important;
}

:deep(.brand-block strong) {
  font-size: 1.05rem !important;
  color: #123c3e !important;
  font-weight: 700 !important;
}

:deep(.brand-block small) {
  font-size: 0.72rem !important;
  color: #72817d !important;
}

:deep(.brand-mark) {
  background: #0f6e70 !important;
  color: #ffffff !important;
  border-radius: 8px !important;
  font-weight: 800;
  width: 32px !important;
  height: 32px !important;
}

:deep(.nav-list) {
  gap: 12px !important;
}

:deep(.nav-item) {
  min-height: 31px !important;
  padding: 6px 9px !important;
  margin-bottom: 0 !important;
  border-radius: 8px !important;
  background: transparent !important;
  border: 1px solid transparent !important;
  transition: all 0.2s ease !important;
}

:deep(.nav-item:hover) {
  background: #f8fafb !important;
}

:deep(.nav-item.router-link-exact-active),
:deep(.nav-item.nav-item--active) {
  background: #eaf5f4 !important;
  border-color: rgba(15, 110, 112, 0.1) !important;
  color: #0f6e70 !important;
}

:deep(.nav-item.router-link-exact-active strong) {
  color: #0f6e70 !important;
}

:deep(.nav-item.router-link-exact-active .nav-item__icon) {
  color: #0f6e70 !important;
}

:deep(.sidebar-card) {
  padding: 10px !important;
  border-radius: 10px !important;
  background: #f8fafb !important;
  border: 1px solid #edf2f5 !important;
  margin-top: auto !important;
}

@media (max-width: 1024px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }
  
  .sidebar-fixed {
    display: none !important;
  }
}
</style>