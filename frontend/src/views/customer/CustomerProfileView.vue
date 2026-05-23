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

const loading = ref(false);
const profileLoading = ref(false);
const payingId = ref("");
const error = ref("");
const profileError = ref("");

const activeTab = ref<"profile" | "bookings" | "settings">("profile");
const bookingFilter = ref<"all" | "pending" | "confirmed" | "cancelled">("all");
const bookingSearch = ref("");

const user = ref({
  id: "",
  name: "Customer User",
  email: "",
  phone: "",
  location: "Cambodia",
  memberSince: "2026",
});

const editForm = ref({ ...user.value });
const bookings = ref<Booking[]>([]);

const filteredBookings = computed(() => {
  let list = bookings.value;

  if (bookingFilter.value !== "all") {
    list = list.filter(
      (booking) => booking.bookingStatus?.toLowerCase() === bookingFilter.value,
    );
  }

  if (bookingSearch.value.trim()) {
    const q = bookingSearch.value.toLowerCase();

    list = list.filter(
      (booking) =>
        booking.id.toLowerCase().includes(q) ||
        booking.referenceCode?.toLowerCase().includes(q) ||
        booking.service?.title?.toLowerCase().includes(q) ||
        booking.provider?.companyName?.toLowerCase().includes(q) ||
        booking.transactionId?.toLowerCase().includes(q),
    );
  }

  return list;
});

const stats = computed(() => {
  const totalBookings = bookings.value.length;

  const confirmed = bookings.value.filter(
    (booking) => booking.bookingStatus?.toLowerCase() === "confirmed",
  ).length;

  const pending = bookings.value.filter(
    (booking) => booking.bookingStatus?.toLowerCase() === "pending",
  ).length;

  const cancelled = bookings.value.filter(
    (booking) => booking.bookingStatus?.toLowerCase() === "cancelled",
  ).length;

  const totalSpent = bookings.value.reduce(
    (sum, booking) => sum + Number(booking.totalAmount || 0),
    0,
  );

  return {
    totalBookings,
    confirmed,
    pending,
    cancelled,
    totalSpent,
  };
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

async function fetchProfile() {
  profileLoading.value = true;
  profileError.value = "";

  try {
    const response = await api.get("/users/me");
    const profile = response.data.data;

    user.value = {
      id: profile.id || "",
      name: profile.username || profile.name || "Customer User",
      email: profile.email || "",
      phone: profile.phoneNumber || profile.phone || "",
      location: profile.location || "Cambodia",
      memberSince: profile.createdAt
        ? new Date(profile.createdAt).getFullYear().toString()
        : "2026",
    };

    editForm.value = { ...user.value };
  } catch (err) {
    console.error(err);
    profileError.value = "Failed to load profile.";
  } finally {
    profileLoading.value = false;
  }
}

async function fetchBookings() {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get("/booking/user");
    bookings.value = response.data.data || [];
  } catch (err) {
    console.error(err);
    error.value = "Failed to load bookings.";
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

async function saveProfile() {
  if (!user.value.id) {
    alert("User ID not found.");
    return;
  }

  try {
    const payload = {
      username: editForm.value.name,
      email: editForm.value.email,
      phoneNumber: editForm.value.phone,
      location: editForm.value.location,
    };

    const response = await api.put(`/users/${user.value.id}`, payload);
    const updatedUser = response.data.data || response.data;

    user.value = {
      id: updatedUser.id || user.value.id,
      name: updatedUser.username || editForm.value.name,
      email: updatedUser.email || editForm.value.email,
      phone:
        updatedUser.phoneNumber || updatedUser.phone || editForm.value.phone,
      location: updatedUser.location || editForm.value.location,
      memberSince: user.value.memberSince,
    };

    editForm.value = { ...user.value };
    alert("Profile updated successfully.");
    activeTab.value = "profile";
  } catch (err) {
    console.error(err);
    alert("Failed to update profile.");
  }
}

function viewBookingDetail(id: string) {
  router.push({
    name: "booking-detail",
    params: { id },
  });
}

function goToBookingHistory() {
  router.push("/booking/history");
}

onMounted(() => {
  fetchProfile();
  fetchBookings();
});
</script>

<template>
  <div class="profile-page">
    <CustomerNavbar />

    <main class="profile-container">
      <section class="profile-header">
        <div class="profile-avatar">
          {{ user.name.charAt(0).toUpperCase() }}
        </div>

        <div class="profile-info">
          <p v-if="profileLoading" class="small-message">Loading profile...</p>
          <p v-if="profileError" class="error-message">{{ profileError }}</p>

          <h1>{{ user.name }}</h1>
          <p>{{ user.email || "No email" }}</p>
          <p>{{ user.phone || "No phone number" }}</p>
          <p>{{ user.location }}</p>
        </div>

        <button class="edit-btn" @click="activeTab = 'settings'">
          Edit Profile
        </button>
      </section>

      <section class="stats-grid">
        <div class="stat-card">
          <span>Total Bookings</span>
          <strong>{{ stats.totalBookings }}</strong>
        </div>

        <div class="stat-card">
          <span>Confirmed</span>
          <strong>{{ stats.confirmed }}</strong>
        </div>

        <div class="stat-card">
          <span>Pending</span>
          <strong>{{ stats.pending }}</strong>
        </div>

        <div class="stat-card">
          <span>Total Spent</span>
          <strong>{{ formatMoney(stats.totalSpent) }}</strong>
        </div>
      </section>

      <section class="content-layout">
        <aside class="sidebar">
          <button
            :class="{ active: activeTab === 'profile' }"
            @click="activeTab = 'profile'"
          >
            Profile
          </button>

          <button
            :class="{ active: activeTab === 'bookings' }"
            @click="activeTab = 'bookings'"
          >
            My Bookings
          </button>

          <button
            :class="{ active: activeTab === 'settings' }"
            @click="activeTab = 'settings'"
          >
            Settings
          </button>
        </aside>

        <section class="main-panel">
          <div v-if="activeTab === 'profile'" class="panel">
            <h2>Profile Information</h2>

            <div class="info-grid">
              <div class="info-item">
                <label>Full Name</label>
                <p>{{ user.name }}</p>
              </div>

              <div class="info-item">
                <label>Email</label>
                <p>{{ user.email || "N/A" }}</p>
              </div>

              <div class="info-item">
                <label>Phone</label>
                <p>{{ user.phone || "N/A" }}</p>
              </div>

              <div class="info-item">
                <label>Location</label>
                <p>{{ user.location }}</p>
              </div>

              <div class="info-item">
                <label>Member Since</label>
                <p>{{ user.memberSince }}</p>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'bookings'" class="panel">
            <div class="panel-header">
              <div>
                <h2>My Bookings</h2>
                <p>
                  View your booking tickets, reference code, and payment status.
                </p>
              </div>

              <div class="header-actions">
                <button class="refresh-btn" @click="fetchBookings">
                  Refresh
                </button>

                <button class="history-btn" @click="goToBookingHistory">
                  View Full History
                </button>
              </div>
            </div>

            <div class="booking-tools">
              <input
                v-model="bookingSearch"
                type="text"
                placeholder="Search reference code, booking, tour, provider, or transaction..."
              />

              <select v-model="bookingFilter">
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <p v-if="loading" class="small-message">Loading bookings...</p>
            <p v-if="error" class="error-message">{{ error }}</p>

            <div v-if="!loading && !filteredBookings.length" class="empty-box">
              No bookings found.
            </div>

            <div v-if="filteredBookings.length" class="booking-list">
              <div
                v-for="booking in filteredBookings"
                :key="booking.id"
                class="booking-card"
              >
                <div class="booking-main">
                  <div>
                    <h3>{{ booking.service?.title || "Unknown Service" }}</h3>

                    <p>
                      Reference Code:
                      <strong>{{ booking.referenceCode || "N/A" }}</strong>
                    </p>

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

                  <div class="booking-price">
                    {{ formatMoney(booking.totalAmount) }}
                  </div>
                </div>

                <div class="booking-meta">
                  <span>Date: {{ formatDate(booking.bookingDate) }}</span>
                  <span>Quantity: {{ booking.quantity }}</span>

                  <span
                    :class="[
                      'status-badge',
                      statusClass(booking.bookingStatus),
                    ]"
                  >
                    Booking: {{ booking.bookingStatus }}
                  </span>

                  <span
                    :class="[
                      'payment-badge',
                      statusClass(booking.paymentStatus),
                    ]"
                  >
                    Payment: {{ booking.paymentStatus }}
                  </span>
                </div>

                <div class="booking-actions">
                  <button @click="viewBookingDetail(booking.id)">
                    View Ticket
                  </button>

                  <button
                    v-if="booking.paymentStatus?.toLowerCase() === 'pending'"
                    class="pay-btn"
                    :disabled="payingId === booking.id"
                    @click="confirmPayment(booking.id)"
                  >
                    {{ payingId === booking.id ? "Processing..." : "Pay Now" }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'settings'" class="panel">
            <h2>Edit Profile</h2>

            <div class="form-grid">
              <div class="form-group">
                <label>Full Name</label>
                <input v-model="editForm.name" type="text" />
              </div>

              <div class="form-group">
                <label>Email</label>
                <input v-model="editForm.email" type="email" />
              </div>

              <div class="form-group">
                <label>Phone</label>
                <input v-model="editForm.phone" type="text" />
              </div>

              <div class="form-group">
                <label>Location</label>
                <input v-model="editForm.location" type="text" />
              </div>
            </div>

            <button class="save-btn" @click="saveProfile">Save Changes</button>
          </div>
        </section>
      </section>
    </main>

    <CustomerFooter />
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f7f8;
  color: #152323;
  font-family: Arial, sans-serif;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

.profile-header {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-avatar {
  width: 82px;
  height: 82px;
  border-radius: 50%;
  background: #0f6e70;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
}

.profile-info h1 {
  margin: 0 0 8px;
  font-size: 24px;
}

.profile-info p {
  margin: 4px 0;
  color: #5f6f6f;
  font-size: 14px;
}

.edit-btn,
.refresh-btn,
.save-btn,
.booking-actions button {
  background: #0f6e70;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  cursor: pointer;
  font-weight: 600;
}

.edit-btn:hover,
.refresh-btn:hover,
.save-btn:hover,
.booking-actions button:hover {
  background: #0a5557;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.history-btn {
  background: #ffffff;
  color: #0f6e70;
  border: 1px solid #0f6e70;
  padding: 10px 18px;
  cursor: pointer;
  font-weight: 600;
}

.history-btn:hover {
  background: #eef7f7;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 20px 0;
}

.stat-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 18px;
}

.stat-card span {
  display: block;
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 8px;
}

.stat-card strong {
  font-size: 24px;
  color: #0f6e70;
}

.content-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 20px;
}

.sidebar {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  height: fit-content;
}

.sidebar button {
  display: block;
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  padding: 14px 18px;
  cursor: pointer;
  color: #374151;
  font-weight: 600;
  border-left: 4px solid transparent;
}

.sidebar button:hover,
.sidebar button.active {
  background: #eef7f7;
  color: #0f6e70;
  border-left-color: #0f6e70;
}

.main-panel {
  min-width: 0;
}

.panel {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 24px;
}

.panel h2 {
  margin: 0 0 16px;
  font-size: 22px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
}

.panel-header h2 {
  margin-bottom: 4px;
}

.panel-header p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.info-grid,
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.info-item label,
.form-group label {
  display: block;
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.info-item p {
  margin: 0;
  font-size: 15px;
  color: #111827;
}

.form-group input,
.booking-tools input,
.booking-tools select {
  width: 100%;
  border: 1px solid #d1d5db;
  padding: 11px 12px;
  outline: none;
  font-size: 14px;
}

.form-group input:focus,
.booking-tools input:focus,
.booking-tools select:focus {
  border-color: #0f6e70;
}

.save-btn {
  margin-top: 18px;
}

.booking-tools {
  display: grid;
  grid-template-columns: 1fr 180px;
  gap: 12px;
  margin-bottom: 18px;
}

.small-message {
  color: #6b7280;
}

.error-message {
  color: #dc2626;
  font-weight: 600;
}

.empty-box {
  border: 1px dashed #d1d5db;
  padding: 32px;
  text-align: center;
  color: #6b7280;
}

.booking-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.booking-card {
  border: 1px solid #e5e7eb;
  padding: 18px;
  background: #ffffff;
}

.booking-main {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.booking-main h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.booking-main p {
  margin: 4px 0;
  color: #6b7280;
  font-size: 14px;
}

.booking-main strong {
  color: #0f6e70;
}

.booking-price {
  color: #0f6e70;
  font-size: 20px;
  font-weight: 700;
  white-space: nowrap;
}

.booking-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
  align-items: center;
}

.booking-meta span {
  font-size: 13px;
}

.status-badge,
.payment-badge {
  padding: 4px 10px;
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
  margin-top: 14px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 850px) {
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: flex;
    overflow-x: auto;
  }

  .sidebar button {
    min-width: 140px;
    border-left: none;
    border-bottom: 4px solid transparent;
  }

  .sidebar button.active {
    border-left-color: transparent;
    border-bottom-color: #0f6e70;
  }

  .booking-tools {
    grid-template-columns: 1fr;
  }

  .info-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .booking-main {
    flex-direction: column;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 500px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .profile-container {
    padding: 16px 12px 30px;
  }

  .panel,
  .profile-header,
  .stat-card,
  .booking-card {
    padding: 16px;
  }
}
</style>
