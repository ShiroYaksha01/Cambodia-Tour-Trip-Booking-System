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
}

interface ProviderInfo {
  id?: string;
  companyName?: string;
}

interface Booking {
  id: string;
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
const error = ref("");
const search = ref("");
const statusFilter = ref("all");
const paymentFilter = ref("all");

const filteredBookings = computed(() => {
  let list = bookings.value;

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

  if (search.value.trim()) {
    const q = search.value.toLowerCase();

    list = list.filter(
      (booking) =>
        booking.id.toLowerCase().includes(q) ||
        booking.service?.title?.toLowerCase().includes(q) ||
        booking.provider?.companyName?.toLowerCase().includes(q) ||
        booking.transactionId?.toLowerCase().includes(q),
    );
  }

  return list;
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

function viewBookingDetail(id: string) {
  router.push({
    name: "booking-detail",
    params: { id },
  });
}

function goBackToProfile() {
  router.push("/customer/profile");
}

onMounted(() => {
  fetchBookings();
});
</script>

<template>
  <div class="history-page">
    <CustomerNavbar />

    <main class="history-container">
      <div class="page-header">
        <div>
          <h1>Booking History</h1>
          <p>View your bookings, payment status, and ticket details.</p>
        </div>

        <div class="header-actions">
          <button class="back-btn" @click="goBackToProfile">
            Back to Profile
          </button>

          <button class="refresh-btn" @click="fetchBookings">Refresh</button>
        </div>
      </div>

      <section class="filters">
        <input
          v-model="search"
          type="text"
          placeholder="Search by tour, provider, booking ID, or transaction ID"
        />

        <select v-model="statusFilter">
          <option value="all">All Booking Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select v-model="paymentFilter">
          <option value="all">All Payment Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </section>

      <p v-if="loading" class="message">Loading booking history...</p>
      <p v-if="error" class="error-message">{{ error }}</p>

      <section v-if="!loading && !filteredBookings.length" class="empty-box">
        No bookings found.
      </section>

      <section v-if="filteredBookings.length" class="booking-list">
        <article
          v-for="booking in filteredBookings"
          :key="booking.id"
          class="booking-card"
        >
          <div class="booking-top">
            <div>
              <h2>{{ booking.service?.title || "Unknown Service" }}</h2>

              <p>
                Provider:
                {{ booking.provider?.companyName || "Unknown Provider" }}
              </p>

              <p>Booking ID: {{ booking.id }}</p>

              <p>
                Transaction ID:
                {{ booking.transactionId || "N/A" }}
              </p>
            </div>

            <div class="amount">
              {{ formatMoney(booking.totalAmount) }}
            </div>
          </div>

          <div class="booking-info">
            <span>Date: {{ formatDate(booking.bookingDate) }}</span>
            <span>Quantity: {{ booking.quantity }}</span>

            <span :class="['status-badge', statusClass(booking.bookingStatus)]">
              Booking: {{ booking.bookingStatus }}
            </span>

            <span
              :class="['payment-badge', statusClass(booking.paymentStatus)]"
            >
              Payment: {{ booking.paymentStatus }}
            </span>
          </div>

          <div class="booking-actions">
            <button @click="viewBookingDetail(booking.id)">View Ticket</button>

            <button
              v-if="booking.paymentStatus?.toLowerCase() === 'pending'"
              class="pay-btn"
              :disabled="payingId === booking.id"
              @click="confirmPayment(booking.id)"
            >
              {{ payingId === booking.id ? "Processing..." : "Pay Now" }}
            </button>
          </div>
        </article>
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
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

.page-header {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.page-header h1 {
  margin: 0 0 6px;
  font-size: 26px;
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

.back-btn {
  background: #ffffff;
  color: #0f6e70;
  border: 1px solid #0f6e70;
  padding: 10px 18px;
  cursor: pointer;
  font-weight: 600;
}

.back-btn:hover {
  background: #eef7f7;
}

.refresh-btn,
.booking-actions button {
  background: #0f6e70;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  cursor: pointer;
  font-weight: 600;
}

.refresh-btn:hover,
.booking-actions button:hover {
  background: #0a5557;
}

.pay-btn {
  background: #047857 !important;
}

.pay-btn:hover {
  background: #065f46 !important;
}

.pay-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.filters {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 18px;
  margin: 18px 0;
  display: grid;
  grid-template-columns: 1fr 190px 190px;
  gap: 12px;
}

.filters input,
.filters select {
  border: 1px solid #d1d5db;
  padding: 11px 12px;
  font-size: 14px;
  outline: none;
}

.filters input:focus,
.filters select:focus {
  border-color: #0f6e70;
}

.message {
  color: #6b7280;
}

.error-message {
  color: #dc2626;
  font-weight: 600;
}

.empty-box {
  background: #ffffff;
  border: 1px dashed #d1d5db;
  padding: 34px;
  text-align: center;
  color: #6b7280;
}

.booking-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.booking-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 20px;
}

.booking-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.booking-top h2 {
  margin: 0 0 8px;
  font-size: 18px;
}

.booking-top p {
  margin: 4px 0;
  color: #6b7280;
  font-size: 14px;
}

.amount {
  color: #0f6e70;
  font-size: 22px;
  font-weight: 700;
  white-space: nowrap;
}

.booking-info {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
  align-items: center;
}

.booking-info span {
  font-size: 13px;
}

.status-badge,
.payment-badge {
  padding: 5px 10px;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 11px !important;
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

.booking-actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 800px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .booking-top {
    flex-direction: column;
  }
}
</style>
