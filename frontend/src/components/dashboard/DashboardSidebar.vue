<template>
  <aside class="sidebar-shell" :class="`sidebar-shell--${role}`">
    <div
      v-if="role === 'provider'"
      class="sidebar-inner sidebar-inner--provider"
    >
      <div class="provider-brand">
        <div class="provider-brand__mark" aria-hidden="true">⬤</div>
        <div>
          <strong>Angkor Treasures</strong>
          <small>VERIFIED PROVIDER</small>
        </div>
      </div>

      <nav class="provider-nav" aria-label="Provider navigation">
        <router-link
          v-for="item in providerNavItems"
          :key="item.label"
          :to="item.href"
          class="provider-nav__item"
        >
          <span class="provider-nav__icon" aria-hidden="true">
            <component :is="item.icon" />
          </span>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <button class="provider-cta" type="button">New Booking</button>

      <footer class="provider-footer">
        <a href="#" aria-label="Support">Support</a>
        <LogoutButton />
      </footer>
    </div>

    <div v-else class="sidebar-inner">
      <div class="brand-block">
        <img class="brand-logo" src="/logo-wordmark.png" alt="Anajak Tour" />
      </div>

      <nav class="nav-list" aria-label="Dashboard navigation">
        <section
          v-for="section in groupedNavItems"
          :key="section.label"
          class="nav-section"
        >
          <p v-if="section.label" class="nav-section__label">{{ section.label }}</p>
          <component
            :is="item.href.startsWith('/') ? 'router-link' : 'a'"
            v-for="item in section.items"
            :key="item.label"
            :to="item.href.startsWith('/') ? item.href : undefined"
            :href="item.href.startsWith('/') ? undefined : item.href"
            class="nav-item"
            :class="{ 'nav-item--active': isActiveItem(item) }"
          >
            <span class="nav-item__icon" aria-hidden="true">
              <component :is="item.icon" />
            </span>
            <span>
              <strong>{{ item.label }}</strong>
              <small>{{ item.description }}</small>
            </span>
          </component>
        </section>
      </nav>

      <section class="sidebar-card">
        <div class="system-status">
          <span class="system-status__dot"></span>
          <div>
            <p>System status</p>
            <strong>Operational</strong>
          </div>
        </div>

        <div class="sidebar-actions">
          <LogoutButton />
          <a href="#" aria-label="Help">Help</a>
        </div>
      </section>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  BanknotesIcon,
  BookOpenIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  ChartBarSquareIcon,
  Cog6ToothIcon,
  CubeIcon,
  EnvelopeIcon,
  HomeIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/outline";
import LogoutButton from "../LogoutButton.vue";

type DashboardRole = "admin" | "provider";

type NavItem = {
  label: string;
  description: string;
  href: string;
  icon: string;
  group?: "Main" | "Management";
};

const navMap: Record<DashboardRole, NavItem[]> = {
  admin: [
    {
      label: "Dashboard",
      description: "Financial overview",
      href: "/admin/dashboard",
      icon: "HomeIcon",
    },
    {
      label: "Users",
      description: "Manage accounts",
      href: "/admin/users",
      icon: "UserGroupIcon",
    },
    {
      label: "Providers",
      description: "Vendors & partners",
      href: "/admin/providers",
      icon: "BuildingStorefrontIcon",
    },
    {
      label: "Bookings",
      description: "Booking Ledger",
      href: "/admin/bookings",
      icon: "CalendarDaysIcon",
    },
    {
      label: "Packages",
      description: "Service catalog",
      href: "/admin/packages",
      icon: "CubeIcon",
    },
    {
      label: "Revenue",
      description: "Financial analytics",
      href: "/admin/revenue",
      icon: "BanknotesIcon",
    },
    {
      label: "Analytics",
      description: "Business intelligence",
      href: "/admin/analytics",
      icon: "ChartBarSquareIcon",
    },
    {
      label: "Settings",
      description: "Platform controls",
      href: "/admin/settings",
      icon: "Cog6ToothIcon",
    },
  ],
  provider: [
    {
      label: "Inventory",
      description: "Stock and availability",
      href: "/provider/dashboard",
      icon: "CubeIcon",
    },
    {
      label: "Bookings",
      description: "Reservation ledger",
      href: "/provider/bookings",
      icon: "BookOpenIcon",
    },
    {
      label: "Finance",
      description: "Pricing and markup",
      href: "#pricing",
      icon: "ChartBarSquareIcon",
    },
    {
      label: "Messages",
      description: "Inbox and requests",
      href: "#controller",
      icon: "EnvelopeIcon",
    },
    {
      label: "Settings",
      description: "Provider preferences",
      href: "#changes",
      icon: "Cog6ToothIcon",
    },
  ],
};

export default defineComponent({
  name: "DashboardSidebar",
  components: {
    LogoutButton,
    BanknotesIcon,
    BookOpenIcon,
    BuildingStorefrontIcon,
    CalendarDaysIcon,
    ChartBarSquareIcon,
    Cog6ToothIcon,
    CubeIcon,
    EnvelopeIcon,
    HomeIcon,
    UserGroupIcon,
  },
  props: {
    role: {
      type: String as () => DashboardRole,
      required: true,
    },
  },
  computed: {
    navItems(): NavItem[] {
      return navMap[this.role];
    },
    groupedNavItems(): Array<{ label: string; items: NavItem[] }> {
      return [{ label: "", items: this.navItems }];
    },
    providerNavItems(): NavItem[] {
      return navMap.provider;
    },
    roleLabel(): string {
      return this.role === "admin" ? "Administrator" : "Provider";
    },
  },
  methods: {
    isActiveItem(item: NavItem): boolean {
      return item.href.startsWith("/") && this.$route.path === item.href;
    },
  },
});
</script>

<style scoped>
.sidebar-shell {
  height: 100%;
  border-radius: 22px;
  overflow: hidden;
  background: #ffffff;
  border-right: 1px solid #e8eeef;
  box-shadow: none;
}

.sidebar-shell--provider {
  background: linear-gradient(180deg, #f8faf9 0%, #f4f7f6 100%);
}

.sidebar-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px 14px 16px;
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
  height: 18px;
  display: grid;
  place-items: center;
  color: #67807d;
}

.provider-nav__icon svg,
.nav-item__icon svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
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
  align-items: center;
  padding: 0 4px 18px;
}

.brand-logo {
  width: min(100%, 224px);
  height: 46px;
  object-fit: contain;
  object-position: left center;
}

.eyebrow,
.nav-item small,
.sidebar-card__eyebrow,
.nav-section__label {
  margin: 0;
  font-size: 0.66rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a9897;
}

.nav-list {
  display: grid;
  gap: 14px;
}

.nav-section {
  display: grid;
  gap: 4px;
}

.nav-section__label {
  padding: 0 10px 4px;
  font-weight: 700;
}

.nav-item {
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 32px;
  padding: 7px 9px;
  border-radius: 8px;
  color: #526466;
  text-decoration: none;
  background: transparent;
  border: 1px solid transparent;
  transition:
    transform 180ms ease,
    background 180ms ease,
    border-color 180ms ease;
}

.nav-item:hover {
  transform: none;
  background: #f6f9f9;
  color: #173f42;
}

.nav-item--active {
  background: #eaf5f4;
  color: #0f6e70;
  border-color: rgba(15, 110, 112, 0.1);
}

.router-link-active.nav-item {
  background: rgba(15, 110, 112, 0.08) !important;
  border-color: rgba(15, 110, 112, 0.12) !important;
  transform: translateX(4px);
}

.nav-item__icon {
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  color: currentColor;
}

.router-link-active .nav-item__icon {
  color: #0f6e70;
}

.nav-item strong,
.sidebar-card__metric strong,
.system-status strong {
  display: block;
  font-size: 0.83rem;
  color: inherit;
}

.nav-item small {
  display: block;
  margin-top: 0;
  text-transform: none;
  letter-spacing: 0;
  color: #8a9897;
  font-size: 0.69rem;
}

.sidebar-card {
  margin-top: auto;
  padding: 10px;
  border-radius: 10px;
  background: #f8fbfb;
  border: 1px solid #e8eeef;
}

.system-status {
  display: flex;
  gap: 8px;
  align-items: center;
}

.system-status__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #24b47e;
  box-shadow: 0 0 0 3px rgba(36, 180, 126, 0.14);
}

.system-status p {
  margin: 0;
  font-size: 0.69rem;
  color: #7a8782;
}

.system-status strong {
  font-size: 0.76rem;
  line-height: 1.45;
  color: #203c3e;
}

.sidebar-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
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
