<template>
  <main class="provider-ledger-shell">
    <DashboardSidebar role="provider" />

    <section class="provider-ledger-content">
      <header class="topbar">
        <div class="topbar__search">
          <span class="search-icon">⌕</span>
          <input v-model="searchTerm" type="search" placeholder="Search bookings, guests, or references..." />
        </div>

        <div class="topbar__actions">
          <button class="ghost-button" type="button">Download CSV</button>
          <button class="primary-button" type="button">Request Payout</button>
          <div class="profile-chip">
            <div class="profile-chip__avatar">AT</div>
            <div>
              <strong>Angkor Treasures</strong>
              <small>Verified provider</small>
            </div>
          </div>
        </div>
      </header>

      <section class="hero-panel">
        <div>
          <p class="section-kicker">Financial Overview</p>
          <h1>Financial Transparency Ledger</h1>
          <p>Monitor your bookings, review payment status, and keep a clear view of confirmed and pending settlements.</p>
        </div>

        <div class="hero-actions">
          <div class="filter-group">
            <label>
              <span>Status</span>
              <select v-model="statusFilter">
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </label>

            <label>
              <span>Sort</span>
              <select v-model="sortMode">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="amount">Amount</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <section class="summary-grid">
        <article class="summary-card summary-card--teal">
          <span>Total Bookings</span>
          <strong>{{ summary.totalBookings }}</strong>
          <small>{{ summary.completedBookings }} paid settlements</small>
        </article>

        <article class="summary-card summary-card--gold">
          <span>Paid Revenue</span>
          <strong>{{ formatMoney(summary.paidRevenue) }}</strong>
          <small>Released and confirmed</small>
        </article>

        <article class="summary-card summary-card--red">
          <span>Pending Balance</span>
          <strong>{{ formatMoney(summary.pendingRevenue) }}</strong>
          <small>{{ summary.pendingBookings }} bookings awaiting payout</small>
        </article>

        <article class="summary-card summary-card--forest">
          <span>Visible This Week</span>
          <strong>{{ filteredBookings.length }}</strong>
          <small>{{ summary.uniqueGuests }} unique guest records</small>
        </article>
      </section>

      <section class="earnings-panel">
        <div class="panel-heading panel-heading--compact">
          <div>
            <p class="section-kicker">Provider Earnings Tracker</p>
            <h2>Money Logic</h2>
          </div>
          <span class="chart-note">10% platform commission</span>
        </div>

        <div class="earnings-grid">
          <article class="earnings-card earnings-card--teal">
            <span>Total Revenue</span>
            <strong>{{ formatMoney(earnings.totalRevenue) }}</strong>
            <small>Sum of all paid bookings</small>
          </article>

          <article class="earnings-card earnings-card--gold">
            <span>Platform Commission</span>
            <strong>{{ formatMoney(earnings.platformCommission) }}</strong>
            <small>Automatically reserved by the platform</small>
          </article>

          <article class="earnings-card earnings-card--forest">
            <span>Payout Balance</span>
            <strong>{{ formatMoney(earnings.payoutBalance) }}</strong>
            <small>Actual money the provider earns</small>
          </article>
        </div>
      </section>

      <section class="workspace-grid">
        <article class="chart-panel">
          <div class="panel-heading">
            <div>
              <p class="section-kicker">Revenue Performance</p>
              <h2>Bookings By Day</h2>
            </div>
            <span class="chart-note">Paid vs pending value</span>
          </div>

          <div class="chart-legend">
            <span><i class="dot dot--paid"></i> Paid</span>
            <span><i class="dot dot--pending"></i> Pending</span>
          </div>

          <div class="bar-chart" aria-label="Bookings by day chart">
            <div v-for="item in chartData" :key="item.label" class="bar-column">
              <div class="bar-stack">
                <span class="bar bar--pending" :style="{ height: `${item.pendingHeight}%` }"></span>
                <span class="bar bar--paid" :style="{ height: `${item.paidHeight}%` }"></span>
              </div>
              <small>{{ item.label }}</small>
            </div>
          </div>
        </article>

        <aside class="side-rail">
          <article class="panel-card">
            <div class="panel-heading panel-heading--compact">
              <div>
                <p class="section-kicker">Quick Insights</p>
                <h3>Payment Snapshot</h3>
              </div>
            </div>

            <div class="insight-list">
              <div>
                <strong>{{ summary.paidBookings }}</strong>
                <span>Paid bookings</span>
              </div>
              <div>
                <strong>{{ summary.pendingBookings }}</strong>
                <span>Pending bookings</span>
              </div>
              <div>
                <strong>{{ summary.confirmationRate }}%</strong>
                <span>Confirmation rate</span>
              </div>
            </div>
          </article>

          <article class="panel-card panel-card--highlight">
            <p class="section-kicker">Holding Period</p>
            <h3>Understanding the Release Window</h3>
            <p>Paid bookings are highlighted in green. Pending bookings stay in yellow until the payment clears or a settlement update arrives.</p>
            <button class="ghost-button ghost-button--wide" type="button">View Payout Policy</button>
          </article>
        </aside>
      </section>

      <ProviderBookingsList
        :bookings="filteredBookings"
        :loading="loading"
        :error="error"
        :statusLabel="statusFilterLabel"
        :sortLabel="sortLabel"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar.vue'
import ProviderBookingsList from '../../components/provider/ProviderBookingsList.vue'
import { getProviderBookings } from '../../services/api'

type BookingRecord = {
  id?: string | number
  booking_id?: string | number
  transaction_id?: string | number
  reference?: string
  service_name?: string
  service?: { name?: string; title?: string }
  user?: string | {
    name?: string
    fullName?: string
    firstName?: string
    lastName?: string
  }
  quantity?: number
  qty?: number
  amount?: number | string
  total_amount?: number | string
  price?: number | string
  date?: string
  booking_date?: string
  createdAt?: string
  payment_status?: string
  status?: string
}

type ChartDay = {
  label: string
  paid: number
  pending: number
  paidHeight: number
  pendingHeight: number
}

const bookings = ref<BookingRecord[]>([])
const loading = ref(false)
const error = ref('')
const searchTerm = ref('')
const statusFilter = ref<'all' | 'paid' | 'pending'>('all')
const sortMode = ref<'newest' | 'oldest' | 'amount'>('newest')

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function normalizedStatus(booking: BookingRecord) {
  return String(booking.payment_status ?? booking.status ?? '').trim().toLowerCase()
}

function isPaid(booking: BookingRecord) {
  const value = normalizedStatus(booking)
  return value === 'paid' || value === 'released' || value === 'success'
}

function isPending(booking: BookingRecord) {
  const value = normalizedStatus(booking)
  return value === 'pending' || value === 'processing' || value === 'hold'
}

function bookingDate(booking: BookingRecord) {
  return booking.date ?? booking.booking_date ?? booking.createdAt ?? ''
}

function serviceName(booking: BookingRecord) {
  return booking.service_name ?? booking.service?.name ?? booking.service?.title ?? 'Service booking'
}

function guestLabel(booking: BookingRecord) {
  const user = booking.user

  if (!user) return ''
  if (typeof user === 'string') return user

  return user.name ?? user.fullName ?? [user.firstName, user.lastName].filter(Boolean).join(' ')
}

function bookingCode(booking: BookingRecord) {
  return String(booking.id ?? booking.booking_id ?? booking.transaction_id ?? booking.reference ?? '—')
}

function bookingAmount(booking: BookingRecord) {
  const rawValue = booking.amount ?? booking.total_amount ?? booking.price
  const numericValue = typeof rawValue === 'string' ? Number(rawValue) : rawValue
  return Number.isFinite(numericValue as number) ? Number(numericValue) : null
}

function formatMoney(value: number | null) {
  if (value === null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

async function load() {
  loading.value = true
  error.value = ''

  try {
    const res = await getProviderBookings()
    const data = res.data as BookingRecord[] | { bookings?: BookingRecord[] }
    bookings.value = Array.isArray(data) ? data : data.bookings ?? []
  } catch (err: any) {
    console.error(err)
    error.value = err?.response?.data?.message || err?.message || 'Failed to load bookings'
  } finally {
    loading.value = false
  }
}

const filteredBookings = computed(() => {
  const search = searchTerm.value.trim().toLowerCase()

  const items = bookings.value.filter((booking) => {
    const text = [
      bookingCode(booking),
      serviceName(booking),
      guestLabel(booking),
      normalizedStatus(booking),
    ]
      .join(' ')
      .toLowerCase()

    const matchesSearch = search.length === 0 || text.includes(search)
    const matchesStatus =
      statusFilter.value === 'all'
        || (statusFilter.value === 'paid' && isPaid(booking))
        || (statusFilter.value === 'pending' && isPending(booking))

    return matchesSearch && matchesStatus
  })

  return [...items].sort((left, right) => {
    if (sortMode.value === 'amount') {
      return (bookingAmount(right) ?? 0) - (bookingAmount(left) ?? 0)
    }

    const leftTime = new Date(bookingDate(left)).getTime() || 0
    const rightTime = new Date(bookingDate(right)).getTime() || 0
    return sortMode.value === 'newest' ? rightTime - leftTime : leftTime - rightTime
  })
})

const summary = computed(() => {
  const totalBookings = bookings.value.length
  const paidBookings = bookings.value.filter((booking) => isPaid(booking)).length
  const pendingBookings = bookings.value.filter((booking) => isPending(booking)).length
  const paidRevenue = bookings.value.filter((booking) => isPaid(booking)).reduce((total, booking) => total + (bookingAmount(booking) ?? 0), 0)
  const pendingRevenue = bookings.value.filter((booking) => isPending(booking)).reduce((total, booking) => total + (bookingAmount(booking) ?? 0), 0)
  const uniqueGuests = new Set(bookings.value.map((booking) => guestLabel(booking)).filter(Boolean)).size

  return {
    totalBookings,
    paidBookings,
    pendingBookings,
    paidRevenue,
    pendingRevenue,
    uniqueGuests,
    completedBookings: paidBookings,
    confirmationRate: totalBookings === 0 ? 0 : Math.round((paidBookings / totalBookings) * 100),
  }
})

const earnings = computed(() => {
  const totalRevenue = summary.value.paidRevenue
  const platformCommission = totalRevenue * 0.1
  const payoutBalance = totalRevenue - platformCommission

  return {
    totalRevenue,
    platformCommission,
    payoutBalance,
  }
})

const chartData = computed<ChartDay[]>(() => {
  const buckets = days.map((label, index) => {
    const dayBookings = bookings.value.filter((booking) => {
      const parsed = new Date(bookingDate(booking))
      return !Number.isNaN(parsed.getTime()) && parsed.getDay() === index
    })

    const paid = dayBookings.filter((booking) => isPaid(booking)).reduce((total, booking) => total + (bookingAmount(booking) ?? 0), 0)
    const pending = dayBookings.filter((booking) => isPending(booking)).reduce((total, booking) => total + (bookingAmount(booking) ?? 0), 0)

    return { label, paid, pending, paidHeight: 0, pendingHeight: 0 }
  })

  const maxValue = Math.max(...buckets.map((bucket) => Math.max(bucket.paid, bucket.pending)), 1)

  return buckets.map((bucket) => ({
    ...bucket,
    paidHeight: Math.max(10, Math.round((bucket.paid / maxValue) * 100)),
    pendingHeight: Math.max(10, Math.round((bucket.pending / maxValue) * 100)),
  }))
})

const statusFilterLabel = computed(() => {
  if (statusFilter.value === 'paid') return 'Paid only'
  if (statusFilter.value === 'pending') return 'Pending only'
  return 'All statuses'
})

const sortLabel = computed(() => {
  if (sortMode.value === 'oldest') return 'Oldest'
  if (sortMode.value === 'amount') return 'Amount'
  return 'Newest'
})

onMounted(() => {
  load()
})
</script>

<style scoped>
.provider-ledger-shell {
  height: 100vh;
  display: grid;
  grid-template-columns: 245px minmax(0, 1fr);
  background: #202020;
  box-sizing: border-box;
  overflow: hidden;
}

.provider-ledger-content {
  display: grid;
  gap: 16px;
  padding: 18px;
  background: linear-gradient(180deg, #f7f7f6 0%, #f9faf9 100%);
  overflow-y: auto;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.topbar__search {
  flex: 1;
  max-width: 430px;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-radius: 999px;
  background: #f0f3f2;
  color: #73827d;
}

.topbar__search input {
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  color: #244042;
  font: inherit;
}

.search-icon {
  font-size: 0.9rem;
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.ghost-button,
.primary-button {
  min-height: 38px;
  border-radius: 999px;
  padding: 0 16px;
  font: inherit;
  font-weight: 700;
  border: 1px solid transparent;
}

.ghost-button {
  background: #fff;
  border-color: #d6dddb;
  color: #2f4344;
}

.primary-button {
  background: linear-gradient(180deg, #0f6e70, #0a5c5d);
  color: #fff;
  box-shadow: 0 14px 28px rgba(15, 110, 112, 0.18);
}

.ghost-button--wide {
  width: 100%;
  margin-top: 14px;
}

.profile-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 2px;
}

.profile-chip__avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0f6e70, #efb34f);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
}

.profile-chip strong,
.profile-chip small {
  display: block;
  line-height: 1.1;
}

.profile-chip strong {
  color: #173f42;
  font-size: 0.82rem;
}

.profile-chip small {
  color: #72817d;
  font-size: 0.68rem;
}

.hero-panel {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
}

.section-kicker {
  margin: 0 0 8px;
  color: #7a8784;
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-panel h1 {
  margin: 0;
  color: #173f42;
  font-size: 2rem;
  line-height: 1.05;
}

.hero-panel p {
  max-width: 720px;
  margin: 10px 0 0;
  color: #72817d;
  font-size: 0.92rem;
}

.hero-actions {
  min-width: 320px;
}

.filter-group {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.filter-group label {
  display: grid;
  gap: 6px;
}

.filter-group span {
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  color: #7a8784;
  text-transform: uppercase;
}

.filter-group select {
  min-height: 42px;
  border: 1px solid #e0e5e3;
  border-radius: 12px;
  background: #fff;
  padding: 0 12px;
  font: inherit;
  color: #244042;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.summary-card {
  padding: 18px 16px 16px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(20, 31, 31, 0.07);
  border-top: 3px solid transparent;
}

.summary-card span {
  display: block;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  color: #7f8b88;
  text-transform: uppercase;
}

.summary-card strong {
  display: block;
  margin-top: 10px;
  color: #173f42;
  font-size: 2rem;
  line-height: 1;
}

.summary-card small {
  display: block;
  margin-top: 6px;
  color: #6c7b77;
  font-size: 0.78rem;
}

.summary-card--teal { border-top-color: #1b8d90; }
.summary-card--gold { border-top-color: #c68a22; }
.summary-card--red { border-top-color: #e03a3a; }
.summary-card--forest { border-top-color: #4a7a65; }

.earnings-panel {
  display: grid;
  gap: 12px;
  padding: 18px 16px 16px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(20, 31, 31, 0.07);
}

.panel-heading--compact h2 {
  margin-top: 0;
  color: #1b3031;
  font-size: 1rem;
}

.earnings-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.earnings-card {
  padding: 16px 14px 14px;
  border-radius: 14px;
  background: #fbfcfb;
  border: 1px solid #eef1f0;
  border-top: 3px solid transparent;
}

.earnings-card span {
  display: block;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  color: #7f8b88;
  text-transform: uppercase;
}

.earnings-card strong {
  display: block;
  margin-top: 8px;
  color: #173f42;
  font-size: 1.6rem;
  line-height: 1;
}

.earnings-card small {
  display: block;
  margin-top: 6px;
  color: #6c7b77;
  font-size: 0.78rem;
}

.earnings-card--teal { border-top-color: #1b8d90; }
.earnings-card--gold { border-top-color: #c68a22; }
.earnings-card--forest { border-top-color: #4a7a65; }

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) 284px;
  gap: 14px;
}

.chart-panel,
.panel-card {
  background: #fff;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 16px 34px rgba(20, 31, 31, 0.08);
}

.panel-heading {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.panel-heading h2,
.panel-heading h3 {
  margin: 0;
  color: #1b3031;
}

.chart-note {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: #f0f3f2;
  color: #60706d;
  font-size: 0.72rem;
  font-weight: 700;
}

.chart-legend {
  display: flex;
  gap: 16px;
  margin-top: 14px;
  color: #62726f;
  font-size: 0.78rem;
}

.chart-legend span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  display: inline-block;
}

.dot--paid { background: #0f6e70; }
.dot--pending { background: #f1b84e; }

.bar-chart {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
  align-items: end;
  height: 260px;
  margin-top: 18px;
  padding: 18px 10px 10px;
  border-radius: 16px;
  background: linear-gradient(180deg, #fefefe, #fbfcfc);
  border: 1px solid #edf0ef;
}

.bar-column {
  display: grid;
  gap: 10px;
  justify-items: center;
}

.bar-stack {
  width: 100%;
  height: 180px;
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 5px;
}

.bar {
  width: 18px;
  border-radius: 12px 12px 4px 4px;
}

.bar--paid {
  background: #0f6e70;
}

.bar--pending {
  background: #f1b84e;
}

.bar-column small {
  color: #72817d;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.side-rail {
  display: grid;
  gap: 12px;
}

.insight-list {
  display: grid;
  gap: 12px;
  margin-top: 8px;
}

.insight-list div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 14px;
  background: #f7f8f7;
}

.insight-list strong {
  color: #173f42;
  font-size: 1.25rem;
}

.insight-list span {
  color: #6c7b77;
  font-size: 0.8rem;
}

.panel-card--highlight {
  background: linear-gradient(180deg, #0f7b7d, #0b6467);
  color: #fff;
}

.panel-card--highlight .section-kicker,
.panel-card--highlight p,
.panel-card--highlight h3 {
  color: inherit;
}

.panel-card--highlight p {
  margin-top: 10px;
  opacity: 0.9;
}

@media (max-width: 1280px) {
  .provider-ledger-shell {
    grid-template-columns: 1fr;
  }

  .summary-grid,
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .topbar,
  .hero-panel {
    flex-direction: column;
    align-items: stretch;
  }

  .topbar__actions {
    flex-wrap: wrap;
    margin-left: 0;
  }

  .bar-chart {
    height: 220px;
  }
}
</style>