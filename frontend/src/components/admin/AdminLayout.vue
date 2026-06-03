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
  grid-template-columns: 260px minmax(0, 1fr);
  background: #F8F9FA;
  box-sizing: border-box;
  overflow: hidden;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #111827;
}

.sidebar-fixed {
  height: 100%;
}

.main-container {
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #F8F9FA;
  overflow: hidden;
}

.page-content {
  flex: 1;
  padding: 30px 34px 36px;
  overflow-y: auto;
}

:deep(.sidebar-shell) {
  height: 100%;
  min-height: 100vh;
  border-radius: 0 !important;
  border: none !important;
  border-right: 1px solid #e7eaee !important;
  box-shadow: none !important;
  background: #ffffff !important;
  padding: 22px 16px !important;
  display: flex;
  flex-direction: column;
}

:deep(.sidebar-inner) {
  padding: 0 !important;
  gap: 22px !important;
}

:deep(.brand-block) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px 14px !important;
}

:deep(.brand-block p.eyebrow) {
  display: block !important;
  color: #6B7280 !important;
  letter-spacing: 0.16em !important;
}

:deep(.brand-block strong) {
  font-size: 1.04rem !important;
  color: #111827 !important;
  font-weight: 700 !important;
}

:deep(.brand-block small) {
  display: inline-flex !important;
  width: fit-content;
  margin-top: 8px !important;
  padding: 4px 9px;
  border: 1px solid rgba(20, 138, 116, 0.2);
  border-radius: 999px;
  background: rgba(20, 138, 116, 0.1);
  font-size: 0.67rem !important;
  color: #148A74 !important;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

:deep(.brand-mark) {
  background: #148A74 !important;
  color: #ffffff !important;
  border: none !important;
  border-radius: 12px !important;
  font-weight: 800;
  width: 38px !important;
  height: 38px !important;
}

:deep(.nav-list) {
  gap: 8px !important;
}

:deep(.nav-item) {
  position: relative;
  min-height: 44px !important;
  padding: 9px 12px !important;
  margin-bottom: 0 !important;
  border-radius: 10px !important;
  background: transparent !important;
  border: 1px solid transparent !important;
  color: #4B5563 !important;
  transition: all 0.22s ease !important;
}

:deep(.nav-item:hover) {
  background: #F3F4F6 !important;
  color: #111827 !important;
}

:deep(.nav-item.router-link-exact-active),
:deep(.nav-item.nav-item--active) {
  background: rgba(20, 138, 116, 0.08) !important;
  border-color: transparent !important;
  color: #111827 !important;
  box-shadow: inset 3px 0 0 #148A74;
}

:deep(.nav-item.router-link-exact-active strong) {
  color: #111827 !important;
}

:deep(.nav-item.router-link-exact-active .nav-item__icon) {
  color: #148A74 !important;
}

:deep(.sidebar-card) {
  padding: 13px !important;
  border-radius: 12px !important;
  background: #F9FAFB !important;
  border: 1px solid #E5E7EB !important;
  margin-top: auto !important;
}

:deep(.nav-section__label),
:deep(.nav-item small),
:deep(.system-status p),
:deep(.sidebar-actions a) {
  color: #6B7280 !important;
}

:deep(.nav-item strong),
:deep(.system-status strong) {
  color: inherit !important;
}

@media (max-width: 1024px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }
  
  .sidebar-fixed {
    display: none !important;
  }

  .page-content {
    padding: 22px 18px 28px;
  }
}
</style>
