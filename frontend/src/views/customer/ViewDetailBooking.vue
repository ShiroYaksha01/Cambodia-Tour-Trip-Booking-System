<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import CustomerNavbar from "../../components/customer/CustomerNavbar.vue";
import CustomerFooter from "../../components/customer/CustomerFooter.vue";

const route = useRoute();
const router = useRouter();
const bookingId = (route.query.id as string) ?? "BK-001";

// ─── Static mock data (keyed by booking ID) ───────────────────────────────
const bookingsMap: Record<string, any> = {
  "BK-001": {
    id: "BK-001",
    image: "🏛️",
    tour: "Angkor Wat Sunrise Tour",
    destination: "Siem Reap, Cambodia",
    bookingDate: "10 Apr 2026",
    travelDate: "15 May 2026",
    price: 89,
    guests: 2,
    status: "upcoming",
    duration: "1 Day",
    meetingPoint: "Pub Street, Siem Reap at 4:30 AM",
    guide: "Mr. Dara Sok",
    guidePhone: "+855 17 234 567",
    includes: [
      "Hotel pickup & drop-off",
      "Sunrise admission ticket",
      "Breakfast at local restaurant",
      "English-speaking guide",
      "Bottled water",
    ],
    excludes: ["Gratuities", "Personal expenses"],
    itinerary: [
      { time: "04:30 AM", event: "Hotel pickup from Siem Reap" },
      { time: "05:15 AM", event: "Arrive Angkor Wat – sunrise viewing" },
      { time: "07:00 AM", event: "Temple exploration with guide" },
      { time: "08:30 AM", event: "Breakfast at local restaurant" },
      { time: "10:30 AM", event: "Visit Bayon Temple & Ta Prohm" },
      { time: "12:30 PM", event: "Drop-off at hotel" },
    ],
    reviews: [
      {
        name: "Maly K.",
        rating: 5,
        comment: "Absolutely magical! The sunrise was breathtaking.",
        date: "Mar 2026",
      },
      {
        name: "James T.",
        rating: 5,
        comment: "Dara was an excellent guide, very knowledgeable.",
        date: "Feb 2026",
      },
    ],
    rating: 4.9,
    totalReviews: 234,
  },
  "BK-002": {
    id: "BK-002",
    image: "🏝️",
    tour: "Koh Rong Island Escape",
    destination: "Koh Rong, Cambodia",
    bookingDate: "22 Mar 2026",
    travelDate: "30 Jun 2026",
    price: 145,
    guests: 2,
    status: "upcoming",
    duration: "2 Days 1 Night",
    meetingPoint: "Sihanoukville Ferry Terminal at 8:00 AM",
    guide: "Ms. Chenda Ly",
    guidePhone: "+855 12 876 543",
    includes: [
      "Ferry tickets (return)",
      "1 night beachfront bungalow",
      "Breakfast & dinner",
      "Snorkeling gear",
      "Island tour",
    ],
    excludes: ["Alcoholic beverages", "Gratuities", "Travel insurance"],
    itinerary: [
      { time: "08:00 AM", event: "Depart Sihanoukville by ferry" },
      { time: "09:30 AM", event: "Arrive Koh Rong – check in" },
      { time: "11:00 AM", event: "Beach time & snorkeling" },
      { time: "01:00 PM", event: "Lunch at beach restaurant" },
      { time: "03:00 PM", event: "Island hike to viewpoint" },
      { time: "07:00 PM", event: "Dinner & bioluminescent water tour" },
      { time: "Day 2", event: "Morning swim, checkout, return ferry" },
    ],
    reviews: [
      {
        name: "Sophie M.",
        rating: 5,
        comment: "Paradise on earth! The bioluminescence was unreal.",
        date: "Jan 2026",
      },
    ],
    rating: 4.7,
    totalReviews: 189,
  },
};

const booking = bookingsMap[bookingId] ?? bookingsMap["BK-001"];
const showCancelModal = ref(false);
const toasts = ref<{ id: string; message: string }[]>([]);
const reviewText = ref("");
const reviewRating = ref(0);
const hoverRating = ref(0);
const showReviewBox = ref(false);

function addToast(msg: string) {
  const id = Date.now().toString();
  toasts.value.push({ id, message: msg });
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, 3000);
}

function downloadInvoice() {
  addToast(`Invoice ${booking.id} downloaded!`);
}
function submitReview() {
  if (!reviewRating.value) return;
  addToast("Review submitted — thank you!");
  showReviewBox.value = false;
  reviewText.value = "";
  reviewRating.value = 0;
}
</script>

<template>
  <div class="page">
    <CustomerNavbar />

    <!-- Toast -->
    <Teleport to="body">
      <div class="toast-container">
        <TransitionGroup name="toast">
          <div v-for="t in toasts" :key="t.id" class="toast">
            ✓ {{ t.message }}
          </div>
        </TransitionGroup>
      </div>
    </Teleport>

    <div class="bd-page">
      <!-- ── Breadcrumb ────────────────────────────────────────────────────── -->
      <div class="breadcrumb">
        <button class="back-btn" @click="router.back()">
          ← Back to Profile
        </button>
        <span class="crumb-sep">/</span>
        <span class="crumb">Bookings</span>
        <span class="crumb-sep">/</span>
        <span class="crumb active">{{ booking.id }}</span>
      </div>

      <!-- ── Hero ─────────────────────────────────────────────────────────── -->
      <div class="hero-banner">
        <div class="hero-emoji">{{ booking.image }}</div>
        <div class="hero-gradient"></div>
        <div class="hero-text">
          <span :class="['status-pill', booking.status]">{{
            booking.status
          }}</span>
          <h1>{{ booking.tour }}</h1>
          <p>📍 {{ booking.destination }} · ⏱ {{ booking.duration }}</p>
        </div>
      </div>

      <!-- ── Main Grid ─────────────────────────────────────────────────────── -->
      <div class="main-grid">
        <!-- LEFT COLUMN ──────────────────────────────────────────────────── -->
        <div class="left-col">
          <!-- Booking Summary Card -->
          <div class="card">
            <div class="card-title">Booking Summary</div>
            <div class="summary-rows">
              <div class="srow">
                <span>Booking ID</span><strong>{{ booking.id }}</strong>
              </div>
              <div class="srow">
                <span>Booking Date</span
                ><strong>{{ booking.bookingDate }}</strong>
              </div>
              <div class="srow">
                <span>Travel Date</span
                ><strong>{{ booking.travelDate }}</strong>
              </div>
              <div class="srow">
                <span>Guests</span
                ><strong
                  >{{ booking.guests }} person{{
                    booking.guests > 1 ? "s" : ""
                  }}</strong
                >
              </div>
              <div class="srow">
                <span>Price per Person</span
                ><strong>${{ booking.price }}</strong>
              </div>
              <div class="srow total">
                <span>Total Paid</span
                ><strong>${{ booking.price * booking.guests }}</strong>
              </div>
            </div>
          </div>

          <!-- Meeting Point -->
          <div class="card">
            <div class="card-title">Meeting Point</div>
            <div class="meetup">
              <div class="meetup-icon">📍</div>
              <p>{{ booking.meetingPoint }}</p>
            </div>
          </div>

          <!-- Guide Info -->
          <div class="card">
            <div class="card-title">Your Guide</div>
            <div class="guide-row">
              <div class="guide-avatar">
                {{
                  booking.guide
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                }}
              </div>
              <div>
                <div class="guide-name">{{ booking.guide }}</div>
                <div class="guide-phone">📞 {{ booking.guidePhone }}</div>
              </div>
              <button
                class="contact-btn"
                @click="addToast('Message sent to guide!')"
              >
                Message
              </button>
            </div>
          </div>

          <!-- Includes / Excludes -->
          <div class="card">
            <div class="card-title">What's Included</div>
            <div class="inc-grid">
              <div>
                <div class="inc-head">✓ Included</div>
                <ul class="inc-list green">
                  <li v-for="item in booking.includes" :key="item">
                    {{ item }}
                  </li>
                </ul>
              </div>
              <div>
                <div class="inc-head">✕ Not Included</div>
                <ul class="inc-list red">
                  <li v-for="item in booking.excludes" :key="item">
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN ─────────────────────────────────────────────────── -->
        <div class="right-col">
          <!-- Action Buttons -->
          <div class="card actions-card">
            <button class="btn-primary full" @click="downloadInvoice">
              ⬇ Download Invoice
            </button>
            <button
              v-if="booking.status === 'upcoming'"
              class="btn-danger full"
              @click="showCancelModal = true"
            >
              Cancel Booking
            </button>
            <button
              v-if="booking.status === 'completed' && !showReviewBox"
              class="btn-ghost full"
              @click="showReviewBox = true"
            >
              ⭐ Leave a Review
            </button>
            <div v-if="showReviewBox" class="review-box">
              <div class="star-row">
                <span
                  v-for="s in 5"
                  :key="s"
                  :class="[
                    'star',
                    { active: s <= (hoverRating || reviewRating) },
                  ]"
                  @mouseenter="hoverRating = s"
                  @mouseleave="hoverRating = 0"
                  @click="reviewRating = s"
                  >★</span
                >
              </div>
              <textarea
                v-model="reviewText"
                placeholder="Share your experience..."
                class="review-input"
              ></textarea>
              <div class="review-actions">
                <button class="btn-ghost sm" @click="showReviewBox = false">
                  Cancel
                </button>
                <button class="btn-primary sm" @click="submitReview">
                  Submit
                </button>
              </div>
            </div>
          </div>

          <!-- Itinerary -->
          <div class="card">
            <div class="card-title">Itinerary</div>
            <div class="itinerary">
              <div
                v-for="(step, i) in booking.itinerary"
                :key="i"
                class="itin-step"
              >
                <div class="itin-dot-col">
                  <div class="itin-dot"></div>
                  <div
                    v-if="i < booking.itinerary.length - 1"
                    class="itin-line"
                  ></div>
                </div>
                <div class="itin-body">
                  <span class="itin-time">{{ step.time }}</span>
                  <span class="itin-event">{{ step.event }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Reviews -->
          <div class="card">
            <div class="card-title">
              Guest Reviews
              <span class="rating-badge"
                >⭐ {{ booking.rating }} ({{ booking.totalReviews }})</span
              >
            </div>
            <div class="reviews-list">
              <div
                v-for="r in booking.reviews"
                :key="r.name"
                class="review-item"
              >
                <div class="review-top">
                  <div class="review-avatar">{{ r.name[0] }}</div>
                  <div>
                    <div class="review-name">{{ r.name }}</div>
                    <div class="review-date">{{ r.date }}</div>
                  </div>
                  <div class="review-stars">{{ "★".repeat(r.rating) }}</div>
                </div>
                <p class="review-comment">{{ r.comment }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showCancelModal"
          class="modal-overlay"
          @click.self="showCancelModal = false"
        >
          <div class="modal">
            <div class="modal-header">
              <h2>Cancel Booking</h2>
              <button class="modal-close" @click="showCancelModal = false">
                ✕
              </button>
            </div>
            <div class="modal-body">
              <div class="confirm-icon">⚠️</div>
              <p class="confirm-msg">
                Are you sure you want to cancel
                <strong>{{ booking.tour }}</strong
                >? This action cannot be undone.
              </p>
            </div>
            <div class="modal-footer">
              <button class="btn-ghost" @click="showCancelModal = false">
                Keep Booking
              </button>
              <button
                class="btn-danger"
                @click="
                  showCancelModal = false;
                  addToast('Booking cancelled.');
                "
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <CustomerFooter />
  </div>
</template>

<style scoped>
.page {
  --primary: #0f6e70;
  --primary-light: #1a9496;
  --primary-muted: rgba(15, 110, 112, 0.1);
  --surface: #ffffff;
  --surface-2: #f7f9f8;
  --surface-3: #f0f4f3;
  --border: rgba(0, 0, 0, 0.08);
  --text: #0d1f1f;
  --text-2: #4a6262;
  --text-3: #7a9494;
  --radius: 14px;
  --radius-sm: 8px;
  --shadow: 0 2px 16px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 8px 32px rgba(0, 0, 0, 0.1);
  background: var(--surface-2);
  min-height: 100vh;
  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  color: var(--text);
}

.bd-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px 60px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Breadcrumb ─────────────────────────────────────────────────────────── */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-3);
}
.back-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s;
}
.back-btn:hover {
  opacity: 0.7;
}
.crumb-sep {
  color: var(--border);
}
.crumb.active {
  color: var(--text);
  font-weight: 600;
}

/* ── Hero Banner ────────────────────────────────────────────────────────── */
.hero-banner {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  height: 200px;
  background: linear-gradient(135deg, #0a4f51, #0f6e70, #1a9496);
  display: flex;
  align-items: flex-end;
  box-shadow: var(--shadow-md);
}
.hero-emoji {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  font-size: 72px;
  opacity: 0.18;
  pointer-events: none;
  filter: blur(1px);
}
.hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, transparent 60%);
}
.hero-text {
  position: relative;
  padding: 24px 28px;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.hero-text h1 {
  font-size: 22px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.3px;
}
.hero-text p {
  font-size: 13px;
  opacity: 0.8;
  margin: 0;
}

.status-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
}
.status-pill.upcoming {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  border: 1px solid rgba(147, 197, 253, 0.3);
}
.status-pill.completed {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border: 1px solid rgba(134, 239, 172, 0.3);
}
.status-pill.cancelled {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(252, 165, 165, 0.3);
}

/* ── Grid ───────────────────────────────────────────────────────────────── */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  align-items: start;
}

.left-col,
.right-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Card ───────────────────────────────────────────────────────────────── */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 22px;
  box-shadow: var(--shadow);
}
.card-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ── Summary ────────────────────────────────────────────────────────────── */
.summary-rows {
  display: flex;
  flex-direction: column;
}
.srow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 14px;
  color: var(--text-2);
  border-bottom: 1px solid var(--border);
}
.srow:last-child {
  border-bottom: none;
}
.srow strong {
  color: var(--text);
  font-weight: 600;
}
.srow.total {
  font-size: 16px;
  font-weight: 700;
}
.srow.total strong {
  color: var(--primary);
  font-size: 18px;
}

/* ── Meeting ────────────────────────────────────────────────────────────── */
.meetup {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.meetup-icon {
  font-size: 22px;
  flex-shrink: 0;
}
.meetup p {
  font-size: 14px;
  color: var(--text-2);
  margin: 0;
  line-height: 1.6;
}

/* ── Guide ──────────────────────────────────────────────────────────────── */
.guide-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.guide-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0a4f51, #0f6e70);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.guide-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}
.guide-phone {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 2px;
}
.contact-btn {
  margin-left: auto;
  background: var(--primary-muted);
  color: var(--primary);
  border: 1px solid rgba(15, 110, 112, 0.2);
  padding: 7px 16px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.contact-btn:hover {
  background: var(--primary);
  color: #fff;
}

/* ── Includes ───────────────────────────────────────────────────────────── */
.inc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.inc-head {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-2);
}
.inc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.inc-list li {
  font-size: 13px;
  color: var(--text-2);
  padding-left: 16px;
  position: relative;
  line-height: 1.5;
}
.inc-list.green li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #16a34a;
  font-weight: 700;
  font-size: 11px;
}
.inc-list.red li::before {
  content: "✕";
  position: absolute;
  left: 0;
  color: #dc2626;
  font-weight: 700;
  font-size: 11px;
}

/* ── Action Buttons ─────────────────────────────────────────────────────── */
.actions-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.btn-primary {
  background: linear-gradient(135deg, #0f6e70, #1a9496);
  color: #fff;
  border: none;
  padding: 11px 20px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 12px rgba(15, 110, 112, 0.3);
}
.btn-primary.full {
  width: 100%;
}
.btn-primary.sm {
  padding: 7px 16px;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(15, 110, 112, 0.4);
}

.btn-ghost {
  background: transparent;
  color: var(--primary);
  border: 1.5px solid rgba(15, 110, 112, 0.3);
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-ghost.full {
  width: 100%;
}
.btn-ghost.sm {
  padding: 7px 16px;
}
.btn-ghost:hover {
  background: var(--primary-muted);
}

.btn-danger {
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-danger.full {
  width: 100%;
}
.btn-danger:hover {
  background: #b91c1c;
}

/* ── Review Box ─────────────────────────────────────────────────────────── */
.review-box {
  border-top: 1px solid var(--border);
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.star-row {
  display: flex;
  gap: 6px;
}
.star {
  font-size: 26px;
  color: var(--border);
  cursor: pointer;
  transition:
    color 0.1s,
    transform 0.1s;
}
.star.active {
  color: #f59e0b;
}
.star:hover {
  transform: scale(1.15);
}
.review-input {
  width: 100%;
  min-height: 80px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  color: var(--text);
  padding: 10px 12px;
  font-size: 13px;
  resize: vertical;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
}
.review-input:focus {
  border-color: var(--primary);
}
.review-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* ── Itinerary ──────────────────────────────────────────────────────────── */
.itinerary {
  display: flex;
  flex-direction: column;
}
.itin-step {
  display: flex;
  gap: 14px;
}
.itin-dot-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}
.itin-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary);
  flex-shrink: 0;
  margin-top: 3px;
  box-shadow: 0 0 0 3px var(--primary-muted);
}
.itin-line {
  flex: 1;
  width: 2px;
  background: var(--border);
  margin: 4px 0;
  min-height: 24px;
}
.itin-body {
  padding-bottom: 20px;
  flex: 1;
}
.itin-time {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.itin-event {
  display: block;
  font-size: 13px;
  color: var(--text);
  margin-top: 2px;
  line-height: 1.5;
}

/* ── Reviews ────────────────────────────────────────────────────────────── */
.rating-badge {
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: none;
  letter-spacing: 0;
}
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.review-item {
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
}
.review-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.review-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.review-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--surface-3);
  color: var(--primary);
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.review-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}
.review-date {
  font-size: 11px;
  color: var(--text-3);
}
.review-stars {
  margin-left: auto;
  color: #f59e0b;
  font-size: 13px;
}
.review-comment {
  font-size: 13px;
  color: var(--text-2);
  margin: 0;
  line-height: 1.6;
}

/* ── Modal ──────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  width: 100%;
  max-width: 380px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border);
}
.modal-header h2 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}
.modal-close {
  background: none;
  border: none;
  font-size: 15px;
  cursor: pointer;
  color: var(--text-3);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: all 0.15s;
}
.modal-close:hover {
  background: var(--surface-3);
  color: var(--text);
}
.modal-body {
  padding: 22px;
}
.modal-footer {
  padding: 14px 22px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.confirm-icon {
  font-size: 38px;
  text-align: center;
  margin-bottom: 10px;
}
.confirm-msg {
  font-size: 14px;
  color: var(--text-2);
  text-align: center;
  line-height: 1.6;
}

/* ── Toast ──────────────────────────────────────────────────────────────── */
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.toast {
  padding: 11px 18px;
  border-radius: var(--radius-sm);
  background: #0f6e70;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  transition: all 0.2s;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(60px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(60px);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* ── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 800px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
  .right-col {
    order: -1;
  }
  .inc-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 500px) {
  .hero-banner {
    height: 160px;
  }
  .hero-text h1 {
    font-size: 17px;
  }
}
</style>
