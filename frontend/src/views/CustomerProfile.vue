<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import CustomerNavbar from "../components/customer/CustomerNavbar.vue";
import CustomerFooter from "../components/customer/CustomerFooter.vue";

const router = useRouter();

// ─── Types ───────────────────────────────────────────────────────────────────
interface Booking {
  id: string;
  image: string;
  tour: string;
  destination: string;
  bookingDate: string;
  travelDate: string;
  price: number;
  guests: number;
  status: "upcoming" | "completed" | "cancelled";
}

interface WishlistItem {
  id: string;
  image: string;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
}

interface Notification {
  id: string;
  type: "booking" | "promo" | "payment" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// ─── State ───────────────────────────────────────────────────────────────────
const activeTab = ref<
  | "overview"
  | "bookings"
  | "wishlist"
  | "payments"
  | "settings"
  | "notifications"
>("overview");
const settingsTab = ref<
  "profile" | "security" | "notifications" | "privacy" | "language"
>("profile");
const bookingFilter = ref<"all" | "upcoming" | "completed" | "cancelled">(
  "all",
);
const bookingSearch = ref("");
const showEditModal = ref(false);
const showCancelModal = ref(false);
const showNotifDropdown = ref(false);
const selectedBooking = ref<Booking | null>(null);
const toasts = ref<
  { id: string; message: string; type: "success" | "error" | "info" }[]
>([]);
const darkMode = ref(false);
const wishlistHover = ref<string | null>(null);

// ─── Mock Data ────────────────────────────────────────────────────────────────
const user = ref({
  name: "Sophea Chann",
  email: "sophea@email.com",
  phone: "+855 12 345 678",
  location: "Phnom Penh, Cambodia",
  avatar: "SC",
  verified: true,
  memberSince: "Jan 2023",
  loyaltyPoints: 2340,
  membershipLevel: "Gold" as "Bronze" | "Silver" | "Gold",
  totalSpent: 4850,
});

const editForm = ref({ ...user.value });

const stats = ref({
  totalBookings: 12,
  upcoming: 2,
  completed: 8,
  cancelled: 2,
  wishlist: 5,
  totalSpent: 4850,
  loyaltyPoints: 2340,
});

const bookings = ref<Booking[]>([
  {
    id: "BK-001",
    image: "🏛️",
    tour: "Angkor Wat Sunrise Tour",
    destination: "Siem Reap",
    bookingDate: "10 Apr 2026",
    travelDate: "15 May 2026",
    price: 89,
    guests: 2,
    status: "upcoming",
  },
  {
    id: "BK-002",
    image: "🏝️",
    tour: "Koh Rong Island Escape",
    destination: "Koh Rong",
    bookingDate: "22 Mar 2026",
    travelDate: "30 Jun 2026",
    price: 145,
    guests: 2,
    status: "upcoming",
  },
  {
    id: "BK-003",
    image: "🌿",
    tour: "Cardamom Mountains Trek",
    destination: "Koh Kong",
    bookingDate: "01 Feb 2026",
    travelDate: "10 Feb 2026",
    price: 120,
    guests: 1,
    status: "completed",
  },
  {
    id: "BK-004",
    image: "🛶",
    tour: "Mekong River Cruise",
    destination: "Kratie",
    bookingDate: "15 Jan 2026",
    travelDate: "20 Jan 2026",
    price: 75,
    guests: 3,
    status: "completed",
  },
  {
    id: "BK-005",
    image: "🏖️",
    tour: "Sihanoukville Beach Day",
    destination: "Sihanoukville",
    bookingDate: "05 Dec 2025",
    travelDate: "24 Dec 2025",
    price: 55,
    guests: 2,
    status: "cancelled",
  },
  {
    id: "BK-006",
    image: "🗿",
    tour: "Preah Vihear Temple",
    destination: "Preah Vihear",
    bookingDate: "10 Nov 2025",
    travelDate: "18 Nov 2025",
    price: 95,
    guests: 2,
    status: "completed",
  },
]);

const wishlist = ref<WishlistItem[]>([
  {
    id: "W-001",
    image: "🏛️",
    title: "Bayon Temple Night Tour",
    location: "Siem Reap",
    rating: 4.9,
    reviews: 234,
    price: 65,
  },
  {
    id: "W-002",
    image: "🌊",
    title: "Kampot River Kayaking",
    location: "Kampot",
    rating: 4.7,
    reviews: 189,
    price: 45,
  },
  {
    id: "W-003",
    image: "🏔️",
    title: "Bokor Mountain Escape",
    location: "Kampot",
    rating: 4.8,
    reviews: 312,
    price: 110,
  },
  {
    id: "W-004",
    image: "🌅",
    title: "Phnom Bakheng Sunset",
    location: "Siem Reap",
    rating: 4.6,
    reviews: 567,
    price: 35,
  },
  {
    id: "W-005",
    image: "🚂",
    title: "Bamboo Train Adventure",
    location: "Battambang",
    rating: 4.5,
    reviews: 445,
    price: 25,
  },
]);

const notifications = ref<Notification[]>([
  {
    id: "N-001",
    type: "booking",
    title: "Booking Confirmed",
    message: "Your Angkor Wat Sunrise Tour is confirmed for May 15.",
    time: "2h ago",
    read: false,
  },
  {
    id: "N-002",
    type: "promo",
    title: "Weekend Offer!",
    message: "Get 20% off island tours this weekend.",
    time: "5h ago",
    read: false,
  },
  {
    id: "N-003",
    type: "payment",
    title: "Payment Received",
    message: "Payment of $145 for Koh Rong tour processed.",
    time: "1d ago",
    read: true,
  },
  {
    id: "N-004",
    type: "system",
    title: "Profile Updated",
    message: "Your profile information was successfully updated.",
    time: "2d ago",
    read: true,
  },
]);

const paymentMethods = ref([
  { id: "PM-001", type: "visa", last4: "4242", expiry: "09/27", primary: true },
  {
    id: "PM-002",
    type: "mastercard",
    last4: "8521",
    expiry: "03/26",
    primary: false,
  },
]);

const billingHistory = ref([
  {
    ref: "BK-001",
    date: "10 Apr 2026",
    amount: 178,
    description: "Angkor Wat Sunrise Tour × 2",
  },
  {
    ref: "BK-002",
    date: "22 Mar 2026",
    amount: 290,
    description: "Koh Rong Island Escape × 2",
  },
  {
    ref: "BK-003",
    date: "01 Feb 2026",
    amount: 120,
    description: "Cardamom Mountains Trek × 1",
  },
  {
    ref: "BK-004",
    date: "15 Jan 2026",
    amount: 225,
    description: "Mekong River Cruise × 3",
  },
]);

// ─── Computed ─────────────────────────────────────────────────────────────────
const filteredBookings = computed(() => {
  let list = bookings.value;
  if (bookingFilter.value !== "all")
    list = list.filter((b) => b.status === bookingFilter.value);
  if (bookingSearch.value.trim()) {
    const q = bookingSearch.value.toLowerCase();
    list = list.filter(
      (b) =>
        b.tour.toLowerCase().includes(q) ||
        b.destination.toLowerCase().includes(q),
    );
  }
  return list;
});

const unreadCount = computed(
  () => notifications.value.filter((n) => !n.read).length,
);

const membershipProgress = computed(() => {
  const thresholds = {
    Bronze: [0, 1000],
    Silver: [1000, 2000],
    Gold: [2000, 3000],
  };
  const [min, max] = thresholds[user.value.membershipLevel];
  return Math.min(((user.value.loyaltyPoints - min) / (max - min)) * 100, 100);
});

// ─── Methods ──────────────────────────────────────────────────────────────────
function addToast(
  message: string,
  type: "success" | "error" | "info" = "success",
) {
  const id = Date.now().toString();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, 3500);
}

function saveProfile() {
  Object.assign(user.value, editForm.value);
  showEditModal.value = false;
  addToast("Profile updated successfully!");
}

function confirmCancel() {
  if (!selectedBooking.value) return;
  const b = bookings.value.find((b) => b.id === selectedBooking.value!.id);
  if (b) b.status = "cancelled";
  showCancelModal.value = false;
  selectedBooking.value = null;
  addToast("Booking cancelled.", "info");
}

function removeWishlist(id: string) {
  wishlist.value = wishlist.value.filter((w) => w.id !== id);
  addToast("Removed from wishlist.");
}

function markAllRead() {
  notifications.value.forEach((n) => (n.read = true));
}

function downloadInvoice(ref: string) {
  addToast(`Invoice ${ref} downloaded!`, "success");
}

function toggleDark() {
  darkMode.value = !darkMode.value;
  document.documentElement.classList.toggle("dark-mode", darkMode.value);
}

function cardBrand(type: string) {
  return type === "visa" ? "💳 VISA" : "💳 MC";
}
</script>

<template>
  <div :class="['app-shell', { dark: darkMode }]">
    <CustomerNavbar />

    <!-- Toast Notifications -->
    <Teleport to="body">
      <div class="toast-container">
        <TransitionGroup name="toast">
          <div v-for="t in toasts" :key="t.id" :class="['toast', t.type]">
            <span class="toast-icon">{{
              t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"
            }}</span>
            {{ t.message }}
          </div>
        </TransitionGroup>
      </div>
    </Teleport>

    <!-- ── HERO SECTION ─────────────────────────────────────────────────────── -->
    <div class="hero-section">
      <div class="hero-cover">
        <div class="cover-overlay"></div>
        <div class="cover-pattern"></div>
        <!-- Dark mode toggle floating -->
        <button
          class="dark-toggle"
          @click="toggleDark"
          :title="darkMode ? 'Light mode' : 'Dark mode'"
        >
          {{ darkMode ? "☀️" : "🌙" }}
        </button>
      </div>

      <div class="hero-content">
        <div class="profile-glass">
          <div class="avatar-wrap">
            <div class="avatar-ring">
              <div class="avatar">{{ user.avatar }}</div>
            </div>
            <div
              class="avatar-edit"
              @click="showEditModal = true"
              title="Edit avatar"
            >
              ✎
            </div>
          </div>

          <div class="profile-info">
            <div class="name-row">
              <h1 class="user-name">{{ user.name }}</h1>
              <span v-if="user.verified" class="verified-badge"
                >✓ Verified</span
              >
            </div>
            <p class="user-meta">{{ user.email }} · {{ user.phone }}</p>
            <p class="user-meta muted">
              📍 {{ user.location }} · Member since {{ user.memberSince }}
            </p>

            <!-- Membership level -->
            <div class="membership-row">
              <span
                :class="[
                  'membership-badge',
                  user.membershipLevel.toLowerCase(),
                ]"
              >
                {{
                  user.membershipLevel === "Gold"
                    ? "🥇"
                    : user.membershipLevel === "Silver"
                      ? "🥈"
                      : "🥉"
                }}
                {{ user.membershipLevel }} Member
              </span>
              <div class="points-pill">
                ⭐ {{ user.loyaltyPoints.toLocaleString() }} pts
              </div>
            </div>

            <div class="loyalty-bar-wrap">
              <div class="loyalty-bar">
                <div
                  class="loyalty-fill"
                  :style="{ width: membershipProgress + '%' }"
                ></div>
              </div>
              <span class="loyalty-label"
                >{{ Math.round(membershipProgress) }}% to next level</span
              >
            </div>
          </div>

          <div class="profile-actions">
            <button class="btn-primary" @click="showEditModal = true">
              ✎ Edit Profile
            </button>
            <button class="btn-ghost">👁 Public Profile</button>
            <div class="quick-actions">
              <button
                class="icon-btn"
                title="Settings"
                @click="activeTab = 'settings'"
              >
                ⚙
              </button>
              <button
                class="icon-btn"
                title="Notifications"
                @click="showNotifDropdown = !showNotifDropdown"
              >
                🔔
                <span v-if="unreadCount" class="notif-dot">{{
                  unreadCount
                }}</span>
              </button>
              <button class="icon-btn danger" title="Logout">⎋</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── MAIN LAYOUT ──────────────────────────────────────────────────────── -->
    <div class="dashboard-layout">
      <!-- Sidebar Nav -->
      <aside class="sidebar">
        <nav class="sidebar-nav">
          <button
            v-for="item in [
              { key: 'overview', icon: '◈', label: 'Overview' },
              {
                key: 'bookings',
                icon: '🧳',
                label: 'Bookings',
                badge: stats.upcoming,
              },
              {
                key: 'wishlist',
                icon: '❤',
                label: 'Wishlist',
                badge: wishlist.length,
              },
              { key: 'payments', icon: '💳', label: 'Payments' },
              {
                key: 'notifications',
                icon: '🔔',
                label: 'Notifications',
                badge: unreadCount || undefined,
              },
              { key: 'settings', icon: '⚙', label: 'Settings' },
            ]"
            :key="item.key"
            :class="['nav-item', { active: activeTab === item.key }]"
            @click="activeTab = item.key as any"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
            <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
          </button>
        </nav>

        <!-- Sidebar Stats -->
        <div class="sidebar-stats">
          <div class="ss-item">
            <span class="ss-val">${{ user.totalSpent.toLocaleString() }}</span>
            <span class="ss-label">Total Spent</span>
          </div>
          <div class="ss-item">
            <span class="ss-val">{{ stats.totalBookings }}</span>
            <span class="ss-label">Trips</span>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- ── OVERVIEW TAB ──────────────────────────────────────────────── -->
        <section v-if="activeTab === 'overview'" class="tab-section">
          <h2 class="section-title">Dashboard Overview</h2>

          <!-- Analytics Cards -->
          <div class="analytics-grid">
            <div
              class="stat-card gradient-teal"
              @mouseenter="$event.currentTarget.classList.add('hovered')"
              @mouseleave="$event.currentTarget.classList.remove('hovered')"
            >
              <div class="stat-icon">🧳</div>
              <div class="stat-val">{{ stats.totalBookings }}</div>
              <div class="stat-lbl">Total Bookings</div>
              <div class="stat-bar">
                <div class="stat-fill" style="width: 80%"></div>
              </div>
            </div>
            <div class="stat-card gradient-blue">
              <div class="stat-icon">✈️</div>
              <div class="stat-val">{{ stats.upcoming }}</div>
              <div class="stat-lbl">Upcoming Trips</div>
              <div class="stat-bar">
                <div class="stat-fill" style="width: 17%"></div>
              </div>
            </div>
            <div class="stat-card gradient-green">
              <div class="stat-icon">✓</div>
              <div class="stat-val">{{ stats.completed }}</div>
              <div class="stat-lbl">Completed Trips</div>
              <div class="stat-bar">
                <div class="stat-fill" style="width: 67%"></div>
              </div>
            </div>
            <div class="stat-card gradient-coral">
              <div class="stat-icon">✕</div>
              <div class="stat-val">{{ stats.cancelled }}</div>
              <div class="stat-lbl">Cancelled</div>
              <div class="stat-bar">
                <div class="stat-fill" style="width: 17%"></div>
              </div>
            </div>
            <div class="stat-card gradient-purple">
              <div class="stat-icon">❤</div>
              <div class="stat-val">{{ stats.wishlist }}</div>
              <div class="stat-lbl">Wishlist Items</div>
              <div class="stat-bar">
                <div class="stat-fill" style="width: 50%"></div>
              </div>
            </div>
            <div class="stat-card gradient-amber">
              <div class="stat-icon">$</div>
              <div class="stat-val">
                ${{ stats.totalSpent.toLocaleString() }}
              </div>
              <div class="stat-lbl">Total Spent</div>
              <div class="stat-bar">
                <div class="stat-fill" style="width: 70%"></div>
              </div>
            </div>
          </div>

          <!-- Travel Insights -->
          <div class="insights-section">
            <h3 class="sub-title">Travel Insights</h3>
            <div class="insights-grid">
              <div class="insight-card">
                <h4>Most Visited Destinations</h4>
                <ul class="dest-list">
                  <li
                    v-for="(d, i) in [
                      { city: 'Siem Reap', count: 4, pct: 80 },
                      { city: 'Koh Rong', count: 2, pct: 40 },
                      { city: 'Kampot', count: 2, pct: 40 },
                      { city: 'Phnom Penh', count: 1, pct: 20 },
                    ]"
                    :key="i"
                    class="dest-item"
                  >
                    <span class="dest-name">{{ d.city }}</span>
                    <div class="dest-bar-wrap">
                      <div
                        class="dest-bar"
                        :style="{ width: d.pct + '%' }"
                      ></div>
                    </div>
                    <span class="dest-count">{{ d.count }}x</span>
                  </li>
                </ul>
              </div>
              <div class="insight-card">
                <h4>Travel Stats</h4>
                <div class="travel-stats">
                  <div class="ts-row">
                    <span>Countries visited</span><strong>1</strong>
                  </div>
                  <div class="ts-row">
                    <span>Cities explored</span><strong>6</strong>
                  </div>
                  <div class="ts-row">
                    <span>Avg. trip cost</span
                    ><strong
                      >${{
                        Math.round(stats.totalSpent / stats.completed)
                      }}</strong
                    >
                  </div>
                  <div class="ts-row">
                    <span>Favourite category</span><strong>Cultural</strong>
                  </div>
                  <div class="ts-row">
                    <span>Loyalty rank</span><strong>Top 15%</strong>
                  </div>
                </div>
              </div>
              <div class="insight-card map-card">
                <h4>Travel History Map</h4>
                <div class="map-mock">
                  <svg viewBox="0 0 300 160" class="map-svg">
                    <rect
                      width="300"
                      height="160"
                      rx="8"
                      fill="rgba(15,110,112,0.08)"
                    />
                    <!-- Cambodia rough outline -->
                    <path
                      d="M80,30 L200,25 L230,60 L220,110 L180,140 L100,135 L70,100 L65,60 Z"
                      fill="rgba(15,110,112,0.15)"
                      stroke="#0f6e70"
                      stroke-width="1.5"
                    />
                    <!-- City dots -->
                    <circle
                      cx="140"
                      cy="55"
                      r="6"
                      fill="#0f6e70"
                      opacity="0.9"
                    />
                    <text x="148" y="59" font-size="9" fill="#0f6e70">
                      Siem Reap
                    </text>
                    <circle
                      cx="130"
                      cy="95"
                      r="5"
                      fill="#0f6e70"
                      opacity="0.7"
                    />
                    <text x="138" y="99" font-size="9" fill="#0f6e70">
                      Phnom Penh
                    </text>
                    <circle
                      cx="165"
                      cy="115"
                      r="4"
                      fill="#0f6e70"
                      opacity="0.6"
                    />
                    <text x="173" y="119" font-size="9" fill="#0f6e70">
                      Kampot
                    </text>
                    <circle
                      cx="100"
                      cy="105"
                      r="4"
                      fill="#0f6e70"
                      opacity="0.5"
                    />
                    <circle
                      cx="195"
                      cy="80"
                      r="3"
                      fill="#6ec6c7"
                      opacity="0.5"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommended Tours -->
          <div class="recommended">
            <h3 class="sub-title">Recommended For You</h3>
            <div class="rec-grid">
              <div
                v-for="t in [
                  {
                    icon: '🌺',
                    name: 'Battambang Arts Tour',
                    loc: 'Battambang',
                    price: 45,
                    rating: 4.8,
                  },
                  {
                    icon: '🐬',
                    name: 'Dolphin Watching Kratie',
                    loc: 'Kratie',
                    price: 55,
                    rating: 4.9,
                  },
                  {
                    icon: '⛩️',
                    name: 'Beng Mealea Jungle Temple',
                    loc: 'Siem Reap',
                    price: 70,
                    rating: 4.7,
                  },
                ]"
                :key="t.name"
                class="rec-card"
              >
                <div class="rec-emoji">{{ t.icon }}</div>
                <div class="rec-info">
                  <h4>{{ t.name }}</h4>
                  <p>📍 {{ t.loc }} · ⭐ {{ t.rating }}</p>
                </div>
                <div class="rec-price">${{ t.price }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- ── BOOKINGS TAB ──────────────────────────────────────────────── -->
        <section v-if="activeTab === 'bookings'" class="tab-section">
          <div class="section-header">
            <h2 class="section-title">My Bookings</h2>
            <span class="count-badge">{{ filteredBookings.length }} trips</span>
          </div>

          <!-- Search & Filters -->
          <div class="booking-toolbar">
            <div class="search-wrap">
              <span class="search-icon">🔍</span>
              <input
                v-model="bookingSearch"
                type="text"
                placeholder="Search tours, destinations..."
                class="search-input"
              />
            </div>
            <div class="filter-pills">
              <button
                v-for="f in ['all', 'upcoming', 'completed', 'cancelled']"
                :key="f"
                :class="['filter-pill', { active: bookingFilter === f }]"
                @click="bookingFilter = f as any"
              >
                {{ f.charAt(0).toUpperCase() + f.slice(1) }}
              </button>
            </div>
          </div>

          <!-- Booking Cards -->
          <TransitionGroup name="list" tag="div" class="booking-list">
            <div v-for="b in filteredBookings" :key="b.id" class="booking-card">
              <div class="bk-img">{{ b.image }}</div>
              <div class="bk-body">
                <div class="bk-header">
                  <div>
                    <h3 class="bk-title">{{ b.tour }}</h3>
                    <p class="bk-dest">📍 {{ b.destination }}</p>
                  </div>
                  <span :class="['status-badge', b.status]">{{
                    b.status
                  }}</span>
                </div>
                <div class="bk-meta">
                  <div class="bk-meta-item">📅 Booked {{ b.bookingDate }}</div>
                  <div class="bk-meta-item">✈️ Travel {{ b.travelDate }}</div>
                  <div class="bk-meta-item">
                    👥 {{ b.guests }} guest{{ b.guests > 1 ? "s" : "" }}
                  </div>
                  <div class="bk-meta-item price">
                    ${{ (b.price * b.guests).toLocaleString() }}
                  </div>
                </div>
                <div class="bk-actions">
                  <button
                    class="bk-btn"
                    @click="
                      router.push({
                        path: '/booking/booking-detail',
                        query: { id: b.id },
                      })
                    "
                  >
                    View Details
                  </button>
                  <button class="bk-btn" @click="downloadInvoice(b.id)">
                    ⬇ Invoice
                  </button>
                  <button v-if="b.status === 'completed'" class="bk-btn star">
                    ⭐ Review
                  </button>
                  <button
                    v-if="b.status === 'upcoming'"
                    class="bk-btn danger"
                    @click="
                      selectedBooking = b;
                      showCancelModal = true;
                    "
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </TransitionGroup>

          <div v-if="!filteredBookings.length" class="empty-state">
            <div class="empty-icon">🧳</div>
            <p>No bookings found</p>
          </div>
        </section>

        <!-- ── WISHLIST TAB ──────────────────────────────────────────────── -->
        <section v-if="activeTab === 'wishlist'" class="tab-section">
          <div class="section-header">
            <h2 class="section-title">Saved Tours</h2>
            <span class="count-badge">{{ wishlist.length }} saved</span>
          </div>

          <div class="wishlist-grid">
            <div
              v-for="w in wishlist"
              :key="w.id"
              :class="['wish-card', { hovered: wishlistHover === w.id }]"
              @mouseenter="wishlistHover = w.id"
              @mouseleave="wishlistHover = null"
            >
              <div class="wish-img">
                <span class="wish-emoji">{{ w.image }}</span>
                <button
                  class="heart-btn"
                  @click="removeWishlist(w.id)"
                  title="Remove from wishlist"
                >
                  ❤
                </button>
              </div>
              <div class="wish-body">
                <h3 class="wish-title">{{ w.title }}</h3>
                <p class="wish-loc">📍 {{ w.location }}</p>
                <div class="wish-rating">
                  <span class="stars">⭐ {{ w.rating }}</span>
                  <span class="reviews">({{ w.reviews }} reviews)</span>
                </div>
                <div class="wish-footer">
                  <span class="wish-price"
                    >from ${{ w.price }}<span class="per">/person</span></span
                  >
                  <button
                    class="btn-book"
                    @click="addToast(`Booking ${w.title}...`, 'info')"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!wishlist.length" class="empty-state">
            <div class="empty-icon">❤</div>
            <p>Your wishlist is empty</p>
          </div>
        </section>

        <!-- ── PAYMENTS TAB ──────────────────────────────────────────────── -->
        <section v-if="activeTab === 'payments'" class="tab-section">
          <h2 class="section-title">Payment & Billing</h2>

          <div class="payments-layout">
            <div class="payment-methods">
              <div class="panel-title">Payment Methods</div>

              <div v-for="pm in paymentMethods" :key="pm.id" class="pm-card">
                <div class="pm-brand">{{ cardBrand(pm.type) }}</div>
                <div class="pm-info">
                  <span class="pm-num">•••• {{ pm.last4 }}</span>
                  <span class="pm-exp">Expires {{ pm.expiry }}</span>
                </div>
                <div class="pm-right">
                  <span v-if="pm.primary" class="primary-badge">Primary</span>
                  <button class="icon-btn sm">✕</button>
                </div>
              </div>

              <button
                class="add-pm-btn"
                @click="addToast('Payment method UI coming soon!', 'info')"
              >
                + Add Payment Method
              </button>
            </div>

            <div class="billing-section">
              <div class="panel-title">Billing History</div>
              <table class="billing-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="bh in billingHistory" :key="bh.ref">
                    <td>{{ bh.date }}</td>
                    <td class="bh-desc">{{ bh.description }}</td>
                    <td class="bh-amount">${{ bh.amount }}</td>
                    <td>
                      <button class="link-btn" @click="downloadInvoice(bh.ref)">
                        ⬇ PDF
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- ── NOTIFICATIONS TAB ─────────────────────────────────────────── -->
        <section v-if="activeTab === 'notifications'" class="tab-section">
          <div class="section-header">
            <h2 class="section-title">Notifications</h2>
            <button class="link-btn" @click="markAllRead">Mark all read</button>
          </div>

          <div class="notif-list">
            <div
              v-for="n in notifications"
              :key="n.id"
              :class="['notif-item', { unread: !n.read }]"
              @click="n.read = true"
            >
              <div :class="['notif-dot-icon', n.type]">
                {{
                  n.type === "booking"
                    ? "🧳"
                    : n.type === "promo"
                      ? "🎁"
                      : n.type === "payment"
                        ? "💳"
                        : "⚙"
                }}
              </div>
              <div class="notif-body">
                <div class="notif-title">{{ n.title }}</div>
                <div class="notif-msg">{{ n.message }}</div>
                <div class="notif-time">{{ n.time }}</div>
              </div>
              <div v-if="!n.read" class="unread-indicator"></div>
            </div>
          </div>
        </section>

        <!-- ── SETTINGS TAB ──────────────────────────────────────────────── -->
        <section v-if="activeTab === 'settings'" class="tab-section">
          <h2 class="section-title">Settings</h2>

          <div class="settings-layout">
            <div class="settings-tabs">
              <button
                v-for="st in [
                  { key: 'profile', label: '👤 Profile' },
                  { key: 'security', label: '🔒 Security' },
                  { key: 'notifications', label: '🔔 Notifications' },
                  { key: 'privacy', label: '🛡 Privacy' },
                  { key: 'language', label: '🌐 Language' },
                ]"
                :key="st.key"
                :class="['stab', { active: settingsTab === st.key }]"
                @click="settingsTab = st.key as any"
              >
                {{ st.label }}
              </button>
            </div>

            <div class="settings-panel">
              <!-- Profile Settings -->
              <div v-if="settingsTab === 'profile'">
                <h3 class="panel-title">Profile Information</h3>
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
                    <input v-model="editForm.phone" type="tel" />
                  </div>
                  <div class="form-group">
                    <label>Location</label>
                    <input v-model="editForm.location" type="text" />
                  </div>
                </div>
                <button class="btn-primary" @click="saveProfile">
                  Save Changes
                </button>
              </div>

              <!-- Security -->
              <div v-if="settingsTab === 'security'">
                <h3 class="panel-title">Security Settings</h3>
                <div class="form-grid">
                  <div class="form-group full">
                    <label>Current Password</label>
                    <input type="password" placeholder="••••••••" />
                  </div>
                  <div class="form-group">
                    <label>New Password</label>
                    <input type="password" placeholder="••••••••" />
                  </div>
                  <div class="form-group">
                    <label>Confirm Password</label>
                    <input type="password" placeholder="••••••••" />
                  </div>
                </div>
                <button
                  class="btn-primary"
                  @click="addToast('Password updated!', 'success')"
                >
                  Update Password
                </button>
                <div class="tfa-section">
                  <div class="tfa-row">
                    <div>
                      <strong>Two-Factor Authentication</strong>
                      <p>Add an extra layer of security</p>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Notifications settings -->
              <div v-if="settingsTab === 'notifications'">
                <h3 class="panel-title">Notification Preferences</h3>
                <div class="notif-prefs">
                  <div
                    v-for="pref in [
                      'Booking confirmations',
                      'Promotional offers',
                      'Payment alerts',
                      'Trip reminders',
                      'System updates',
                    ]"
                    :key="pref"
                    class="pref-row"
                  >
                    <span>{{ pref }}</span>
                    <label class="toggle-switch">
                      <input type="checkbox" checked />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Privacy -->
              <div v-if="settingsTab === 'privacy'">
                <h3 class="panel-title">Privacy Settings</h3>
                <div class="notif-prefs">
                  <div
                    v-for="pref in [
                      'Show profile publicly',
                      'Share travel history',
                      'Allow recommendations',
                      'Data analytics opt-in',
                    ]"
                    :key="pref"
                    class="pref-row"
                  >
                    <span>{{ pref }}</span>
                    <label class="toggle-switch">
                      <input type="checkbox" checked />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Language -->
              <div v-if="settingsTab === 'language'">
                <h3 class="panel-title">Language & Region</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Language</label>
                    <select>
                      <option>English</option>
                      <option>ភាសាខ្មែរ</option>
                      <option>日本語</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Currency</label>
                    <select>
                      <option>USD ($)</option>
                      <option>KHR (฿)</option>
                      <option>EUR (€)</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Timezone</label>
                    <select>
                      <option>Asia/Phnom_Penh (UTC+7)</option>
                      <option>Asia/Tokyo</option>
                    </select>
                  </div>
                </div>
                <button
                  class="btn-primary"
                  @click="addToast('Language settings saved!', 'success')"
                >
                  Save
                </button>

                <!-- Danger zone -->
                <div class="danger-zone">
                  <h4>⚠ Danger Zone</h4>
                  <p>
                    Permanently delete your account and all associated data.
                  </p>
                  <button
                    class="btn-danger"
                    @click="
                      addToast(
                        'Account deletion requires confirmation email.',
                        'error',
                      )
                    "
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- ── MODALS ──────────────────────────────────────────────────────────── -->

    <!-- Edit Profile Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showEditModal"
          class="modal-overlay"
          @click.self="showEditModal = false"
        >
          <div class="modal">
            <div class="modal-header">
              <h2>Edit Profile</h2>
              <button class="modal-close" @click="showEditModal = false">
                ✕
              </button>
            </div>
            <div class="modal-body">
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
                  <input v-model="editForm.phone" type="tel" />
                </div>
                <div class="form-group">
                  <label>Location</label>
                  <input v-model="editForm.location" type="text" />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-ghost" @click="showEditModal = false">
                Cancel
              </button>
              <button class="btn-primary" @click="saveProfile">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Cancel Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showCancelModal"
          class="modal-overlay"
          @click.self="showCancelModal = false"
        >
          <div class="modal modal-sm">
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
                <strong>{{ selectedBooking?.tour }}</strong
                >? This action cannot be undone.
              </p>
            </div>
            <div class="modal-footer">
              <button class="btn-ghost" @click="showCancelModal = false">
                Keep Booking
              </button>
              <button class="btn-danger" @click="confirmCancel">
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
/* ── CSS Custom Properties ────────────────────────────────────────────────── */
.app-shell {
  --primary: #0f6e70;
  --primary-light: #1a9496;
  --primary-dark: #0a4f51;
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
  --shadow-md: 0 8px 32px rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.05);
  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  background: var(--surface-2);
  min-height: 100vh;
  color: var(--text);
}

/* Dark mode */
.app-shell.dark {
  --surface: #0f1a1a;
  --surface-2: #0a1212;
  --surface-3: #162020;
  --border: rgba(255, 255, 255, 0.08);
  --text: #e2efef;
  --text-2: #8ab8b8;
  --text-3: #5a8888;
}

/* ── HERO ─────────────────────────────────────────────────────────────────── */
.hero-section {
  position: relative;
  overflow: hidden;
}

.hero-cover {
  height: 220px;
  background: linear-gradient(
    135deg,
    #0a4f51 0%,
    #0f6e70 30%,
    #1a9496 55%,
    #0d8a6e 75%,
    #0a6550 100%
  );
  position: relative;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='28'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.cover-pattern {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 70% 50%,
    rgba(255, 255, 255, 0.06) 0%,
    transparent 60%
  );
}

.dark-toggle {
  position: absolute;
  top: 16px;
  right: 20px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  width: 38px;
  height: 38px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}
.dark-toggle:hover {
  background: rgba(255, 255, 255, 0.25);
}

.hero-content {
  padding: 0 20px;
  margin-top: -80px;
  position: relative;
  z-index: 10;
}

.profile-glass {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.avatar-ring {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(135deg, #0f6e70, #1a9496, #0d8a6e);
  box-shadow: 0 4px 20px rgba(15, 110, 112, 0.3);
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #0a4f51, #0f6e70);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.15s;
}
.avatar-edit:hover {
  transform: scale(1.15);
}

.profile-info {
  flex: 1;
  min-width: 200px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.user-name {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
  letter-spacing: -0.3px;
}

.verified-badge {
  background: rgba(15, 110, 112, 0.1);
  color: var(--primary);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid rgba(15, 110, 112, 0.2);
}

.user-meta {
  color: var(--text-2);
  font-size: 13px;
  margin: 4px 0 0;
}
.user-meta.muted {
  color: var(--text-3);
}

.membership-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.membership-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}
.membership-badge.gold {
  background: rgba(212, 170, 0, 0.12);
  color: #a87800;
  border: 1px solid rgba(212, 170, 0, 0.25);
}
.membership-badge.silver {
  background: rgba(148, 163, 184, 0.15);
  color: #64748b;
  border: 1px solid rgba(148, 163, 184, 0.3);
}
.membership-badge.bronze {
  background: rgba(180, 83, 9, 0.1);
  color: #b45309;
  border: 1px solid rgba(180, 83, 9, 0.2);
}

.points-pill {
  font-size: 12px;
  font-weight: 600;
  background: var(--primary-muted);
  color: var(--primary);
  padding: 4px 10px;
  border-radius: 20px;
}

.loyalty-bar-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.loyalty-bar {
  flex: 1;
  max-width: 180px;
  height: 5px;
  background: var(--surface-3);
  border-radius: 10px;
  overflow: hidden;
}

.loyalty-fill {
  height: 100%;
  background: linear-gradient(90deg, #0f6e70, #1a9496);
  border-radius: 10px;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.loyalty-label {
  font-size: 11px;
  color: var(--text-3);
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  margin-left: auto;
}

.btn-primary {
  background: linear-gradient(135deg, #0f6e70, #1a9496);
  color: #fff;
  border: none;
  padding: 9px 20px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  box-shadow: 0 2px 12px rgba(15, 110, 112, 0.3);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(15, 110, 112, 0.4);
}
.btn-primary:active {
  transform: translateY(0);
}

.btn-ghost {
  background: transparent;
  color: var(--primary);
  border: 1.5px solid rgba(15, 110, 112, 0.3);
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-ghost:hover {
  background: var(--primary-muted);
}

.quick-actions {
  display: flex;
  gap: 6px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.15s;
  color: var(--text-2);
}
.icon-btn:hover {
  background: var(--surface-3);
  border-color: var(--primary);
}
.icon-btn.danger:hover {
  background: rgba(220, 38, 38, 0.08);
  border-color: #ef4444;
  color: #ef4444;
}
.icon-btn.sm {
  width: 28px;
  height: 28px;
  font-size: 11px;
}

.notif-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: #ef4444;
  color: #fff;
  border-radius: 50%;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── DASHBOARD LAYOUT ─────────────────────────────────────────────────────── */
.dashboard-layout {
  display: flex;
  gap: 0;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 20px 40px;
  gap: 20px;
}

/* ── SIDEBAR ──────────────────────────────────────────────────────────────── */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-nav {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  width: 100%;
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-2);
  cursor: pointer;
  transition: all 0.15s;
  border-left: 3px solid transparent;
  text-align: left;
}
.nav-item:hover {
  background: var(--surface-3);
  color: var(--primary);
}
.nav-item.active {
  background: var(--primary-muted);
  color: var(--primary);
  font-weight: 600;
  border-left-color: var(--primary);
}

.nav-icon {
  font-size: 16px;
  flex-shrink: 0;
}
.nav-label {
  flex: 1;
}

.nav-badge {
  background: var(--primary);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 20px;
  min-width: 18px;
  text-align: center;
}

.sidebar-stats {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.ss-item {
  text-align: center;
}
.ss-val {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
}
.ss-label {
  font-size: 11px;
  color: var(--text-3);
}

/* ── MAIN CONTENT ─────────────────────────────────────────────────────────── */
.main-content {
  flex: 1;
  min-width: 0;
}

.tab-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
  letter-spacing: -0.3px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
}

.sub-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 12px;
}

.count-badge {
  background: var(--primary-muted);
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

/* ── ANALYTICS CARDS ──────────────────────────────────────────────────────── */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.stat-card {
  border-radius: var(--radius);
  padding: 20px 16px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.stat-card.hovered,
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  font-size: 22px;
  margin-bottom: 8px;
}
.stat-val {
  font-size: 26px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1;
}
.stat-lbl {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 4px;
  font-weight: 500;
}

.stat-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  margin-top: 12px;
  overflow: hidden;
}
.stat-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
}

.gradient-teal {
  background: linear-gradient(135deg, #0a4f51, #0f6e70);
}
.gradient-blue {
  background: linear-gradient(135deg, #1a56b0, #2979e0);
}
.gradient-green {
  background: linear-gradient(135deg, #166534, #16a34a);
}
.gradient-coral {
  background: linear-gradient(135deg, #9f1239, #e11d48);
}
.gradient-purple {
  background: linear-gradient(135deg, #4c1d95, #7c3aed);
}
.gradient-amber {
  background: linear-gradient(135deg, #92400e, #d97706);
}

/* ── INSIGHTS ─────────────────────────────────────────────────────────────── */
.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.insight-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
}
.insight-card h4 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
  margin: 0 0 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dest-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.dest-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dest-name {
  font-size: 13px;
  color: var(--text);
  width: 90px;
  flex-shrink: 0;
}
.dest-bar-wrap {
  flex: 1;
  height: 5px;
  background: var(--surface-3);
  border-radius: 10px;
  overflow: hidden;
}
.dest-bar {
  height: 100%;
  background: linear-gradient(90deg, #0f6e70, #1a9496);
  border-radius: 10px;
}
.dest-count {
  font-size: 12px;
  color: var(--text-3);
  font-weight: 600;
  width: 22px;
  text-align: right;
}

.travel-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ts-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-2);
  padding: 4px 0;
  border-bottom: 1px solid var(--border);
}
.ts-row strong {
  color: var(--text);
  font-weight: 600;
}

.map-card {
  grid-column: span 1;
}
.map-mock {
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-top: 4px;
}
.map-svg {
  width: 100%;
}

/* ── RECOMMENDED ──────────────────────────────────────────────────────────── */
.rec-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rec-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: var(--shadow);
  transition: all 0.15s;
  cursor: pointer;
}
.rec-card:hover {
  transform: translateX(4px);
  border-color: rgba(15, 110, 112, 0.3);
}
.rec-emoji {
  font-size: 28px;
}
.rec-info {
  flex: 1;
}
.rec-info h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 2px;
}
.rec-info p {
  font-size: 12px;
  color: var(--text-3);
  margin: 0;
}
.rec-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
  white-space: nowrap;
}

/* ── BOOKING TOOLBAR ──────────────────────────────────────────────────────── */
.booking-toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.search-wrap {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0 12px;
  height: 40px;
  box-shadow: var(--shadow);
}

.search-icon {
  font-size: 15px;
  color: var(--text-3);
}

.search-input {
  border: none;
  background: none;
  outline: none;
  font-size: 13px;
  color: var(--text);
  flex: 1;
}
.search-input::placeholder {
  color: var(--text-3);
}

.filter-pills {
  display: flex;
  gap: 6px;
}
.filter-pill {
  padding: 7px 14px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-2);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.filter-pill:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.filter-pill.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

/* ── BOOKING CARDS ────────────────────────────────────────────────────────── */
.booking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.booking-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  display: flex;
  gap: 0;
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: all 0.2s;
}
.booking-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.bk-img {
  width: 80px;
  min-height: 80px;
  background: linear-gradient(135deg, var(--surface-3), var(--surface-2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
}

.bk-body {
  flex: 1;
  padding: 16px 18px;
}

.bk-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.bk-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 2px;
}
.bk-dest {
  font-size: 12px;
  color: var(--text-3);
  margin: 0;
}

.status-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.status-badge.upcoming {
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
}
.status-badge.completed {
  background: rgba(22, 163, 74, 0.1);
  color: #15803d;
}
.status-badge.cancelled {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

.bk-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin: 10px 0;
}
.bk-meta-item {
  font-size: 12px;
  color: var(--text-2);
}
.bk-meta-item.price {
  font-weight: 700;
  color: var(--primary);
  font-size: 14px;
}

.bk-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.bk-btn {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  cursor: pointer;
  transition: all 0.15s;
}
.bk-btn:hover {
  background: var(--primary-muted);
  border-color: var(--primary);
  color: var(--primary);
}
.bk-btn.danger:hover {
  background: rgba(220, 38, 38, 0.08);
  border-color: #ef4444;
  color: #ef4444;
}
.bk-btn.star:hover {
  background: rgba(245, 158, 11, 0.1);
  border-color: #f59e0b;
  color: #d97706;
}

/* ── WISHLIST ─────────────────────────────────────────────────────────────── */
.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.wish-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: all 0.25s;
}
.wish-card.hovered {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.wish-img {
  height: 130px;
  background: linear-gradient(135deg, var(--surface-3), var(--surface-2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  position: relative;
  transition: transform 0.3s;
}
.wish-card.hovered .wish-img {
  transform: scale(1.05);
}

.heart-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  transition: all 0.15s;
}
.heart-btn:hover {
  background: #ef4444;
  color: #fff;
  transform: scale(1.15);
}

.wish-body {
  padding: 14px 16px;
}
.wish-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px;
}
.wish-loc {
  font-size: 12px;
  color: var(--text-3);
  margin: 0 0 8px;
}

.wish-rating {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}
.stars {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}
.reviews {
  font-size: 11px;
  color: var(--text-3);
}

.wish-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.wish-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
}
.per {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-3);
}

.btn-book {
  background: linear-gradient(135deg, #0f6e70, #1a9496);
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-book:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 12px rgba(15, 110, 112, 0.3);
}

/* ── PAYMENTS ─────────────────────────────────────────────────────────────── */
.payments-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.panel-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 14px;
}

.payment-methods {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
}

.pm-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  margin-bottom: 10px;
  background: var(--surface-2);
  transition: all 0.15s;
}
.pm-card:hover {
  border-color: rgba(15, 110, 112, 0.3);
}

.pm-brand {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  width: 70px;
  flex-shrink: 0;
}
.pm-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pm-num {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
.pm-exp {
  font-size: 11px;
  color: var(--text-3);
}
.pm-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.primary-badge {
  background: rgba(15, 110, 112, 0.1);
  color: var(--primary);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  border: 1px solid rgba(15, 110, 112, 0.2);
}

.add-pm-btn {
  width: 100%;
  padding: 12px;
  border: 2px dashed var(--border);
  border-radius: var(--radius-sm);
  background: none;
  color: var(--text-3);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.add-pm-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-muted);
}

.billing-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
}

.billing-table {
  width: 100%;
  border-collapse: collapse;
}
.billing-table th {
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 0 10px;
  border-bottom: 1px solid var(--border);
}
.billing-table td {
  padding: 12px 0;
  font-size: 13px;
  color: var(--text-2);
  border-bottom: 1px solid var(--border);
}
.bh-desc {
  color: var(--text);
  font-weight: 500;
}
.bh-amount {
  font-weight: 700;
  color: var(--primary);
}

.link-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
}
.link-btn:hover {
  background: var(--primary-muted);
}

/* ── NOTIFICATIONS ────────────────────────────────────────────────────────── */
.notif-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notif-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}
.notif-item.unread {
  border-left: 3px solid var(--primary);
}
.notif-item:hover {
  background: var(--surface-2);
}

.notif-dot-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.notif-body {
  flex: 1;
}
.notif-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 2px;
}
.notif-msg {
  font-size: 12px;
  color: var(--text-2);
  line-height: 1.5;
}
.notif-time {
  font-size: 11px;
  color: var(--text-3);
  margin-top: 4px;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
  flex-shrink: 0;
  margin-top: 5px;
}

/* ── SETTINGS ─────────────────────────────────────────────────────────────── */
.settings-layout {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.settings-tabs {
  width: 180px;
  flex-shrink: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  height: fit-content;
}

.stab {
  display: block;
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-2);
  cursor: pointer;
  transition: all 0.15s;
  border-left: 3px solid transparent;
}
.stab:hover {
  background: var(--surface-3);
  color: var(--primary);
}
.stab.active {
  background: var(--primary-muted);
  color: var(--primary);
  font-weight: 600;
  border-left-color: var(--primary);
}

.settings-panel {
  flex: 1;
  min-width: 280px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.form-group.full {
  grid-column: span 2;
}
.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.form-group input,
.form-group select {
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  color: var(--text);
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
}
.form-group input:focus,
.form-group select:focus {
  border-color: var(--primary);
}

.tfa-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}
.tfa-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.tfa-row strong {
  font-size: 14px;
  color: var(--text);
}
.tfa-row p {
  font-size: 12px;
  color: var(--text-3);
  margin: 2px 0 0;
}

.notif-prefs {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.pref-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: var(--text);
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}
.pref-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

/* Toggle switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}
.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  inset: 0;
  background: var(--border);
  border-radius: 24px;
  transition: background 0.2s;
}
.slider::before {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  left: 3px;
  top: 3px;
  background: white;
  transition: transform 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}
.toggle-switch input:checked ~ .slider {
  background: var(--primary);
}
.toggle-switch input:checked ~ .slider::before {
  transform: translateX(20px);
}

.danger-zone {
  margin-top: 28px;
  padding: 18px;
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: var(--radius-sm);
  background: rgba(220, 38, 38, 0.03);
}
.danger-zone h4 {
  font-size: 13px;
  font-weight: 700;
  color: #dc2626;
  margin: 0 0 6px;
}
.danger-zone p {
  font-size: 12px;
  color: var(--text-3);
  margin: 0 0 14px;
}

.btn-danger {
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-danger:hover {
  background: #b91c1c;
}

/* ── MODALS ───────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  width: 100%;
  max-width: 520px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-sm {
  max-width: 380px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}
.modal-header h2 {
  font-size: 17px;
  font-weight: 700;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 16px;
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
  padding: 24px;
}
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.booking-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.bd-hero {
  font-size: 48px;
  text-align: center;
  padding: 16px;
  background: var(--surface-2);
  border-radius: var(--radius-sm);
}
.bd-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.bd-info h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}
.bd-rows {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.bd-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-2);
}
.bd-row.total {
  font-weight: 700;
  color: var(--primary);
  font-size: 15px;
  border-bottom: none;
}
.bd-row strong {
  color: var(--text);
}

.confirm-icon {
  font-size: 40px;
  text-align: center;
  margin-bottom: 12px;
}
.confirm-msg {
  font-size: 14px;
  color: var(--text-2);
  text-align: center;
  line-height: 1.6;
}

/* ── TOAST ────────────────────────────────────────────────────────────────── */
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
  padding: 12px 18px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 220px;
  max-width: 340px;
}
.toast.success {
  background: #0f6e70;
  color: #fff;
}
.toast.error {
  background: #dc2626;
  color: #fff;
}
.toast.info {
  background: #1d4ed8;
  color: #fff;
}
.toast-icon {
  font-size: 15px;
}

/* ── EMPTY STATE ──────────────────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-3);
}
.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}
.empty-state p {
  font-size: 14px;
}

/* ── TRANSITIONS ──────────────────────────────────────────────────────────── */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.96) translateY(8px);
}

.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  transition: all 0.2s;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(60px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(60px);
}

.list-enter-active {
  transition: all 0.2s;
}
.list-leave-active {
  transition: all 0.15s;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

/* ── RESPONSIVE ───────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .dashboard-layout {
    flex-direction: column;
    padding: 12px;
  }
  .sidebar {
    width: 100%;
  }
  .sidebar-nav {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
  }
  .nav-item {
    flex-direction: column;
    padding: 10px 12px;
    font-size: 11px;
    border-left: none;
    border-bottom: 3px solid transparent;
    min-width: 60px;
  }
  .nav-item.active {
    border-bottom-color: var(--primary);
    border-left-color: transparent;
  }
  .sidebar-stats {
    grid-template-columns: repeat(4, 1fr);
  }
  .profile-glass {
    flex-wrap: wrap;
  }
  .profile-actions {
    flex-direction: row;
    flex-wrap: wrap;
    margin-left: 0;
  }
}

@media (max-width: 600px) {
  .analytics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .form-group.full {
    grid-column: span 1;
  }
  .booking-toolbar {
    flex-direction: column;
  }
  .filter-pills {
    width: 100%;
    overflow-x: auto;
  }
  .settings-layout {
    flex-direction: column;
  }
  .settings-tabs {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
  .wishlist-grid {
    grid-template-columns: 1fr 1fr;
  }
  .hero-cover {
    height: 160px;
  }
}
</style>
