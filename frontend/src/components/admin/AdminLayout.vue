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
  background: #f5f5f2;
  box-sizing: border-box;
  overflow: hidden;
  font-family: 'DM Sans', Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
  background:
    radial-gradient(circle at top right, rgba(198, 146, 47, 0.08), transparent 28rem),
    #f5f5f2;
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
  box-shadow: 18px 0 46px rgba(8, 31, 31, 0.16) !important;
  background: linear-gradient(180deg, #143535 0%, #0d2b2b 35%, #081f1f 100%) !important;
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
  color: rgba(255, 255, 255, 0.48) !important;
  letter-spacing: 0.16em !important;
}

:deep(.brand-block strong) {
  font-size: 1.04rem !important;
  color: #ffffff !important;
  font-weight: 700 !important;
}

:deep(.brand-block small) {
  display: inline-flex !important;
  width: fit-content;
  margin-top: 8px !important;
  padding: 4px 9px;
  border: 1px solid rgba(198, 146, 47, 0.28);
  border-radius: 999px;
  background: rgba(198, 146, 47, 0.12);
  font-size: 0.67rem !important;
  color: #f0d49b !important;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

:deep(.brand-mark) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #f0d49b !important;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 12px !important;
  font-weight: 800;
  width: 38px !important;
  height: 38px !important;
}

:deep(.nav-list) {
  gap: 18px !important;
}

:deep(.nav-item) {
  position: relative;
  min-height: 44px !important;
  padding: 9px 12px !important;
  margin-bottom: 0 !important;
  border-radius: 12px !important;
  background: transparent !important;
  border: 1px solid transparent !important;
  color: rgba(255, 255, 255, 0.64) !important;
  transition: all 0.22s ease !important;
}

:deep(.nav-item:hover) {
  background: rgba(255, 255, 255, 0.07) !important;
  color: #ffffff !important;
}

:deep(.nav-item.router-link-exact-active),
:deep(.nav-item.nav-item--active) {
  background: rgba(255, 255, 255, 0.11) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
  box-shadow: inset 3px 0 0 #c6922f;
}

:deep(.nav-item.router-link-exact-active strong) {
  color: #ffffff !important;
}

:deep(.nav-item.router-link-exact-active .nav-item__icon) {
  color: #f0d49b !important;
}

:deep(.sidebar-card) {
  padding: 13px !important;
  border-radius: 16px !important;
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  margin-top: auto !important;
}

:deep(.nav-section__label),
:deep(.nav-item small),
:deep(.system-status p),
:deep(.sidebar-actions a) {
  color: rgba(255, 255, 255, 0.46) !important;
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
