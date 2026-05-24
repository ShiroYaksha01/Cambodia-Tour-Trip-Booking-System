<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../components/admin/AdminLayout.vue'
import api from '../services/api'

const searchQuery = ref('')
const dateRange = ref('30')
const revenueData = ref<{ label: string, value: number }[]>([])
const recentBookings = ref<any[]>([])
const loading = ref(false)
const stats = ref({
  totalRevenue: 0,
  bookingsTotal: 0,
  bookingsPaid: 0,
  pendingAmount: 0,
  pendingCount: 0,
  refundAmount: 0,
  refundCount: 0
})

// ── Stat cards ────────────────────────────────────────────────
const statCards = computed(() => [
  { 
    label: 'TOTAL REVENUE', 
    value: `$${fmtShort(stats.value.totalRevenue)}`, 
    sub: '+12% this month', 
    cls: '' 
  },
  { 
    label: 'PAID BOOKINGS', 
    value: stats.value.bookingsPaid.toString(), 
    sub: `${stats.value.bookingsTotal} Total`, 
    cls: 'blue' 
  },
  { 
    label: 'PENDING PAYMENTS', 
    value: `$${fmtShort(stats.value.pendingAmount)}`, 
    sub: `${stats.value.pendingCount} Transactions`, 
    cls: 'warning' 
  },
  { 
    label: 'REFUND REQUESTS', 
    value: `$${fmtShort(stats.value.refundAmount)}`, 
    sub: `${stats.value.refundCount} Active`, 
    cls: 'danger' 
  },
])

// ── Data Fetching ─────────────────────────────────────────────
const fetchRevenueData = async () => {
  loading.value = true
  try {
    const res = await api.get(`/admin/bookings/revenue-stats?range=${dateRange.value}`)
    if (res.data.success) {
      revenueData.value = res.data.data.trend
      stats.value = res.data.data.overview
    }
  } catch (err) {
    console.error('Failed to fetch revenue data', err)
  } finally {
    loading.value = false
  }
}

const fetchRecentBookings = async () => {
  try {
    const res = await api.get('/admin/bookings/recent-paid?limit=15')
    if (res.data.success) {
      recentBookings.value = res.data.data.map((b: any) => ({
        id: b.id.split('-')[0].toUpperCase(),
        customer: b.user?.username || 'Guest',
        package: b.service?.title || 'Unknown Package',
        amount: b.totalAmount || 0,
        status: b.paymentStatus,
        date: b.createdAt
      }))
    }
  } catch (err) {
    console.error('Failed to fetch bookings', err)
  }
}

onMounted(() => {
  fetchRevenueData()
  fetchRecentBookings()
})

// ── Chart Logic ───────────────────────────────────────────────
const chartPoints = computed(() => {
  if (!revenueData.value.length) return []
  const max = Math.max(...revenueData.value.map(d => d.value), 1000)
  const width = 800
  const height = 220
  const padding = 40

  return revenueData.value.map((d, i) => {
    const x = (i / Math.max(revenueData.value.length - 1, 1)) * width
    const y = height - ((d.value / max) * (height - padding)) - padding/2
    return { x, y, label: d.label }
  })
})

const linePath = computed(() => {
  if (!chartPoints.value.length) return ''
  return chartPoints.value.reduce((path, p, i) => {
    return i === 0 ? `M${p.x},${p.y}` : `${path} L${p.x},${p.y}`
  }, '')
})

const areaPath = computed(() => {
  if (!chartPoints.value.length) return ''
  const first = chartPoints.value[0]
  const last = chartPoints.value[chartPoints.value.length - 1]
  return `${linePath.value} L${last.x},220 L${first.x},220 Z`
})

const yAxisLabels = computed(() => {
  const max = Math.max(...revenueData.value.map(d => d.value), 1000)
  return [
    `$${(max/1000).toFixed(1)}K`,
    `$${(max*0.5/1000).toFixed(1)}K`,
    '$0'
  ]
})

// ── Table filtering ───────────────────────────────────────────
const filteredBookings = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return q ? recentBookings.value.filter(b =>
    b.id.toLowerCase().includes(q) || b.customer.toLowerCase().includes(q)
  ) : recentBookings.value
})

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2 })
const fmtShort = (n: number) => n >= 1000000 ? (n/1000000).toFixed(2) + 'M' : n >= 1000 ? (n/1000).toFixed(1) + 'K' : n.toLocaleString('en-US')
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
const exportReport = () => alert('Exporting revenue report...')
</script>

<template>
  <AdminLayout breadcrumb="Management / Revenue Analytics">
    <div class="page-header">
      <div class="header-left">
        <h1>Financial Overview</h1>
        <p class="description">Track revenue trends, booking payments, and overall financial health of the platform.</p>
      </div>
      <div class="stats">
        <div v-for="card in statCards" :key="card.label" class="stat-card" :class="card.cls">
          <p>{{ card.label }}</p>
          <h2>{{ card.value }}</h2>
          <span class="subtext">{{ card.sub }}</span>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <div class="card chart-card">
        <div class="card-head">
          <h3>Revenue Trend</h3>
          <div class="controls">
            <div v-if="loading" class="mini-spinner"></div>
            <select v-model="dateRange" class="range-select" @change="fetchRevenueData">
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">This Year</option>
            </select>
          </div>
        </div>
        
        <div class="chart-container">
          <div class="chart-y-axis">
            <span v-for="l in yAxisLabels" :key="l">{{ l }}</span>
          </div>
          <div class="chart-main">
            <svg viewBox="0 0 800 220" preserveAspectRatio="none" class="chart-svg">
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#006566" stop-opacity="0.12"/>
                  <stop offset="100%" stop-color="#006566" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <line x1="0" y1="0" x2="800" y2="0" stroke="#f0ede8" stroke-width="1" />
              <line x1="0" y1="110" x2="800" y2="110" stroke="#f0ede8" stroke-width="1" />
              <line x1="0" y1="220" x2="800" y2="220" stroke="#f0ede8" stroke-width="1" />
              
              <path v-if="areaPath" :d="areaPath" fill="url(#revenueGrad)"/>
              <path v-if="linePath" :d="linePath" fill="none" stroke="#006566" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              
              <circle v-for="(p, i) in chartPoints" :key="i" :cx="p.x" :cy="p.y" r="5" fill="white" stroke="#006566" stroke-width="2" />
            </svg>
            <div class="chart-x-axis">
              <span v-for="p in chartPoints" :key="p.label">{{ p.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card table-card">
        <div class="toolbar">
          <h3>Recent Paid Bookings</h3>
          <div class="toolbar-right">
            <div class="search-wrap">
              <svg class="si" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M13 13L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <input v-model="searchQuery" type="search" placeholder="Search booking or customer..." />
            </div>
            <button class="sec-btn" @click="exportReport">Export Report</button>
          </div>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>BOOKING ID</th>
                <th>CUSTOMER</th>
                <th>TOUR PACKAGE</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>DATE</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in filteredBookings" :key="b.id">
                <td class="mono">#{{ b.id }}</td>
                <td>
                  <div class="user-cell">
                    <div class="av">{{ b.customer[0] }}</div>
                    <span>{{ b.customer }}</span>
                  </div>
                </td>
                <td class="muted">{{ b.package }}</td>
                <td class="bold">${{ fmt(b.amount) }}</td>
                <td><span class="status paid">{{ b.status }}</span></td>
                <td>{{ fmtDate(b.date) }}</td>
              </tr>
              <tr v-if="filteredBookings.length === 0">
                <td colspan="6" class="empty-state">No results found matching your search.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
* { box-sizing: border-box; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; gap: 24px; }
.header-left { flex: 1; }
h1 { font-size: 38px; color: #182420; margin: 0 0 10px; }
.description { color: #73807b; max-width: 520px; margin: 0; font-size: 14px; line-height: 1.5; }
.stats { display: flex; gap: 16px; flex-shrink: 0; }
.stat-card { width: 190px; background: white; border-radius: 24px; padding: 22px; box-shadow: 0 8px 28px rgba(0,0,0,0.04); border: 1px solid #f0ede8; transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-4px); }
.stat-card p { color: #7d8884; font-size: 10px; margin: 0; letter-spacing: 0.8px; font-weight: 700; }
.stat-card h2 { margin: 12px 0 4px; font-size: 28px; color: #006566; letter-spacing: -0.5px; }
.stat-card .subtext { font-size: 11px; color: #a1ada9; }
.stat-card.blue h2 { color: #2160c4; }
.stat-card.warning h2 { color: #c58a22; }
.stat-card.danger h2 { color: #c93b3b; }
.content-grid { display: grid; gap: 24px; }
.card { background: white; border-radius: 28px; box-shadow: 0 8px 28px rgba(0,0,0,0.04); border: 1px solid #f2ede7; overflow: hidden; }
.chart-card { padding: 24px; }
.card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.card-head h3 { margin: 0; font-size: 18px; color: #1d2925; }
.controls { display: flex; align-items: center; gap: 12px; }
.mini-spinner { width: 16px; height: 16px; border: 2px solid #f3f0eb; border-top-color: #006566; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.range-select { height: 38px; padding: 0 12px; border-radius: 12px; border: 1.5px solid #e5e0d5; background: #faf8f5; font-size: 13px; outline: none; cursor: pointer; color: #1d2925; }
.range-select:focus { border-color: #006566; }
.chart-container { display: flex; gap: 16px; margin-top: 10px; }
.chart-y-axis { display: flex; flex-direction: column; justify-content: space-between; padding-bottom: 28px; height: 220px; }
.chart-y-axis span { font-size: 11px; color: #a1ada9; font-weight: 600; text-align: right; min-width: 40px; }
.chart-main { flex: 1; }
.chart-svg { width: 100%; height: 220px; display: block; overflow: visible; }
.chart-x-axis { display: flex; justify-content: space-between; padding-top: 12px; }
.chart-x-axis span { font-size: 11px; color: #a1ada9; font-weight: 700; }
.toolbar { padding: 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f2ede7; }
.toolbar h3 { margin: 0; font-size: 18px; color: #1d2925; }
.toolbar-right { display: flex; gap: 12px; align-items: center; }
.search-wrap { position: relative; }
.search-wrap input { height: 40px; width: 260px; border: 1.5px solid #e5e0d5; border-radius: 12px; background: #faf8f5; padding: 0 14px 0 36px; font-size: 13px; outline: none; transition: 0.18s; }
.search-wrap input:focus { border-color: #006566; background: white; }
.si { position: absolute; left: 11px; top: 12.5px; width: 15px; height: 15px; color: #aab0ac; pointer-events: none; }
.sec-btn { height: 40px; padding: 0 20px; border-radius: 12px; border: none; background: #f3f0eb; cursor: pointer; font-size: 13px; font-weight: 600; color: #1d2925; transition: 0.18s; }
.sec-btn:hover { background: #e8e4d9; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 14px 24px; font-size: 10px; color: #8d9792; background: #faf8f5; border-bottom: 1px solid #f2ede7; letter-spacing: 0.8px; font-weight: 800; }
td { padding: 16px 24px; border-bottom: 1px solid #f5f1ea; vertical-align: middle; font-size: 14px; color: #1d2925; }
.mono { font-family: monospace; font-size: 13px; color: #57645d; }
.bold { font-weight: 700; color: #006566; }
.muted { color: #7f8b86; }
.user-cell { display: flex; align-items: center; gap: 12px; }
.av { width: 32px; height: 32px; border-radius: 10px; background: #e8f5f4; color: #006566; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
.status { padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
.status.paid { background: #e8f7f5; color: #00817f; }
.empty-state { text-align: center; padding: 48px !important; color: #89938f; font-size: 14px; }
@media (max-width: 1200px) {
  .page-header { flex-direction: column; }
  .stats { width: 100%; overflow-x: auto; padding-bottom: 8px; }
  .stat-card { flex-shrink: 0; }
}
</style>