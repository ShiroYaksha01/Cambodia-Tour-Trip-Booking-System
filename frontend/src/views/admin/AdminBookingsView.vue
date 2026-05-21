<template>
  <main class="admin-shell">
    <DashboardSidebar role="admin" />

    <section class="admin-content">
      <div class="page-heading">
        <div class="heading-group">
          <p class="eyebrow">Booking Management</p>
          <h1>All Bookings</h1>
          <p class="page-description">
            Monitor all reservation activity, verify payments, and manage service fulfillment.
          </p>
        </div>
      </div>

      <div class="toolbar-row">
        <div class="search-box">
          <span class="search-icon">⌕</span>
          <input 
            v-model.trim="searchQuery" 
            type="search" 
            placeholder="Search by ID, customer, provider..." 
          />
        </div>

        <div class="filter-group">
          <div class="filter-item">
            <label>Booking</label>
            <select v-model="bookingStatusFilter">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div class="filter-item">
            <label>Payment</label>
            <select v-model="paymentStatusFilter">
              <option value="">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      <article class="table-card">
        <header class="card-header">
          <div class="header-main">
            <h2>Booking Ledger</h2>
            <span class="count-badge">{{ bookings.length }} records</span>
          </div>
        </header>

        <div v-if="loading" class="state-container">
          <div class="loader"></div>
          <p>Retrieving booking records...</p>
        </div>

        <div v-else-if="bookings.length === 0" class="state-container empty">
          <div class="empty-icon">📂</div>
          <h3>No bookings found</h3>
          <p>We couldn't find any bookings matching your search criteria.</p>
          <button class="text-button" @click="clearFilters">Reset filters</button>
        </div>

        <div v-else class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer & Provider</th>
                <th>Service Details</th>
                <th>Status</th>
                <th>Payment</th>
                <th class="text-right">Total</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in bookings" :key="booking.id" class="data-row">
                <td>
                  <code class="id-code">{{ booking.id.slice(0, 8).toUpperCase() }}</code>
                </td>
                <td>
                  <div class="double-info">
                    <div class="info-block">
                      <span class="info-label">Customer</span>
                      <strong class="info-value">{{ booking.customerName }}</strong>
                    </div>
                    <div class="info-block">
                      <span class="info-label">Provider</span>
                      <span class="info-value-alt">{{ booking.providerName }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="service-info">
                    <strong class="service-title">{{ booking.serviceName }}</strong>
                    <div class="service-meta">
                      <span>{{ booking.serviceCategory }}</span>
                      <span class="dot">•</span>
                      <span>{{ formatDate(booking.bookingDate) }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span :class="['status-pill', booking.status]">
                    {{ booking.status.charAt(0).toUpperCase() + booking.status.slice(1) }}
                  </span>
                </td>
                <td>
                  <span :class="['status-pill', 'payment', booking.paymentStatus]">
                    {{ booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1) }}
                  </span>
                </td>
                <td class="text-right">
                  <div class="price-cell">
                    <strong class="amount">${{ booking.totalPrice.toFixed(2) }}</strong>
                    <span class="qty">Qty: {{ booking.quantity }}</span>
                  </div>
                </td>
                <td>
                  <div class="action-cell">
                    <button class="view-btn" @click="openDetails(booking.id)">
                      View Details
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <!-- Details Modal -->
      <Transition name="fade">
        <div v-if="detailsOpen" class="modal-overlay" @click.self="closeDetails">
          <div class="modal-window wide">
            <header class="modal-header">
              <div class="header-text">
                <p class="eyebrow">Booking Details</p>
                <h2>Transaction #{{ selectedBooking.id.slice(0, 8).toUpperCase() }}</h2>
              </div>
              <button class="close-btn" @click="closeDetails">✕</button>
            </header>

            <div v-if="detailsLoading" class="modal-loader-container">
              <div class="loader"></div>
              <p>Fetching full transaction history...</p>
            </div>

            <div v-else class="modal-body">
              <div class="details-grid">
                <!-- Left Column -->
                <div class="details-main">
                  <div class="detail-section">
                    <h3>Service Information</h3>
                    <div class="service-highlight">
                      <div class="service-icon">🏞</div>
                      <div class="service-text">
                        <h4>{{ selectedBooking.serviceName }}</h4>
                        <p>{{ selectedBooking.serviceCategory }} • Provided by {{ selectedBooking.providerName }}</p>
                      </div>
                    </div>
                    
                    <div class="info-grid">
                      <div class="info-item">
                        <label>Booking Date</label>
                        <p>{{ formatDate(selectedBooking.bookingDate) }}</p>
                      </div>
                      <div class="info-item">
                        <label>Quantity</label>
                        <p>{{ selectedBooking.quantity }} Persons</p>
                      </div>
                      <div class="info-item">
                        <label>Unit Price</label>
                        <p>${{ (selectedBooking.totalPrice / (selectedBooking.quantity || 1)).toFixed(2) }}</p>
                      </div>
                      <div class="info-item">
                        <label>Total Price</label>
                        <p class="total-price-value">${{ selectedBooking.totalPrice.toFixed(2) }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="detail-section">
                    <h3>Customer Details</h3>
                    <div class="customer-card">
                      <div class="customer-avatar">{{ selectedBooking.customerName.charAt(0) }}</div>
                      <div class="customer-info">
                        <strong>{{ selectedBooking.customerName }}</strong>
                        <span>{{ selectedBooking.customerEmail }}</span>
                        <span>{{ selectedBooking.customerPhone }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right Column -->
                <aside class="details-side">
                  <div class="detail-section">
                    <h3>Status & Payment</h3>
                    <div class="status-box">
                      <div class="status-row">
                        <span>Booking</span>
                        <span :class="['status-pill', selectedBooking.status]">{{ selectedBooking.status }}</span>
                      </div>
                      <div class="status-row">
                        <span>Payment</span>
                        <span :class="['status-pill', 'payment', selectedBooking.paymentStatus]">{{ selectedBooking.paymentStatus }}</span>
                      </div>
                      <div class="status-row divider">
                        <span>Method</span>
                        <strong>{{ selectedBooking.paymentMethod }}</strong>
                      </div>
                      <div class="status-row">
                        <span>Transaction ID</span>
                        <code class="id-code-sm">{{ selectedBooking.transactionId || 'N/A' }}</code>
                      </div>
                    </div>
                  </div>

                  <div class="detail-section">
                    <h3>Timeline</h3>
                    <div class="timeline">
                      <div class="timeline-item" :class="{ active: true }">
                        <div class="dot"></div>
                        <div class="content">
                          <p>Booking Created</p>
                          <small>Request received</small>
                        </div>
                      </div>
                      <div class="timeline-item" :class="{ active: selectedBooking.status !== 'pending' }">
                        <div class="dot"></div>
                        <div class="content">
                          <p>Provider Confirmed</p>
                          <small>{{ selectedBooking.status === 'pending' ? 'Awaiting response' : 'Confirmed by provider' }}</small>
                        </div>
                      </div>
                      <div class="timeline-item" :class="{ active: selectedBooking.status === 'completed' }">
                        <div class="dot"></div>
                        <div class="content">
                          <p>Service Completed</p>
                          <small>{{ selectedBooking.status === 'completed' ? 'Fulfillment verified' : 'In progress' }}</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="qr-section">
                    <div class="qr-box">
                      <div class="qr-placeholder">
                        <div class="qr-inner">QR</div>
                      </div>
                      <p>Verification Code</p>
                    </div>
                  </div>
                </aside>
              </div>
            </div>

            <footer class="modal-footer">
              <button class="secondary-btn" @click="closeDetails">Close View</button>
              <button class="primary-btn" @click="printBooking">Download PDF</button>
            </footer>
          </div>
        </div>
      </Transition>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar.vue'
import { apiGet } from '../../utils/api'

interface BookingItem {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  providerName: string
  serviceName: string
  serviceCategory: string
  bookingDate: string
  quantity: number
  totalPrice: number
  paymentStatus: string
  status: string
  transactionId: string
  paymentMethod?: string
}

const bookings = ref<BookingItem[]>([])
const searchQuery = ref('')
const bookingStatusFilter = ref('')
const paymentStatusFilter = ref('')
const loading = ref(false)
const detailsOpen = ref(false)
const detailsLoading = ref(false)
const selectedBooking = reactive<BookingItem>({
  id: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  providerName: '',
  serviceName: '',
  serviceCategory: '',
  bookingDate: '',
  quantity: 0,
  totalPrice: 0,
  paymentStatus: 'pending',
  status: 'pending',
  transactionId: '',
  paymentMethod: 'ABA QR',
})

const loadBookings = async () => {
  loading.value = true
  try {
    const query = new URLSearchParams()
    if (searchQuery.value) query.set('q', searchQuery.value)
    if (bookingStatusFilter.value) query.set('status', bookingStatusFilter.value)
    if (paymentStatusFilter.value) query.set('paymentStatus', paymentStatusFilter.value)

    const response = await apiGet<{ success: boolean; data: any[] }>(`/admin/bookings?${query.toString()}`)
    bookings.value = response.data.map((item) => ({
      id: item.id,
      customerName: item.user?.username || 'Unknown',
      customerEmail: item.user?.email || 'No email',
      customerPhone: item.user?.phoneNumber || 'No phone',
      providerName: item.provider?.companyName || 'Unknown provider',
      serviceName: item.service?.title || 'Unknown service',
      serviceCategory: item.service?.serviceType || 'General',
      bookingDate: item.bookingDate,
      quantity: item.quantity,
      totalPrice: Number(item.totalPrice) || 0,
      paymentStatus: item.paymentStatus || 'pending',
      status: item.status || 'pending',
      transactionId: item.transactionId || '',
      paymentMethod: item.paymentMethod || 'ABA QR',
    }))
  } catch (error) {
    console.warn('Backend unavailable, using mock data for demonstration.', error)
    // Mock data fallback
    bookings.value = [
      {
        id: 'BK-1001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+855 11 222 333',
        providerName: 'Angkor Klean Tours',
        serviceName: 'Angkor Wat Sunrise Tour',
        serviceCategory: 'Tour',
        bookingDate: new Date().toISOString(),
        quantity: 2,
        totalPrice: 245.0,
        paymentStatus: 'paid',
        status: 'completed',
        transactionId: 'ABA-99218273',
        paymentMethod: 'ABA QR',
      },
      {
        id: 'BK-1002',
        customerName: 'Sarah Smith',
        customerEmail: 'sarah@web.com',
        customerPhone: '+855 99 888 777',
        providerName: 'Mekong Trails Co.',
        serviceName: 'Mekong River Sunset Cruise',
        serviceCategory: 'Experience',
        bookingDate: new Date(Date.now() - 86400000).toISOString(),
        quantity: 4,
        totalPrice: 1120.0,
        paymentStatus: 'paid',
        status: 'confirmed',
        transactionId: 'BAK-11223344',
        paymentMethod: 'Bakong',
      },
      {
        id: 'BK-1003',
        customerName: 'Vibol Kh',
        customerEmail: 'vibol@mail.kh',
        customerPhone: '+855 12 555 444',
        providerName: 'Urban Flavors',
        serviceName: 'Phnom Penh Food Tour',
        serviceCategory: 'Curation',
        bookingDate: new Date(Date.now() - 172800000).toISOString(),
        quantity: 1,
        totalPrice: 85.0,
        paymentStatus: 'pending',
        status: 'pending',
        transactionId: '',
        paymentMethod: 'Cash',
      },
    ]
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const clearFilters = () => {
  searchQuery.value = ''
  bookingStatusFilter.value = ''
  paymentStatusFilter.value = ''
}

const openDetails = async (id: string) => {
  detailsOpen.value = true
  detailsLoading.value = true
  try {
    const response = await apiGet<{ success: boolean; data: any }>(`/admin/bookings/${id}`)
    const booking = response.data

    Object.assign(selectedBooking, {
      id: booking.id,
      customerName: booking.user?.username || 'Unknown',
      customerEmail: booking.user?.email || 'No email',
      customerPhone: booking.user?.phoneNumber || 'No phone',
      providerName: booking.provider?.companyName || 'Unknown',
      serviceName: booking.service?.title || 'Unknown service',
      serviceCategory: booking.service?.serviceType || 'General',
      bookingDate: booking.bookingDate,
      quantity: booking.quantity,
      totalPrice: Number(booking.totalPrice) || 0,
      paymentStatus: booking.paymentStatus || 'pending',
      status: booking.status || 'pending',
      transactionId: booking.transactionId || '',
      paymentMethod: booking.paymentMethod || 'ABA QR',
    })
  } catch (error) {
    console.error(error)
    alert(error instanceof Error ? error.message : 'Unable to load booking details.')
    detailsOpen.value = false
  } finally {
    detailsLoading.value = false
  }
}

const closeDetails = () => {
  detailsOpen.value = false
}

const printBooking = () => {
  window.print();
}

watch([searchQuery, bookingStatusFilter, paymentStatusFilter], () => {
  if (!loading.value) {
    loadBookings()
  }
})

onMounted(() => {
  loadBookings()
})
</script>

<style scoped>
.admin-shell {
  height: 100vh;
  display: grid;
  grid-template-columns: 264px minmax(0, 1fr);
  gap: 18px;
  padding: 16px;
  background: #262626;
  box-sizing: border-box;
  overflow: hidden;
}

.admin-content {
  min-width: 0;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: linear-gradient(180deg, #f3f3f2 0%, #f8f8f6 100%);
  border-radius: 24px;
  overflow-y: auto;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.heading-group h1 {
  margin: 4px 0 8px;
  font-size: clamp(2rem, 2.5vw, 2.8rem);
  color: #173f42;
  letter-spacing: -0.02em;
}

.eyebrow {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #7d8b88;
  font-weight: 700;
}

.page-description {
  color: #576666;
  max-width: 500px;
  line-height: 1.6;
}

/* Toolbar */
.toolbar-row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #8a9490;
  font-size: 1.2rem;
}

.search-box input {
  width: 100%;
  padding: 12px 12px 12px 48px;
  border-radius: 16px;
  border: 1px solid rgba(20, 31, 31, 0.08);
  background: #fff;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
}

.search-box input:focus {
  border-color: #0f6e70;
  box-shadow: 0 0 0 4px rgba(15, 110, 112, 0.1);
}

.filter-group {
  display: flex;
  gap: 12px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  padding: 4px 14px;
  border-radius: 14px;
  border: 1px solid rgba(20, 31, 31, 0.08);
}

.filter-item label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #8a9490;
}

.filter-item select {
  border: 0;
  background: transparent;
  padding: 8px 0;
  font-weight: 700;
  color: #173f42;
  outline: none;
  cursor: pointer;
}

/* Table Card */
.table-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(18, 31, 31, 0.06);
  box-shadow: 0 10px 30px rgba(18, 31, 31, 0.05);
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(18, 31, 31, 0.05);
}

.header-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-main h2 {
  font-size: 1.25rem;
  margin: 0;
  color: #173f42;
}

.count-badge {
  padding: 4px 10px;
  background: #edf4f3;
  color: #0f6e70;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 16px 24px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #8a9490;
  background: rgba(248, 250, 249, 0.5);
}

.data-row {
  border-bottom: 1px solid rgba(18, 31, 31, 0.03);
  transition: background 0.2s;
}

.data-row:hover {
  background: rgba(15, 110, 112, 0.02);
}

.data-table td {
  padding: 20px 24px;
  vertical-align: middle;
}

.id-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background: #f1f3f2;
  color: #576666;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.double-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-block {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  color: #8a9490;
  font-weight: 700;
  margin-bottom: 2px;
}

.info-value {
  font-size: 0.95rem;
  color: #173f42;
  font-weight: 600;
}

.info-value-alt {
  font-size: 0.85rem;
  color: #576666;
}

.service-title {
  display: block;
  font-size: 0.95rem;
  color: #173f42;
  margin-bottom: 4px;
}

.service-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #8a9490;
}

.dot {
  font-size: 1.2rem;
  line-height: 0;
}

.status-pill {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

/* Booking Statuses */
.status-pill.pending { background: #fff9e6; color: #b37400; }
.status-pill.confirmed { background: #e6f6f2; color: #0a6d66; }
.status-pill.completed { background: #edf4f3; color: #173f42; }
.status-pill.cancelled { background: #f4f4f5; color: #5f6d74; }

/* Payment Statuses */
.status-pill.payment.pending { background: #fff4e6; color: #b37400; }
.status-pill.payment.paid { background: #def7ec; color: #0f6e70; }
.status-pill.payment.failed { background: #ffeaea; color: #b42f2f; }

.price-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.amount {
  font-size: 1.1rem;
  color: #173f42;
  font-weight: 800;
}

.qty {
  font-size: 0.75rem;
  color: #8a9490;
}

.view-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid rgba(20, 31, 31, 0.1);
  background: #fff;
  color: #173f42;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  background: #173f42;
  color: #fff;
  border-color: #173f42;
}

/* States */
.state-container {
  padding: 60px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #edf4f3;
  border-top-color: #0f6e70;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(23, 63, 66, 0.4);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 24px;
}

.modal-window.wide {
  max-width: 960px;
}

.modal-window {
  background: #fff;
  width: 100%;
  border-radius: 28px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  max-height: 94vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f1f3f2;
}

.modal-body {
  padding: 32px;
  overflow-y: auto;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-section h3 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #8a9490;
  margin: 0 0 16px;
}

.service-highlight {
  background: #f8faf9;
  padding: 20px;
  border-radius: 20px;
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.service-icon {
  width: 54px;
  height: 54px;
  background: #fff;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.service-text h4 {
  margin: 0 0 4px;
  color: #173f42;
  font-size: 1.1rem;
}

.service-text p {
  margin: 0;
  color: #576666;
  font-size: 0.9rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 800;
  color: #8a9490;
  margin-bottom: 4px;
}

.info-item p {
  font-size: 1.1rem;
  font-weight: 600;
  color: #173f42;
  margin: 0;
}

.total-price-value {
  color: #0f6e70 !important;
  font-size: 1.4rem !important;
  font-weight: 800 !important;
}

.customer-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border: 1px solid #f1f3f2;
  padding: 16px;
  border-radius: 18px;
}

.customer-avatar {
  width: 48px;
  height: 48px;
  background: #173f42;
  color: #fff;
  border-radius: 99px;
  display: grid;
  place-items: center;
  font-weight: 800;
}

.customer-info {
  display: flex;
  flex-direction: column;
}

.customer-info strong {
  color: #173f42;
}

.customer-info span {
  font-size: 0.85rem;
  color: #576666;
}

.status-box {
  background: #f8faf9;
  border-radius: 20px;
  padding: 20px;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-row:last-child {
  margin-bottom: 0;
}

.status-row.divider {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(20, 31, 31, 0.06);
}

.status-row span:first-child {
  font-size: 0.85rem;
  font-weight: 700;
  color: #576666;
}

.id-code-sm {
  font-family: monospace;
  font-size: 0.8rem;
  color: #173f42;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-left: 10px;
}

.timeline-item {
  display: flex;
  gap: 16px;
  padding-bottom: 24px;
  position: relative;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 18px;
  bottom: 0;
  width: 2px;
  background: #edf1f0;
}

.timeline-item.active:not(:last-child)::after {
  background: #0f6e70;
}

.timeline-item .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #d1d9d7;
  flex-shrink: 0;
  z-index: 1;
  margin-top: 6px;
}

.timeline-item.active .dot {
  background: #0f6e70;
  box-shadow: 0 0 0 4px rgba(15, 110, 112, 0.2);
}

.timeline-item .content p {
  margin: 0;
  font-weight: 700;
  color: #173f42;
  font-size: 0.9rem;
}

.timeline-item .content small {
  color: #8a9490;
  font-size: 0.8rem;
}

.qr-section {
  margin-top: 32px;
}

.qr-box {
  background: #173f42;
  border-radius: 24px;
  padding: 24px;
  text-align: center;
  color: #fff;
}

.qr-placeholder {
  width: 120px;
  height: 120px;
  background: #fff;
  margin: 0 auto 16px;
  border-radius: 12px;
  display: grid;
  place-items: center;
}

.qr-inner {
  color: #173f42;
  font-weight: 900;
  font-size: 1.5rem;
  border: 4px solid #173f42;
  padding: 10px;
}

.modal-footer {
  padding: 24px 32px;
  background: #f8faf9;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.secondary-btn {
  background: none;
  border: 1px solid rgba(20, 31, 31, 0.1);
  color: #173f42;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.primary-btn {
  background: #0f6e70;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.close-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f1f3f2;
  border: none;
  cursor: pointer;
  display: grid;
  place-items: center;
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 960px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .details-side {
    order: -1;
  }
  
  .toolbar-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
