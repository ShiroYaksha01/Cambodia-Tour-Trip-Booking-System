<template>
  <AdminLayout breadcrumb="Management / Analytics" @search="(q) => searchQuery = q">
    <section class="admin-content">
      <div class="page-heading">
        <div class="heading-group">
          <p class="eyebrow">Business Intelligence</p>
          <h1>Platform Analytics</h1>
          <p class="page-description">
            Deep dive into customer demographics, popular destinations, and conversion metrics.
          </p>
        </div>
        
        <div class="toolbar-actions">
          <select v-model="timeframe" class="styled-select">
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last Quarter</option>
            <option value="365">This Year</option>
          </select>
          <button class="primary-button" @click="exportData">Export CSV</button>
        </div>
      </div>

      <div class="analytics-grid">
        <!-- Top row: Metric summary -->
        <article class="metric-card">
          <div class="metric-head">
            <h3>Conversion Rate</h3>
            <span class="badge positive">+2.4%</span>
          </div>
          <div class="metric-body">
            <h2>{{ metrics.conversionRate }}%</h2>
            <p>From search to successful booking</p>
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-head">
            <h3>Avg. Booking Value</h3>
            <span class="badge positive">+12%</span>
          </div>
          <div class="metric-body">
            <h2>${{ metrics.avgBookingValue }}</h2>
            <p>Per confirmed transaction</p>
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-head">
            <h3>Cancellation Rate</h3>
            <span class="badge negative">+1.1%</span>
          </div>
          <div class="metric-body">
            <h2>{{ metrics.cancellationRate }}%</h2>
            <p>Percentage of refunded bookings</p>
          </div>
        </article>
      </div>

      <div class="charts-grid">
        <!-- Large Chart -->
        <article class="panel full-width">
          <header class="panel-header">
            <h3>User Growth & Acquisition</h3>
            <p>New registrations vs. active users over time.</p>
          </header>
          <div class="chart-placeholder">
            <div v-if="loading" style="text-align: center; color: #6B7280; padding: 40px;">Loading data...</div>
            <div v-else class="bar-chart">
              <div v-for="n in 12" :key="n" class="bar-group">
                <div class="bar bar-primary" :style="{ height: `${Math.random() * 80 + 20}%` }"></div>
                <div class="bar bar-secondary" :style="{ height: `${Math.random() * 60 + 10}%` }"></div>
              </div>
            </div>
            <div class="chart-x-axis" v-if="!loading">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
              <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>
        </article>

        <!-- Half Charts -->
        <article class="panel">
          <header class="panel-header">
            <h3>Top Destinations</h3>
            <p>Most popular service locations.</p>
          </header>
          <div v-if="loading" style="text-align: center; color: #6B7280; padding: 40px;">Loading data...</div>
          <div v-else-if="topDestinations.length === 0" style="text-align: center; color: #6B7280; padding: 40px;">No destinations found in this period.</div>
          <div v-else class="list-chart">
            <div class="list-item" v-for="(dest, idx) in topDestinations" :key="idx">
              <div class="list-info">
                <strong>{{ dest.name }}</strong>
                <span>{{ dest.bookings }} bookings</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: `${dest.percent}%` }"></div>
              </div>
            </div>
          </div>
        </article>

        <article class="panel">
          <header class="panel-header">
            <h3>Booking by Category</h3>
            <p>Distribution of service types.</p>
          </header>
          <div v-if="loading" style="text-align: center; color: #6B7280; padding: 40px;">Loading data...</div>
          <div v-else-if="categories.length === 0" style="text-align: center; color: #6B7280; padding: 40px;">No categories found in this period.</div>
          <div v-else class="donut-chart-mock">
            <div class="donut-circle">
              <div class="donut-inner">
                <strong>100%</strong>
                <span>Total</span>
              </div>
            </div>
            <div class="donut-legend">
              <div class="legend-item" v-for="(cat, idx) in categories" :key="cat.type">
                <span :class="'dot color-' + (idx % 4 + 1)"></span> 
                <span style="text-transform: capitalize;">{{ cat.type }} ({{ cat.percent }}%)</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminLayout from '../../components/admin/AdminLayout.vue'

const searchQuery = ref('')
const timeframe = ref('30')
const loading = ref(false)

const metrics = ref({
  conversionRate: 3.2,
  avgBookingValue: 145,
  cancellationRate: 1.8
})

const categories = ref([
  { type: 'Tours', percent: 45 },
  { type: 'Hotels', percent: 30 },
  { type: 'Transport', percent: 15 },
  { type: 'Other', percent: 10 },
])

const topDestinations = ref([
  { name: 'Siem Reap', bookings: 1240, percent: 85 },
  { name: 'Phnom Penh', bookings: 890, percent: 60 },
  { name: 'Kampot', bookings: 420, percent: 35 },
  { name: 'Koh Rong', bookings: 310, percent: 25 },
  { name: 'Battambang', bookings: 180, percent: 15 },
])

const exportData = () => {
  alert('Exporting analytics report as CSV...')
}
</script>

<style scoped>
.admin-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 24px;
  gap: 20px;
}

.heading-group h1 {
  margin: 6px 0 8px;
  font-size: 1.8rem;
  color: #111827;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.eyebrow {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #148A74;
  font-weight: 700;
  margin: 0;
}

.page-description {
  color: #6B7280;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
  max-width: 600px;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.styled-select {
  height: 40px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  background: #ffffff;
  font-size: 0.85rem;
  outline: none;
  cursor: pointer;
  color: #111827;
  font-weight: 600;
  font-family: inherit;
}

.styled-select:focus {
  border-color: #148A74;
}

.primary-button {
  background: #148A74;
  color: #ffffff;
  border: none;
  padding: 0 20px;
  height: 40px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.primary-button:hover {
  background: #0f6e5c;
}

/* Analytics Grid */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.metric-card {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}

.metric-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.metric-head h3 {
  margin: 0;
  font-size: 0.85rem;
  color: #6B7280;
  font-weight: 600;
}

.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.badge.positive {
  background: rgba(20, 138, 116, 0.1);
  color: #148A74;
}

.badge.negative {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.metric-body h2 {
  margin: 0 0 4px;
  font-size: 2rem;
  color: #111827;
  font-weight: 700;
}

.metric-body p {
  margin: 0;
  font-size: 0.8rem;
  color: #9CA3AF;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.panel {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}

.panel.full-width {
  grid-column: span 2;
}

.panel-header {
  margin-bottom: 24px;
}

.panel-header h3 {
  margin: 0 0 4px;
  font-size: 1.1rem;
  color: #111827;
  font-weight: 700;
}

.panel-header p {
  margin: 0;
  font-size: 0.85rem;
  color: #6B7280;
}

/* Chart Mocks */
.chart-placeholder {
  height: 280px;
  display: flex;
  flex-direction: column;
}

.bar-chart {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 10px;
  border-bottom: 1px solid #E5E7EB;
}

.bar-group {
  display: flex;
  gap: 4px;
  height: 100%;
  align-items: flex-end;
  width: 24px;
}

.bar {
  flex: 1;
  border-radius: 4px 4px 0 0;
}

.bar-primary { background: #148A74; }
.bar-secondary { background: rgba(20, 138, 116, 0.2); }

.chart-x-axis {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px 0;
  font-size: 0.75rem;
  color: #9CA3AF;
  font-weight: 600;
}

.list-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.list-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.list-info strong {
  color: #111827;
}

.list-info span {
  color: #6B7280;
}

.progress-track {
  height: 8px;
  background: #F3F4F6;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #148A74;
  border-radius: 999px;
}

.donut-chart-mock {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 20px 0;
}

.donut-circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: conic-gradient(#148A74 0% 45%, #F59E0B 45% 75%, #3B82F6 75% 90%, #E5E7EB 90% 100%);
  display: grid;
  place-items: center;
}

.donut-inner {
  width: 100px;
  height: 100px;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.donut-inner strong {
  font-size: 1.4rem;
  color: #111827;
}

.donut-inner span {
  font-size: 0.75rem;
  color: #6B7280;
}

.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #4B5563;
  font-weight: 500;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.color-1 { background: #148A74; }
.color-2 { background: #F59E0B; }
.color-3 { background: #3B82F6; }
.color-4 { background: #E5E7EB; }

@media (max-width: 1024px) {
  .analytics-grid { grid-template-columns: 1fr; }
  .charts-grid { grid-template-columns: 1fr; }
  .panel.full-width { grid-column: span 1; }
  .donut-chart-mock { flex-direction: column; }
}
</style>
