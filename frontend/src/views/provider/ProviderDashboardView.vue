<template>
  <main class="provider-shell">
    <DashboardSidebar role="provider" />

    <section class="provider-content">
      <header class="topbar">
        <div class="topbar__left">
          <h1>Inventory & Pricing</h1>
          <span class="sync-pill">⟳ Syncing: All OTAs</span>
        </div>

        <div class="provider-profile">
          <button class="icon-button" type="button" aria-label="Notifications">🔔</button>
          <div class="provider-profile__text">
            <strong>The Heritage Curator</strong>
            <span>Master Admin</span>
          </div>
          <div class="provider-avatar">AT</div>          <LogoutButton />        </div>
      </header>

      <section class="earnings-panel">
        <div class="panel-header">
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

      <section class="summary-grid" id="overview">
        <article class="summary-card summary-card--teal">
          <span>AVG. OCCUPANCY</span>
          <strong>{{ stats.avgOccupancy }}</strong>
          <small>Real-time calculation</small>
        </article>
        <article class="summary-card summary-card--gold">
          <span>REVPAR</span>
          <strong>{{ stats.revpar }}</strong>
          <small>Total Rev / Capacity</small>
        </article>
        <article class="summary-card summary-card--red">
          <span>LOW STOCK ALERTS</span>
          <strong>{{ stats.lowStockAlerts }}</strong>
          <small>Action required</small>
        </article>
        <article class="summary-card summary-card--forest">
          <span>KHMER NEW YEAR</span>
          <strong>{{ stats.khmerNewYear }}</strong>
          <small>Peak Demand Season</small>
        </article>
      </section>

      <section class="workspace-grid">
        <article class="matrix-panel" id="matrix">
          <div class="matrix-toolbar">
            <button type="button" class="date-nav">‹</button>
            <h2>{{ currentMonth }} {{ currentYear }}</h2>
            <button type="button" class="date-nav">›</button>

            <div class="matrix-toggle">
              <button type="button" @click="openCreateModal" class="add-service-btn">+ Add Service</button>
              <button type="button">Month</button>
              <button type="button" class="matrix-toggle__active">Fortnight</button>
            </div>
          </div>

          <div class="pricing-table">
            <div class="pricing-table__head">
              <span>Product / Service</span>
              <span v-for="day in displayDays" :key="day">{{ day }}</span>
              <span>Actions</span>
            </div>

            <div v-if="loading" class="pricing-row">
              <div style="grid-column: span 8; text-align: center; padding: 20px;">
                Loading inventory...
              </div>
            </div>

            <div v-for="item in inventory" :key="item.id" class="pricing-row">
              <div>
                <strong>{{ item.title }}</strong>
                <small>{{ item.description }}</small>
              </div>
              <template v-if="!item.isClosed">
                <span v-for="i in 6" :key="i" :class="slotClass(item.remaining, item.total)">
                  {{ item.remaining }} left<br />
                  <small>${{ item.price }}</small>
                </span>
              </template>
              <template v-else>
                <span v-for="i in 6" :key="i" class="slot slot--closed">
                  CLOSED<br />
                  <small>${{ item.price }}</small>
                </span>
              </template>
              <div class="actions-cell">
                <button class="action-btn edit" @click="openEditModal(item)">✎</button>
                <button class="action-btn delete" @click="handleDelete(item.id)">✕</button>
              </div>
            </div>
          </div>

          <div class="legend-row">
            <div class="legend-item"><span class="dot dot--teal"></span>Available</div>
            <div class="legend-item"><span class="dot dot--red"></span>Low Stock (&lt;10%)</div>
            <div class="legend-item"><span class="dot dot--gold"></span>Peak Demand</div>
            <a href="#changes">Export Matrix</a>
          </div>
        </article>

        <aside class="side-rail">
          <article class="panel-card" id="pricing">
            <div class="card-header">
              <span class="card-icon">⌘</span>
              <h3>Pricing Engine</h3>
            </div>

            <label class="field">
              <span>RULE TYPE</span>
              <select>
                <option>Add % Markup</option>
                <option>Flat Rate</option>
                <option>Dynamic Demand</option>
              </select>
            </label>

            <label class="field">
              <span>VALUE</span>
              <div class="value-box">% <strong>25</strong></div>
            </label>

            <label class="switch-row">
              <span>AUTO-APPLY LOGIC</span>
              <div class="switch"><span class="switch__knob"></span></div>
              <small>Apply only when stock &lt; 20%</small>
            </label>

            <button type="button" class="primary-button">Update Market Prices</button>
          </article>

          <article class="panel-card" id="controller">
            <div class="card-header card-header--soft">
              <span class="card-icon card-icon--soft">▣</span>
              <h3>Inventory Controller</h3>
            </div>

            <div class="notice-box">
              <strong>KH New Year Focus</strong>
              <p>Apr 13-16 is designated as a high-demand peak period.</p>
            </div>

            <div class="date-grid">
              <label class="field">
                <span>START DATE</span>
                <input type="text" value="04/13/2024" />
              </label>
              <label class="field">
                <span>END DATE</span>
                <input type="text" value="04/16/2024" />
              </label>
            </div>

            <label class="field">
              <span>MAX PAX / DAILY LIMIT</span>
              <input type="text" value="15" />
            </label>

            <small class="helper-text">*Auto-close triggers at 100% occupancy.</small>

            <button type="button" class="outline-button">Batch Process Dates</button>
          </article>

          <article class="panel-card" id="changes">
            <span class="section-kicker">RECENT CHANGES</span>
            <div class="change-item">
              <span class="change-dot change-dot--teal"></span>
              <div>
                <strong>Price Override Applied</strong>
                <small>Angkor Premium · Apr 14-15</small>
              </div>
            </div>
            <div class="change-item">
              <span class="change-dot change-dot--gold"></span>
              <div>
                <strong>Auto-Close Triggered</strong>
                <small>Cooking Class · Apr 12</small>
              </div>
            </div>
          </article>
        </aside>
      </section>
    </section>
  </main>

  <ServiceModal 
    :show="showModal" 
    :service="selectedService" 
    @close="showModal = false" 
    @save="handleSaveService" 
  />
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar.vue'
import LogoutButton from '../../components/LogoutButton.vue'
import ServiceModal from '../../components/provider/ServiceModal.vue'
import { 
  getProviderDashboardStats, 
  getProviderInventoryMatrix,
  getProviderBookings,
  createService,
  updateService,
  deleteService
} from '../../services/api'

const loading = ref(true)
const showModal = ref(false)
const selectedService = ref<any>(null)

const stats = ref({
  avgOccupancy: '0%',
  revpar: '$0.00',
  lowStockAlerts: '00',
  khmerNewYear: '0%',
})

const inventory = ref<any[]>([])
const bookings = ref<any[]>([])

const currentMonth = 'May'
const currentYear = '2026'
const displayDays = ['TUE 19', 'WED 20', 'THU 21', 'FRI 22', 'SAT 23', 'SUN 24']

async function fetchData() {
  loading.value = true
  try {
    const [statsRes, matrixRes, bookingsRes] = await Promise.all([
      getProviderDashboardStats(),
      getProviderInventoryMatrix(),
      getProviderBookings()
    ])
    stats.value = statsRes.data
    inventory.value = matrixRes.data
    bookings.value = Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data?.bookings ?? []
  } catch (error) {
    console.error('Failed to fetch provider dashboard data:', error)
  } finally {
    loading.value = false
  }
}

function bookingAmount(booking: any) {
  const rawValue = booking.amount ?? booking.total_amount ?? booking.price
  const numericValue = typeof rawValue === 'string' ? Number(rawValue) : rawValue
  return Number.isFinite(numericValue as number) ? Number(numericValue) : 0
}

function normalizedStatus(booking: any) {
  return String(booking.payment_status ?? booking.status ?? '').trim().toLowerCase()
}

function isPaid(booking: any) {
  const value = normalizedStatus(booking)
  return value === 'paid' || value === 'released' || value === 'success'
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

const earnings = computed(() => {
  const totalRevenue = bookings.value.filter((booking) => isPaid(booking)).reduce((total, booking) => total + bookingAmount(booking), 0)
  const platformCommission = totalRevenue * 0.1
  const payoutBalance = totalRevenue - platformCommission

  return {
    totalRevenue,
    platformCommission,
    payoutBalance,
  }
})

function openCreateModal() {
  selectedService.value = null
  showModal.value = true
}

function openEditModal(service: any) {
  selectedService.value = service
  showModal.value = true
}

function cleanServicePayload(formData: any) {
  const payload: any = {}
  
  // Whitelist of fields from CreateServiceDto/UpdateServiceDto
  const allowedFields = [
    'serviceType', 'title', 'description', 'price', 'isActive', 
    'image', 'location', 'rating', 'duration', 'totalCapacity',
    'numDays', 'maxPeople', 'travelDate', 'endDate', 
    'departurePoint', 'destination', 'includesAccommodation', 
    'includesTransportation', 'includesMeals',
    'hotelName', 'address', 'starRating', 'roomType', 
    'totalRooms', 'checkInTime', 'checkOutTime',
    'transportType', 'vehicleModel', 'totalSeats', 
    'departureTime', 'arrivalTime', 'pickupNotes'
  ]

  allowedFields.forEach(field => {
    const value = formData[field]
    if (value !== undefined && value !== null && value !== '') {
      // Convert numeric fields
      if ([
        'price', 'rating', 'totalCapacity', 'numDays', 'maxPeople', 
        'starRating', 'totalRooms', 'totalSeats'
      ].includes(field)) {
        payload[field] = Number(value)
      } 
      // Convert boolean fields
      else if ([
        'isActive', 'includesAccommodation', 'includesTransportation', 'includesMeals'
      ].includes(field)) {
        payload[field] = Boolean(value)
      }
      else {
        payload[field] = value
      }
    }
  })

  return payload
}

async function handleSaveService(formData: any) {
  try {
    const payload = cleanServicePayload(formData)
    if (selectedService.value && selectedService.value.id.length > 5) {
      await updateService(selectedService.value.id, payload)
    } else {
      await createService(payload)
    }
    showModal.value = false
    await fetchData()
  } catch (error) {
    console.error('Save failed:', error)
    alert('Failed to save service. Check console for details.')
  }
}

async function handleDelete(id: string) {
  if (id.length < 5) {
    alert('Mock services cannot be deleted')
    return
  }
  if (confirm('Are you sure you want to delete this service?')) {
    try {
      await deleteService(id)
      await fetchData()
    } catch (error) {
      alert('Failed to delete service')
    }
  }
}

function slotClass(remaining: number, total: number) {
  if (total === 0) return 'slot slot--closed'
  const ratio = remaining / total
  if (ratio < 0.1) return 'slot slot--red'
  if (ratio < 0.3) return 'slot slot--gold'
  return 'slot slot--teal'
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.provider-shell {
  height: 100vh;
  display: grid;
  grid-template-columns: 245px minmax(0, 1fr);
  background: #202020;
  box-sizing: border-box;
  overflow: hidden;
}

.provider-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  background: linear-gradient(180deg, #f7f7f6 0%, #f9faf9 100%);
  overflow-y: auto;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 8px;
}

.topbar__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar h1 {
  margin: 0;
  color: #143b3f;
  font-size: 1.3rem;
  font-weight: 800;
}

.sync-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 999px;
  background: #f0f2f1;
  color: #606f6b;
  font-size: 0.65rem;
}

.provider-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-button {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 999px;
  background: transparent;
}

.provider-profile__text strong,
.provider-profile__text span {
  display: block;
  line-height: 1.1;
}

.provider-profile__text strong {
  color: #173f42;
  font-size: 0.78rem;
}

.provider-profile__text span {
  color: #73827d;
  font-size: 0.64rem;
}

.provider-avatar {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0f6e70, #efb34f);
  color: #fff;
  font-size: 0.64rem;
  font-weight: 800;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.summary-card {
  padding: 12px 14px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(20, 31, 31, 0.07);
  border-top: 3px solid transparent;
}

.summary-card span {
  display: block;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  color: #7f8b88;
}

.summary-card strong {
  display: block;
  margin-top: 6px;
  color: #173f42;
  font-size: 1.5rem;
  line-height: 1;
}

.summary-card small {
  display: block;
  margin-top: 4px;
  color: #6c7b77;
  font-size: 0.72rem;
}

.summary-card--teal { border-top-color: #1b8d90; }
.summary-card--gold { border-top-color: #c68a22; }
.summary-card--red { border-top-color: #e03a3a; }
.summary-card--forest { border-top-color: #4a7a65; }

.earnings-panel {
  display: grid;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(20, 31, 31, 0.07);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-header h2 {
  margin: 2px 0 0;
  color: #173f42;
  font-size: 1rem;
  font-weight: 800;
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

.earnings-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.earnings-card {
  padding: 12px 14px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #eef1f0;
  border-top: 3px solid transparent;
}

.earnings-card span {
  display: block;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  color: #7f8b88;
  text-transform: uppercase;
}

.earnings-card strong {
  display: block;
  margin-top: 6px;
  color: #173f42;
  font-size: 1.4rem;
  line-height: 1;
}

.earnings-card small {
  display: block;
  margin-top: 4px;
  color: #6c7b77;
  font-size: 0.72rem;
}

.earnings-card--teal { border-top-color: #1b8d90; }
.earnings-card--gold { border-top-color: #c68a22; }
.earnings-card--forest { border-top-color: #4a7a65; }

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) 284px;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.matrix-panel {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 12px 28px rgba(20, 31, 31, 0.07);
  display: flex;
  flex-direction: column;
}

.matrix-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0 10px;
}

.matrix-toolbar h2 {
  margin: 0;
  color: #2c4042;
  font-size: 1rem;
  font-weight: 700;
}

.date-nav {
  border: 0;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #f2f4f3;
  color: #556866;
  font-size: 0.8rem;
}

.matrix-toggle {
  margin-left: auto;
  display: inline-flex;
  gap: 4px;
  padding: 3px;
  background: #f0f0f0;
  border-radius: 6px;
}

.matrix-toggle button {
  border: 0;
  background: transparent;
  padding: 4px 8px;
  border-radius: 4px;
  color: #5f6f6d;
  font-size: 0.68rem;
}

.add-service-btn {
  background: #0f6e70 !important;
  color: #fff !important;
  font-weight: 700;
  margin-right: 8px;
  cursor: pointer;
}

.matrix-toggle__active {
  background: #0f6e70 !important;
  color: #fff !important;
}

.pricing-table {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #edf0ef;
  flex: 1;
  overflow-y: auto;
}

.pricing-table__head,
.pricing-row {
  display: grid;
  grid-template-columns: 1.6fr repeat(6, 1fr) 80px;
}

.pricing-table__head {
  background: #fafafa;
  border-bottom: 1px solid #eef0ef;
  position: sticky;
  top: 0;
  z-index: 10;
}

.pricing-table__head span {
  padding: 8px;
  font-size: 0.6rem;
  font-weight: 800;
  color: #5c6d6a;
  text-align: center;
}

.pricing-table__head span:first-child {
  text-align: left;
}

.pricing-row {
  border-bottom: 1px solid #f0f1f0;
}

.pricing-row:last-child {
  border-bottom: 0;
}

.pricing-row > div {
  padding: 10px 12px;
}

.pricing-row > div strong {
  display: block;
  color: #1b3031;
  font-size: 0.82rem;
}

.pricing-row > div small {
  display: block;
  margin-top: 3px;
  color: #7b8b88;
  font-size: 0.7rem;
}

.actions-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #eee;
  background: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.action-btn.edit:hover {
  background: #eaf3f4;
  color: #0f6e70;
  border-color: #0f6e70;
}

.action-btn.delete:hover {
  background: #fff3f3;
  color: #c94f4f;
  border-color: #c94f4f;
}

.slot {
  padding: 8px 6px;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: #1e5457;
  border-left: 1px solid #f2f4f3;
}

.slot small {
  display: block;
  margin-top: 2px;
  color: #6c7b77;
  font-size: 0.68rem;
}

.slot--teal { color: #1e6567; }
.slot--gold { background: #fff8ef; color: #a46a00; }
.slot--red { background: #fff3f3; color: #c94f4f; }
.slot--closed { color: #9ea8a6; background: #f7f8f7; }

.legend-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 4px 0;
  color: #60706d;
  font-size: 0.7rem;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-row a {
  margin-left: auto;
  color: #1d7777;
  text-decoration: none;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
}

.dot--teal { background: #1b8d90; }
.dot--red { background: #df4c4c; }
.dot--gold { background: #efb34f; }

.side-rail {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  overflow-x: hidden;
}

.panel-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 12px 28px rgba(20, 31, 31, 0.07);
  box-sizing: border-box;
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.card-header h3 {
  margin: 0;
  color: #263f41;
  font-size: 0.9rem;
}

.card-icon {
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  border-radius: 4px;
  background: #f4f0dc;
  color: #b08724;
  font-size: 0.7rem;
}

.card-icon--soft {
  background: #eaf3f4;
  color: #4f8b8f;
}

.field {
  display: grid;
  gap: 4px;
  margin-top: 8px;
  width: 100%;
  box-sizing: border-box;
}

.field span,
.section-kicker {
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  color: #7a8784;
}

.field select,
.field input,
.value-box {
  width: 100%;
  box-sizing: border-box;
  min-height: 32px;
  border: 1px solid #edf0ef;
  border-radius: 4px;
  background: #f7f8f8;
  padding: 0 8px;
  font: inherit;
  color: #345054;
  font-size: 0.8rem;
}

.value-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.value-box strong {
  font-size: 0.95rem;
  color: #3a4648;
}

.switch-row {
  display: grid;
  gap: 6px;
  margin-top: 8px;
}

.switch-row small,
.helper-text,
.notice-box p,
.change-item small {
  color: #778784;
  font-size: 0.68rem;
}

.switch {
  width: 36px;
  height: 18px;
  border-radius: 999px;
  background: #1b8d90;
  position: relative;
}

.switch__knob {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: #fff;
  position: absolute;
  top: 2px;
  right: 2px;
}

.primary-button,
.outline-button {
  width: 100%;
  min-height: 34px;
  margin-top: 10px;
  border: 0;
  border-radius: 3px;
  font: inherit;
  font-weight: 700;
  font-size: 0.8rem;
}

.primary-button {
  background: #f4a51c;
  color: #fff;
}

.outline-button {
  background: #fff;
  color: #0f6e70;
  border: 1px solid #0f6e70;
}

.notice-box {
  padding: 10px;
  border-left: 3px solid #e9b25e;
  background: #fbf4e8;
  border-radius: 4px;
  margin: 8px 0 10px;
}

.notice-box strong {
  color: #4b3a14;
  font-size: 0.78rem;
}

.date-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.helper-text {
  display: block;
  margin-top: 6px;
}

.change-item {
  display: flex;
  gap: 8px;
  align-items: start;
  margin-top: 6px;
}

.change-item strong {
  display: block;
  color: #2b3f41;
  font-size: 0.78rem;
}

.change-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  margin-top: 4px;
}

.change-dot--teal { background: #0f6e70; }
.change-dot--gold { background: #f4a51c; }

@media (max-width: 1280px) {
  .provider-shell {
    grid-template-columns: 1fr;
    height: auto;
    overflow: auto;
  }

  .provider-content {
    height: auto;
    padding: 16px;
  }

  .summary-grid,
  .earnings-grid,
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-height: 800px) {
  .summary-card strong {
    font-size: 1.2rem;
  }
  .pricing-row > div {
    padding: 6px 12px;
  }
}
</style>