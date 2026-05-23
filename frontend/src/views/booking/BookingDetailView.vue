<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import CustomerNavbar from "../../components/customer/CustomerNavbar.vue";
import CustomerFooter from "../../components/customer/CustomerFooter.vue";
import api from "../../services/api";

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const error = ref("");
const booking = ref<any>(null);

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

async function fetchBookingDetail() {
  loading.value = true;
  error.value = "";

  try {
    const bookingId = route.params.id;
    const response = await api.get(`/booking/${bookingId}`);
    booking.value = response.data.data;
  } catch (err) {
    console.error(err);
    error.value = "Failed to load booking detail.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchBookingDetail();
});
</script>

<template>
  <div class="detail-page">
    <CustomerNavbar />

    <main class="detail-container">
      <button class="back-btn" @click="router.back()">Back</button>

      <p v-if="loading" class="message">Loading booking detail...</p>
      <p v-if="error" class="error-message">{{ error }}</p>

      <section v-if="booking" class="ticket-card">
        <div class="ticket-header">
          <div>
            <h1>Booking Ticket</h1>
            <p>Booking ID: {{ booking.id }}</p>
          </div>

          <span :class="['status-badge', statusClass(booking.bookingStatus)]">
            {{ booking.bookingStatus }}
          </span>
        </div>

        <div class="ticket-body">
          <div class="section">
            <h2>Tour Information</h2>

            <div class="info-grid">
              <div>
                <label>Service</label>
                <p>{{ booking.service?.title || "Unknown Service" }}</p>
              </div>

              <div>
                <label>Provider</label>
                <p>{{ booking.provider?.companyName || "Unknown Provider" }}</p>
              </div>

              <div>
                <label>Booking Date</label>
                <p>{{ formatDate(booking.bookingDate) }}</p>
              </div>

              <div>
                <label>Quantity</label>
                <p>{{ booking.quantity }}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Payment Information</h2>

            <div class="info-grid">
              <div>
                <label>Total Amount</label>
                <p class="price">{{ formatMoney(booking.totalAmount) }}</p>
              </div>

              <div>
                <label>Payment Status</label>
                <p>
                  <span
                    :class="[
                      'payment-badge',
                      statusClass(booking.paymentStatus),
                    ]"
                  >
                    {{ booking.paymentStatus }}
                  </span>
                </p>
              </div>

              <div>
                <label>Transaction ID</label>
                <p>{{ booking.transactionId || "N/A" }}</p>
              </div>

              <div>
                <label>Created At</label>
                <p>{{ formatDate(booking.createdAt) }}</p>
              </div>
            </div>
          </div>

          <div class="section" v-if="booking.user">
            <h2>Customer Information</h2>

            <div class="info-grid">
              <div>
                <label>Name</label>
                <p>{{ booking.user.username || booking.user.name || "N/A" }}</p>
              </div>

              <div>
                <label>Email</label>
                <p>{{ booking.user.email || "N/A" }}</p>
              </div>

              <div>
                <label>Phone</label>
                <p>
                  {{ booking.user.phoneNumber || booking.user.phone || "N/A" }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <CustomerFooter />
  </div>
</template>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: #f5f7f8;
  color: #152323;
  font-family: Arial, sans-serif;
}

.detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

.back-btn {
  background: #ffffff;
  border: 1px solid #d1d5db;
  padding: 10px 16px;
  cursor: pointer;
  margin-bottom: 16px;
  font-weight: 600;
}

.back-btn:hover {
  border-color: #0f6e70;
  color: #0f6e70;
}

.ticket-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
}

.ticket-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.ticket-header h1 {
  margin: 0 0 8px;
  font-size: 26px;
}

.ticket-header p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.ticket-body {
  padding: 24px;
}

.section {
  margin-bottom: 28px;
}

.section:last-child {
  margin-bottom: 0;
}

.section h2 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #0f6e70;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-grid label {
  display: block;
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.info-grid p {
  margin: 0;
  color: #111827;
  font-size: 15px;
}

.price {
  color: #0f6e70 !important;
  font-size: 22px !important;
  font-weight: 700;
}

.status-badge,
.payment-badge {
  padding: 5px 12px;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 12px;
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

.message {
  color: #6b7280;
}

.error-message {
  color: #dc2626;
  font-weight: 600;
}

@media (max-width: 700px) {
  .ticket-header {
    flex-direction: column;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
