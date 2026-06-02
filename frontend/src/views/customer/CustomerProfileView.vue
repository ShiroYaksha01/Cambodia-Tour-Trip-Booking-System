<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import CustomerNavbar from "../../components/customer/CustomerNavbar.vue";
import CustomerFooter from "../../components/customer/CustomerFooter.vue";
import LogoutButton from "../../components/LogoutButton.vue";
import api from "../../services/api";
import { resolveImageUrl } from "../../utils/api";

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

const activeTab = ref<
  "profile" | "bookings" | "activity" | "reviews" | "settings"
>("profile");

const bookingFilter = ref<"all" | "pending" | "confirmed" | "cancelled">("all");
const bookingSearch = ref("");

const darkMode = ref(localStorage.getItem("customerDarkMode") === "true");
const profileImage = ref(localStorage.getItem("customerProfileImage") || "");
const language = ref(localStorage.getItem("customerLanguage") || "English");
const feedbackMessage = ref("");

const privacySettings = ref({
  showEmailToProvider: true,
  showPhoneToProvider: true,
  allowBookingUpdates: true,
  allowPromotions: false,
  loginAlert: true,
});

const supportForm = ref({
  subject: "",
  message: "",
});

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

watch(darkMode, (value) => {
  localStorage.setItem("customerDarkMode", String(value));
});

watch(language, (value) => {
  localStorage.setItem("customerLanguage", value);
});

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

const unpaidBookings = computed(() => {
  return bookings.value.filter(
    (booking) => booking.paymentStatus?.toLowerCase() === "pending",
  );
});

const upcomingBookings = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return bookings.value
    .filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate >= today;
    })
    .sort(
      (a, b) =>
        new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime(),
    );
});

const nextBooking = computed(() => {
  return upcomingBookings.value[0] || null;
});

const notifications = computed(() => {
  const list = [];

  if (unpaidBookings.value.length > 0) {
    list.push({
      type: "warning",
      title: "Payment Required",
      message: `You have ${unpaidBookings.value.length} booking(s) waiting for payment.`,
    });
  }

  if (nextBooking.value) {
    list.push({
      type: "info",
      title: "Upcoming Booking",
      message: `Your next booking is ${
        nextBooking.value.service?.title || "Unknown Service"
      } on ${formatDate(nextBooking.value.bookingDate)}.`,
    });
  }

  if (stats.value.confirmed > 0) {
    list.push({
      type: "success",
      title: "Booking Confirmed",
      message: `You have ${stats.value.confirmed} confirmed booking(s).`,
    });
  }

  if (!list.length) {
    list.push({
      type: "normal",
      title: "No New Notifications",
      message: "You are all caught up.",
    });
  }

  return list;
});

const recentActivities = computed(() => {
  return bookings.value.slice(0, 5).map((booking) => ({
    title: booking.service?.title || "Unknown Service",
    text: `Booking ${booking.referenceCode || booking.id} is ${booking.bookingStatus}.`,
    date: booking.createdAt || booking.bookingDate,
    status: booking.bookingStatus,
  }));
});

const reviewBookings = computed(() => {
  return bookings.value
    .filter((booking) => booking.bookingStatus?.toLowerCase() === "confirmed")
    .slice(0, 5);
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

function filterByStat(status: "all" | "pending" | "confirmed" | "cancelled") {
  activeTab.value = "bookings";
  bookingFilter.value = status;
}

function goToUnpaidBookings() {
  activeTab.value = "bookings";
  bookingFilter.value = "pending";
}

function handleProfileImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please upload an image file.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    profileImage.value = String(reader.result);
    localStorage.setItem("customerProfileImage", profileImage.value);
  };

  reader.readAsDataURL(file);
}

function removeProfileImage() {
  profileImage.value = "";
  localStorage.removeItem("customerProfileImage");
}

function savePrivacySettings() {
  localStorage.setItem(
    "customerPrivacySettings",
    JSON.stringify(privacySettings.value),
  );

  alert("Privacy and notification settings saved.");
}

function loadPrivacySettings() {
  const saved = localStorage.getItem("customerPrivacySettings");

  if (saved) {
    privacySettings.value = JSON.parse(saved);
  }
}

function submitSupportRequest() {
  if (!supportForm.value.subject.trim()) {
    alert("Please enter a subject.");
    return;
  }

  if (!supportForm.value.message.trim()) {
    alert("Please write your message.");
    return;
  }

  alert("Your support request has been submitted.");

  supportForm.value = {
    subject: "",
    message: "",
  };
}

async function fetchProfile() {
  profileLoading.value = true;
  profileError.value = "";

  try {
    const response = await api.get("/users/me");
    const profile = response.data.data || response.data;

    if (!profile) {
      throw new Error("Profile data not found in response");
    }

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

    if (profile.profilePicture) {
      profileImage.value = profile.profilePicture;
    }

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

function submitFeedback() {
  if (!feedbackMessage.value.trim()) {
    alert("Please write your feedback first.");
    return;
  }

  alert("Thank you for your feedback.");
  feedbackMessage.value = "";
}

function addToCalendar(booking: Booking) {
  const title = encodeURIComponent(booking.service?.title || "Tour Booking");

  const details = encodeURIComponent(
    `Reference Code: ${booking.referenceCode || "N/A"}\nProvider: ${
      booking.provider?.companyName || "Unknown Provider"
    }\nTotal: ${formatMoney(booking.totalAmount)}`,
  );

  const date = new Date(booking.bookingDate);
  const start = date.toISOString().replace(/[-:]|\.\d{3}/g, "");

  const endDate = new Date(date.getTime() + 60 * 60 * 1000);
  const end = endDate.toISOString().replace(/[-:]|\.\d{3}/g, "");

  window.open(
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`,
    "_blank",
  );
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

function goToBookingHistory() {
  router.push("/booking/history");
}

function scrollToSettings() {
  activeTab.value = "settings";
  setTimeout(() => {
    const el = document.querySelector(".main-panel");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 100);
}

onMounted(() => {
  fetchProfile();
  fetchBookings();
  loadPrivacySettings();
});
</script>

<template>
  <div class="profile-page" :class="{ dark: darkMode }">
    <CustomerNavbar />

    <main class="profile-container">
      <section class="profile-header">
        <div class="profile-left">
          <div class="profile-photo-wrap">
            <img
              v-if="profileImage"
              :src="resolveImageUrl(profileImage)"
              alt="Customer profile"
              class="profile-photo"
            />

            <div v-else class="profile-avatar">
              {{ user.name.charAt(0).toUpperCase() }}
            </div>

            <label class="upload-photo">
              Change
              <input
                type="file"
                accept="image/*"
                @change="handleProfileImageUpload"
              />
            </label>
          </div>

          <div class="profile-info">
            <div v-if="profileLoading" class="profile-skeleton">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <template v-else>
              <p v-if="profileError" class="error-message">
                {{ profileError }}
              </p>

              <span class="welcome-label">Welcome back</span>
              <h1>{{ user.name }}</h1>
              <p>{{ user.email || "No email" }}</p>
              <p>{{ user.phone || "No phone number" }}</p>
              <p>{{ user.location }}</p>
            </template>
          </div>
        </div>

        <div class="profile-actions">
          <button class="dark-btn" @click="darkMode = !darkMode">
            {{ darkMode ? "Light Mode" : "Dark Mode" }}
          </button>

          <button class="edit-btn" @click="scrollToSettings">
            Edit Profile
          </button>
        </div>
      </section>

      <section class="customer-explore">
        <div
          class="dashboard-card unpaid-card"
          :class="{ danger: unpaidBookings.length > 0 }"
          @click="goToUnpaidBookings"
        >
          <span>Unpaid Bookings</span>
          <strong>{{ unpaidBookings.length }}</strong>
          <p>
            {{
              unpaidBookings.length > 0
                ? "Some bookings still need payment."
                : "No unpaid bookings."
            }}
          </p>
        </div>

        <div class="dashboard-card">
          <span>Upcoming Booking</span>

          <template v-if="nextBooking">
            <strong>{{
              nextBooking.service?.title || "Unknown Service"
            }}</strong>
            <p>{{ formatDate(nextBooking.bookingDate) }}</p>
          </template>

          <template v-else>
            <strong>None</strong>
            <p>No upcoming booking yet.</p>
          </template>
        </div>
      </section>

      <section class="notification-section">
        <div class="section-title">
          <h2>Notifications</h2>
          <p>Important updates about your bookings and payments.</p>
        </div>

        <div class="notification-list">
          <div
            v-for="notification in notifications"
            :key="notification.title"
            :class="['notification-card', notification.type]"
          >
            <strong>{{ notification.title }}</strong>
            <p>{{ notification.message }}</p>
          </div>
        </div>
      </section>

      <section class="stats-grid">
        <button class="stat-card" @click="filterByStat('all')">
          <span>Total Bookings</span>
          <strong>{{ stats.totalBookings }}</strong>
        </button>

        <button class="stat-card" @click="filterByStat('confirmed')">
          <span>Confirmed</span>
          <strong>{{ stats.confirmed }}</strong>
        </button>

        <button class="stat-card" @click="filterByStat('pending')">
          <span>Pending</span>
          <strong>{{ stats.pending }}</strong>
        </button>

        <button class="stat-card">
          <span>Total Spent</span>
          <strong>{{ formatMoney(stats.totalSpent) }}</strong>
        </button>
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
            :class="{ active: activeTab === 'activity' }"
            @click="activeTab = 'activity'"
          >
            Activity
          </button>

          <button
            :class="{ active: activeTab === 'reviews' }"
            @click="activeTab = 'reviews'"
          >
            Reviews
          </button>

          <button
            :class="{ active: activeTab === 'settings' }"
            @click="activeTab = 'settings'"
          >
            Settings
          </button>

          <div class="sidebar-footer">
            <LogoutButton />
          </div>
        </aside>

        <section class="main-panel">
          <Transition name="fade-slide" mode="out-in">
            <div v-if="activeTab === 'profile'" key="profile" class="panel">
              <div class="panel-header">
                <div>
                  <h2>Profile Information</h2>
                  <p>View your personal information and account details.</p>
                </div>
              </div>

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

                <div class="info-item">
                  <label>Language</label>
                  <p>{{ language }}</p>
                </div>
              </div>
            </div>

            <div
              v-else-if="activeTab === 'bookings'"
              key="bookings"
              class="panel"
            >
              <div class="panel-header">
                <div>
                  <h2>My Bookings</h2>
                  <p>
                    View tickets, reference codes, payment status, and calendar
                    sync.
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

              <div v-if="unpaidBookings.length > 0" class="payment-alert">
                <strong>Payment Reminder</strong>
                <p>
                  You have {{ unpaidBookings.length }} booking(s) that are not
                  paid yet. Please pay to confirm your booking.
                </p>
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

              <div v-if="loading" class="booking-skeleton-list">
                <div v-for="item in 3" :key="item" class="booking-skeleton">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>

              <p v-if="error" class="error-message">{{ error }}</p>

              <div
                v-if="!loading && !filteredBookings.length"
                class="empty-box"
              >
                No bookings found.
              </div>

              <TransitionGroup
                v-if="filteredBookings.length"
                name="booking-animation"
                tag="div"
                class="booking-list"
              >
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
                        {{
                          booking.provider?.companyName || "Unknown Provider"
                        }}
                      </p>

                      <p>Booking ID: {{ booking.id }}</p>

                      <p>
                        Transaction ID: {{ booking.transactionId || "N/A" }}
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
                      class="calendar-btn"
                      @click="addToCalendar(booking)"
                    >
                      Add Calendar
                    </button>

                    <button
                      v-if="booking.paymentStatus?.toLowerCase() === 'pending'"
                      class="pay-btn"
                      :disabled="payingId === booking.id"
                      @click="confirmPayment(booking.id)"
                    >
                      {{
                        payingId === booking.id ? "Processing..." : "Pay Now"
                      }}
                    </button>
                  </div>
                </div>
              </TransitionGroup>
            </div>

            <div
              v-else-if="activeTab === 'activity'"
              key="activity"
              class="panel"
            >
              <div class="panel-header">
                <div>
                  <h2>Recent Activity</h2>
                  <p>Your latest booking actions and account updates.</p>
                </div>
              </div>

              <div v-if="!recentActivities.length" class="empty-box">
                No recent activity yet.
              </div>

              <div v-else class="activity-list">
                <div
                  v-for="activity in recentActivities"
                  :key="activity.title + activity.date"
                  class="activity-item"
                >
                  <div
                    :class="['activity-dot', statusClass(activity.status)]"
                  ></div>

                  <div>
                    <strong>{{ activity.title }}</strong>
                    <p>{{ activity.text }}</p>
                    <span>{{ formatDate(activity.date) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else-if="activeTab === 'reviews'"
              key="reviews"
              class="panel"
            >
              <div class="panel-header">
                <div>
                  <h2>Reviews & Feedback</h2>
                  <p>Review your confirmed bookings and send feedback.</p>
                </div>
              </div>

              <div class="review-list">
                <div v-if="!reviewBookings.length" class="empty-box">
                  No confirmed bookings available for reviews yet.
                </div>

                <div
                  v-for="booking in reviewBookings"
                  :key="booking.id"
                  class="review-card"
                >
                  <div>
                    <strong>{{
                      booking.service?.title || "Unknown Service"
                    }}</strong>
                    <p>
                      {{ booking.provider?.companyName || "Unknown Provider" }}
                    </p>
                  </div>

                  <button @click="goToFeedback(booking.id)">
                    Write Review
                  </button>
                </div>
              </div>

              <div class="feedback-box">
                <h3>Platform Feedback</h3>

                <textarea
                  v-model="feedbackMessage"
                  placeholder="Tell us what we can improve..."
                ></textarea>

                <button @click="submitFeedback">Send Feedback</button>
              </div>
            </div>

            <div v-else key="settings" class="panel">
              <div class="panel-header">
                <div>
                  <h2>Account Settings</h2>
                  <p>
                    Manage your account information, privacy, notifications, and
                    support.
                  </p>
                </div>
              </div>

              <div class="settings-layout">
                <section class="settings-section">
                  <div class="settings-title">
                    <h3>Account Information</h3>
                    <p>Update your basic profile information.</p>
                  </div>

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

                  <button class="save-btn" @click="saveProfile">
                    Save Account Info
                  </button>
                </section>

                <section class="settings-section">
                  <div class="settings-title">
                    <h3>Preferences</h3>
                    <p>Choose your language and display mode.</p>
                  </div>

                  <div class="form-grid">
                    <div class="form-group">
                      <label>Preferred Language</label>
                      <select v-model="language">
                        <option>English</option>
                        <option>Khmer</option>
                        <option>Chinese</option>
                        <option>French</option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label>Theme</label>
                      <select v-model="darkMode">
                        <option :value="false">Light Mode</option>
                        <option :value="true">Dark Mode</option>
                      </select>
                    </div>
                  </div>

                  <button
                    v-if="profileImage"
                    class="remove-photo-btn"
                    @click="removeProfileImage"
                  >
                    Remove Profile Photo
                  </button>
                </section>

                <section class="settings-section">
                  <div class="settings-title">
                    <h3>Privacy & Security</h3>
                    <p>Control what information providers can see.</p>
                  </div>

                  <div class="toggle-list">
                    <label class="toggle-item">
                      <div>
                        <strong>Show email to provider</strong>
                        <p>Allow providers to see your email after booking.</p>
                      </div>
                      <input
                        v-model="privacySettings.showEmailToProvider"
                        type="checkbox"
                      />
                    </label>

                    <label class="toggle-item">
                      <div>
                        <strong>Show phone to provider</strong>
                        <p>
                          Allow providers to contact you about your booking.
                        </p>
                      </div>
                      <input
                        v-model="privacySettings.showPhoneToProvider"
                        type="checkbox"
                      />
                    </label>

                    <label class="toggle-item">
                      <div>
                        <strong>Login alert</strong>
                        <p>Get alerts when someone logs into your account.</p>
                      </div>
                      <input
                        v-model="privacySettings.loginAlert"
                        type="checkbox"
                      />
                    </label>
                  </div>

                  <button class="save-btn" @click="savePrivacySettings">
                    Save Privacy Settings
                  </button>
                </section>

                <section class="settings-section">
                  <div class="settings-title">
                    <h3>Notifications</h3>
                    <p>Choose what updates you want to receive.</p>
                  </div>

                  <div class="toggle-list">
                    <label class="toggle-item">
                      <div>
                        <strong>Booking updates</strong>
                        <p>Receive updates about booking status and payment.</p>
                      </div>
                      <input
                        v-model="privacySettings.allowBookingUpdates"
                        type="checkbox"
                      />
                    </label>

                    <label class="toggle-item">
                      <div>
                        <strong>Promotions</strong>
                        <p>Receive offers, discounts, and travel promotions.</p>
                      </div>
                      <input
                        v-model="privacySettings.allowPromotions"
                        type="checkbox"
                      />
                    </label>
                  </div>

                  <button class="save-btn" @click="savePrivacySettings">
                    Save Notification Settings
                  </button>
                </section>

                <section class="settings-section">
                  <div class="settings-title">
                    <h3>Contact Help</h3>
                    <p>Need help? Send a support request to the admin team.</p>
                  </div>

                  <div class="form-group">
                    <label>Subject</label>
                    <input
                      v-model="supportForm.subject"
                      type="text"
                      placeholder="Example: I need help with my booking"
                    />
                  </div>

                  <div class="form-group">
                    <label>Message</label>
                    <textarea
                      v-model="supportForm.message"
                      placeholder="Explain your problem here..."
                    ></textarea>
                  </div>

                  <button class="save-btn" @click="submitSupportRequest">
                    Send Support Request
                  </button>
                </section>

                <section class="settings-section danger-section">
                  <div class="settings-title">
                    <h3>Account Safety</h3>
                    <p>Important actions for your customer account.</p>
                  </div>

                  <div class="danger-box">
                    <strong>Delete Account</strong>
                    <p>
                      Account deletion is not available yet. Contact support if
                      you want to remove your account.
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </Transition>
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
  transition:
    background 0.25s ease,
    color 0.25s ease;
}

.profile-page.dark {
  background: #101827;
  color: #e5f3f3;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

.profile-header {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  box-shadow: 0 12px 35px rgba(15, 35, 35, 0.08);
  animation: pageEnter 0.45s ease;
}

.profile-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-photo-wrap {
  position: relative;
  width: 96px;
  height: 96px;
  flex-shrink: 0;
}

.profile-avatar,
.profile-photo {
  width: 96px;
  height: 96px;
  border-radius: 50%;
}

.profile-avatar {
  background: linear-gradient(135deg, #0f6e70, #12a39f);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 800;
}

.profile-photo {
  object-fit: cover;
  border: 4px solid #ffffff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.16);
}

.upload-photo {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  background: #0f6e70;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 10px;
  cursor: pointer;
  box-shadow: 0 5px 14px rgba(15, 110, 112, 0.3);
}

.upload-photo input {
  display: none;
}

.profile-info {
  flex: 1;
}

.welcome-label {
  display: inline-block;
  color: #0f6e70;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.profile-info h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.profile-info p {
  margin: 4px 0;
  color: #5f6f6f;
  font-size: 14px;
}

.profile-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.dark-btn,
.edit-btn,
.refresh-btn,
.save-btn,
.booking-actions button,
.feedback-box button,
.review-card button {
  background: #0f6e70;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  cursor: pointer;
  font-weight: 700;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.dark-btn {
  background: #111827;
}

.dark-btn:hover,
.edit-btn:hover,
.refresh-btn:hover,
.save-btn:hover,
.booking-actions button:hover,
.feedback-box button:hover,
.review-card button:hover {
  background: #0a5557;
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(15, 110, 112, 0.22);
}

.customer-explore {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin: 20px 0;
}

.dashboard-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 20px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(15, 35, 35, 0.05);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.dashboard-card:hover {
  transform: translateY(-4px);
  border-color: #0f6e70;
  box-shadow: 0 14px 30px rgba(15, 110, 112, 0.14);
}

.dashboard-card span {
  display: block;
  color: #6b7280;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.dashboard-card strong {
  display: block;
  font-size: 24px;
  color: #0f6e70;
  margin-bottom: 8px;
}

.dashboard-card p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.unpaid-card.danger {
  border-color: #f97316;
  background: #fff7ed;
}

.unpaid-card.danger strong {
  color: #c2410c;
}

.notification-section {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(15, 35, 35, 0.05);
}

.section-title h2 {
  margin: 0 0 4px;
  font-size: 20px;
}

.section-title p {
  margin: 0 0 16px;
  color: #6b7280;
  font-size: 14px;
}

.notification-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.notification-card {
  border: 1px solid #e5e7eb;
  padding: 15px;
  background: #fbfcfc;
  animation: notificationEnter 0.35s ease;
}

.notification-card strong {
  display: block;
  margin-bottom: 6px;
  color: #111827;
}

.notification-card p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.notification-card.warning {
  background: #fff7ed;
  border-color: #fed7aa;
}

.notification-card.warning strong {
  color: #c2410c;
}

.notification-card.info {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.notification-card.info strong {
  color: #1d4ed8;
}

.notification-card.success {
  background: #ecfdf5;
  border-color: #bbf7d0;
}

.notification-card.success strong {
  color: #047857;
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
  text-align: left;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(15, 35, 35, 0.05);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: #0f6e70;
  box-shadow: 0 14px 30px rgba(15, 110, 112, 0.14);
}

.stat-card span {
  display: block;
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 8px;
}

.stat-card strong {
  font-size: 26px;
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
  position: sticky;
  top: 18px;
}

.sidebar button {
  display: block;
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  padding: 15px 18px;
  cursor: pointer;
  color: #374151;
  font-weight: 700;
  border-left: 4px solid transparent;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.sidebar button:hover,
.sidebar button.active {
  background: #eef7f7;
  color: #0f6e70;
  border-left-color: #0f6e70;
}

.sidebar-footer {
  border-top: 1px solid #e5e7eb;
  margin-top: 10px;
}

:deep(.sidebar-footer .logout-button) {
  width: 100%;
  padding: 15px 18px;
  justify-content: flex-start;
  border-radius: 0;
  border: none;
  background: transparent;
  color: #ef4444;
  font-weight: 700;
  font-size: inherit;
  font-family: inherit;
  border-left: 4px solid transparent;
}

:deep(.sidebar-footer .logout-button:hover) {
  background: #fef2f2;
  color: #dc2626;
  border-left-color: #ef4444;
}

:deep(.sidebar-footer .logout-button .logout-icon) {
  font-size: 1.1rem;
}

:deep(.sidebar-footer .logout-button .logout-text) {
  letter-spacing: normal;
}

.main-panel {
  min-width: 0;
}

.panel {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(15, 35, 35, 0.05);
}

.panel h2 {
  margin: 0 0 6px;
  font-size: 22px;
}

.panel h3 {
  margin: 0 0 12px;
  font-size: 18px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
}

.panel-header p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.history-btn,
.remove-photo-btn,
.calendar-btn {
  background: #ffffff !important;
  color: #0f6e70 !important;
  border: 1px solid #0f6e70 !important;
  padding: 10px 18px;
  cursor: pointer;
  font-weight: 700;
}

.history-btn:hover,
.remove-photo-btn:hover,
.calendar-btn:hover {
  background: #eef7f7 !important;
}

.info-grid,
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.info-item {
  border: 1px solid #e5e7eb;
  padding: 16px;
  background: #fbfcfc;
}

.info-item label,
.form-group label {
  display: block;
  color: #6b7280;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.info-item p {
  margin: 0;
  font-size: 15px;
  color: #111827;
}

.form-group input,
.form-group select,
.booking-tools input,
.booking-tools select,
.feedback-box textarea,
.form-group textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  padding: 12px;
  outline: none;
  font-size: 14px;
  background: #ffffff;
  color: #111827;
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
}

.form-group input:focus,
.form-group select:focus,
.booking-tools input:focus,
.booking-tools select:focus,
.feedback-box textarea:focus,
.form-group textarea:focus {
  border-color: #0f6e70;
  box-shadow: 0 0 0 3px rgba(15, 110, 112, 0.12);
}

.payment-alert {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  padding: 14px;
  margin-bottom: 16px;
}

.payment-alert strong {
  color: #c2410c;
}

.payment-alert p {
  margin: 6px 0 0;
  color: #7c2d12;
  font-size: 14px;
}

.booking-tools {
  display: grid;
  grid-template-columns: 1fr 180px;
  gap: 12px;
  margin-bottom: 18px;
}

.error-message {
  color: #dc2626;
  font-weight: 700;
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
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.booking-card:hover {
  transform: translateY(-3px);
  border-color: #0f6e70;
  box-shadow: 0 12px 28px rgba(15, 110, 112, 0.12);
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
  font-size: 22px;
  font-weight: 800;
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
  padding: 5px 10px;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 11px !important;
  animation: pulseSoft 1.8s infinite;
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

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.activity-item {
  display: flex;
  gap: 14px;
  border: 1px solid #e5e7eb;
  padding: 16px;
  background: #fbfcfc;
}

.activity-dot {
  width: 14px;
  height: 14px;
  background: #c2410c;
  margin-top: 4px;
  flex-shrink: 0;
}

.activity-dot.confirmed {
  background: #047857;
}

.activity-dot.cancelled {
  background: #dc2626;
}

.activity-item strong {
  color: #0f6e70;
}

.activity-item p {
  margin: 5px 0;
  color: #6b7280;
}

.activity-item span {
  color: #6b7280;
  font-size: 13px;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-card {
  border: 1px solid #e5e7eb;
  background: #fbfcfc;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
}

.review-card p {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.feedback-box {
  margin-top: 22px;
  border: 1px solid #e5e7eb;
  padding: 18px;
  background: #fbfcfc;
}

.feedback-box textarea {
  min-height: 120px;
  resize: vertical;
  margin-bottom: 12px;
}

.settings-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-section {
  border: 1px solid #e5e7eb;
  background: #fbfcfc;
  padding: 20px;
}

.settings-title {
  margin-bottom: 18px;
}

.settings-title h3 {
  margin: 0 0 6px;
  font-size: 18px;
  color: #0f6e70;
}

.settings-title p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.toggle-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toggle-item {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  cursor: pointer;
}

.toggle-item strong {
  color: #111827;
  font-size: 15px;
}

.toggle-item p {
  margin: 5px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.toggle-item input {
  width: 20px;
  height: 20px;
  accent-color: #0f6e70;
  flex-shrink: 0;
}

.danger-section {
  background: #fff7ed;
  border-color: #fed7aa;
}

.danger-box {
  background: #ffffff;
  border: 1px solid #fed7aa;
  padding: 15px;
}

.danger-box strong {
  color: #c2410c;
}

.danger-box p {
  margin: 6px 0 0;
  color: #7c2d12;
  font-size: 14px;
}

.settings-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.profile-skeleton span,
.booking-skeleton span {
  display: block;
  height: 14px;
  background: linear-gradient(90deg, #e5e7eb, #f8fafc, #e5e7eb);
  background-size: 200% 100%;
  animation: skeletonMove 1.1s infinite;
  margin: 10px 0;
}

.profile-skeleton span:first-child {
  width: 180px;
  height: 24px;
}

.profile-skeleton span:nth-child(2) {
  width: 240px;
}

.profile-skeleton span:nth-child(3) {
  width: 140px;
}

.booking-skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.booking-skeleton {
  border: 1px solid #e5e7eb;
  padding: 18px;
}

.booking-skeleton span:first-child {
  width: 50%;
  height: 22px;
}

.booking-skeleton span:nth-child(2) {
  width: 75%;
}

.booking-skeleton span:nth-child(3) {
  width: 35%;
}

.dark .profile-header,
.dark .dashboard-card,
.dark .notification-section,
.dark .notification-card,
.dark .stat-card,
.dark .sidebar,
.dark .panel,
.dark .booking-card,
.dark .info-item,
.dark .activity-item,
.dark .review-card,
.dark .feedback-box,
.dark .settings-section,
.dark .toggle-item,
.dark .danger-box {
  background: #172334;
  border-color: #26394f;
  color: #e5f3f3;
}

.dark .profile-info p,
.dark .dashboard-card p,
.dark .dashboard-card span,
.dark .section-title p,
.dark .notification-card p,
.dark .panel-header p,
.dark .booking-main p,
.dark .activity-item p,
.dark .activity-item span,
.dark .review-card p,
.dark .settings-title p,
.dark .toggle-item p {
  color: #a8b8c8;
}

.dark .notification-card strong,
.dark .info-item p,
.dark .toggle-item strong {
  color: #e5f3f3;
}

.dark .sidebar button {
  color: #d1e3e3;
}

.dark .sidebar button:hover,
.dark .sidebar button.active {
  background: #102f35;
}

.dark .form-group input,
.dark .form-group select,
.dark .booking-tools input,
.dark .booking-tools select,
.dark .feedback-box textarea,
.dark .form-group textarea {
  background: #101827;
  border-color: #31445c;
  color: #e5f3f3;
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

.booking-animation-enter-active,
.booking-animation-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.booking-animation-enter-from,
.booking-animation-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes notificationEnter {
  from {
    opacity: 0;
    transform: translateY(10px);
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

@keyframes pulseSoft {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.03);
  }

  100% {
    transform: scale(1);
  }
}

@media (max-width: 950px) {
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-actions {
    width: 100%;
  }

  .customer-explore {
    grid-template-columns: 1fr;
  }

  .notification-list {
    grid-template-columns: 1fr;
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
    position: static;
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

@media (max-width: 560px) {
  .profile-container {
    padding: 16px 12px 30px;
  }

  .profile-left {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-header,
  .panel,
  .dashboard-card,
  .notification-section,
  .stat-card,
  .booking-card,
  .settings-section {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .review-card,
  .toggle-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-info h1 {
    font-size: 23px;
  }
}
</style>
