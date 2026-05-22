<template>
  <main class="admin-shell">
    <DashboardSidebar role="admin" />

    <div class="admin-main-area">
      <!-- Flush Horizontal Header Topnav -->
      <header class="topbar">
        <div class="topbar-left">
          <button class="menu-trigger" aria-label="Toggle navigation">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div class="searchbar">
            <span class="searchbar__icon">⌕</span>
            <input 
              v-model.trim="searchQuery" 
              type="text" 
              placeholder="Search by ID, customer, provider..." 
            />
            <kbd class="search-shortcut">⌘K</kbd>
          </div>
        </div>

        <div class="topbar-actions">
          <div class="icon-button" aria-label="Notifications">
            <span class="notification-badge">3</span>
            <span aria-hidden="true">○</span>
          </div>
          <button class="icon-button" aria-label="Toggle theme">◐</button>
          
          <div class="profile-chip">
            <div class="avatar">AS</div>
            <div class="profile-meta">
              <strong>Admin Supervisor</strong>
              <span>System Administrator</span>
            </div>
            <span class="chevron">▼</span>
          </div>
        </div>
      </header>

      <!-- Scrollable Main Content Viewport -->
      <div class="admin-viewport-scroll">
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
            <div class="filter-group">
              <div class="filter-item">
                <label>Booking</label>
                <select v-model="bookingStatusFilter" class="styled-select">
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div class="filter-item border-left">
                <label>Payment</label>
                <select v-model="paymentStatusFilter" class="styled-select">
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
              <div class="empty-icon">□</div>
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
                          <span class="category-tag-mini">{{ booking.serviceCategory }}</span>
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
                          <div class="service-icon">◇</div>
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
                            <div class="timeline-dot"></div>
                            <div class="content">
                              <p>Booking Created</p>
                              <small>Request received</small>
                            </div>
                          </div>
                          <div class="timeline-item" :class="{ active: selectedBooking.status !== 'pending' }">
                            <div class="timeline-dot"></div>
                            <div class="content">
                              <p>Provider Confirmed</p>
                              <small>{{ selectedBooking.status === 'pending' ? 'Awaiting response' : 'Confirmed by provider' }}</small>
                            </div>
                          </div>
                          <div class="timeline-item" :class="{ active: selectedBooking.status === 'completed' }">
                            <div class="timeline-dot"></div>
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
      </div>
    </div>
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
      totalPrice: Number(item.totalAmount) || Number(item.totalPrice) || 0,
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
      providerName: booking.provider?.companyName || 'Unknown provider',
      serviceName: booking.service?.title || 'Unknown service',
      serviceCategory: booking.service?.serviceType || 'General',
      bookingDate: booking.bookingDate,
      quantity: booking.quantity,
      totalPrice: Number(booking.totalAmount) || Number(booking.totalPrice) || 0,
      paymentStatus: booking.paymentStatus || 'pending',
      status: booking.status || 'pending',
      transactionId: booking.transactionId || '',
      paymentMethod: booking.paymentMethod || 'ABA QR',
    })
  } catch (error) {
    console.warn('Backend details API failed, falling back to mock details.', error)
    
    // Find inside local state or mock
    const localMock = bookings.value.find(b => b.id === id) || {
      id,
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
    }

    Object.assign(selectedBooking, {
      ...localMock,
    })
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
/* Scoped CSS targeting the clean Vercel/Linear/Stripe Startup Mockup Visual Aesthetics */
.admin-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 264px minmax(0, 1fr);
  gap: 0;
  padding: 0;
  background: #ffffff; /* pure white sidebar container base */
  box-sizing: border-box;
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #173f42;
}

.admin-main-area {
  display: flex;
  flex-direction: column;
  background: #f8fafb; /* The light page backdrop exactly matching the mockup */
  min-height: 100vh;
  min-width: 0;
}

.admin-viewport-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.admin-content {
  min-width: 0;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Sidebar Custom Styling - Scoped overrides to look EXACTLY like the mockup */
:deep(.sidebar-shell) {
  height: 100%;
  min-height: 100vh;
  border-radius: 0 !important;
  border: none !important;
  border-right: 1px solid #edf2f5 !important;
  box-shadow: none !important;
  background: #ffffff !important;
  padding: 24px 16px !important;
  display: flex;
  flex-direction: column;
}

:deep(.brand-block) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 4px 24px 4px !important;
}

:deep(.brand-block p.eyebrow) {
  display: none !important;
}

:deep(.brand-block strong) {
  font-size: 1.05rem !important;
  color: #123c3e !important;
  font-weight: 700 !important;
}

:deep(.brand-block small) {
  font-size: 0.72rem !important;
  color: #72817d !important;
}

:deep(.brand-mark) {
  background: #0f6e70 !important;
  color: #ffffff !important;
  border-radius: 8px !important;
  font-weight: 800;
  width: 32px !important;
  height: 32px !important;
}

:deep(.nav-item) {
  border-radius: 8px !important;
  padding: 10px 12px !important;
  margin-bottom: 2px !important;
  background: transparent !important;
  border: 1px solid transparent !important;
  transition: all 0.2s ease !important;
}

:deep(.nav-item:hover) {
  background: #f8fafb !important;
}

:deep(.nav-item.router-link-exact-active) {
  background: rgba(15, 110, 112, 0.08) !important;
  color: #0f6e70 !important;
}

:deep(.nav-item.router-link-exact-active strong) {
  color: #0f6e70 !important;
}

:deep(.nav-item.router-link-exact-active .nav-item__icon) {
  color: #0f6e70 !important;
}

:deep(.sidebar-card) {
  background: #f8fafb !important;
  border: 1px solid #edf2f5 !important;
  border-radius: 12px !important;
  padding: 12px !important;
  margin-top: auto !important;
}

/* Horizontal Top Navigation Bar */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #ffffff;
  border-bottom: 1px solid #edf2f5;
  padding: 16px 32px;
  height: 70px;
  box-sizing: border-box;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.menu-trigger {
  display: none;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #5e6e70;
  cursor: pointer;
}

.searchbar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #edf2f5;
  border-radius: 8px;
  height: 38px;
  width: 100%;
  max-width: 420px;
  padding: 0 12px;
  transition: all 0.2s ease;
}

.searchbar:focus-within {
  border-color: #0f6e70;
  box-shadow: 0 0 0 2px rgba(15, 110, 112, 0.08);
}

.searchbar__icon {
  font-size: 1.1rem;
  color: #9ea9ab;
}

.searchbar input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.88rem;
  color: #173f42;
  background: transparent;
}

.searchbar input::placeholder {
  color: #9ea9ab;
}

.search-shortcut {
  font-size: 0.72rem;
  background: #f1f3f5;
  color: #9ea9ab;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-button {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #edf2f5;
  background: #ffffff;
  color: #5e6e70;
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 1rem;
  transition: all 0.2s ease;
  position: relative;
}

.icon-button:hover {
  background: #f8fafb;
  border-color: #d1dadc;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #f15d5d;
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: bold;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.profile-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 4px 12px;
  border-radius: 8px;
  border: 1px solid #edf2f5;
  background: #ffffff;
  cursor: pointer;
}

.profile-meta {
  text-align: left;
}

.profile-meta strong {
  display: block;
  font-size: 0.82rem;
  color: #173f42;
  font-weight: 700;
}

.profile-meta span {
  display: block;
  font-size: 0.68rem;
  color: #9ea9ab;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #24a874;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.82rem;
  display: grid;
  place-items: center;
}

.chevron {
  font-size: 0.6rem;
  color: #9ea9ab;
  margin-left: 2px;
}

/* Page heading and banner */
.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid #edf2f5;
  padding-bottom: 24px;
  gap: 20px;
}

.heading-group h1 {
  margin: 6px 0 8px;
  font-size: 1.6rem;
  color: #123c3e;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.eyebrow {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #0f6e70;
  font-weight: 700;
  margin: 0;
}

.page-description {
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.5;
  margin: 0;
  max-width: 600px;
}

/* Toolbar & Filters */
.toolbar-row {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: flex-end;
}

.filter-group {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #edf2f5;
  height: 38px;
  overflow: hidden;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  height: 100%;
}

.filter-item.border-left {
  border-left: 1px solid #edf2f5;
}

.filter-item label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.styled-select {
  border: 0;
  background: transparent;
  padding: 4px 0;
  font-weight: 600;
  color: #1e293b;
  outline: none;
  cursor: pointer;
  font-size: 0.85rem;
}

/* Table Card Design */
.table-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #edf2f5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #edf2f5;
  background: #ffffff;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-main h2 {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
  color: #123c3e;
}

.count-badge {
  padding: 2px 8px;
  background: rgba(15, 110, 112, 0.06);
  color: #0f6e70;
  border-radius: 99px;
  font-size: 0.72rem;
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
  padding: 12px 24px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  background: #f8fafb;
  border-bottom: 1px solid #edf2f5;
  font-weight: 700;
}

.data-row {
  border-bottom: 1px solid #edf2f5;
  transition: background 0.15s ease;
}

.data-row:hover {
  background: #f8fafb;
}

.data-row:last-child {
  border-bottom: none;
}

.data-table td {
  padding: 16px 24px;
  vertical-align: middle;
  font-size: 0.88rem;
  color: #334155;
}

.id-code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  background: #f1f5f9;
  color: #475569;
  padding: 3px 6px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
}

.double-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.info-block {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 700;
}

.info-value {
  font-size: 0.88rem;
  color: #123c3e;
  font-weight: 600;
}

.info-value-alt {
  font-size: 0.82rem;
  color: #64748b;
  font-weight: 500;
}

.service-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.service-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: #123c3e;
}

.service-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #64748b;
}

.category-tag-mini {
  color: #0f6e70;
  font-weight: 600;
}

.dot {
  font-size: 1.2rem;
  line-height: 0;
  color: #cbd5e1;
}

.status-pill {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: capitalize;
}

/* Booking Statuses */
.status-pill.pending { background: rgba(229, 154, 24, 0.1); color: #e59a18; }
.status-pill.confirmed { background: rgba(15, 110, 112, 0.08); color: #0f6e70; }
.status-pill.completed { background: rgba(36, 168, 116, 0.1); color: #24a874; }
.status-pill.cancelled { background: #f1f5f9; color: #64748b; }

/* Payment Statuses */
.status-pill.payment.pending { background: rgba(229, 154, 24, 0.1); color: #e59a18; }
.status-pill.payment.paid { background: rgba(36, 168, 116, 0.1); color: #24a874; }
.status-pill.payment.failed { background: rgba(241, 93, 93, 0.1); color: #f15d5d; }

.price-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.amount {
  font-size: 0.95rem;
  color: #123c3e;
  font-weight: 700;
}

.qty {
  font-size: 0.75rem;
  color: #94a3b8;
}

.view-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #edf2f5;
  background: #ffffff;
  color: #123c3e;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  background: #0f6e70;
  color: #ffffff;
  border-color: #0f6e70;
}

/* States & Loaders */
.state-container {
  padding: 60px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #64748b;
}

.state-container h3 {
  margin: 0;
  color: #123c3e;
  font-size: 1rem;
  font-weight: 700;
}

.state-container p {
  margin: 0;
  font-size: 0.88rem;
}

.loader {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(15, 110, 112, 0.1);
  border-top-color: #0f6e70;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 2.2rem;
}

.text-button {
  background: none;
  border: none;
  color: #0f6e70;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
}

/* Modal Wide Sheets */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(18, 60, 62, 0.25);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 24px;
}

.modal-window.wide {
  max-width: 920px;
}

.modal-window {
  background: #ffffff;
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(18, 60, 62, 0.15);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border: 1px solid #edf2f5;
}

.modal-header {
  padding: 20px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #edf2f5;
  background: #ffffff;
}

.modal-header h2 {
  font-size: 1.15rem;
  margin: 4px 0 0;
  color: #123c3e;
  font-weight: 700;
}

.modal-body {
  padding: 28px;
  overflow-y: auto;
  background: #f8fafb;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 28px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h3 {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #0f6e70;
  margin: 0 0 16px;
  font-weight: 800;
}

.service-highlight {
  background: #ffffff;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  border: 1px solid #edf2f5;
}

.service-icon {
  width: 48px;
  height: 48px;
  background: rgba(15, 110, 112, 0.06);
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 1.3rem;
  color: #0f6e70;
}

.service-text h4 {
  margin: 0 0 4px;
  color: #123c3e;
  font-size: 0.95rem;
  font-weight: 700;
}

.service-text p {
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item label {
  display: block;
  font-size: 0.68rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 4px;
}

.info-item p {
  font-size: 0.95rem;
  font-weight: 600;
  color: #123c3e;
  margin: 0;
}

.total-price-value {
  color: #0f6e70 !important;
  font-size: 1.15rem !important;
  font-weight: 800 !important;
}

.customer-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #ffffff;
  border: 1px solid #edf2f5;
  padding: 16px;
  border-radius: 12px;
}

.customer-avatar {
  width: 42px;
  height: 42px;
  background: #123c3e;
  color: #ffffff;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 0.95rem;
}

.customer-info {
  display: flex;
  flex-direction: column;
}

.customer-info strong {
  color: #123c3e;
  font-size: 0.88rem;
}

.customer-info span {
  font-size: 0.8rem;
  color: #64748b;
}

.status-box {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #edf2f5;
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
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #edf2f5;
}

.status-row span:first-child {
  font-size: 0.82rem;
  font-weight: 600;
  color: #64748b;
}

.id-code-sm {
  font-family: monospace;
  font-size: 0.8rem;
  color: #123c3e;
  font-weight: 600;
}

.timeline {
  display: flex;
  flex-direction: column;
  padding-left: 8px;
}

.timeline-item {
  display: flex;
  gap: 16px;
  padding-bottom: 20px;
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
  background: #edf2f5;
}

.timeline-item.active:not(:last-child)::after {
  background: #0f6e70;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #cbd5e1;
  flex-shrink: 0;
  z-index: 1;
  margin-top: 4px;
}

.timeline-item.active .timeline-dot {
  background: #0f6e70;
  box-shadow: 0 0 0 4px rgba(15, 110, 112, 0.15);
}

.timeline-item .content p {
  margin: 0;
  font-weight: 700;
  color: #123c3e;
  font-size: 0.85rem;
}

.timeline-item .content small {
  color: #94a3b8;
  font-size: 0.78rem;
}

.qr-section {
  margin-top: 24px;
}

.qr-box {
  background: #123c3e;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  color: #ffffff;
}

.qr-placeholder {
  width: 100px;
  height: 100px;
  background: #ffffff;
  margin: 0 auto 12px;
  border-radius: 8px;
  display: grid;
  place-items: center;
}

.qr-inner {
  color: #123c3e;
  font-weight: 800;
  font-size: 1.25rem;
  border: 3px solid #123c3e;
  padding: 6px;
}

.qr-box p {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.modal-footer {
  padding: 18px 28px;
  background: #ffffff;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #edf2f5;
}

.secondary-btn {
  background: none;
  border: 1px solid #edf2f5;
  color: #64748b;
  font-weight: 700;
  cursor: pointer;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 0.88rem;
  transition: all 0.2s ease;
}

.secondary-btn:hover {
  background: #f8fafb;
}

.primary-btn {
  background: #0f6e70;
  color: #ffffff;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.88rem;
  transition: all 0.2s ease;
}

.primary-btn:hover {
  background: #0a5c5d;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: #f8fafb;
  color: #64748b;
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #edf2f5;
  color: #123c3e;
}

.modal-loader-container {
  padding: 60px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #64748b;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Compact SaaS admin refinement */
.admin-shell {
  grid-template-columns: 236px minmax(0, 1fr);
  background: #ffffff;
  color: #16383a;
}

.admin-main-area,
.modal-body {
  background: #f7f9fa;
}

.admin-content {
  padding: 24px 28px 28px;
  gap: 18px;
}

:deep(.sidebar-shell) {
  padding: 18px 12px !important;
  border-right-color: #e6ecee !important;
}

:deep(.sidebar-inner) {
  padding: 0 !important;
  gap: 16px !important;
}

:deep(.brand-block) {
  padding: 0 8px 8px !important;
}

:deep(.nav-list) {
  gap: 12px !important;
}

:deep(.nav-item) {
  min-height: 31px !important;
  padding: 6px 9px !important;
  margin-bottom: 0 !important;
}

:deep(.nav-item--active),
:deep(.nav-item.router-link-exact-active) {
  background: #eaf5f4 !important;
  border-color: rgba(15, 110, 112, 0.1) !important;
  color: #0f6e70 !important;
}

:deep(.sidebar-card) {
  padding: 10px !important;
  border-radius: 10px !important;
}

.topbar {
  height: 58px;
  padding: 12px 28px;
  border-bottom-color: #e6ecee;
}

.searchbar {
  height: 34px;
  max-width: 360px;
  border-color: #e4ebed;
  border-radius: 7px;
}

.icon-button {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  border-color: #e4ebed;
  font-size: 0.82rem;
}

.topbar-actions {
  gap: 10px;
}

.profile-chip {
  min-height: 32px;
  padding: 2px 8px 2px 6px;
  border-color: #e4ebed;
}

.avatar {
  width: 24px;
  height: 24px;
  font-size: 0.66rem;
  background: #0f6e70;
}

.profile-meta span {
  display: none;
}

.page-heading {
  padding-bottom: 16px;
  border-bottom-color: #e6ecee;
}

.heading-group h1 {
  margin: 3px 0 5px;
  font-size: 1.35rem;
  letter-spacing: 0;
}

.page-description {
  font-size: 0.84rem;
}

.toolbar-row {
  justify-content: flex-start;
}

.filter-group {
  height: 34px;
  border-color: #e4ebed;
  border-radius: 7px;
}

.filter-item {
  padding: 0 11px;
}

.table-card,
.modal-window,
.service-highlight,
.customer-card,
.status-box {
  border-color: #e4ebed;
  border-radius: 10px;
  box-shadow: none;
}

.card-header {
  padding: 14px 18px;
  border-bottom-color: #e4ebed;
}

.data-table th {
  padding: 10px 18px;
  background: #fbfcfc;
}

.data-table td {
  padding: 12px 18px;
}

.id-code,
.id-code-sm {
  background: #f5f7f8;
  border-radius: 5px;
  font-size: 0.74rem;
}

.status-pill {
  padding: 3px 8px;
  border-radius: 999px;
}

.view-btn,
.primary-btn,
.secondary-btn,
.close-btn {
  border-radius: 7px;
}

.modal-header,
.modal-footer {
  padding: 16px 22px;
}

.modal-body {
  padding: 22px;
}

.details-grid {
  gap: 18px;
}

.detail-section {
  margin-bottom: 18px;
}

@media (max-width: 1024px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }
  
  :deep(.sidebar-shell) {
    display: none !important;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .details-side {
    order: -1;
  }
}

@media (max-width: 768px) {
  .toolbar-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
