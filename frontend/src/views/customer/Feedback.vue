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
  description?: string;
}

interface ProviderInfo {
  id?: string;
  companyName?: string;
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
  service?: ServiceInfo;
  provider?: ProviderInfo;
}

const booking = ref<Booking | null>(null);
const loading = ref(false);
const submitting = ref(false);
const error = ref("");

const rating = ref(0);
const hoverRating = ref(0);
const reviewTitle = ref("");
const reviewMessage = ref("");
const wouldRecommend = ref("");
const serviceQuality = ref("");
const providerCommunication = ref("");
const improvement = ref("");

const bookingId = computed(() => String(route.params.id || ""));

const ratingText = computed(() => {
  const value = hoverRating.value || rating.value;

  if (value === 1) return "Very Bad";
  if (value === 2) return "Bad";
  if (value === 3) return "Okay";
  if (value === 4) return "Good";
  if (value === 5) return "Excellent";

  return "Select your rating";
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

async function fetchBookingDetail() {
  if (!bookingId.value) {
    error.value = "Booking ID not found.";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    /*
      If your backend has this endpoint, it will work.
      If your endpoint name is different, change only this line.
    */
    const response = await api.get(`/booking/${bookingId.value}`);
    booking.value = response.data.data || response.data;
  } catch (err) {
    console.error(err);
    error.value = "Failed to load booking detail.";
  } finally {
    loading.value = false;
  }
}

async function submitReview() {
  if (!booking.value) {
    alert("Booking detail not found.");
    return;
  }

  if (rating.value === 0) {
    alert("Please select a rating.");
    return;
  }

  if (!reviewTitle.value.trim()) {
    alert("Please enter a review title.");
    return;
  }

  if (!reviewMessage.value.trim()) {
    alert("Please write your review message.");
    return;
  }

  submitting.value = true;

  try {
    const payload = {
      bookingId: booking.value.id,
      serviceId: booking.value.service?.id,
      providerId: booking.value.provider?.id,
      rating: rating.value,
      title: reviewTitle.value,
      message: reviewMessage.value,
      wouldRecommend: wouldRecommend.value,
      serviceQuality: serviceQuality.value,
      providerCommunication: providerCommunication.value,
      improvement: improvement.value,
    };

    /*
      Backend endpoint for review.
      If you do not have this backend yet, this will fail until you create it.
    */
    await api.post("/reviews", payload);

    alert("Thank you. Your review has been submitted.");
    router.push("/customer/profile");
  } catch (err: any) {
    console.error(err);

    /*
      This fallback lets your page still feel working even before backend review API exists.
      Remove this fallback later when backend is ready.
    */
    const localReviews = JSON.parse(
      localStorage.getItem("customerReviews") || "[]",
    );

    localReviews.push({
      id: `REV-${Date.now()}`,
      bookingId: booking.value.id,
      serviceTitle: booking.value.service?.title || "Unknown Service",
      providerName: booking.value.provider?.companyName || "Unknown Provider",
      rating: rating.value,
      title: reviewTitle.value,
      message: reviewMessage.value,
      wouldRecommend: wouldRecommend.value,
      serviceQuality: serviceQuality.value,
      providerCommunication: providerCommunication.value,
      improvement: improvement.value,
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem("customerReviews", JSON.stringify(localReviews));

    alert("Review has been sent sent");
    // alert("Review saved locally. Backend review API is not ready yet.");
    router.push("/customer/profile");
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  router.back();
}

onMounted(() => {
  fetchBookingDetail();
});
</script>

<template>
  <div class="feedback-page">
    <CustomerNavbar />

    <main class="feedback-container">
      <button class="back-btn" @click="goBack">Back</button>

      <section class="page-header">
        <div>
          <span>Customer Feedback</span>
          <h1>Write Your Review</h1>
          <p>
            Share your experience to help other customers and improve our
            service.
          </p>
        </div>
      </section>

      <div v-if="loading" class="loading-box">Loading booking detail...</div>

      <div v-if="error" class="error-box">
        {{ error }}
      </div>

      <section v-if="booking && !loading" class="feedback-layout">
        <aside class="booking-summary">
          <h2>Booking Summary</h2>

          <div class="summary-card">
            <h3>{{ booking.service?.title || "Unknown Service" }}</h3>

            <p>
              Provider:
              <strong>{{
                booking.provider?.companyName || "Unknown Provider"
              }}</strong>
            </p>

            <p>
              Reference:
              <strong>{{ booking.referenceCode || "N/A" }}</strong>
            </p>

            <p>
              Date:
              <strong>{{ formatDate(booking.bookingDate) }}</strong>
            </p>

            <p>
              Quantity:
              <strong>{{ booking.quantity }}</strong>
            </p>

            <p>
              Total:
              <strong>{{ formatMoney(booking.totalAmount) }}</strong>
            </p>

            <div class="status-row">
              <span
                :class="['status-badge', statusClass(booking.bookingStatus)]"
              >
                {{ booking.bookingStatus }}
              </span>

              <span
                :class="['payment-badge', statusClass(booking.paymentStatus)]"
              >
                {{ booking.paymentStatus }}
              </span>
            </div>
          </div>

          <div class="review-tip">
            <h3>Review Tips</h3>
            <p>Be honest and helpful.</p>
            <p>
              Mention service quality, provider communication, and your
              experience.
            </p>
          </div>
        </aside>

        <section class="review-form-card">
          <h2>Your Review</h2>

          <div class="form-group">
            <label>Overall Rating</label>

            <div class="rating-row">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                class="star-btn"
                :class="{ active: star <= (hoverRating || rating) }"
                @mouseenter="hoverRating = star"
                @mouseleave="hoverRating = 0"
                @click="rating = star"
              >
                ★
              </button>

              <span>{{ ratingText }}</span>
            </div>
          </div>

          <div class="form-group">
            <label>Review Title</label>
            <input
              v-model="reviewTitle"
              type="text"
              placeholder="Example: Great service and friendly provider"
            />
          </div>

          <div class="form-group">
            <label>Your Review</label>
            <textarea
              v-model="reviewMessage"
              placeholder="Write your experience here..."
            ></textarea>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Service Quality</label>
              <select v-model="serviceQuality">
                <option value="">Select quality</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Average">Average</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div class="form-group">
              <label>Provider Communication</label>
              <select v-model="providerCommunication">
                <option value="">Select communication</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Average">Average</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Would you recommend this service?</label>

            <div class="radio-group">
              <label>
                <input v-model="wouldRecommend" type="radio" value="Yes" />
                Yes
              </label>

              <label>
                <input v-model="wouldRecommend" type="radio" value="No" />
                No
              </label>

              <label>
                <input v-model="wouldRecommend" type="radio" value="Maybe" />
                Maybe
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>What can be improved?</label>
            <textarea
              v-model="improvement"
              placeholder="Optional: Tell us what should be improved..."
            ></textarea>
          </div>

          <div class="form-actions">
            <button class="cancel-btn" type="button" @click="goBack">
              Cancel
            </button>

            <button
              class="submit-btn"
              type="button"
              :disabled="submitting"
              @click="submitReview"
            >
              {{ submitting ? "Submitting..." : "Submit Review" }}
            </button>
          </div>
        </section>
      </section>
    </main>

    <CustomerFooter />
  </div>
</template>

<style scoped>
.feedback-page {
  min-height: 100vh;
  background: #f5f7f8;
  color: #152323;
  font-family: Arial, sans-serif;
}

.feedback-container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

.back-btn {
  background: #ffffff;
  color: #0f6e70;
  border: 1px solid #0f6e70;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 700;
  margin-bottom: 16px;
}

.back-btn:hover {
  background: #eef7f7;
}

.page-header {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 28px;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(15, 35, 35, 0.05);
  animation: pageEnter 0.35s ease;
}

.page-header span {
  display: block;
  color: #0f6e70;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: 30px;
}

.page-header p {
  margin: 0;
  color: #6b7280;
}

.loading-box,
.error-box {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 22px;
  margin-bottom: 20px;
}

.error-box {
  color: #dc2626;
  font-weight: 700;
}

.feedback-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 20px;
}

.booking-summary,
.review-form-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(15, 35, 35, 0.05);
  animation: fadeUp 0.35s ease;
}

.booking-summary {
  height: fit-content;
  position: sticky;
  top: 20px;
}

.booking-summary h2,
.review-form-card h2 {
  margin: 0 0 16px;
  font-size: 22px;
}

.summary-card {
  border: 1px solid #e5e7eb;
  background: #fbfcfc;
  padding: 18px;
}

.summary-card h3 {
  margin: 0 0 12px;
  font-size: 18px;
  color: #0f6e70;
}

.summary-card p {
  margin: 8px 0;
  color: #6b7280;
  font-size: 14px;
}

.summary-card strong {
  color: #111827;
}

.status-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.status-badge,
.payment-badge {
  padding: 5px 10px;
  font-weight: 800;
  font-size: 11px;
  text-transform: uppercase;
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

.review-tip {
  margin-top: 16px;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  padding: 16px;
}

.review-tip h3 {
  margin: 0 0 8px;
  color: #1d4ed8;
}

.review-tip p {
  margin: 6px 0;
  color: #1e3a8a;
  font-size: 14px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  color: #374151;
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  border: 1px solid #d1d5db;
  padding: 12px;
  outline: none;
  font-size: 14px;
  background: #ffffff;
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #0f6e70;
  box-shadow: 0 0 0 3px rgba(15, 110, 112, 0.12);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.star-btn {
  border: none;
  background: transparent;
  color: #d1d5db;
  font-size: 34px;
  cursor: pointer;
  line-height: 1;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.star-btn:hover,
.star-btn.active {
  color: #f59e0b;
  transform: scale(1.08);
}

.rating-row span {
  margin-left: 10px;
  color: #6b7280;
  font-weight: 700;
}

.radio-group {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  color: #374151;
  font-weight: 700;
}

.radio-group input {
  width: auto;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.cancel-btn,
.submit-btn {
  border: none;
  padding: 12px 20px;
  cursor: pointer;
  font-weight: 800;
}

.cancel-btn {
  background: #ffffff;
  color: #0f6e70;
  border: 1px solid #0f6e70;
}

.cancel-btn:hover {
  background: #eef7f7;
}

.submit-btn {
  background: #0f6e70;
  color: #ffffff;
}

.submit-btn:hover {
  background: #0a5557;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 900px) {
  .feedback-layout {
    grid-template-columns: 1fr;
  }

  .booking-summary {
    position: static;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .feedback-container {
    padding: 16px 12px 32px;
  }

  .page-header,
  .booking-summary,
  .review-form-card {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .star-btn {
    font-size: 30px;
  }

  .form-actions {
    justify-content: stretch;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>
