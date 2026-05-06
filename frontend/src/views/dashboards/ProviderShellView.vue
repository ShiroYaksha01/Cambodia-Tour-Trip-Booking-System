<template>
  <div class="provider-shell">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Provider Suite</h2>
        <p class="subtitle">HERITAGE MANAGEMENT</p>
      </div>

      <nav class="sidebar-nav">
        <RouterLink class="nav-item" :to="{ name: 'provider-dashboard' }" active-class="active">
          <span class="icon">⚙️</span>
          Command Center
        </RouterLink>
        <RouterLink class="nav-item" :to="{ name: 'provider-service' }" active-class="active">
          <span class="icon">🛠️</span>
          Service Manager
        </RouterLink>
        <RouterLink class="nav-item" :to="{ name: 'provider-inventory' }" active-class="active">
          <span class="icon">📊</span>
          Inventory & Pricing
        </RouterLink>
        <a href="#" class="nav-item" @click.prevent>
          <span class="icon">👥</span>
          Guest Manifest
        </a>
        <a href="#" class="nav-item" @click.prevent>
          <span class="icon">💰</span>
          Financial Ledger
        </a>
        <a href="#" class="nav-item" @click.prevent>
          <span class="icon">💬</span>
          Customer Chat
        </a>
        <a href="#" class="nav-item" @click.prevent>
          <span class="icon">🎨</span>
          Brand Settings
        </a>
      </nav>
    </aside>

    <main class="shell-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.provider-shell {
  display: flex;
  min-height: 100vh;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.sidebar {
  width: 200px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
  overflow-y: auto;
  flex: 0 0 200px;
}

.sidebar-header {
  margin-bottom: 30px;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.subtitle {
  margin: 4px 0 0 0;
  font-size: 11px;
  color: #999;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  text-decoration: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #f0f0f0;
}

.nav-item.active {
  background: #e8f4f0;
  color: #1b7f6a;
  border-left: 3px solid #1b7f6a;
  padding-left: 9px;
}

.nav-item .icon {
  font-size: 16px;
}

.shell-content {
  flex: 1;
  min-width: 0;
  overflow: auto;
}

:deep(.provider-suite),
:deep(.inventory-shell) {
  display: block !important;
  min-height: auto !important;
  height: auto !important;
  background: #ffffff !important;
  font-family: inherit !important;
}

:deep(.provider-suite > .sidebar),
:deep(.inventory-shell > .sidebar) {
  display: none !important;
}

:deep(.provider-suite > .main-content),
:deep(.inventory-shell > .inventory-main) {
  width: 100% !important;
  height: auto !important;
  min-height: auto !important;
}

@media (max-width: 900px) {
  .provider-shell {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    flex-basis: auto;
    border-right: 0;
    border-bottom: 1px solid #e0e0e0;
  }
}
</style>