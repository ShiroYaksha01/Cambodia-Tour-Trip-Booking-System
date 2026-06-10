<template>
  <div class="provider-shell">
    <Teleport to="body">
      <Transition name="slide">
        <div v-if="mobileSidebarOpen" class="mobile-sidebar-overlay" @click="mobileSidebarOpen = false">
          <aside class="mobile-sidebar" @click.stop>
            <DashboardSidebar role="provider" />
          </aside>
        </div>
      </Transition>
    </Teleport>

    <DashboardSidebar role="provider" class="sidebar-fixed" />

    <main class="shell-content">
      <ProviderHeader
        v-model:searchQuery="searchQuery"
        :title="(route.meta.title as string) || ''"
        @toggle-sidebar="mobileSidebarOpen = !mobileSidebarOpen"
      />

      <div class="page-content">
        <RouterView v-slot="{ Component }">
          <component
            :is="Component"
            :key="$route.fullPath"
            :search-query="searchQuery"
          />
        </RouterView>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar.vue";
import ProviderHeader from "@/components/ProviderHeader.vue";

const route = useRoute();
const searchQuery = ref("");
const mobileSidebarOpen = ref(false);
</script>

<style scoped>
.provider-shell {
  height: 100vh;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  background: #f8f9fa;
  overflow: hidden;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #111827;
}

.sidebar-fixed {
  height: 100%;
}

.shell-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #f8f9fa;
}

.page-content {
  flex: 1;
  padding: 30px 34px 36px;
  overflow-y: auto;
}

.mobile-sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(17, 24, 39, 0.5);
  display: none;
}

.mobile-sidebar {
  width: 280px;
  height: 100%;
  overflow-y: auto;
  background: #ffffff;
}

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.2s ease;
}

.slide-enter-active .mobile-sidebar,
.slide-leave-active .mobile-sidebar {
  transition: transform 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}

.slide-enter-from .mobile-sidebar,
.slide-leave-to .mobile-sidebar {
  transform: translateX(-100%);
}

:deep(.sidebar-shell) {
  height: 100%;
  min-height: 100vh;
  border-radius: 0 !important;
  border: none !important;
  border-right: 1px solid #e7eaee !important;
  background: #ffffff !important;
  padding: 22px 16px !important;
}

:deep(.sidebar-inner) {
  padding: 0 !important;
  gap: 22px !important;
}

:deep(.brand-block) {
  padding: 0 8px 14px !important;
}

:deep(.brand-logo) {
  width: min(100%, 224px) !important;
  height: 46px !important;
}

:deep(.nav-list) {
  gap: 8px !important;
}

:deep(.nav-item) {
  position: relative;
  min-height: 44px !important;
  padding: 9px 12px !important;
  border-radius: 10px !important;
  background: transparent !important;
  border: 1px solid transparent !important;
  color: #4b5563 !important;
}

:deep(.nav-item:hover) {
  background: #f3f4f6 !important;
  color: #111827 !important;
}

:deep(.nav-item.router-link-exact-active),
:deep(.nav-item.nav-item--active) {
  background: rgba(20, 138, 116, 0.08) !important;
  border-color: transparent !important;
  color: #111827 !important;
  box-shadow: inset 3px 0 0 #148a74;
  transform: none !important;
}

:deep(.nav-item.router-link-exact-active .nav-item__icon) {
  color: #148a74 !important;
}

:deep(.sidebar-card) {
  padding: 13px !important;
  border-radius: 12px !important;
  background: #f9fafb !important;
  border: 1px solid #e5e7eb !important;
  margin-top: auto !important;
}

:deep(.sidebar-actions) {
  margin-top: 0 !important;
}

:deep(.provider-suite),
:deep(.inventory-shell),
:deep(.provider-dashboard-view) {
  display: block !important;
  min-height: auto !important;
  height: auto !important;
  background: transparent !important;
  font-family: inherit !important;
}

:deep(.provider-suite > .sidebar),
:deep(.inventory-shell > .sidebar) {
  display: none !important;
}

:deep(.provider-suite > .main-content),
:deep(.inventory-shell > .inventory-main),
:deep(.provider-dashboard-view > .main-content) {
  width: 100% !important;
  height: auto !important;
  min-height: auto !important;
  overflow: visible !important;
}

:deep(.provider-dashboard-view .content-wrapper),
:deep(.provider-suite .content-wrapper) {
  padding: 18px 0 0 !important;
}

@media (max-width: 900px) {
  .provider-shell {
    grid-template-columns: 1fr;
  }

  .sidebar-fixed {
    display: none !important;
  }

  .page-content {
    padding: 22px 18px 28px;
  }

  .mobile-sidebar-overlay {
    display: block;
  }
}
</style>
