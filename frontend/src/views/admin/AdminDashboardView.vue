<template>
  <AdminLayout @search="(q) => searchQuery = q">
    <section class="admin-content">
      <div class="welcome-banner">
        <div class="banner-text">
          <h2>{{ greeting }}, Admin</h2>
          <p>Operational overview for bookings, revenue, providers, and platform health.</p>
        </div>
        <div class="banner-actions">
          <div class="datepicker-dropdown">
            <span class="calendar-icon">□</span>
            <span>{{ currentDateLabel }}</span>
            <span class="chevron-down">▾</span>
          </div>
        </div>
      </div>

      <section class="kpi-grid">
        <article class="kpi-card hover-lift">
          <div class="kpi-card__header">
            <div class="kpi-icon-wrapper theme-green">
              <span>$</span>
            </div>
            <span class="kpi-title">Revenue</span>
          </div>
          <div class="kpi-value">${{ formatNumber(stats.totalRevenue) }}</div>
          <div class="kpi-trend" :class="stats.totalRevenue > 0 ? 'trend-up' : 'trend-neutral'">
            <span>{{ stats.totalRevenue > 0 ? 'Live' : 'No data' }}</span> <small>paid bookings only</small>
          </div>
          <div class="kpi-sparkline stroke-green">
            <svg viewBox="0 0 100 28" class="sparkline-svg" preserveAspectRatio="none">
              <path :d="sparklineAreaPaths.revenue" class="sparkline-area"></path>
              <path :d="sparklinePaths.revenue" fill="none" stroke-width="2" stroke-linecap="round"></path>
            </svg>
          </div>
        </article>

        <article class="kpi-card hover-lift">
          <div class="kpi-card__header">
            <div class="kpi-icon-wrapper theme-blue">
              <span>□</span>
            </div>
            <span class="kpi-title">Total Bookings</span>
          </div>
          <div class="kpi-value">{{ formatInteger(stats.totalBookings) }}</div>
          <div class="kpi-trend" :class="stats.totalBookings > 0 ? 'trend-up' : 'trend-neutral'">
            <span>{{ stats.totalBookings > 0 ? 'Live' : 'No data' }}</span> <small>from bookings table</small>
          </div>
          <div class="kpi-sparkline stroke-blue">
            <svg viewBox="0 0 100 28" class="sparkline-svg" preserveAspectRatio="none">
              <path :d="sparklineAreaPaths.bookings" class="sparkline-area"></path>
              <path :d="sparklinePaths.bookings" fill="none" stroke-width="2" stroke-linecap="round"></path>
            </svg>
          </div>
        </article>

        <article class="kpi-card hover-lift">
          <div class="kpi-card__header">
            <div class="kpi-icon-wrapper theme-purple">
              <span>○</span>
            </div>
            <span class="kpi-title">Total Providers</span>
          </div>
          <div class="kpi-value">{{ formatInteger(stats.totalProviders) }}</div>
          <div class="kpi-trend" :class="stats.verifiedProviders > 0 ? 'trend-up' : 'trend-neutral'">
            <span>{{ formatInteger(stats.verifiedProviders) }}</span> <small>verified</small>
          </div>
          <div class="kpi-sparkline stroke-purple">
            <svg viewBox="0 0 100 28" class="sparkline-svg" preserveAspectRatio="none">
              <path :d="sparklineAreaPaths.providers" class="sparkline-area"></path>
              <path :d="sparklinePaths.providers" fill="none" stroke-width="2" stroke-linecap="round"></path>
            </svg>
          </div>
        </article>

        <article class="kpi-card hover-lift">
          <div class="kpi-card__header">
            <div class="kpi-icon-wrapper theme-orange">
              <span>◌</span>
            </div>
            <span class="kpi-title">Total Clients</span>
          </div>
          <div class="kpi-value">{{ formatInteger(stats.totalUsers) }}</div>
          <div class="kpi-trend" :class="stats.totalUsers > 0 ? 'trend-up' : 'trend-neutral'">
            <span>{{ stats.totalUsers > 0 ? 'Live' : 'No data' }}</span> <small>registered users</small>
          </div>
          <div class="kpi-sparkline stroke-orange">
            <svg viewBox="0 0 100 28" class="sparkline-svg" preserveAspectRatio="none">
              <path :d="sparklineAreaPaths.users" class="sparkline-area"></path>
              <path :d="sparklinePaths.users" fill="none" stroke-width="2" stroke-linecap="round"></path>
            </svg>
          </div>
        </article>

        <article class="kpi-card hover-lift">
          <div class="kpi-card__header">
            <div class="kpi-icon-wrapper theme-teal">
              <span>◇</span>
            </div>
            <span class="kpi-title">Platform Fee</span>
          </div>
          <div class="kpi-value">${{ formatNumber(stats.totalPlatformFee) }}</div>
          <div class="kpi-trend" :class="stats.totalPlatformFee > 0 ? 'trend-up' : 'trend-neutral'">
            <span>{{ stats.totalPlatformFee > 0 ? 'Live' : 'No data' }}</span> <small>commission earned</small>
          </div>
          <div class="kpi-sparkline stroke-teal">
            <svg viewBox="0 0 100 28" class="sparkline-svg" preserveAspectRatio="none">
              <path :d="sparklineAreaPaths.platformFee" class="sparkline-area"></path>
              <path :d="sparklinePaths.platformFee" fill="none" stroke-width="2" stroke-linecap="round"></path>
            </svg>
          </div>
        </article>
      </section>

      <div v-if="isLoading" class="skeleton-container">
        <div class="skeleton-grid">
          <div class="skeleton-panel skeleton-pulse" style="height: 380px;"></div>
          <div class="skeleton-panel skeleton-pulse" style="height: 380px;"></div>
        </div>
      </div>

      <div v-else-if="loadError" class="dashboard-body">
        <article class="panel error-panel">
          <h3>Dashboard data is unavailable</h3>
          <p>{{ loadError }}</p>
          <button class="retry-button" type="button" @click="loadStatsData">Retry</button>
        </article>
      </div>

      <div v-else class="dashboard-body">
        <section class="main-analytics-grid">
          <div class="analytics-main-column">
            <article class="panel panel--revenue">
              <div class="panel-header-row">
                <div class="panel-title-block">
                  <span class="panel-eyebrow">Revenue Overview</span>
                </div>
                <div class="panel-controls">
                  <div class="segmented-dropdown">
                    <span>This Week</span>
                    <span class="chevron-down">▾</span>
                  </div>
                </div>
              </div>

              <div class="revenue-metric-row">
                <strong class="revenue-main-val">${{ formatNumber(stats.totalRevenue) }}</strong>
                <span class="trend-badge-pill green-badge">{{ formatInteger(stats.totalBookings) }} bookings</span>
                <span class="subtext-label">Total revenue from paid bookings</span>
              </div>

              <div class="chart-area-container" :class="{ 'chart-area-container--empty': !hasRevenueVisual }">
                <svg
                  v-if="hasRevenueLineChart"
                  viewBox="0 0 600 180"
                  class="main-svg-chart"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#0f8f89" stop-opacity="0.16" />
                      <stop offset="100%" stop-color="#24a874" stop-opacity="0.00" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="30" x2="600" y2="30" stroke="#edf2f3" stroke-width="1" />
                  <line x1="0" y1="80" x2="600" y2="80" stroke="#edf2f3" stroke-width="1" />
                  <line x1="0" y1="130" x2="600" y2="130" stroke="#edf2f3" stroke-width="1" />
                  <path :d="chartAreaPath" fill="url(#chartGrad)"></path>
                  <path :d="chartLinePath" fill="none" stroke="#0f8f89" stroke-width="2.6" stroke-linecap="round"></path>
                  <circle 
                    v-for="(pt, idx) in chartPoints" 
                    :key="idx" 
                    :cx="pt.x" 
                    :cy="pt.y" 
                    r="3.5" 
                    fill="#ffffff" 
                    stroke="#0f8f89" 
                    stroke-width="2.5"
                  />
                </svg>

                <div v-else-if="hasRevenueSummaryVisual" class="revenue-summary-visual">
                  <div v-for="item in revenueSummaryItems" :key="item.label" class="summary-bar">
                    <div class="summary-bar__meta">
                      <span>{{ item.label }}</span>
                      <strong>{{ item.display }}</strong>
                    </div>
                    <div class="summary-bar__track">
                      <span :style="{ width: `${item.percent}%` }"></span>
                    </div>
                  </div>
                </div>

                <div v-else class="chart-empty-state">
                  <span class="chart-empty-state__icon">≋</span>
                  <strong>Not enough revenue data yet</strong>
                  <p>Paid bookings will appear here once revenue activity is available.</p>
                </div>

                <div v-if="hasRevenueLineChart" class="chart-labels-row">
                  <span v-for="stat in monthlyStats" :key="stat.month">{{ stat.month }}</span>
                </div>
              </div>

              <div class="revenue-insights-grid">
                <div class="insight-item">
                  <span>Highest revenue day</span>
                  <strong>{{ highestRevenueLabel }}</strong>
                </div>
                <div class="insight-item">
                  <span>Average daily revenue</span>
                  <strong>${{ formatNumber(averageDailyRevenue) }}</strong>
                </div>
                <div class="insight-item">
                  <span>Paid bookings</span>
                  <strong>{{ formatInteger(stats.paidPaymentCount || stats.totalBookings) }}</strong>
                </div>
                <div class="insight-item">
                  <span>Platform fee</span>
                  <strong>${{ formatNumber(stats.totalPlatformFee) }}</strong>
                </div>
              </div>
            </article>

            <article class="panel panel--bookings">
              <div class="panel-header-row">
                <h3>Recent Bookings</h3>
                <router-link to="/admin/bookings" class="view-all-link">View All</router-link>
              </div>

              <div class="table-wrapper">
                <table class="saas-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Client</th>
                      <th>Tour</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="booking in filteredBookings" :key="booking.id" class="table-row">
                      <td>
                        <span class="booking-id-text">
                          {{ booking.transactionId || booking.id.substring(0, 11) }}
                        </span>
                      </td>
                      <td>
                        <span class="client-name">{{ booking.customerName }}</span>
                      </td>
                      <td>
                        <span class="tour-title" :title="booking.serviceTitle">
                          {{ booking.serviceTitle }}
                        </span>
                      </td>
                      <td>
                        <span class="row-date">{{ formatDate(booking.date) }}</span>
                      </td>
                      <td>
                        <strong class="row-amount">${{ formatNumber(booking.amount) }}</strong>
                      </td>
                      <td>
                        <span 
                          class="badge-saas" 
                          :class="`badge-saas--${booking.status.toLowerCase()}`"
                        >
                          {{ booking.status }}
                        </span>
                      </td>
                      <td class="action-cell">
                        <button class="row-action-btn" type="button" aria-label="Actions">•••</button>
                      </td>
                    </tr>
                    <tr v-if="!filteredBookings.length">
                      <td colspan="7" class="empty-state-cell">
                        <div class="empty-state-msg">
                          <span>□</span>
                          <strong>No recent bookings yet</strong>
                          <p>New booking activity will appear here as customers reserve tours.</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>
          </div>

          <div class="analytics-side-column">
            <article class="panel panel--status">
              <h3>Booking Status</h3>
              <div class="donut-wrapper">
                <div v-if="hasStatusData" class="donut-chart-box" :style="{ background: donutGradient }">
                  <div class="donut-inner-hole"></div>
                </div>

                <div v-else class="status-empty-state">
                  <span>◇</span>
                  <strong>No booking status data</strong>
                  <p>Status distribution will appear after bookings are recorded.</p>
                </div>
                
                <div class="donut-legend">
                  <div v-for="item in statusLegend" :key="item.status" class="legend-item">
                    <span class="indicator-dot" :style="{ background: item.color }"></span>
                    <span class="legend-name">{{ item.label }}</span>
                    <strong class="legend-percent">{{ item.percent }}%</strong>
                    <span class="legend-count">({{ item.count }})</span>
                  </div>
                </div>
              </div>
            </article>

            <article class="panel panel--health">
              <div class="panel-header-row">
                <h3>System Health</h3>
                <a href="#" class="view-all-link">View All</a>
              </div>
              <div class="health-list">
                <div class="health-item">
                  <span class="health-label">API Gateway</span>
                  <span class="status-pill" :class="loadError ? 'status-pill--down' : 'status-pill--ok'">
                    ● {{ loadError ? 'Unavailable' : 'Operational' }}
                  </span>
                </div>
                <div class="health-item">
                  <span class="health-label">Database</span>
                  <span class="status-pill" :class="loadError ? 'status-pill--down' : 'status-pill--ok'">
                    ● {{ loadError ? 'Unavailable' : 'Operational' }}
                  </span>
                </div>
                <div class="health-item">
                  <span class="health-label">Payment Service</span>
                  <span class="status-pill" :class="stats.paidPaymentCount > 0 ? 'status-pill--ok' : 'status-pill--idle'">
                    ● {{ stats.paidPaymentCount > 0 ? 'Receiving payments' : 'No paid bookings' }}
                  </span>
                </div>
                <div class="health-item">
                  <span class="health-label">Email Service</span>
                  <span class="status-pill status-pill--idle">● Not connected</span>
                </div>
              </div>
            </article>

            <article class="panel panel--activity">
              <div class="panel-header-row">
                <h3>Recent Activity</h3>
                <a href="#" class="view-all-link">View All</a>
              </div>
              <div class="timeline-list">
                <div v-for="activity in recentActivities" :key="activity.id" class="timeline-item">
                  <div class="timeline-icon-box theme-green-soft">
                    <span>{{ activity.icon }}</span>
                  </div>
                  <div class="timeline-body">
                    <p><strong>{{ activity.title }}</strong></p>
                    <span>{{ activity.detail }} · {{ activity.time }}</span>
                  </div>
                </div>
                <div v-if="!recentActivities.length" class="empty-activity">
                  No recent booking activity yet
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>

      <div class="quick-nav-actions">
        <router-link class="quick-nav-btn" to="/admin/providers">Manage Providers</router-link>
        <router-link class="quick-nav-btn" to="/admin/bookings">View All Bookings</router-link>
      </div>
    </section>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import { getAdminDashboardSummary } from '../../services/api'

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded'

type DashboardStats = {
  totalBookings: number
  totalRevenue: number
  totalProviders: number
  totalUsers: number
  totalServices: number
  verifiedProviders: number
  paidPaymentCount: number
  totalPlatformFee: number
}

type AdminDashboardResponse = {
  total_users: number
  total_providers: number
  total_bookings: number
  total_revenue: number
  total_platform_fee: number
}

type RecentBooking = {
  id: string
  customerName?: string
  customerEmail?: string
  serviceTitle?: string
  providerName?: string
  amount: number
  status: BookingStatus
  date: string
  transactionId?: string
  createdAt?: string
}

type MonthlyStat = {
  month: string
  bookings: number
  revenue: number
}

const emptyStats = (): DashboardStats => ({
  totalBookings: 0,
  totalRevenue: 0,
  totalProviders: 0,
  totalUsers: 0,
  totalServices: 0,
  verifiedProviders: 0,
  paidPaymentCount: 0,
  totalPlatformFee: 0,
})

const emptyStatusBreakdown = (): Record<BookingStatus, number> => ({
  pending: 0,
  confirmed: 0,
  cancelled: 0,
  completed: 0,
  refunded: 0,
})

const statusMeta: Record<BookingStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: '#d88a12' },
  confirmed: { label: 'Confirmed', color: '#1f9f72' },
  cancelled: { label: 'Cancelled', color: '#dc4c4c' },
  completed: { label: 'Completed', color: '#0f8f89' },
  refunded: { label: 'Refunded', color: '#64748b' },
}

const searchQuery = ref('')
const isLoading = ref(true)
const loadError = ref('')

const stats = ref<DashboardStats>(emptyStats())
const statusBreakdown = ref<Record<BookingStatus, number>>(emptyStatusBreakdown())

const recentBookings = ref<RecentBooking[]>([])
const monthlyStats = ref<MonthlyStat[]>([])
const currentDateLabel = new Date().toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const loadStatsData = async () => {
  try {
    isLoading.value = true
    loadError.value = ''
    const res = await getAdminDashboardSummary()
    const data = res?.success && res?.data ? res.data : res

    if (isDashboardResponse(data)) {
      stats.value = {
        ...emptyStats(),
        totalUsers: Number(data.total_users || 0),
        totalProviders: Number(data.total_providers || 0),
        totalBookings: Number(data.total_bookings || 0),
        totalRevenue: Number(data.total_revenue || 0),
        totalPlatformFee: Number(data.total_platform_fee || 0),
      }
      statusBreakdown.value = emptyStatusBreakdown()
      recentBookings.value = []
      monthlyStats.value = []
    } else if (res && res.success && res.data) {
      stats.value = { ...emptyStats(), ...(data.stats || {}) }
      statusBreakdown.value = { ...emptyStatusBreakdown(), ...(data.statusBreakdown || {}) }
      recentBookings.value = data.recentBookings || []
      monthlyStats.value = data.monthlyStats || []
    } else {
      throw new Error('The backend returned an invalid dashboard response.')
    }
  } catch (err) {
    console.error("Failed to load SaaS stats dashboard data:", err)
    loadError.value = 'Please make sure the backend is running and the database is reachable.'
    stats.value = emptyStats()
    statusBreakdown.value = emptyStatusBreakdown()
    recentBookings.value = []
    monthlyStats.value = []
  } finally {
    isLoading.value = false
  }
}

const isDashboardResponse = (data: unknown): data is AdminDashboardResponse => {
  if (!data || typeof data !== 'object') return false
  return (
    'total_users' in data &&
    'total_providers' in data &&
    'total_bookings' in data &&
    'total_revenue' in data &&
    'total_platform_fee' in data
  )
}

onMounted(() => {
  loadStatsData()
})

const filteredBookings = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return recentBookings.value

  return recentBookings.value.filter((b) => {
    return (
      (b.customerName || '').toLowerCase().includes(query) ||
      (b.customerEmail || '').toLowerCase().includes(query) ||
      (b.serviceTitle || '').toLowerCase().includes(query) ||
      (b.providerName || '').toLowerCase().includes(query) ||
      (b.transactionId && b.transactionId.toLowerCase().includes(query)) ||
      b.status.toLowerCase().includes(query)
    )
  })
})

const totalStatusCount = computed(() => {
  const s = statusBreakdown.value
  return Object.values(s).reduce((sum, count) => sum + Number(count || 0), 0)
})

const hasStatusData = computed(() => totalStatusCount.value > 0)

const statusLegend = computed(() => {
  return (Object.keys(statusMeta) as BookingStatus[]).map((status) => {
    const count = statusBreakdown.value[status] || 0
    return {
      status,
      count,
      label: statusMeta[status].label,
      color: statusMeta[status].color,
      percent: hasStatusData.value ? Math.round((count / totalStatusCount.value) * 100) : 0,
    }
  })
})

const donutGradient = computed(() => {
  if (!hasStatusData.value) return ''

  let start = 0
  const segments = statusLegend.value.map((item) => {
    const end = start + item.percent
    const segment = `${item.color} ${start}% ${end}%`
    start = end
    return segment
  })

  return `conic-gradient(${segments.join(', ')})`
})

const recentActivities = computed(() => {
  return recentBookings.value.slice(0, 3).map((booking) => ({
    id: booking.id,
    icon: booking.status === 'confirmed' ? '✓' : booking.status === 'cancelled' ? '×' : '□',
    title: `${statusMeta[booking.status]?.label || 'New'} booking`,
    detail: booking.serviceTitle || booking.transactionId || 'Booking activity',
    time: formatRelativeTime(booking.createdAt || booking.date),
  }))
})

const notificationCount = computed(() => recentActivities.value.length)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const chartWidth = 600
const chartHeight = 180
const sparklineWidth = 100
const sparklineHeight = 28

const hasRevenueLineChart = computed(() => {
  return monthlyStats.value.length > 1 && monthlyStats.value.some((stat) => Number(stat.revenue || 0) > 0)
})

const hasRevenueSummaryVisual = computed(() => {
  return !hasRevenueLineChart.value && (
    stats.value.totalRevenue > 0 ||
    stats.value.totalPlatformFee > 0 ||
    stats.value.totalBookings > 0
  )
})

const hasRevenueVisual = computed(() => hasRevenueLineChart.value || hasRevenueSummaryVisual.value)

const revenueSummaryItems = computed(() => {
  const items = [
    {
      label: 'Paid revenue',
      value: stats.value.totalRevenue,
      display: `$${formatNumber(stats.value.totalRevenue)}`,
    },
    {
      label: 'Platform fee',
      value: stats.value.totalPlatformFee,
      display: `$${formatNumber(stats.value.totalPlatformFee)}`,
    },
    {
      label: 'Bookings',
      value: stats.value.totalBookings,
      display: formatInteger(stats.value.totalBookings),
    },
  ]
  const maxValue = Math.max(...items.map((item) => Number(item.value || 0)), 1)

  return items.map((item) => ({
    ...item,
    percent: item.value > 0 ? Math.max(10, Math.round((item.value / maxValue) * 100)) : 0,
  }))
})

const highestRevenueLabel = computed(() => {
  const revenueStats = monthlyStats.value.filter((stat) => Number(stat.revenue || 0) > 0)
  if (revenueStats.length > 0) {
    const top = revenueStats.reduce((best, stat) => (stat.revenue > best.revenue ? stat : best), revenueStats[0])
    return `${top.month} · $${formatNumber(top.revenue)}`
  }

  return stats.value.totalRevenue > 0 ? `Current period · $${formatNumber(stats.value.totalRevenue)}` : 'No revenue yet'
})

const averageDailyRevenue = computed(() => {
  const revenueStats = monthlyStats.value.filter((stat) => Number(stat.revenue || 0) > 0)
  if (revenueStats.length > 0) {
    const total = revenueStats.reduce((sum, stat) => sum + Number(stat.revenue || 0), 0)
    return total / revenueStats.length
  }

  const divisor = Math.max(Number(stats.value.totalBookings || 0), 1)
  return stats.value.totalRevenue > 0 ? stats.value.totalRevenue / divisor : 0
})

const buildSparklineValues = (value: number, seed: number): number[] => {
  if (value <= 0) return [0.18, 0.18, 0.19, 0.18, 0.2, 0.19]

  const normalized = Math.min(Math.log10(value + 1) / 4, 1)
  const base = 0.28 + normalized * 0.3
  return [0, 1, 2, 3, 4, 5].map((idx) => {
    const drift = idx * 0.045
    const wave = Math.sin((idx + seed) * 1.1) * 0.055
    return Math.min(0.88, Math.max(0.18, base + drift + wave))
  })
}

const pathFromValues = (values: number[]): string => {
  const xStep = sparklineWidth / (values.length - 1)
  return values
    .map((value, index) => {
      const x = index * xStep
      const y = sparklineHeight - value * (sparklineHeight - 7) - 3
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

const areaPathFromLine = (linePath: string): string => {
  return `${linePath} L ${sparklineWidth} ${sparklineHeight} L 0 ${sparklineHeight} Z`
}

const sparklinePaths = computed(() => {
  return {
    revenue: pathFromValues(buildSparklineValues(stats.value.totalRevenue, 1)),
    bookings: pathFromValues(buildSparklineValues(stats.value.totalBookings, 2)),
    providers: pathFromValues(buildSparklineValues(stats.value.totalProviders, 3)),
    users: pathFromValues(buildSparklineValues(stats.value.totalUsers, 4)),
    platformFee: pathFromValues(buildSparklineValues(stats.value.totalPlatformFee, 5)),
  }
})

const sparklineAreaPaths = computed(() => {
  return {
    revenue: areaPathFromLine(sparklinePaths.value.revenue),
    bookings: areaPathFromLine(sparklinePaths.value.bookings),
    providers: areaPathFromLine(sparklinePaths.value.providers),
    users: areaPathFromLine(sparklinePaths.value.users),
    platformFee: areaPathFromLine(sparklinePaths.value.platformFee),
  }
})

const chartPoints = computed(() => {
  if (!hasRevenueLineChart.value) return []
  const maxRevenue = Math.max(...monthlyStats.value.map((s) => s.revenue), 1)
  
  return monthlyStats.value.map((stat, idx) => {
    const x = monthlyStats.value.length === 1 ? chartWidth / 2 : (idx / (monthlyStats.value.length - 1)) * chartWidth
    const y = chartHeight - (stat.revenue / maxRevenue) * (chartHeight - 40) - 15
    return { x, y }
  })
})

const chartLinePath = computed(() => {
  const points = chartPoints.value
  if (points.length === 0) return ''
  return points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')
})

const chartAreaPath = computed(() => {
  const points = chartPoints.value
  if (points.length === 0) return ''
  const line = chartLinePath.value
  return `${line} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`
})

const formatNumber = (num: number): string => {
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const formatInteger = (num: number): string => {
  return Number(num).toLocaleString('en-US')
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatRelativeTime = (dateStr: string): string => {
  if (!dateStr) return 'recently'

  const date = new Date(dateStr)
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hr ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}
</script>

<style scoped>
.admin-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.welcome-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 2px 0 0;
}

.banner-text h2 {
  margin: 0 0 3px;
  font-size: 1.18rem;
  font-weight: 700;
  color: #173f42;
  letter-spacing: 0;
}

.banner-text p {
  margin: 0;
  color: #66787a;
  font-size: 0.82rem;
}

.datepicker-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background: #ffffff;
  border: 1px solid #e4ebed;
  border-radius: 7px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #5e6e70;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.datepicker-dropdown:hover {
  background: #f8fafb;
  border-color: #d1dadc;
}

.chevron-down {
  font-size: 0.72rem;
  color: #9ea9ab;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(138px, 1fr));
  gap: 9px;
}

.kpi-card {
  background: #ffffff;
  border: 1px solid #e2e9eb;
  border-radius: 10px;
  padding: 11px 11px 9px;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 1px 2px rgba(17, 39, 41, 0.02);
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  justify-content: space-between;
}

.kpi-card:hover {
  border-color: #cfdadc;
  box-shadow: 0 8px 22px rgba(18, 43, 45, 0.045);
}

.kpi-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 3px;
}

.kpi-title {
  font-size: 0.72rem;
  font-weight: 600;
  color: #66787a;
}

.kpi-icon-wrapper {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  display: grid;
  place-items: center;
  font-size: 0.72rem;
  flex-shrink: 0;
}

.theme-green { background: #eefdf7; color: #24a874; font-weight: bold; }
.theme-blue { background: #eef6fd; color: #3b82f6; }
.theme-purple { background: #f6eeff; color: #8b5cf6; }
.theme-orange { background: #fff6ee; color: #e59a18; }
.theme-teal { background: #eefdfd; color: #0f6e70; }

.kpi-value {
  font-size: clamp(1.04rem, 1.35vw, 1.24rem);
  font-weight: 700;
  color: #173f42;
  letter-spacing: 0;
  margin-bottom: 2px;
  line-height: 1.1;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  min-height: 17px;
  white-space: nowrap;
}

.trend-up span {
  color: #24a874;
  font-weight: 700;
}

.trend-up small {
  color: #9ea9ab;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trend-neutral span {
  color: #5e6e70;
  font-weight: 700;
}

.trend-neutral small {
  color: #9ea9ab;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kpi-sparkline {
  height: 20px;
  width: 100%;
  margin-top: 5px;
  opacity: 0.95;
}

.sparkline-svg {
  width: 100%;
  height: 100%;
}

.sparkline-area {
  opacity: 0.12;
}

.stroke-green .sparkline-area { fill: #0f8f89; }
.stroke-blue .sparkline-area { fill: #2563eb; }
.stroke-purple .sparkline-area { fill: #64748b; }
.stroke-orange .sparkline-area { fill: #d88a12; }
.stroke-teal .sparkline-area { fill: #0f6e70; }

.stroke-green path { stroke: #24a874; }
.stroke-blue path { stroke: #3b82f6; }
.stroke-purple path { stroke: #8b5cf6; }
.stroke-orange path { stroke: #e59a18; }
.stroke-teal path { stroke: #0f6e70; }

.main-analytics-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.76fr) minmax(268px, 0.72fr);
  gap: 13px;
}

.analytics-main-column,
.analytics-side-column {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.panel {
  background: #ffffff;
  border: 1px solid #e2e9eb;
  border-radius: 10px;
  padding: 14px;
  box-shadow: 0 1px 2px rgba(17, 39, 41, 0.02);
}

.error-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.error-panel h3 {
  margin: 0;
  color: #173f42;
}

.error-panel p {
  margin: 0;
  color: #5e6e70;
}

.retry-button {
  border: none;
  border-radius: 8px;
  background: #0f6e70;
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
  padding: 10px 14px;
}

.retry-button:hover {
  background: #0b5b5d;
}

.panel-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.panel-title-block h3,
.panel--bookings h3,
.panel--status h3,
.panel--health h3,
.panel--activity h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #173f42;
}

.panel-eyebrow {
  font-size: 0.84rem;
  font-weight: 700;
  color: #173f42;
  display: block;
}

.panel-controls {
  display: flex;
  gap: 8px;
}

.segmented-dropdown {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f8fafb;
  border: 1px solid #edf2f5;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #5e6e70;
  cursor: pointer;
}

.revenue-metric-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 9px;
  flex-wrap: wrap;
}

.revenue-main-val {
  font-size: 1.48rem;
  font-weight: 700;
  color: #173f42;
  letter-spacing: -0.01em;
}

.trend-badge-pill {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
}

.green-badge {
  background: #eefdf7;
  color: #24a874;
}

.subtext-label {
  font-size: 0.8rem;
  color: #9ea9ab;
}

.chart-area-container {
  width: 100%;
  margin-top: 4px;
  min-height: 168px;
  padding: 10px 10px 8px;
  border: 1px solid #e7eef0;
  border-radius: 9px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcfc 100%);
}

.chart-area-container--empty {
  display: grid;
  place-items: center;
}

.main-svg-chart {
  width: 100%;
  height: 144px;
  overflow: visible;
  display: block;
}

.chart-labels-row {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #f1f3f5;
}

.chart-labels-row span {
  font-size: 0.78rem;
  font-weight: 600;
  color: #9ea9ab;
}

.revenue-summary-visual {
  display: grid;
  gap: 14px;
  padding: 12px 4px;
}

.summary-bar {
  display: grid;
  gap: 7px;
}

.summary-bar__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.78rem;
  color: #5d6f70;
}

.summary-bar__meta strong {
  color: #173f42;
  font-size: 0.82rem;
}

.summary-bar__track {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: #eef3f4;
}

.summary-bar__track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #0f8f89;
}

.chart-empty-state,
.status-empty-state {
  display: grid;
  justify-items: center;
  gap: 5px;
  text-align: center;
  color: #7a8a8b;
}

.chart-empty-state__icon,
.status-empty-state span {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #edf6f5;
  color: #0f6e70;
  font-weight: 800;
}

.chart-empty-state strong,
.status-empty-state strong {
  color: #173f42;
  font-size: 0.86rem;
}

.chart-empty-state p,
.status-empty-state p {
  max-width: 260px;
  margin: 0;
  font-size: 0.76rem;
  line-height: 1.45;
}

.revenue-insights-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
  margin-top: 10px;
  border: 1px solid #e7eef0;
  border-radius: 9px;
  overflow: hidden;
  background: #ffffff;
}

.insight-item {
  display: grid;
  gap: 3px;
  padding: 10px 12px;
  border-right: 1px solid #e7eef0;
}

.insight-item:last-child {
  border-right: 0;
}

.insight-item span {
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #819193;
}

.insight-item strong {
  min-width: 0;
  overflow: hidden;
  color: #173f42;
  font-size: 0.82rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.view-all-link {
  font-size: 0.8rem;
  font-weight: 700;
  color: #0f6e70;
  text-decoration: none;
}

.view-all-link:hover {
  text-decoration: underline;
}

.panel--bookings .table-wrapper {
  margin-top: 6px;
}

.table-wrapper {
  overflow-x: auto;
}

.saas-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.saas-table th {
  padding: 9px 10px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #9ea9ab;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #edf2f5;
  background: #fbfcfc;
}

.saas-table td {
  padding: 9px 10px;
  font-size: 0.84rem;
  color: #173f42;
  border-bottom: 1px solid #edf2f5;
  background: #ffffff;
}

.saas-table tr:last-child td {
  border-bottom: none;
}

.saas-table tr:hover td {
  background: #f8fafb;
}

.booking-id-text {
  font-family: monospace;
  font-weight: 600;
  color: #5e6e70;
}

.client-name {
  font-weight: 600;
  color: #173f42;
}

.tour-title {
  color: #5e6e70;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  font-weight: 500;
}

.row-date {
  color: #9ea9ab;
  font-size: 0.8rem;
}

.row-amount {
  font-weight: 700;
  color: #173f42;
}

.badge-saas {
  display: inline-flex;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: capitalize;
}

.badge-saas--confirmed { background: #eefdf7; color: #24a874; }
.badge-saas--pending { background: #fff6ee; color: #e59a18; }
.badge-saas--cancelled { background: #fdf2f2; color: #f15d5d; }
.badge-saas--completed { background: #eef6fd; color: #3b82f6; }
.badge-saas--refunded { background: #f6eeff; color: #7c3aed; }

.row-action-btn {
  background: none;
  border: none;
  color: #9ea9ab;
  cursor: pointer;
  font-size: 0.9rem;
}

.empty-state-cell {
  text-align: center;
  padding: 24px 12px !important;
}

.empty-state-msg {
  display: grid;
  justify-items: center;
  gap: 5px;
}

.empty-state-msg span {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #edf6f5;
  color: #0f6e70;
  font-size: 0.9rem;
}

.empty-state-msg strong {
  color: #173f42;
  font-size: 0.86rem;
}

.empty-state-msg p {
  max-width: 320px;
  margin: 0;
  color: #7a8a8b;
  font-size: 0.78rem;
}

.panel--status h3 {
  margin: 0 0 16px;
}

.donut-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.donut-chart-box {
  width: 104px;
  height: 104px;
  border-radius: 50%;
  position: relative;
  display: flex;
  place-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(18, 43, 45, 0.04);
}

.donut-inner-hole {
  width: 68px;
  height: 68px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px #edf2f3;
}

.donut-legend {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) auto auto;
  gap: 7px;
  align-items: center;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.legend-name {
  font-size: 0.78rem;
  color: #536668;
  font-weight: 500;
}

.legend-percent {
  color: #173f42;
  font-weight: 700;
  font-size: 0.74rem;
}

.legend-count {
  color: #9ea9ab;
  font-size: 0.74rem;
}

.health-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.health-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 0;
  border-bottom: 1px solid #edf2f3;
}

.health-item:last-child {
  border-bottom: none;
}

.health-label {
  font-size: 0.84rem;
  font-weight: 600;
  color: #5e6e70;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 20px;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
}

.status-pill--ok {
  background: #e8f8f1;
  color: #147a56;
}

.status-pill--idle {
  background: #f1f4f5;
  color: #5d6f70;
}

.status-pill--down {
  background: #fff0f0;
  color: #c43f3f;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.timeline-icon-box {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  font-size: 0.88rem;
  flex-shrink: 0;
  background: #edf6f5;
  color: #0f6e70;
}

.theme-green-soft { background: #eefdf7; }
.theme-purple-soft { background: #f6eeff; }
.theme-orange-soft { background: #fff6ee; }

.timeline-body p {
  margin: 0 0 2px;
  font-size: 0.8rem;
  color: #173f42;
  font-weight: 600;
}

.timeline-body span {
  font-size: 0.72rem;
  color: #9ea9ab;
}

.empty-activity {
  border: 1px dashed #dce6e8;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  color: #7a8a8b;
  background: #fbfcfc;
  font-size: 0.82rem;
}

.quick-nav-actions {
  display: flex;
  gap: 12px;
}

.quick-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 16px;
  border-radius: 7px;
  border: 1px solid #e2e9eb;
  background: #ffffff;
  color: #5e6e70;
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.quick-nav-btn:hover {
  background: #f8fafb;
  border-color: #cfdadc;
}

.skeleton-container {
  display: flex;
  flex-direction: column;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: 1.76fr 0.72fr;
  gap: 13px;
}

.skeleton-panel {
  background: #ffffff;
  border: 1px solid #e2e9eb;
  border-radius: 10px;
}

.skeleton-pulse {
  background: linear-gradient(90deg, #f0f2f3 25%, #e1e4e6 50%, #f0f2f3 75%);
  background-size: 200% 100%;
  animation: pulse 1.6s infinite ease-in-out;
}

@keyframes pulse {
  0% { background-position: 120% 0; }
  100% { background-position: -80% 0; }
}

@media (max-width: 1180px) {
  .kpi-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .revenue-insights-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .insight-item:nth-child(2) {
    border-right: 0;
  }

  .insight-item:nth-child(-n + 2) {
    border-bottom: 1px solid #e7eef0;
  }
}

@media (max-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .main-analytics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .welcome-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
