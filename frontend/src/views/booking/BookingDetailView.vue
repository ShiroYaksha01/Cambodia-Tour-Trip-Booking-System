<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import CustomerNavbar from "../../components/customer/CustomerNavbar.vue";
import CustomerFooter from "../../components/customer/CustomerFooter.vue";
import api from "../../services/api";

const route = useRoute();
const router = useRouter();

interface ServiceInfo {
  id?: string;
  title?: string;
  price?: number;
  duration?: string;
  location?: string;
  tourLocation?: string;
  address?: string;
  description?: string;
  itinerary?: string;
  guideName?: string;
  guidePhone?: string;
  guideContact?: string;
  guideRating?: number;
}

interface ProviderInfo {
  id?: string;
  companyName?: string;
  phone?: string;
  phoneNumber?: string;
  email?: string;
  rating?: number;
}

interface CustomerInfo {
  username?: string;
  name?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
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
  updatedAt?: string;
  service?: ServiceInfo;
  provider?: ProviderInfo;
  user?: CustomerInfo;
}

const loading = ref(false);
const payingId = ref("");
const cancellingId = ref("");
const error = ref("");
const booking = ref<Booking | null>(null);

const activeSection = ref<"overview" | "payment" | "guide" | "customer">(
  "overview",
);

const bookingId = computed(() => String(route.params.id || ""));

const isPendingPayment = computed(() => {
  return booking.value?.paymentStatus?.toLowerCase() === "pending";
});

const isConfirmed = computed(() => {
  return booking.value?.bookingStatus?.toLowerCase() === "confirmed";
});

const isCancelled = computed(() => {
  return booking.value?.bookingStatus?.toLowerCase() === "cancelled";
});

const canCancelBooking = computed(() => {
  if (!booking.value) return false;

  const status = booking.value.bookingStatus?.toLowerCase();
  const payment = booking.value.paymentStatus?.toLowerCase();

  return status !== "cancelled" && payment !== "paid";
});

const timelineSteps = computed(() => {
  const status = booking.value?.bookingStatus?.toLowerCase();
  const payment = booking.value?.paymentStatus?.toLowerCase();

  return [
    {
      title: "Booking Created",
      active: true,
      text: "Your booking request was created.",
    },
    {
      title: "Payment",
      active: payment === "paid",
      text:
        payment === "paid"
          ? "Payment has been completed."
          : "Payment is waiting.",
    },
    {
      title: "Confirmed",
      active: status === "confirmed",
      text:
        status === "confirmed"
          ? "Your booking is confirmed."
          : "Waiting for confirmation.",
    },
  ];
});

function formatDate(date: string | undefined) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(date: string | undefined) {
  if (!date) return "N/A";

  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(amount: number | undefined) {
  return `$${Number(amount || 0).toLocaleString()}`;
}

function statusClass(status: string | undefined) {
  return status?.toLowerCase() || "pending";
}

function getTourLocation() {
  return (
    booking.value?.service?.location ||
    booking.value?.service?.tourLocation ||
    booking.value?.service?.address ||
    "Location not provided"
  );
}

function getTourDuration() {
  return booking.value?.service?.duration || "Duration not provided";
}

function getGuideName() {
  return booking.value?.service?.guideName || "Guide not assigned";
}

function getGuideContact() {
  return (
    booking.value?.service?.guidePhone ||
    booking.value?.service?.guideContact ||
    booking.value?.provider?.phoneNumber ||
    booking.value?.provider?.phone ||
    "Contact not provided"
  );
}

function getGuideRating() {
  return (
    booking.value?.service?.guideRating ||
    booking.value?.provider?.rating ||
    null
  );
}

function copyReferenceCode() {
  if (!booking.value?.referenceCode) {
    alert("Reference code not found.");
    return;
  }

  navigator.clipboard.writeText(booking.value.referenceCode);
  alert("Reference code copied.");
}

function printTicket() {
  window.print();
}

function addToCalendar() {
  if (!booking.value) return;

  const title = encodeURIComponent(
    booking.value.service?.title || "Tour Booking",
  );

  const details = encodeURIComponent(
    `Reference Code: ${booking.value.referenceCode || "N/A"}\nProvider: ${
      booking.value.provider?.companyName || "Unknown Provider"
    }\nTotal: ${formatMoney(booking.value.totalAmount)}`,
  );

  const location = encodeURIComponent(getTourLocation());

  const date = new Date(booking.value.bookingDate);
  const start = date.toISOString().replace(/[-:]|\.\d{3}/g, "");

  const endDate = new Date(date.getTime() + 60 * 60 * 1000);
  const end = endDate.toISOString().replace(/[-:]|\.\d{3}/g, "");

  window.open(
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`,
    "_blank",
  );
}

async function fetchBookingDetail() {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get(`/booking/${bookingId.value}`);
    booking.value = response.data.data || response.data;
  } catch (err) {
    console.error(err);
    error.value = "Failed to load booking detail.";
  } finally {
    loading.value = false;
  }
}

async function confirmPayment() {
  if (!booking.value) return;

  const confirmed = confirm("Do you want to confirm payment for this booking?");
  if (!confirmed) return;

  payingId.value = booking.value.id;

  try {
    await api.post("/booking/payment/success", {
      bookingId: booking.value.id,
      transactionId: `PAY-${Date.now()}`,
    });

    alert("Payment confirmed successfully.");
    await fetchBookingDetail();
  } catch (err: any) {
    console.error(err);
    alert(err.response?.data?.message || "Failed to confirm payment.");
  } finally {
    payingId.value = "";
  }
}

async function cancelBooking() {
  if (!booking.value) return;

  const confirmed = confirm("Are you sure you want to cancel this booking?");
  if (!confirmed) return;

  cancellingId.value = booking.value.id;

  try {
    /*
      Change this endpoint if your backend cancel route is different.
      Example alternatives:
      await api.put(`/booking/${booking.value.id}/cancel`);
      await api.delete(`/booking/${booking.value.id}`);
    */
    await api.patch(`/booking/${booking.value.id}/cancel`);

    alert("Booking cancelled successfully.");
    await fetchBookingDetail();
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

function goToFeedback() {
  if (!booking.value) return;

  router.push({
    name: "customer-feedback",
    params: { id: booking.value.id },
  });
}

function goBack() {
  router.back();
}

onMounted(() => {
  fetchBookingDetail();
});
</script>

<template>
  <div class="detail-page">
    <CustomerNavbar />

    <main class="detail-container">
      <div class="top-actions no-print">
        <button class="back-btn" @click="goBack">Back</button>

        <div class="quick-actions">
          <button v-if="booking" class="outline-btn" @click="copyReferenceCode">
            Copy Reference
          </button>

          <button v-if="booking" class="outline-btn" @click="addToCalendar">
            Add Calendar
          </button>

          <button v-if="booking" class="outline-btn" @click="printTicket">
            Print Ticket
          </button>
        </div>
      </div>

      <section v-if="loading" class="skeleton-ticket">
        <div class="skeleton-line large"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-grid">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </section>

      <p v-if="error" class="error-message">{{ error }}</p>

      <section v-if="booking && !loading" class="ticket-card">
        <div class="ticket-header">
          <div>
            <span class="ticket-label">Booking Ticket</span>
            <h1>{{ booking.service?.title || "Unknown Service" }}</h1>

            <p>
              Reference Code:
              <strong>{{ booking.referenceCode || "N/A" }}</strong>
            </p>

            <p>Booking ID: {{ booking.id }}</p>
          </div>

          <div class="ticket-status">
            <span :class="['status-badge', statusClass(booking.bookingStatus)]">
              {{ booking.bookingStatus }}
            </span>

            <span
              :class="['payment-badge', statusClass(booking.paymentStatus)]"
            >
              Payment: {{ booking.paymentStatus }}
            </span>
          </div>
        </div>

        <div v-if="isPendingPayment" class="payment-warning no-print">
          <div>
            <strong>Payment Required</strong>
            <p>
              This booking is not paid yet. Please complete payment to confirm
              it.
            </p>
          </div>

          <button
            class="pay-btn"
            :disabled="payingId === booking.id"
            @click="confirmPayment"
          >
            {{ payingId === booking.id ? "Processing..." : "Pay Now" }}
          </button>
        </div>

        <div v-if="isCancelled" class="cancel-warning">
          This booking has been cancelled.
        </div>

        <section class="timeline-section">
          <div
            v-for="step in timelineSteps"
            :key="step.title"
            class="timeline-step"
            :class="{ active: step.active }"
          >
            <div class="step-dot"></div>

            <div>
              <strong>{{ step.title }}</strong>
              <p>{{ step.text }}</p>
            </div>
          </div>
        </section>

        <div class="detail-layout">
          <aside class="summary-panel">
            <h2>Ticket Summary</h2>

            <div class="qr-box">
              <div class="fake-qr">
                {{ booking.referenceCode?.slice(0, 2) || "BK" }}
              </div>

              <p>Show this ticket reference during check-in.</p>
            </div>

            <div class="summary-list">
              <div>
                <span>Tour Date</span>
                <strong>{{ formatDate(booking.bookingDate) }}</strong>
              </div>

              <div>
                <span>Total Amount</span>
                <strong>{{ formatMoney(booking.totalAmount) }}</strong>
              </div>

              <div>
                <span>Quantity</span>
                <strong>{{ booking.quantity }}</strong>
              </div>

              <div>
                <span>Provider</span>
                <strong>
                  {{ booking.provider?.companyName || "Unknown Provider" }}
                </strong>
              </div>
            </div>

            <div class="summary-actions no-print">
              <button
                v-if="isConfirmed"
                class="review-btn"
                @click="goToFeedback"
              >
                Write Review
              </button>

              <button
                v-if="canCancelBooking"
                class="cancel-btn"
                :disabled="cancellingId === booking.id"
                @click="cancelBooking"
              >
                {{
                  cancellingId === booking.id
                    ? "Cancelling..."
                    : "Cancel Booking"
                }}
              </button>
            </div>
          </aside>

          <section class="main-detail-panel">
            <nav class="detail-tabs no-print">
              <button
                :class="{ active: activeSection === 'overview' }"
                @click="activeSection = 'overview'"
              >
                Overview
              </button>

              <button
                :class="{ active: activeSection === 'payment' }"
                @click="activeSection = 'payment'"
              >
                Payment
              </button>

              <button
                :class="{ active: activeSection === 'guide' }"
                @click="activeSection = 'guide'"
              >
                Guide
              </button>

              <button
                :class="{ active: activeSection === 'customer' }"
                @click="activeSection = 'customer'"
              >
                Customer
              </button>
            </nav>

            <Transition name="fade-slide" mode="out-in">
              <div
                v-if="activeSection === 'overview'"
                key="overview"
                class="section"
              >
                <h2>Tour Information</h2>

                <div class="info-grid">
                  <div>
                    <label>Reference Code</label>
                    <p>{{ booking.referenceCode || "N/A" }}</p>
                  </div>

                  <div>
                    <label>Service</label>
                    <p>{{ booking.service?.title || "Unknown Service" }}</p>
                  </div>

                  <div>
                    <label>Provider</label>
                    <p>
                      {{ booking.provider?.companyName || "Unknown Provider" }}
                    </p>
                  </div>

                  <div>
                    <label>Tour Date</label>
                    <p>{{ formatDate(booking.bookingDate) }}</p>
                  </div>

                  <div>
                    <label>Duration</label>
                    <p>{{ getTourDuration() }}</p>
                  </div>

                  <div>
                    <label>Location</label>
                    <p>{{ getTourLocation() }}</p>
                  </div>

                  <div>
                    <label>Quantity</label>
                    <p>{{ booking.quantity }}</p>
                  </div>

                  <div>
                    <label>Created At</label>
                    <p>{{ formatDateTime(booking.createdAt) }}</p>
                  </div>
                </div>

                <div class="description-box">
                  <h3>Tour Description</h3>
                  <p>
                    {{
                      booking.service?.description ||
                      "No description available for this tour."
                    }}
                  </p>
                </div>

                <div class="description-box">
                  <h3>Itinerary</h3>
                  <p>
                    {{
                      booking.service?.itinerary ||
                      "Itinerary is not available for this booking."
                    }}
                  </p>
                </div>
              </div>

              <div
                v-else-if="activeSection === 'payment'"
                key="payment"
                class="section"
              >
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
                    <label>Booking Status</label>
                    <p>
                      <span
                        :class="[
                          'status-badge',
                          statusClass(booking.bookingStatus),
                        ]"
                      >
                        {{ booking.bookingStatus }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div
                v-else-if="activeSection === 'guide'"
                key="guide"
                class="section"
              >
                <h2>Guide & Provider Information</h2>

                <div class="info-grid">
                  <div>
                    <label>Guide Name</label>
                    <p>{{ getGuideName() }}</p>
                  </div>

                  <div>
                    <label>Guide Contact</label>
                    <p>{{ getGuideContact() }}</p>
                  </div>

                  <div>
                    <label>Guide Rating</label>
                    <p>
                      {{
                        getGuideRating()
                          ? `${getGuideRating()} / 5`
                          : "No rating yet"
                      }}
                    </p>
                  </div>

                  <div>
                    <label>Provider Email</label>
                    <p>{{ booking.provider?.email || "Email not provided" }}</p>
                  </div>

                  <div>
                    <label>Provider Phone</label>
                    <p>
                      {{
                        booking.provider?.phoneNumber ||
                        booking.provider?.phone ||
                        "Phone not provided"
                      }}
                    </p>
                  </div>

                  <div>
                    <label>Provider Name</label>
                    <p>
                      {{ booking.provider?.companyName || "Unknown Provider" }}
                    </p>
                  </div>
                </div>
              </div>

              <div v-else key="customer" class="section">
                <h2>Customer Information</h2>

                <div v-if="booking.user" class="info-grid">
                  <div>
                    <label>Name</label>
                    <p>
                      {{ booking.user.username || booking.user.name || "N/A" }}
                    </p>
                  </div>

                  <div>
                    <label>Email</label>
                    <p>{{ booking.user.email || "N/A" }}</p>
                  </div>

                  <div>
                    <label>Phone</label>
                    <p>
                      {{
                        booking.user.phoneNumber || booking.user.phone || "N/A"
                      }}
                    </p>
                  </div>
                </div>

                <div v-else class="empty-box">
                  Customer information is not available.
                </div>
              </div>
            </Transition>
          </section>
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
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

.top-actions {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  margin-bottom: 16px;
}

.quick-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.back-btn,
.outline-btn {
  background: #ffffff;
  border: 1px solid #0f6e70;
  color: #0f6e70;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 700;
}

.back-btn:hover,
.outline-btn:hover {
  background: #eef7f7;
}

.ticket-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 12px 30px rgba(15, 35, 35, 0.06);
  animation: pageEnter 0.35s ease;
}

.ticket-header {
  padding: 28px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  background: linear-gradient(135deg, #ffffff, #eef7f7);
}

.ticket-label {
  display: block;
  color: #0f6e70;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.ticket-header h1 {
  margin: 0 0 8px;
  font-size: 30px;
}

.ticket-header p {
  margin: 4px 0;
  color: #6b7280;
  font-size: 14px;
}

.ticket-header strong {
  color: #0f6e70;
}

.ticket-status {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.payment-warning {
  margin: 20px 24px 0;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.payment-warning strong {
  color: #c2410c;
}

.payment-warning p {
  margin: 5px 0 0;
  color: #7c2d12;
  font-size: 14px;
}

.cancel-warning {
  margin: 20px 24px 0;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 16px;
  font-weight: 800;
}

.timeline-section {
  padding: 22px 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  border-bottom: 1px solid #e5e7eb;
}

.timeline-step {
  display: flex;
  gap: 12px;
  border: 1px solid #e5e7eb;
  padding: 14px;
  background: #fbfcfc;
}

.step-dot {
  width: 14px;
  height: 14px;
  margin-top: 2px;
  background: #d1d5db;
  flex-shrink: 0;
}

.timeline-step.active .step-dot {
  background: #0f6e70;
}

.timeline-step strong {
  color: #111827;
  font-size: 14px;
}

.timeline-step p {
  margin: 5px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.detail-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  padding: 24px;
}

.summary-panel {
  border: 1px solid #e5e7eb;
  background: #fbfcfc;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.summary-panel h2 {
  margin: 0 0 16px;
  font-size: 20px;
}

.qr-box {
  border: 1px dashed #cbd5e1;
  background: #ffffff;
  padding: 18px;
  text-align: center;
  margin-bottom: 18px;
}

.fake-qr {
  width: 110px;
  height: 110px;
  background:
    linear-gradient(90deg, #111827 50%, transparent 50%),
    linear-gradient(#111827 50%, transparent 50%);
  background-size: 20px 20px;
  margin: 0 auto 12px;
  color: #0f6e70;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 8px solid #ffffff;
  box-shadow: 0 0 0 1px #d1d5db;
}

.qr-box p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-list div {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 12px;
}

.summary-list div:last-child {
  border-bottom: none;
}

.summary-list span {
  display: block;
  color: #6b7280;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.summary-list strong {
  color: #111827;
  font-size: 15px;
}

.summary-actions {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.review-btn,
.cancel-btn,
.pay-btn {
  border: none;
  padding: 11px 16px;
  cursor: pointer;
  font-weight: 800;
}

.review-btn {
  background: #0f6e70;
  color: #ffffff;
}

.review-btn:hover {
  background: #0a5557;
}

.cancel-btn {
  background: #dc2626;
  color: #ffffff;
}

.cancel-btn:hover {
  background: #b91c1c;
}

.pay-btn {
  background: #047857;
  color: #ffffff;
}

.pay-btn:hover {
  background: #065f46;
}

.cancel-btn:disabled,
.pay-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.main-detail-panel {
  min-width: 0;
}

.detail-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
  overflow-x: auto;
}

.detail-tabs button {
  background: transparent;
  border: none;
  padding: 12px 16px;
  cursor: pointer;
  color: #374151;
  font-weight: 800;
  border-bottom: 4px solid transparent;
  white-space: nowrap;
}

.detail-tabs button:hover,
.detail-tabs button.active {
  color: #0f6e70;
  border-bottom-color: #0f6e70;
  background: #eef7f7;
}

.section h2 {
  margin: 0 0 16px;
  font-size: 20px;
  color: #0f6e70;
}

.section h3 {
  margin: 0 0 8px;
  font-size: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-grid div {
  border: 1px solid #e5e7eb;
  background: #fbfcfc;
  padding: 15px;
}

.info-grid label {
  display: block;
  color: #6b7280;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.info-grid p {
  margin: 0;
  color: #111827;
  font-size: 15px;
  word-break: break-word;
}

.description-box {
  border: 1px solid #e5e7eb;
  background: #fbfcfc;
  padding: 16px;
  margin-top: 16px;
}

.description-box p {
  margin: 0;
  color: #374151;
  line-height: 1.6;
  font-size: 14px;
}

.price {
  color: #0f6e70 !important;
  font-size: 22px !important;
  font-weight: 800;
}

.status-badge,
.payment-badge {
  display: inline-block;
  padding: 6px 12px;
  font-weight: 800;
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

.empty-box {
  border: 1px dashed #d1d5db;
  padding: 28px;
  text-align: center;
  color: #6b7280;
}

.error-message {
  background: #ffffff;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 16px;
  font-weight: 700;
}

.skeleton-ticket {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 24px;
}

.skeleton-line,
.skeleton-grid span {
  display: block;
  height: 14px;
  background: linear-gradient(90deg, #e5e7eb, #f8fafc, #e5e7eb);
  background-size: 200% 100%;
  animation: skeletonMove 1.1s infinite;
  margin-bottom: 12px;
}

.skeleton-line.large {
  width: 45%;
  height: 28px;
}

.skeleton-line {
  width: 65%;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 20px;
}

.skeleton-grid span {
  height: 70px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
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

@keyframes skeletonMove {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}

@media print {
  .no-print,
  nav,
  footer {
    display: none !important;
  }

  .detail-page {
    background: #ffffff;
  }

  .detail-container {
    max-width: 100%;
    padding: 0;
  }

  .ticket-card {
    border: none;
    box-shadow: none;
  }

  .ticket-header {
    background: #ffffff;
  }

  .detail-layout {
    grid-template-columns: 1fr;
  }

  .summary-panel {
    position: static;
  }
}

@media (max-width: 980px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .summary-panel {
    position: static;
  }

  .timeline-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .top-actions,
  .ticket-header,
  .payment-warning {
    flex-direction: column;
    align-items: flex-start;
  }

  .quick-actions {
    width: 100%;
  }

  .quick-actions button,
  .back-btn,
  .payment-warning button {
    width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .detail-container {
    padding: 16px 12px 32px;
  }

  .ticket-header,
  .detail-layout,
  .timeline-section {
    padding: 16px;
  }

  .ticket-header h1 {
    font-size: 24px;
  }
}
</style>
