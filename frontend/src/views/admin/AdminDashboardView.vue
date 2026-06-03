<template>
  <AdminLayout @search="(q) => searchQuery = q">
    <section class="admin-content">
      <div class="welcome-banner">
        <div class="banner-text">
          <span class="page-kicker">Dashboard</span>
          <h2>{{ greeting }}, Admin</h2>
          <p>Monitor revenue, booking movement, providers, and customer growth from one calm workspace.</p>
        </div>
      </div>

      <section class="kpi-grid">
        <article class="kpi-card kpi-card--hero hover-lift">
          <div class="kpi-card__header">
            <div class="kpi-icon-wrapper theme-green">
              <CurrencyDollarIcon aria-hidden="true" />
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
              <ClipboardDocumentListIcon aria-hidden="true" />
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
              <BuildingStorefrontIcon aria-hidden="true" />
            </div>
            <span class="kpi-title">Active Providers</span>
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
              <UserGroupIcon aria-hidden="true" />
            </div>
            <span class="kpi-title">Total Users</span>
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
        <section class="revenue-hero-grid">
          <article class="panel panel--revenue">
            <div class="panel-header-row">
              <div class="panel-title-block">
                <span class="panel-eyebrow">Revenue Overview</span>
                <p>Total paid booking revenue across the current operating period.</p>
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
              <span class="subtext-label">Paid booking performance</span>
            </div>

            <div class="chart-area-container">
              <svg
                v-if="hasRevenueLineChart"
                viewBox="0 0 600 180"
                class="main-svg-chart"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#148A74" stop-opacity="0.18" />
                    <stop offset="100%" stop-color="#148A74" stop-opacity="0.00" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="30" x2="600" y2="30" stroke="#E7EAEE" stroke-width="1" />
                <line x1="0" y1="80" x2="600" y2="80" stroke="#E7EAEE" stroke-width="1" />
                <line x1="0" y1="130" x2="600" y2="130" stroke="#E7EAEE" stroke-width="1" />
                <path :d="chartAreaPath" fill="url(#chartGrad)"></path>
                <path :d="chartLinePath" fill="none" stroke="#148A74" stroke-width="3" stroke-linecap="round"></path>
                <circle 
                  v-for="(pt, idx) in chartPoints" 
                  :key="idx" 
                  :cx="pt.x" 
                  :cy="pt.y" 
                  r="3.5" 
                  fill="#ffffff" 
                  stroke="#148A74" 
                  stroke-width="2.5"
                />
              </svg>

              <div v-else class="ghost-chart" aria-label="Revenue trend preview">
                <div class="ghost-chart__line"></div>
                <div class="ghost-chart__metrics">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>

              <div v-if="hasRevenueLineChart" class="chart-labels-row">
                <span v-for="stat in monthlyStats" :key="stat.month">{{ stat.month }}</span>
              </div>
            </div>

            <div class="revenue-insights-grid">
              <div class="insight-item">
                <span>Highest revenue</span>
                <strong>{{ highestRevenueLabel }}</strong>
              </div>
              <div class="insight-item">
                <span>Average booking value</span>
                <strong>${{ formatNumber(averageBookingValue) }}</strong>
              </div>
              <div class="insight-item">
                <span>Paid bookings</span>
                <strong>{{ formatInteger(stats.paidPaymentCount || stats.totalBookings) }}</strong>
              </div>
            </div>
          </article>
        </section>

        <section class="operations-grid">
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
                    <th>Customer</th>
                    <th>Package</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
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
                  </tr>
                  <tr v-if="!filteredBookings.length">
                    <td colspan="6" class="empty-state-cell">
                      <div class="empty-state-msg">
                        <InboxIcon class="empty-state-icon" aria-hidden="true" />
                        <strong>No recent bookings yet</strong>
                        <p>New booking activity will appear here as customers reserve tours.</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article class="panel panel--status">
            <div class="panel-header-row panel-header-row--compact">
              <h3>Booking Status</h3>
            </div>
            <div class="donut-wrapper">
              <div v-if="hasStatusData" class="donut-chart-box" :style="{ background: donutGradient }">
                <div class="donut-inner-hole">
                  <strong>{{ dominantStatusPercent }}%</strong>
                  <span>{{ dominantStatusLabel }}</span>
                </div>
              </div>

              <div v-else class="status-empty-state">
                <ChartPieIcon class="empty-state-icon" aria-hidden="true" />
                <strong>No status data</strong>
                <p>Status distribution will appear after bookings are recorded.</p>
              </div>
              
              <div class="donut-legend">
                <div v-for="item in compactStatusLegend" :key="item.status" class="legend-item">
                  <span class="indicator-dot" :style="{ background: item.color }"></span>
                  <span class="legend-name">{{ item.label }}</span>
                  <strong class="legend-percent">{{ item.percent }}%</strong>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section class="insight-grid">
          <article class="panel insight-panel">
            <div class="panel-header-row panel-header-row--compact">
              <h3>Provider Insights</h3>
            </div>
            <div class="metric-stack">
              <div class="metric-line">
                <span>Active providers</span>
                <strong>{{ formatInteger(stats.totalProviders) }}</strong>
              </div>
              <div class="metric-line">
                <span>Verified providers</span>
                <strong>{{ formatInteger(stats.verifiedProviders) }}</strong>
              </div>
              <div class="metric-progress">
                <span :style="{ width: `${providerVerificationRate}%` }"></span>
              </div>
            </div>
          </article>

          <article class="panel insight-panel">
            <div class="panel-header-row panel-header-row--compact">
              <h3>User Growth</h3>
            </div>
            <div class="metric-stack">
              <div class="metric-line">
                <span>Total users</span>
                <strong>{{ formatInteger(stats.totalUsers) }}</strong>
              </div>
              <div class="metric-line">
                <span>Bookings per user</span>
                <strong>{{ bookingsPerUser }}</strong>
              </div>
              <div class="mini-bars">
                <span v-for="bar in userGrowthBars" :key="bar" :style="{ height: `${bar}%` }"></span>
              </div>
            </div>
          </article>

          <article class="panel panel--activity">
            <div class="panel-header-row panel-header-row--compact">
              <h3>Recent Activity</h3>
            </div>
            <div class="timeline-list">
              <div v-for="activity in recentActivities" :key="activity.id" class="timeline-item">
                <div class="timeline-icon-box" :class="activity.iconClass">
                  <CheckCircleIcon v-if="activity.icon === 'confirmed'" aria-hidden="true" />
                  <XCircleIcon v-else-if="activity.icon === 'cancelled'" aria-hidden="true" />
                  <ClockIcon v-else aria-hidden="true" />
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
        </section>
      </div>
    </section>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import axios from 'axios'
import {
  BuildingStorefrontIcon,
  ChartPieIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CurrencyDollarIcon,
  InboxIcon,
  UserGroupIcon,
  XCircleIcon,
} from '@heroicons/vue/24/outline'
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
  pending: { label: 'Pending', color: '#C6922F' },
  confirmed: { label: 'Confirmed', color: '#148A74' },
  cancelled: { label: 'Cancelled', color: '#D64545' },
  completed: { label: 'Completed', color: '#3B82F6' },
  refunded: { label: 'Refunded', color: '#98A2B3' },
}

const searchQuery = ref('')
const isLoading = ref(true)
const loadError = ref('')

const stats = ref<DashboardStats>(emptyStats())
const statusBreakdown = ref<Record<BookingStatus, number>>(emptyStatusBreakdown())

const recentBookings = ref<RecentBooking[]>([])
const monthlyStats = ref<MonthlyStat[]>([])
const loadStatsData = async () => {
  try {
    isLoading.value = true
    loadError.value = ''
    const res = await getAdminDashboardSummary()
    const data = res?.success && res?.data ? res.data : res

    if (data && typeof data === 'object') {
      const s = data.stats || {}
      stats.value = {
        totalBookings: Number(s.totalBookings || 0),
        totalRevenue: Number(s.totalRevenue || 0),
        totalProviders: Number(s.totalProviders || 0),
        totalUsers: Number(s.totalUsers || 0),
        totalServices: Number(s.totalServices || 0),
        verifiedProviders: Number(s.verifiedProviders || 0),
        paidPaymentCount: Number(s.paidPaymentCount || 0),
        totalPlatformFee: Number(s.totalPlatformFee || 0),
      }
      statusBreakdown.value = { ...emptyStatusBreakdown(), ...(data.statusBreakdown || {}) }
      recentBookings.value = (data.recentBookings || []).map((b: any) => ({
        id: b.id,
        customerName: b.customerName || b.user?.username || 'Guest',
        customerEmail: b.customerEmail || b.user?.email,
        serviceTitle: b.serviceTitle || b.service?.title,
        providerName: b.providerName || b.provider?.companyName,
        amount: Number(b.amount || b.totalAmount || 0),
        status: (b.status || b.bookingStatus || 'pending').toLowerCase(),
        date: b.date || b.createdAt,
        transactionId: b.transactionId || b.referenceCode || b.id.substring(0, 8).toUpperCase(),
        createdAt: b.createdAt
      }))
      monthlyStats.value = data.monthlyStats || []
    } else {
      throw new Error('The backend returned an invalid dashboard response.')
    }
  } catch (err) {
    console.error("Failed to load SaaS stats dashboard data:", err)
    if (axios.isAxiosError(err)) {
      if (!err.response) {
        loadError.value =
          'Cannot reach the backend. Start it with `npm run start:dev` in the backend folder (http://localhost:3000).'
      } else if (err.response.status === 401) {
        loadError.value =
          'Your session has expired or you are not signed in. Log in again with an admin account.'
      } else if (err.response.status === 403) {
        loadError.value = 'Your account does not have admin access to this dashboard.'
      } else {
        const message = (err.response.data as { message?: string })?.message
        loadError.value = message || `Server error (${err.response.status}).`
      }
    } else {
      loadError.value = 'An unexpected error occurred while loading dashboard data.'
    }
    stats.value = emptyStats()
    statusBreakdown.value = emptyStatusBreakdown()
    recentBookings.value = []
    monthlyStats.value = []
  } finally {
    isLoading.value = false
  }
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

const compactStatusLegend = computed(() => {
  return statusLegend.value
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
})

const dominantStatus = computed(() => {
  return compactStatusLegend.value[0] || {
    label: 'No data',
    percent: 0,
  }
})

const dominantStatusLabel = computed(() => dominantStatus.value.label)
const dominantStatusPercent = computed(() => dominantStatus.value.percent)

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
    icon: booking.status === 'confirmed' ? 'confirmed' : booking.status === 'cancelled' ? 'cancelled' : 'pending',
    iconClass:
      booking.status === 'confirmed'
        ? 'timeline-icon-box--success'
        : booking.status === 'cancelled'
          ? 'timeline-icon-box--danger'
          : 'timeline-icon-box--pending',
    title: `${statusMeta[booking.status]?.label || 'New'} booking`,
    detail: booking.serviceTitle || booking.transactionId || 'Booking activity',
    time: formatRelativeTime(booking.createdAt || booking.date),
  }))
})



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

const highestRevenueLabel = computed(() => {
  const revenueStats = monthlyStats.value.filter((stat) => Number(stat.revenue || 0) > 0)
  if (revenueStats.length > 0) {
    const top = revenueStats.reduce((best, stat) => (stat.revenue > best.revenue ? stat : best), revenueStats[0])
    return `${top.month} · $${formatNumber(top.revenue)}`
  }

  return stats.value.totalRevenue > 0 ? `Current period · $${formatNumber(stats.value.totalRevenue)}` : 'No revenue yet'
})

const averageBookingValue = computed(() => {
  const divisor = Math.max(Number(stats.value.paidPaymentCount || stats.value.totalBookings || 0), 1)
  return stats.value.totalRevenue > 0 ? stats.value.totalRevenue / divisor : 0
})

const providerVerificationRate = computed(() => {
  if (!stats.value.totalProviders) return 0
  return Math.min(100, Math.round((stats.value.verifiedProviders / stats.value.totalProviders) * 100))
})

const bookingsPerUser = computed(() => {
  if (!stats.value.totalUsers) return '0.0'
  return (stats.value.totalBookings / stats.value.totalUsers).toFixed(1)
})

const userGrowthBars = computed(() => {
  const base = Math.max(stats.value.totalUsers, 1)
  return [36, 52, 45, 68, 74, 88].map((value, index) => {
    const lift = Math.min(12, Math.log10(base + index + 1) * 4)
    return Math.min(96, Math.round(value + lift))
  })
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
  }
})

const sparklineAreaPaths = computed(() => {
  return {
    revenue: areaPathFromLine(sparklinePaths.value.revenue),
    bookings: areaPathFromLine(sparklinePaths.value.bookings),
    providers: areaPathFromLine(sparklinePaths.value.providers),
    users: areaPathFromLine(sparklinePaths.value.users),
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
  gap: 22px;
  animation: fade-in-up 420ms ease both;
}

.welcome-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 4px 0 2px;
}

.page-kicker {
  display: block;
  margin-bottom: 10px;
  color: var(--accent-secondary);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.banner-text h2 {
  margin: 0 0 8px;
  font-family: "DM Serif Display", Georgia, serif;
  font-size: 2rem;
  font-weight: 400;
  color: var(--text-primary);
  letter-spacing: 0;
  line-height: 1.05;
}

.banner-text p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.94rem;
}

.datepicker-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-card);
}

.datepicker-dropdown:hover {
  background: #fbfaf7;
  border-color: rgba(198, 146, 47, 0.22);
}

.chevron-down {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.control-icon {
  width: 16px;
  height: 16px;
  color: var(--accent-primary);
}

.kpi-grid {
  display: grid;
  grid-template-columns: minmax(260px, 1.45fr) repeat(3, minmax(170px, 1fr));
  gap: 14px;
}

.kpi-card {
  background: var(--bg-surface);
  border: 1px solid rgba(231, 234, 238, 0.88);
  border-radius: var(--radius-md);
  padding: 18px;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  justify-content: space-between;
}

.kpi-card--hero {
  min-height: 160px;
  background:
    linear-gradient(135deg, rgba(20, 138, 116, 0.08), rgba(198, 146, 47, 0.08)),
    var(--bg-surface);
}

.kpi-card--hero .kpi-value {
  font-size: 2.45rem;
}

.dashboard-body {
  display: grid;
  gap: 18px;
}

.kpi-card:hover {
  border-color: rgba(20, 138, 116, 0.22);
  box-shadow: var(--shadow-elevated);
  transform: translateY(-2px);
}

.kpi-card__header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.kpi-title {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.kpi-icon-wrapper {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.kpi-icon-wrapper svg {
  width: 17px;
  height: 17px;
  stroke-width: 2;
}

.theme-green { background: rgba(20, 138, 116, 0.1); color: var(--accent-primary); font-weight: bold; }
.theme-blue { background: rgba(59, 130, 246, 0.1); color: var(--accent-info); }
.theme-purple { background: var(--bg-elevated); color: var(--sidebar-bg-secondary); }
.theme-orange { background: rgba(198, 146, 47, 0.12); color: var(--accent-secondary); }

.kpi-value {
  font-family: "DM Serif Display", Georgia, serif;
  font-size: 1.8rem;
  font-weight: 400;
  color: var(--text-primary);
  letter-spacing: 0;
  margin-bottom: 4px;
  line-height: 1.1;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  min-height: 17px;
  white-space: nowrap;
}

.trend-up span {
  color: var(--accent-primary);
  font-weight: 700;
}

.trend-up small {
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
}

.trend-neutral span {
  color: var(--text-secondary);
  font-weight: 700;
}

.trend-neutral small {
  color: var(--text-muted);
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

.stroke-green .sparkline-area { fill: var(--accent-primary); }
.stroke-blue .sparkline-area { fill: var(--accent-info); }
.stroke-purple .sparkline-area { fill: var(--sidebar-bg-secondary); }
.stroke-orange .sparkline-area { fill: var(--accent-secondary); }

.stroke-green path { stroke: var(--accent-primary); }
.stroke-blue path { stroke: var(--accent-info); }
.stroke-purple path { stroke: var(--sidebar-bg-secondary); }
.stroke-orange path { stroke: var(--accent-secondary); }

.revenue-hero-grid {
  display: grid;
  gap: 18px;
}

.operations-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.58fr);
  gap: 18px;
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.panel {
  background: var(--bg-surface);
  border: 1px solid rgba(231, 234, 238, 0.9);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-card);
}

.error-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.error-panel h3 {
  margin: 0;
  color: var(--text-primary);
}

.error-panel p {
  margin: 0;
  color: var(--text-secondary);
}

.retry-button {
  border: none;
  border-radius: var(--radius-sm);
  background: var(--accent-primary);
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
  padding: 10px 14px;
}

.retry-button:hover {
  background: var(--accent-primary-hover);
}

.panel-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.panel-title-block h3,
.panel--bookings h3,
.panel--status h3,
.panel--health h3,
.panel--activity h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 750;
  color: var(--text-primary);
}

.panel-eyebrow {
  font-size: 1.05rem;
  font-weight: 750;
  color: var(--text-primary);
  display: block;
}

.panel-title-block p {
  margin-top: 6px;
  color: var(--text-secondary);
  font-size: 0.86rem;
}

.panel-header-row--compact {
  margin-bottom: 10px;
}

.panel-controls {
  display: flex;
  gap: 8px;
}

.segmented-dropdown {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 12px;
  background: #fbfaf7;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
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
  font-family: "DM Serif Display", Georgia, serif;
  font-size: 2.75rem;
  font-weight: 400;
  color: var(--text-primary);
  letter-spacing: 0;
}

.trend-badge-pill {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
}

.green-badge {
  background: rgba(20, 138, 116, 0.1);
  color: var(--accent-primary);
}

.subtext-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.chart-area-container {
  width: 100%;
  margin-top: 4px;
  min-height: 280px;
  padding: 14px 14px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: linear-gradient(180deg, #ffffff 0%, #fbfaf7 100%);
  box-sizing: border-box;
}

.chart-area-container--empty {
  display: grid;
  place-items: center;
}

.main-svg-chart {
  width: 100%;
  height: 230px;
  overflow: visible;
  display: block;
}

.ghost-chart {
  position: relative;
  min-height: 230px;
  overflow: hidden;
  border-radius: var(--radius-md);
  background:
    linear-gradient(180deg, rgba(20, 138, 116, 0.1), rgba(20, 138, 116, 0)),
    repeating-linear-gradient(0deg, transparent 0 54px, rgba(231, 234, 238, 0.9) 55px 56px);
}

.ghost-chart__line {
  position: absolute;
  inset: 34px 20px 48px;
  border-bottom: 3px solid rgba(20, 138, 116, 0.28);
  border-radius: 50%;
  transform: skewY(-7deg);
}

.ghost-chart__metrics {
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 18px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.ghost-chart__metrics span {
  height: 8px;
  border-radius: 999px;
  background: rgba(152, 162, 179, 0.22);
}

.chart-labels-row {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}

.chart-labels-row span {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
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
  color: var(--text-secondary);
}

.summary-bar__meta strong {
  color: var(--text-primary);
  font-size: 0.82rem;
}

.summary-bar__track {
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--bg-elevated);
}

.summary-bar__track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--accent-primary);
}

.chart-empty-state,
.status-empty-state {
  display: grid;
  justify-items: center;
  gap: 7px;
  text-align: center;
  color: var(--text-secondary);
}

.empty-state-icon {
  width: 30px;
  height: 30px;
  padding: 7px;
  border-radius: var(--radius-sm);
  background: rgba(20, 138, 116, 0.1);
  color: var(--accent-primary);
  box-sizing: content-box;
}

.chart-empty-state strong,
.status-empty-state strong {
  color: var(--text-primary);
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  margin-top: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-surface);
}

.insight-item {
  display: grid;
  gap: 5px;
  padding: 12px;
  border-right: 1px solid var(--border);
}

.insight-item:last-child {
  border-right: 0;
}

.insight-item span {
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.insight-item strong {
  min-width: 0;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 0.86rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.view-all-link {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent-primary);
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
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.saas-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.saas-table th {
  padding: 10px 12px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border);
  background: #fbfaf7;
}

.saas-table td {
  padding: 11px 12px;
  font-size: 0.84rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border);
  background: var(--bg-surface);
}

.saas-table tr:last-child td {
  border-bottom: none;
}

.saas-table tr:hover td {
  background: #fbfaf7;
}

.booking-id-text {
  font-family: monospace;
  font-weight: 600;
  color: var(--text-secondary);
}

.client-name {
  font-weight: 600;
  color: var(--text-primary);
}

.tour-title {
  color: var(--text-secondary);
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  font-weight: 500;
}

.row-date {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.row-amount {
  font-weight: 700;
  color: var(--text-primary);
}

.badge-saas {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: capitalize;
}

.badge-saas--confirmed { background: rgba(20, 138, 116, 0.1); color: var(--accent-primary); }
.badge-saas--pending { background: rgba(198, 146, 47, 0.12); color: var(--accent-secondary); }
.badge-saas--cancelled { background: rgba(214, 69, 69, 0.1); color: var(--accent-danger); }
.badge-saas--completed { background: rgba(59, 130, 246, 0.1); color: var(--accent-info); }
.badge-saas--refunded { background: var(--bg-elevated); color: var(--text-secondary); }

.empty-state-cell {
  text-align: center;
  padding: 24px 12px !important;
}

.empty-state-msg {
  display: grid;
  justify-items: center;
  gap: 7px;
}

.empty-state-msg strong {
  color: var(--text-primary);
  font-size: 0.86rem;
}

.empty-state-msg p {
  max-width: 320px;
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.78rem;
}

.panel--status h3 {
  margin: 0;
}

.donut-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.donut-chart-box {
  width: 136px;
  height: 136px;
  border-radius: 50%;
  position: relative;
  display: flex;
  place-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(18, 43, 45, 0.04);
}

.donut-inner-hole {
  width: 88px;
  height: 88px;
  background: var(--bg-surface);
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px var(--border);
  display: grid;
  place-items: center;
  align-content: center;
  gap: 2px;
  text-align: center;
}

.donut-inner-hole strong {
  font-family: "DM Serif Display", Georgia, serif;
  font-size: 1.75rem;
  font-weight: 400;
  color: var(--text-primary);
  line-height: 1;
}

.donut-inner-hole span {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.donut-legend {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.legend-item {
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  min-height: 24px;
}

.metric-stack {
  display: grid;
  gap: 14px;
  margin-top: 8px;
}

.metric-line {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: baseline;
}

.metric-line span {
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.metric-line strong {
  font-family: "DM Serif Display", Georgia, serif;
  color: var(--text-primary);
  font-size: 1.65rem;
  font-weight: 400;
}

.metric-progress {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--bg-elevated);
}

.metric-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
}

.mini-bars {
  height: 72px;
  display: flex;
  align-items: end;
  gap: 8px;
  padding-top: 8px;
}

.mini-bars span {
  flex: 1;
  min-height: 16px;
  border-radius: 999px 999px 6px 6px;
  background: linear-gradient(180deg, rgba(20, 138, 116, 0.62), rgba(20, 138, 116, 0.16));
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.legend-name {
  font-size: 0.78rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.legend-percent {
  color: var(--text-primary);
  font-weight: 700;
  font-size: 0.74rem;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 14px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.timeline-icon-box {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.timeline-icon-box svg {
  width: 17px;
  height: 17px;
}

.timeline-icon-box--success { background: rgba(20, 138, 116, 0.1); color: var(--accent-primary); }
.timeline-icon-box--pending { background: rgba(198, 146, 47, 0.12); color: var(--accent-secondary); }
.timeline-icon-box--danger { background: rgba(214, 69, 69, 0.1); color: var(--accent-danger); }

.timeline-body p {
  margin: 0 0 2px;
  font-size: 0.84rem;
  color: var(--text-primary);
  font-weight: 600;
}

.timeline-body span {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.empty-activity {
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  padding: 10px;
  text-align: center;
  color: var(--text-secondary);
  background: #fbfaf7;
  font-size: 0.82rem;
}

.skeleton-container {
  display: flex;
  flex-direction: column;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: 1.76fr 0.72fr;
  gap: 16px;
}

.skeleton-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .kpi-card--hero {
    grid-column: 1 / -1;
  }

  .revenue-insights-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .operations-grid,
  .insight-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .skeleton-grid {
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

  .revenue-insights-grid {
    grid-template-columns: 1fr;
  }

  .insight-item {
    border-right: 0;
    border-bottom: 1px solid #e7eef0;
  }

  .insight-item:last-child {
    border-bottom: 0;
  }

  .panel-header-row,
  .revenue-metric-row {
    align-items: flex-start;
  }

  .panel-header-row {
    flex-direction: column;
  }

}
</style>
