<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import CustomerNavbar from "../../components/customer/CustomerNavbar.vue";
import CustomerFooter from "../../components/customer/CustomerFooter.vue";
import api from "../../services/api";

const router = useRouter();

interface ServiceInfo {
  id?: string;
  title?: string;
  price?: number;
  duration?: string;
  location?: string;
  tourLocation?: string;
  address?: string;
  guideName?: string;
  guidePhone?: string;
  guideContact?: string;
  guideRating?: number;
  itinerary?: string;
}

interface ProviderInfo {
  id?: string;
  companyName?: string;
  phoneNumber?: string;
  phone?: string;
  rating?: number;
}

interface Booking {
  id: string;
  referenceCode?: string;
  bookingDate: string;
  quantity: number;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  transactionId?: string;
  createdAt?: string;
  service?: ServiceInfo;
  provider?: ProviderInfo;
}

const bookings = ref<Booking[]>([]);
const loading = ref(false);
const payingId = ref("");
const cancellingId = ref("");
const error = ref("");

const search = ref("");
const statusFilter = ref("all");
const paymentFilter = ref("all");
const dateFrom = ref("");
const dateTo = ref("");
const sortBy = ref("newest");
const currentPage = ref(1);
const perPage = ref(5);

const expandedBookingId = ref("");

const stats = computed(() => {
  const total = bookings.value.length;

  const confirmed = bookings.value.filter(
    (booking) => booking.bookingStatus?.toLowerCase() === "confirmed",
  ).length;

  const pendingPayment = bookings.value.filter(
    (booking) => booking.paymentStatus?.toLowerCase() === "pending",
  ).length;

  const cancelled = bookings.value.filter(
    (booking) => booking.bookingStatus?.toLowerCase() === "cancelled",
  ).length;

  const totalSpent = bookings.value.reduce(
    (sum, booking) => sum + Number(booking.totalAmount || 0),
    0,
  );

  return {
    total,
    confirmed,
    pendingPayment,
    cancelled,
    totalSpent,
  };
});

const filteredBookings = computed(() => {
  let list = [...bookings.value];

  if (statusFilter.value !== "all") {
    list = list.filter(
      (booking) => booking.bookingStatus?.toLowerCase() === statusFilter.value,
    );
  }

  if (paymentFilter.value !== "all") {
    list = list.filter(
      (booking) => booking.paymentStatus?.toLowerCase() === paymentFilter.value,
    );
  }

  if (dateFrom.value) {
    const from = new Date(dateFrom.value);
    from.setHours(0, 0, 0, 0);

    list = list.filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate >= from;
    });
  }

  if (dateTo.value) {
    const to = new Date(dateTo.value);
    to.setHours(23, 59, 59, 999);

    list = list.filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate <= to;
    });
  }

  if (search.value.trim()) {
    const q = search.value.toLowerCase();

    list = list.filter((booking) => {
      const serviceTitle = booking.service?.title || "";
      const providerName = booking.provider?.companyName || "";
      const guideName = booking.service?.guideName || "";
      const location =
        booking.service?.location ||
        booking.service?.tourLocation ||
        booking.service?.address ||
        "";

      return (
        booking.id.toLowerCase().includes(q) ||
        booking.referenceCode?.toLowerCase().includes(q) ||
        serviceTitle.toLowerCase().includes(q) ||
        providerName.toLowerCase().includes(q) ||
        guideName.toLowerCase().includes(q) ||
        location.toLowerCase().includes(q) ||
        booking.transactionId?.toLowerCase().includes(q)
      );
    });
  }

  if (sortBy.value === "newest") {
    list.sort(
      (a, b) =>
        new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime(),
    );
  }

  if (sortBy.value === "oldest") {
    list.sort(
      (a, b) =>
        new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime(),
    );
  }

  if (sortBy.value === "highest") {
    list.sort(
      (a, b) => Number(b.totalAmount || 0) - Number(a.totalAmount || 0),
    );
  }

  if (sortBy.value === "lowest") {
    list.sort(
      (a, b) => Number(a.totalAmount || 0) - Number(b.totalAmount || 0),
    );
  }

  return list;
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredBookings.value.length / perPage.value));
});

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredBookings.value.slice(start, start + perPage.value);
});

function formatDate(date: string) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatMoney(amount: number) {
  return `$${Number(amount || 0).toLocaleString()}`;
}

function statusClass(status: string) {
  return status?.toLowerCase() || "pending";
}

function getTourLocation(booking: Booking) {
  return (
    booking.service?.location ||
    booking.service?.tourLocation ||
    booking.service?.address ||
    "Location not provided"
  );
}

function getTourDuration(booking: Booking) {
  return booking.service?.duration || "Duration not provided";
}

function getGuideName(booking: Booking) {
  return booking.service?.guideName || "Guide not assigned";
}

function getGuideContact(booking: Booking) {
  return (
    booking.service?.guidePhone ||
    booking.service?.guideContact ||
    booking.provider?.phoneNumber ||
    booking.provider?.phone ||
    "Contact not provided"
  );
}

function getGuideRating(booking: Booking) {
  return booking.service?.guideRating || booking.provider?.rating || null;
}

function canCancelBooking(booking: Booking) {
  const status = booking.bookingStatus?.toLowerCase();
  const payment = booking.paymentStatus?.toLowerCase();

  return status !== "cancelled" && payment !== "paid";
}

function resetFilters() {
  search.value = "";
  statusFilter.value = "all";
  paymentFilter.value = "all";
  dateFrom.value = "";
  dateTo.value = "";
  sortBy.value = "newest";
  currentPage.value = 1;
}

function toggleExpand(id: string) {
  expandedBookingId.value = expandedBookingId.value === id ? "" : id;
}

async function fetchBookings() {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get("/booking/user");
    bookings.value = response.data.data || [];
  } catch (err) {
    console.error(err);
    error.value = "Failed to load booking history.";
  } finally {
    loading.value = false;
  }
}

async function confirmPayment(bookingId: string) {
  const confirmed = confirm("Do you want to confirm payment for this booking?");
  if (!confirmed) return;

  payingId.value = bookingId;

  try {
    await api.post("/booking/payment/success", {
      bookingId,
      transactionId: `PAY-${Date.now()}`,
    });

    alert("Payment confirmed successfully.");
    await fetchBookings();
  } catch (err: any) {
    console.error(err);
    alert(err.response?.data?.message || "Failed to confirm payment.");
  } finally {
    payingId.value = "";
  }
}

async function cancelBooking(bookingId: string) {
  const confirmed = confirm("Are you sure you want to cancel this booking?");
  if (!confirmed) return;

  cancellingId.value = bookingId;

  try {
    /*
      Change this endpoint if your backend cancel route is different.
      Common examples:
      await api.patch(`/booking/${bookingId}/cancel`);
      await api.put(`/booking/${bookingId}/cancel`);
      await api.delete(`/booking/${bookingId}`);
    */
    await api.patch(`/booking/${bookingId}/cancel`);

    alert("Booking cancelled successfully.");
    await fetchBookings();
  } catch (err: any) {
    console.error(err);

    alert(
      err.response?.data?.message ||
        "Failed to cancel booking. Please check your backend cancel endpoint.",
    );
  } finally {
    cancellingId.value = "";
  }
}

function viewBookingDetail(id: string) {
  router.push({
    name: "booking-detail",
    params: { id },
  });
}

function goToFeedback(id: string) {
  router.push({
    name: "customer-feedback",
    params: { id },
  });
}

function goBackToProfile() {
  router.push("/customer/profile");
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

onMounted(() => {
  fetchBookings();
});
</script>

<template>
  <div class="history-page">
    <CustomerNavbar />

    <main class="history-container">
      <section class="page-header">
        <div>
          <span>Customer Booking Center</span>
          <h1>Booking History</h1>
          <p>
            Track your tours, payments, guide details, booking status, and
            review history.
          </p>
        </div>

        <div class="header-actions">
          <button class="back-btn" @click="goBackToProfile">
            Back to Profile
          </button>

          <button class="refresh-btn" @click="fetchBookings">Refresh</button>
        </div>
      </section>

      <section class="summary-grid">
        <div class="summary-card">
          <span>Total Bookings</span>
          <strong>{{ stats.total }}</strong>
        </div>

        <div class="summary-card">
          <span>Confirmed</span>
          <strong>{{ stats.confirmed }}</strong>
        </div>

        <div class="summary-card warning">
          <span>Pending Payment</span>
          <strong>{{ stats.pendingPayment }}</strong>
        </div>

        <div class="summary-card">
          <span>Total Spent</span>
          <strong>{{ formatMoney(stats.totalSpent) }}</strong>
        </div>
      </section>

      <section class="filters">
        <div class="filter-main">
          <input
            v-model="search"
            type="text"
            placeholder="Search tour name, reference code, provider, guide, location, or transaction ID"
            @input="currentPage = 1"
          />
        </div>

        <div class="filter-grid">
          <select v-model="statusFilter" @change="currentPage = 1">
            <option value="all">All Booking Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select v-model="paymentFilter" @change="currentPage = 1">
            <option value="all">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>

          <input v-model="dateFrom" type="date" @change="currentPage = 1" />

          <input v-model="dateTo" type="date" @change="currentPage = 1" />

          <select v-model="sortBy" @change="currentPage = 1">
            <option value="newest">Sort: Newest Tour Date</option>
            <option value="oldest">Sort: Oldest Tour Date</option>
            <option value="highest">Sort: Highest Amount</option>
            <option value="lowest">Sort: Lowest Amount</option>
          </select>

          <select v-model="perPage" @change="currentPage = 1">
            <option :value="5">5 per page</option>
            <option :value="10">10 per page</option>
            <option :value="20">20 per page</option>
          </select>
        </div>

        <div class="filter-footer">
          <p>
            Showing {{ paginatedBookings.length }} of
            {{ filteredBookings.length }} booking(s)
          </p>

          <button @click="resetFilters">Reset Filters</button>
        </div>
      </section>

      <section v-if="loading" class="skeleton-list">
        <div v-for="item in 3" :key="item" class="skeleton-card">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </section>

      <p v-if="error" class="error-message">{{ error }}</p>

      <section v-if="!loading && !filteredBookings.length" class="empty-box">
        <h2>No bookings found</h2>
        <p>Try changing your search keyword or filters.</p>
      </section>

      <section v-if="!loading && paginatedBookings.length" class="booking-list">
        <article
          v-for="booking in paginatedBookings"
          :key="booking.id"
          class="booking-card"
        >
          <div class="booking-top">
            <div class="booking-title">
              <span class="reference">
                {{ booking.referenceCode || "No Reference" }}
              </span>

              <h2>{{ booking.service?.title || "Unknown Service" }}</h2>

              <p>
                Provider:
                <strong>
                  {{ booking.provider?.companyName || "Unknown Provider" }}
                </strong>
              </p>
            </div>

            <div class="amount-box">
              <span>Total Amount</span>
              <strong>{{ formatMoney(booking.totalAmount) }}</strong>
            </div>
          </div>

          <div class="booking-info-grid">
            <div>
              <label>Tour Date</label>
              <p>{{ formatDate(booking.bookingDate) }}</p>
            </div>

            <div>
              <label>Duration</label>
              <p>{{ getTourDuration(booking) }}</p>
            </div>

            <div>
              <label>Location</label>
              <p>{{ getTourLocation(booking) }}</p>
            </div>

            <div>
              <label>Quantity</label>
              <p>{{ booking.quantity }}</p>
            </div>
          </div>

          <div class="status-row">
            <span :class="['status-badge', statusClass(booking.bookingStatus)]">
              Booking: {{ booking.bookingStatus }}
            </span>

            <span
              :class="['payment-badge', statusClass(booking.paymentStatus)]"
            >
              Payment: {{ booking.paymentStatus }}
            </span>
          </div>

          <div
            v-if="expandedBookingId === booking.id"
            class="extra-detail-panel"
          >
            <div class="detail-grid">
              <div>
                <label>Booking ID</label>
                <p>{{ booking.id }}</p>
              </div>

              <div>
                <label>Transaction ID</label>
                <p>{{ booking.transactionId || "N/A" }}</p>
              </div>

              <div>
                <label>Tour Guide</label>
                <p>{{ getGuideName(booking) }}</p>
              </div>

              <div>
                <label>Guide Contact</label>
                <p>{{ getGuideContact(booking) }}</p>
              </div>

              <div>
                <label>Guide Rating</label>
                <p>
                  {{
                    getGuideRating(booking)
                      ? `${getGuideRating(booking)} / 5`
                      : "No rating yet"
                  }}
                </p>
              </div>

              <div>
                <label>Created At</label>
                <p>
                  {{ formatDate(booking.createdAt || booking.bookingDate) }}
                </p>
              </div>
            </div>

            <div class="itinerary-box">
              <label>Tour Itinerary</label>
              <p>
                {{
                  booking.service?.itinerary ||
                  "Itinerary is not available for this booking."
                }}
              </p>
            </div>
          </div>

          <div class="booking-actions">
            <button @click="viewBookingDetail(booking.id)">View Ticket</button>

            <button class="outline-btn" @click="toggleExpand(booking.id)">
              {{
                expandedBookingId === booking.id
                  ? "Hide Details"
                  : "More Details"
              }}
            </button>

            <button
              v-if="booking.bookingStatus?.toLowerCase() === 'confirmed'"
              class="outline-btn"
              @click="goToFeedback(booking.id)"
            >
              Write Review
            </button>

            <button
              v-if="booking.paymentStatus?.toLowerCase() === 'pending'"
              class="pay-btn"
              :disabled="payingId === booking.id"
              @click="confirmPayment(booking.id)"
            >
              {{ payingId === booking.id ? "Processing..." : "Pay Now" }}
            </button>

            <button
              v-if="canCancelBooking(booking)"
              class="cancel-btn"
              :disabled="cancellingId === booking.id"
              @click="cancelBooking(booking.id)"
            >
              {{
                cancellingId === booking.id ? "Cancelling..." : "Cancel Booking"
              }}
            </button>
          </div>
        </article>
      </section>

      <section v-if="!loading && filteredBookings.length" class="pagination">
        <button :disabled="currentPage === 1" @click="previousPage">
          Previous
        </button>

        <span>Page {{ currentPage }} of {{ totalPages }}</span>

        <button :disabled="currentPage === totalPages" @click="nextPage">
          Next
        </button>
      </section>
    </main>

    <CustomerFooter />
  </div>
</template>

<style scoped>
.history-page {
  min-height: 100vh;
  background: #f5f7f8;
  color: #152323;
  font-family: Arial, sans-serif;
}

.history-container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

.page-header {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 26px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  box-shadow: 0 10px 28px rgba(15, 35, 35, 0.06);
  animation: pageEnter 0.35s ease;
}

.page-header span {
  color: #0f6e70;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
}

.page-header h1 {
  margin: 6px 0;
  font-size: 30px;
}

.page-header p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.back-btn,
.outline-btn {
  background: #ffffff;
  color: #0f6e70;
  border: 1px solid #0f6e70;
  padding: 10px 18px;
  cursor: pointer;
  font-weight: 700;
}

.back-btn:hover,
.outline-btn:hover {
  background: #eef7f7;
}

.refresh-btn,
.booking-actions button {
  background: #0f6e70;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  cursor: pointer;
  font-weight: 700;
}

.refresh-btn:hover,
.booking-actions button:hover {
  background: #0a5557;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 20px 0;
}

.summary-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(15, 35, 35, 0.05);
  transition: transform 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-3px);
}

.summary-card span {
  color: #6b7280;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

.summary-card strong {
  display: block;
  margin-top: 8px;
  color: #0f6e70;
  font-size: 26px;
}

.summary-card.warning strong {
  color: #c2410c;
}

.filters {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 18px;
  margin: 18px 0;
  box-shadow: 0 8px 24px rgba(15, 35, 35, 0.05);
}

.filter-main {
  margin-bottom: 12px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

.filters input,
.filters select {
  width: 100%;
  border: 1px solid #d1d5db;
  padding: 11px 12px;
  font-size: 14px;
  outline: none;
  background: #ffffff;
}

.filters input:focus,
.filters select:focus {
  border-color: #0f6e70;
  box-shadow: 0 0 0 3px rgba(15, 110, 112, 0.12);
}

.filter-footer {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  margin-top: 14px;
}

.filter-footer p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.filter-footer button {
  background: #ffffff;
  color: #0f6e70;
  border: 1px solid #0f6e70;
  padding: 9px 14px;
  cursor: pointer;
  font-weight: 700;
}

.error-message {
  color: #dc2626;
  font-weight: 700;
}

.empty-box {
  background: #ffffff;
  border: 1px dashed #d1d5db;
  padding: 38px;
  text-align: center;
  color: #6b7280;
}

.empty-box h2 {
  margin: 0 0 8px;
  color: #111827;
}

.booking-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.booking-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(15, 35, 35, 0.05);
  animation: cardEnter 0.3s ease;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.booking-card:hover {
  transform: translateY(-3px);
  border-color: #0f6e70;
  box-shadow: 0 14px 30px rgba(15, 110, 112, 0.12);
}

.booking-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.reference {
  display: inline-block;
  background: #eef7f7;
  color: #0f6e70;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 10px;
}

.booking-title h2 {
  margin: 0 0 8px;
  font-size: 20px;
}

.booking-title p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.booking-title strong {
  color: #0f6e70;
}

.amount-box {
  text-align: right;
  white-space: nowrap;
}

.amount-box span {
  display: block;
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.amount-box strong {
  display: block;
  color: #0f6e70;
  font-size: 24px;
  margin-top: 6px;
}

.booking-info-grid,
.detail-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-top: 18px;
}

.booking-info-grid div,
.detail-grid div {
  background: #fbfcfc;
  border: 1px solid #e5e7eb;
  padding: 12px;
}

.booking-info-grid label,
.detail-grid label,
.itinerary-box label {
  display: block;
  color: #6b7280;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.booking-info-grid p,
.detail-grid p,
.itinerary-box p {
  margin: 0;
  color: #111827;
  font-size: 14px;
  word-break: break-word;
}

.status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.status-badge,
.payment-badge {
  padding: 5px 10px;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 11px;
}

.status-badge.pending,
.payment-badge.pending {
  background: #fff7ed;
  color: #c2410c;
}

.status-badge.confirmed,
.payment-badge.paid {
  background: #ecfdf5;
  color: #047857;
}

.status-badge.cancelled,
.payment-badge.failed {
  background: #fef2f2;
  color: #dc2626;
}

.extra-detail-panel {
  margin-top: 18px;
  border-top: 1px solid #e5e7eb;
  padding-top: 18px;
  animation: detailEnter 0.25s ease;
}

.itinerary-box {
  margin-top: 14px;
  background: #fbfcfc;
  border: 1px solid #e5e7eb;
  padding: 12px;
}

.booking-actions {
  margin-top: 18px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pay-btn {
  background: #047857 !important;
}

.pay-btn:hover {
  background: #065f46 !important;
}

.cancel-btn {
  background: #dc2626 !important;
}

.cancel-btn:hover {
  background: #b91c1c !important;
}

.booking-actions button:disabled,
.pagination button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.pagination {
  margin-top: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
}

.pagination button {
  background: #0f6e70;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  cursor: pointer;
  font-weight: 700;
}

.pagination span {
  color: #374151;
  font-weight: 700;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.skeleton-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 20px;
}

.skeleton-card span {
  display: block;
  height: 14px;
  background: linear-gradient(90deg, #e5e7eb, #f8fafc, #e5e7eb);
  background-size: 200% 100%;
  animation: skeletonMove 1.1s infinite;
  margin: 10px 0;
}

.skeleton-card span:first-child {
  width: 50%;
  height: 24px;
}

.skeleton-card span:nth-child(2) {
  width: 75%;
}

.skeleton-card span:nth-child(3) {
  width: 35%;
}

@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes detailEnter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes skeletonMove {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}

@media (max-width: 1050px) {
  .filter-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .booking-info-grid,
  .detail-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 760px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .filter-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .booking-top {
    flex-direction: column;
  }

  .amount-box {
    text-align: left;
  }

  .booking-info-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-wrap: wrap;
  }
}

@media (max-width: 520px) {
  .history-container {
    padding: 16px 12px 32px;
  }

  .page-header,
  .filters,
  .booking-card,
  .summary-card {
    padding: 16px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .booking-actions button,
  .back-btn,
  .refresh-btn {
    width: 100%;
  }
}
</style>
