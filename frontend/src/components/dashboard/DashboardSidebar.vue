<template>
  <aside class="sidebar-shell" :class="`sidebar-shell--${role}`">
    <div v-if="role === 'provider'" class="sidebar-inner sidebar-inner--provider">
      <div class="provider-brand">
        <div class="provider-brand__mark" aria-hidden="true">⬤</div>
        <div>
          <strong>Angkor Treasures</strong>
          <small>VERIFIED PROVIDER</small>
        </div>
      </div>

      <nav class="provider-nav" aria-label="Provider navigation">
        <a v-for="item in providerNavItems" :key="item.label" :href="item.href" class="provider-nav__item">
          <span class="provider-nav__icon" aria-hidden="true">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </a>
      </nav>

      <button class="provider-cta" type="button">New Booking</button>

      <footer class="provider-footer">
        <a href="#" aria-label="Support">Support</a>
        <a href="#" aria-label="Logout">Logout</a>
      </footer>
    </div>

    <div v-else class="sidebar-inner">
      <div class="brand-block">
        <div class="brand-mark" aria-hidden="true">A</div>
        <div>
          <p class="eyebrow">{{ roleLabel }} Central</p>
          <strong>Tour Booking System</strong>
          <small>System Supervisor</small>
        </div>
      </div>

      <nav class="nav-list" aria-label="Dashboard navigation">
        <a v-for="item in navItems" :key="item.label" :href="item.href" class="nav-item">
          <span class="nav-item__icon" aria-hidden="true">{{ item.icon }}</span>
          <span>
            <strong>{{ item.label }}</strong>
            <small>{{ item.description }}</small>
          </span>
        </a>
      </nav>

      <section class="sidebar-card">
        <div class="system-status">
          <span class="system-status__dot"></span>
          <div>
            <p>SYSTEM STATUS</p>
            <strong>System Online, Connectivity with ABA Pay is stable.</strong>
          </div>
        </div>

        <div class="sidebar-actions">
          <a href="#" aria-label="Logout">Logout</a>
          <a href="#" aria-label="Help">Help</a>
        </div>
      </section>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

type DashboardRole = 'admin' | 'provider'

type NavItem = {
  label: string
  description: string
  href: string
  icon: string
}

const navMap: Record<DashboardRole, NavItem[]> = {
  admin: [
    { label: 'Dashboard', description: 'Financial overview', href: '#overview', icon: '◌' },
    { label: 'Clients', description: 'Manage customer accounts', href: '#bookings', icon: '👤' },
    { label: 'Providers', description: 'Vendors and partners', href: '#providers', icon: '▣' },
    { label: 'Package Oversight', description: 'Trip quality review', href: '#reports', icon: '⌁' },
    { label: 'Booking Ledger', description: 'Settlement activity', href: '#reports', icon: '⌕' },
    { label: 'Finance & Escrow', description: 'Transactions and holds', href: '#reports', icon: '◫' },
    { label: 'Payment Logs', description: 'Recent payment records', href: '#reports', icon: '≡' },
    { label: 'Review Moderation', description: 'Content and ratings', href: '#reports', icon: '✦' },
    { label: 'Support Tickets', description: 'Customer escalations', href: '#reports', icon: '✉' },
  ],
  provider: [
    { label: 'Inventory', description: 'Stock and availability', href: '#overview', icon: '◌' },
    { label: 'Manifest', description: 'Departure schedule', href: '#matrix', icon: '▣' },
    { label: 'Finance', description: 'Pricing and markup', href: '#pricing', icon: '◫' },
    { label: 'Messages', description: 'Inbox and requests', href: '#controller', icon: '✉' },
    { label: 'Settings', description: 'Provider preferences', href: '#changes', icon: '⚙' },
  ],
}

export default defineComponent({
  name: 'DashboardSidebar',
  props: {
    role: {
      type: String as () => DashboardRole,
      required: true,
    },
  },
  computed: {
    navItems(): NavItem[] {
      return navMap[this.role]
    },
    providerNavItems(): NavItem[] {
      return navMap.provider
    },
    roleLabel(): string {
      return this.role === 'admin' ? 'Administrator' : 'Provider'
    },
  },
})
</script>

<style scoped>
.sidebar-shell {
  min-height: 100%;
  border-radius: 22px;
  overflow: hidden;
  background: #f6f6f4;
  border: 1px solid rgba(18, 31, 31, 0.07);
  box-shadow: 0 18px 42px rgba(18, 31, 31, 0.12);
}

.sidebar-shell--provider {
  background: linear-gradient(180deg, #f8faf9 0%, #f4f7f6 100%);
}

.sidebar-inner {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 16px 14px 14px;
}

.sidebar-inner--provider {
  padding: 18px 16px 16px;
}

.provider-brand {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 4px 10px;
}

.provider-brand__mark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: #1e8a86;
  color: #fff;
  font-size: 0.78rem;
}

.provider-brand strong {
  display: block;
  color: #173f42;
  font-size: 0.94rem;
}

.provider-brand small {
  display: block;
  margin-top: 2px;
  color: #6f7f7d;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
}

.provider-nav {
  display: grid;
  gap: 6px;
  margin-top: 2px;
}

.provider-nav__item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 38px;
  padding: 9px 10px;
  border-radius: 8px;
  color: #264044;
  text-decoration: none;
  transition:
    background 180ms ease,
    transform 180ms ease;
}

.provider-nav__item:hover {
  background: rgba(30, 138, 134, 0.08);
  transform: translateX(2px);
}

.provider-nav__icon {
  width: 18px;
  display: grid;
  place-items: center;
  font-size: 0.82rem;
  color: #67807d;
}

.provider-cta {
  margin-top: auto;
  min-height: 40px;
  border: 0;
  border-radius: 6px;
  background: linear-gradient(180deg, #0f6e70, #0a5c5d);
  color: #fff;
  font: inherit;
  font-weight: 700;
  box-shadow: 0 14px 28px rgba(15, 110, 112, 0.18);
}

.provider-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 8px;
}

.provider-footer a {
  color: #7a8987;
  text-decoration: none;
  font-size: 0.8rem;
}

.brand-block {
  display: flex;
  gap: 12px;
  align-items: start;
  padding: 6px 4px 10px;
}

.brand-block strong {
  display: block;
  font-size: 0.98rem;
  color: #154b4d;
}

.brand-block small {
  display: block;
  margin-top: 2px;
  color: #72817d;
  font-size: 0.74rem;
}

.brand-mark {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 0.92rem;
  color: #f7fbf7;
  background: #0f6e70;
}

.eyebrow,
.nav-item small,
.sidebar-card__eyebrow {
  margin: 0;
  font-size: 0.69rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #7b8884;
}

.nav-list {
  display: grid;
  gap: 6px;
}

.nav-item {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 34px;
  padding: 8px 10px;
  border-radius: 8px;
  color: #223d3f;
  text-decoration: none;
  background: transparent;
  border: 1px solid transparent;
  transition:
    transform 180ms ease,
    background 180ms ease,
    border-color 180ms ease;
}

.nav-item:hover {
  transform: translateX(2px);
  background: rgba(15, 110, 112, 0.06);
  border-color: rgba(15, 110, 112, 0.08);
}

.nav-item__icon {
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  font-size: 0.86rem;
  color: #6d7e7b;
}

.nav-item strong,
.sidebar-card__metric strong,
.system-status strong {
  display: block;
  font-size: 0.88rem;
  color: #1f3d3f;
}

.nav-item small {
  display: block;
  margin-top: 1px;
  text-transform: none;
  letter-spacing: 0;
  color: #8a9691;
}

.sidebar-card {
  margin-top: auto;
  padding: 14px;
  border-radius: 16px;
  background: #f0f4f3;
  border: 1px solid rgba(18, 31, 31, 0.06);
}

.system-status {
  display: flex;
  gap: 10px;
  align-items: start;
}

.system-status__dot {
  width: 8px;
  height: 8px;
  margin-top: 5px;
  border-radius: 999px;
  background: #24b47e;
  box-shadow: 0 0 0 4px rgba(36, 180, 126, 0.18);
}

.system-status p {
  margin: 0 0 4px;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #7a8782;
}

.system-status strong {
  font-size: 0.8rem;
  line-height: 1.45;
  color: #203c3e;
}

.sidebar-actions {
  display: flex;
  gap: 18px;
  padding-top: 10px;
  color: #7a8782;
}

.sidebar-actions a {
  color: inherit;
  text-decoration: none;
  font-size: 0.8rem;
}

@media (max-width: 1024px) {
  .sidebar-shell {
    border-radius: 18px;
  }
}
</style>