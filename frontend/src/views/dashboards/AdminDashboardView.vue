<template>
  <main class="admin-shell">
    <DashboardSidebar role="admin" />

    <section class="admin-content">
      <header class="topbar">
        <label class="searchbar" aria-label="Search analytics, trips, or providers">
          <span class="searchbar__icon" aria-hidden="true">⌕</span>
          <input
            v-model.trim="searchQuery"
            type="search"
            placeholder="Search analytics, trips, or providers..."
          />
        </label>

        <div class="topbar-actions">
          <button class="icon-button" type="button" aria-label="Notifications">🔔</button>
          <button class="icon-button" type="button" aria-label="Create">✎</button>
          <button class="icon-button" type="button" aria-label="Settings">⚙</button>

          <div class="profile-chip">
            <div>
              <strong>Admin Profile</strong>
              <span>System Supervisor</span>
            </div>
            <div class="avatar">AK</div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <section class="overview-grid">
        <article class="panel panel--hero">
          <div class="panel__header">
            <div>
              <p class="eyebrow">Financial Overview</p>
              <h1>Financial Overview</h1>
              <p class="lede">
                Real-time performance metrics across the Cambodia tour ecosystem. Track GMV and
                platform revenue trends.
              </p>
            </div>
          </div>

          <div class="hero-metrics">
            <div class="metric-block">
              <span>Total GMV</span>
              <strong>$1,284,500</strong>
              <small class="positive">+12.4% vs last week</small>
            </div>

            <div class="metric-block metric-block--split">
              <div>
                <span>Platform Revenue</span>
                <strong>$192,675</strong>
                <small>15% commission avg.</small>
              </div>
              <div>
                <span>Weekly Growth</span>
                <strong class="accent">18.5%</strong>
              </div>
            </div>
          </div>

          <div class="chart-card" aria-label="Revenue chart">
            <div class="chart-bars" aria-hidden="true">
              <span style="height: 42%"></span>
              <span style="height: 48%"></span>
              <span style="height: 54%"></span>
              <span style="height: 64%"></span>
              <span style="height: 72%"></span>
              <span style="height: 69%"></span>
              <span style="height: 84%"></span>
            </div>
          </div>
        </article>

        <aside class="stacked-rail">
          <article class="status-card status-card--health">
            <div class="status-card__header">
              <div>
                <p class="eyebrow eyebrow--light">System Health</p>
                <h2>System Health</h2>
              </div>
              <span class="status-icon" aria-hidden="true">▣</span>
            </div>

            <div class="health-row">
              <span>Server uptime</span>
              <strong>99.98%</strong>
            </div>
            <div class="health-row">
              <span>API gateway</span>
              <strong>Stable</strong>
            </div>
            <div class="health-row">
              <span>Booking API</span>
              <strong>Active</strong>
            </div>
          </article>

          <article class="status-card status-card--users">
            <p class="eyebrow eyebrow--light">Active users now</p>
            <strong>1,482</strong>
            <span>admin, provider, and customer sessions live</span>
          </article>
        </aside>
      </section>

      <section v-if="hasVisibleResults" class="section-heading">
        <span class="accent-marker"></span>
        <h2>Pending Approvals</h2>
      </section>

      <section v-if="hasVisibleResults" class="approval-grid">
        <article v-if="visibleProviders.length" class="card-card">
          <div class="card-card__top">
            <span class="card-badge">12 NEW</span>
            <span class="card-icon">👥</span>
          </div>
          <h3>New Providers</h3>
          <ul class="mini-list">
            <li v-for="provider in visibleProviders" :key="provider.name">
              <span class="avatar avatar--soft">AK</span>
              <div>
                <strong>{{ provider.name }}</strong>
                <small>{{ provider.location }} · {{ provider.age }}</small>
              </div>
            </li>
          </ul>
          <button class="panel-button" type="button">Review All Applications</button>
        </article>

        <article v-if="visiblePackages.length" class="card-card">
          <div class="card-card__top">
            <span class="card-badge card-badge--warn">4 URGENT</span>
            <span class="card-icon">🚩</span>
          </div>
          <h3>Flagged Packages</h3>
          <ul class="mini-list">
            <li v-for="packageItem in visiblePackages" :key="packageItem.name">
              <span class="mini-thumb" :class="packageItem.thumbClass"></span>
              <div>
                <strong>{{ packageItem.name }}</strong>
                <small>{{ packageItem.note }}</small>
              </div>
            </li>
          </ul>
          <button class="panel-button" type="button">Audit Content</button>
        </article>

        <article v-if="visibleTickets.length" class="card-card">
          <div class="card-card__top">
            <span class="card-badge card-badge--soft">28 OPEN</span>
            <span class="card-icon">✦</span>
          </div>
          <h3>Support Tickets</h3>
          <div class="ticket-list">
            <article v-for="ticket in visibleTickets" :key="ticket.id">
              <strong>{{ ticket.id }}: {{ ticket.title }}</strong>
              <small>{{ ticket.note }}</small>
              <span class="ticket-tag" :class="ticket.priorityClass">{{ ticket.priority }}</span>
            </article>
          </div>
          <button class="panel-button" type="button">Go to Support Desk</button>
        </article>
      </section>

      <section class="lower-grid">
        <article v-if="visibleRegions.length" class="panel panel--chart">
          <div class="section-header section-header--tight">
            <h2>Regional Performance</h2>
            <div class="segmented-toggle">
              <button class="segmented-toggle__active" type="button">Monthly</button>
              <button type="button">Quarterly</button>
            </div>
          </div>

          <div class="region-list">
            <div v-for="region in visibleRegions" :key="region.name" class="region-row">
              <div class="region-row__meta">
                <span>{{ region.name }}</span>
                <strong>{{ region.value }}</strong>
              </div>
              <div class="progress-track"><span :style="{ width: region.width }"></span></div>
            </div>
          </div>
        </article>

        <article v-if="visiblePayments.length" class="panel panel--payments">
          <p class="eyebrow">Live Payment Stream</p>
          <h2>Live Payment Stream</h2>

          <div class="payment-list">
            <div v-for="payment in visiblePayments" :key="payment.bookingId" class="payment-row">
              <div>
                <strong>{{ payment.bookingId }}</strong>
                <small>{{ payment.channel }}</small>
              </div>
              <strong>{{ payment.amount }}</strong>
            </div>
          </div>

          <button class="panel-button panel-button--outline" type="button">View Financial Logs</button>
        </article>
      </section>

      <section v-if="searchQuery && !hasVisibleResults" class="empty-state">
        <h2>No results found</h2>
        <p>Try a different keyword like provider, Angkor, payment, ticket, or revenue.</p>
      </section>
    </section>

    <button class="fab" type="button" aria-label="Create new item">+</button>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar.vue'
import LogoutButton from '../../components/LogoutButton.vue'

type ProviderItem = {
  name: string
  location: string
  age: string
}

type PackageItem = {
  name: string
  note: string
  thumbClass: string
}

type TicketItem = {
  id: string
  title: string
  note: string
  priority: string
  priorityClass: string
}

type RegionItem = {
  name: string
  value: string
  width: string
}

type PaymentItem = {
  bookingId: string
  channel: string
  amount: string
}

const searchQuery = ref('')

const providers: ProviderItem[] = [
  { name: 'Angkor Klean Tours', location: 'Siem Reap', age: '3h ago' },
  { name: 'Mekong Trails Co.', location: 'Phnom Penh', age: '5h ago' },
]

const packages: PackageItem[] = [
  { name: 'Sunrise Angkor Private', note: 'Pricing anomaly detected', thumbClass: 'mini-thumb--sunrise' },
  { name: 'Ratanakiri Jungle Trek', note: 'Expired safety cert', thumbClass: 'mini-thumb--jungle' },
]

const tickets: TicketItem[] = [
  {
    id: '#T-842',
    title: 'Refund Request',
    note: 'User claims duplicate payment via Bakong QR.',
    priority: 'High Priority',
    priorityClass: 'ticket-tag--high',
  },
  {
    id: '#T-841',
    title: 'API Timeout',
    note: 'Provider unable to sync calendar availability.',
    priority: 'Normal',
    priorityClass: '',
  },
]

const regions: RegionItem[] = [
  { name: 'Siem Reap / Angkor Area', value: '$452,000 (45%)', width: '78%' },
  { name: 'Coastal / Sihanoukville', value: '$281,000 (28%)', width: '63%' },
  { name: 'Phnom Penh / Capital', value: '$190,000 (19%)', width: '49%' },
]

const payments: PaymentItem[] = [
  { bookingId: 'Booking #BK-9921', channel: 'via ABA QR', amount: '$245.00' },
  { bookingId: 'Booking #BK-9918', channel: 'via Bakong', amount: '$1,120.00' },
  { bookingId: 'Booking #BK-9925', channel: 'Pending Escrow Release', amount: '$85.00' },
]

const searchTarget = computed(() => searchQuery.value.toLowerCase())

function matchesSearch(text: string): boolean {
  const query = searchTarget.value

  if (!query) {
    return true
  }

  return text.toLowerCase().includes(query)
}

const visibleProviders = computed(() =>
  providers.filter((provider) => matchesSearch(`${provider.name} ${provider.location} ${provider.age}`)),
)

const visiblePackages = computed(() =>
  packages.filter((packageItem) => matchesSearch(`${packageItem.name} ${packageItem.note}`)),
)

const visibleTickets = computed(() =>
  tickets.filter((ticket) => matchesSearch(`${ticket.id} ${ticket.title} ${ticket.note} ${ticket.priority}`)),
)

const visibleRegions = computed(() =>
  regions.filter((region) => matchesSearch(`${region.name} ${region.value}`)),
)

const visiblePayments = computed(() =>
  payments.filter((payment) => matchesSearch(`${payment.bookingId} ${payment.channel} ${payment.amount}`)),
)

const hasVisibleResults = computed(
  () =>
    visibleProviders.value.length > 0 ||
    visiblePackages.value.length > 0 ||
    visibleTickets.value.length > 0 ||
    visibleRegions.value.length > 0 ||
    visiblePayments.value.length > 0,
)
</script>

<style scoped>
.admin-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 264px minmax(0, 1fr);
  gap: 18px;
  padding: 16px;
  background: #262626;
  box-sizing: border-box;
}

.admin-content {
  min-width: 0;
  padding: 14px 18px 18px 2px;
  display: grid;
  gap: 18px;
  background: linear-gradient(180deg, #f3f3f2 0%, #f8f8f6 100%);
  border-radius: 24px;
  position: relative;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 10px 6px 8px;
}

.searchbar {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 42px;
  max-width: 690px;
  padding: 0 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(20, 73, 73, 0.08);
  box-shadow: 0 14px 34px rgba(18, 31, 31, 0.06);
}

.searchbar__icon {
  color: #8a9490;
  font-size: 0.95rem;
}

.searchbar input {
  width: 100%;
  border: 0;
  background: transparent;
  outline: none;
  font: inherit;
  color: #21555a;
}

.searchbar input::placeholder {
  color: #8a9490;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-button {
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 20px rgba(20, 31, 31, 0.06);
  color: #38565a;
  cursor: pointer;
}

.profile-chip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 20px rgba(20, 31, 31, 0.06);
}

.profile-chip strong,
.profile-chip span {
  display: block;
  line-height: 1.1;
}

.profile-chip strong {
  font-size: 0.84rem;
  color: #173f42;
}

.profile-chip span {
  font-size: 0.72rem;
  color: #6d7e7b;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #114b47, #efb34f);
  color: #fffaf2;
  font-size: 0.7rem;
  font-weight: 800;
}

.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(270px, 0.72fr);
  gap: 18px;
}

.panel {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(18, 31, 31, 0.06);
  border-radius: 18px;
  box-shadow: 0 14px 28px rgba(18, 31, 31, 0.08);
}

.panel--hero {
  padding: 20px;
  display: grid;
  gap: 16px;
}

.panel__header h1 {
  margin: 0;
  font-size: clamp(2rem, 2.8vw, 2.8rem);
  line-height: 1.02;
  letter-spacing: -0.04em;
  color: #165a57;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #7d887f;
}

.eyebrow--light {
  color: rgba(255, 255, 255, 0.72);
}

.lede {
  max-width: 46rem;
  margin: 10px 0 0;
  color: #6a7875;
  line-height: 1.65;
}

.hero-metrics {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 14px;
}

.metric-block {
  padding: 18px 18px 16px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(18, 31, 31, 0.06);
}

.metric-block span,
.metric-block small {
  display: block;
  color: #81908d;
}

.metric-block strong {
  display: block;
  margin: 10px 0 6px;
  color: #1b6260;
  line-height: 1;
}

.metric-block:first-child strong {
  font-size: clamp(2rem, 3vw, 3rem);
}

.metric-block--split {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.metric-block--split > div {
  padding: 12px 12px 10px;
  border-radius: 14px;
  background: linear-gradient(180deg, #f7fbfa 0%, #eef5f2 100%);
}

.accent {
  color: #b17815 !important;
  font-size: 2.1rem;
}

.positive {
  color: #24a874 !important;
}

.chart-card {
  padding: 10px 0 2px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(39, 134, 132, 0.03));
}

.chart-bars {
  height: 190px;
  display: flex;
  align-items: end;
  gap: 12px;
  padding: 16px 12px 8px;
}

.chart-bars span {
  flex: 1;
  border-radius: 8px 8px 0 0;
  background: linear-gradient(180deg, rgba(187, 219, 220, 0.36), rgba(112, 170, 174, 0.9));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.stacked-rail {
  display: grid;
  gap: 14px;
}

.status-card {
  padding: 18px;
  border-radius: 18px;
}

.status-card--health {
  min-height: 276px;
  background: linear-gradient(180deg, #165c56 0%, #114a48 100%);
  color: #f8fbf8;
}

.status-card__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.status-card h2,
.section-heading h2,
.card-card h3,
.panel--payments h2 {
  margin: 0;
  color: inherit;
}

.status-card h2 {
  color: #fbfefb;
  font-size: 1.15rem;
}

.status-icon {
  font-size: 0.9rem;
  opacity: 0.8;
}

.health-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
}

.health-row span {
  color: rgba(242, 247, 242, 0.72);
}

.health-row strong {
  color: #f8f9f5;
}

.status-card--users {
  display: grid;
  gap: 8px;
  align-content: start;
  padding: 18px;
  background: linear-gradient(180deg, #a46a00 0%, #9c6506 100%);
  color: #fff9ef;
}

.status-card--users strong {
  font-size: 2.4rem;
}

.status-card--users span {
  color: rgba(255, 248, 231, 0.8);
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 2px;
}

.accent-marker {
  width: 4px;
  height: 20px;
  border-radius: 999px;
  background: #a46a00;
}

.approval-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.card-card {
  padding: 18px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid rgba(18, 31, 31, 0.06);
  box-shadow: 0 14px 28px rgba(18, 31, 31, 0.06);
  display: grid;
  gap: 14px;
}

.card-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-badge {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 6px;
  background: #e2f6f4;
  color: #0f6e70;
  font-size: 0.67rem;
  font-weight: 700;
}

.card-badge--warn {
  background: #fde8e3;
  color: #c25a4c;
}

.card-badge--soft {
  background: #f8efe0;
  color: #9c6506;
}

.card-icon {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: rgba(18, 31, 31, 0.04);
  color: #7f908b;
  font-size: 0.82rem;
}

.card-card h3 {
  color: #173f42;
  font-size: 1.05rem;
}

.mini-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}

.mini-list li {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mini-list strong,
.ticket-list strong,
.payment-row strong,
.region-row__meta strong {
  color: #173f42;
}

.mini-list small,
.ticket-list small,
.payment-row small {
  display: block;
  color: #7b8b87;
}

.avatar--soft {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: #eef5f2;
  color: #7a8b88;
  font-size: 0.62rem;
  font-weight: 700;
}

.mini-thumb {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
}

.mini-thumb--sunrise {
  background: linear-gradient(135deg, #111827, #efb34f);
}

.mini-thumb--jungle {
  background: linear-gradient(135deg, #3b5c2f, #ffe082);
}

.ticket-list {
  display: grid;
  gap: 10px;
}

.ticket-list article {
  padding: 12px 12px 10px;
  border-radius: 12px;
  background: #f9fbfa;
  border: 1px solid rgba(18, 31, 31, 0.06);
}

.ticket-tag {
  display: inline-flex;
  margin-top: 8px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #edf4f3;
  color: #5f7b78;
  font-size: 0.68rem;
  font-weight: 700;
}

.ticket-tag--high {
  background: #fdeae4;
  color: #c25a4c;
}

.panel-button {
  min-height: 36px;
  border: 0;
  border-radius: 4px;
  background: #0f6e70;
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.panel-button--outline {
  background: transparent;
  border: 1px solid #9cc7cb;
  color: #156a6b;
}

.lower-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(0, 0.85fr);
  gap: 16px;
}

.panel--chart,
.panel--payments {
  padding: 18px;
}

.section-header--tight {
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.segmented-toggle {
  display: inline-flex;
  gap: 8px;
  padding: 4px;
  border-radius: 999px;
  background: #f1f2f0;
}

.segmented-toggle button {
  border: 0;
  background: transparent;
  padding: 6px 12px;
  border-radius: 999px;
  color: #6d7e7b;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 700;
}

.segmented-toggle__active {
  background: #fff !important;
  color: #173f42 !important;
  box-shadow: 0 4px 10px rgba(18, 31, 31, 0.08);
}

.region-list {
  display: grid;
  gap: 16px;
  padding-top: 8px;
}

.region-row {
  display: grid;
  gap: 8px;
}

.region-row__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.region-row__meta span,
.payment-row small {
  color: #71817d;
}

.progress-track {
  height: 6px;
  border-radius: 999px;
  background: #edf2f0;
  overflow: hidden;
}

.progress-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0f6e70, #1c8d8a);
}

.panel--payments {
  display: grid;
  gap: 10px;
}

.panel--payments h2 {
  font-size: 1.1rem;
  color: #173f42;
}

.payment-list {
  display: grid;
  gap: 10px;
}

.payment-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(18, 31, 31, 0.08);
}

.payment-row:last-child {
  border-bottom: 0;
}

.empty-state {
  padding: 24px 22px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(18, 31, 31, 0.06);
  box-shadow: 0 14px 28px rgba(18, 31, 31, 0.06);
}

.empty-state h2 {
  margin: 0 0 8px;
  color: #173f42;
}

.empty-state p {
  margin: 0;
  color: #6a7875;
}

.fab {
  position: absolute;
  right: 22px;
  bottom: 20px;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 10px;
  background: linear-gradient(180deg, #0f6e70 0%, #0b5b5c 100%);
  color: #fff;
  font-size: 1.2rem;
  font-weight: 700;
  box-shadow: 0 10px 20px rgba(15, 110, 112, 0.25);
}

@media (max-width: 1280px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }

  .admin-content {
    padding-left: 14px;
  }

  .overview-grid,
  .lower-grid,
  .approval-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .topbar,
  .topbar-actions,
  .hero-metrics,
  .metric-block--split,
  .region-row__meta {
    flex-direction: column;
    align-items: stretch;
  }

  .searchbar {
    max-width: none;
  }

  .topbar-actions {
    width: 100%;
  }

  .profile-chip {
    justify-content: space-between;
  }
}
</style>
