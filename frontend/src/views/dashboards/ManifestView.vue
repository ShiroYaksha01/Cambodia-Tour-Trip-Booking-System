<template>
  <div class="manifest-container">
    <!-- Content -->
    <main class="manifest-content">
      <!-- Left: Check-in Terminal -->
      <section class="check-in-section">
        <h2>Check-in Terminal</h2>
        
        <div class="booking-code-section">
          <label class="section-label">BOOKING REFERENCE CODE</label>
          <div class="code-display">
            <div class="digit" v-for="(digit, idx) in bookingCodeDigits" :key="idx">
              {{ digit || '-' }}
            </div>
          </div>

          <div class="alphanumeric-keyboard">
            <div class="keyboard-row">
              <div v-for="n in ['1','2','3','4','5','6','7','8','9','0']" :key="n" class="key" @click="addDigit(n)">{{ n }}</div>
            </div>
            <div class="keyboard-row">
              <div v-for="l in ['Q','W','E','R','T','Y','U','I','O','P']" :key="l" class="key" @click="addDigit(l)">{{ l }}</div>
            </div>
            <div class="keyboard-row">
              <div v-for="l in ['A','S','D','F','G','H','J','K','L']" :key="l" class="key" @click="addDigit(l)">{{ l }}</div>
            </div>
            <div class="keyboard-row">
              <div class="key special-key clear-btn" @click="clearCode">⌫</div>
              <div v-for="l in ['Z','X','C','V','B','N','M']" :key="l" class="key" @click="addDigit(l)">{{ l }}</div>
              <div class="key special-key check-btn" @click="verifyCode">✓</div>
            </div>
          </div>

          <div class="info-box">
            <span class="info-icon">ℹ</span>
            <p>Please verify the 6-digit code from the guest's digital voucher. If the code fails, search by phone number.</p>
          </div>

          <div v-if="verificationMessage" class="verification-result" :class="verificationMessage.type">
            <span class="result-icon">{{ verificationMessage.icon }}</span>
            <div>
              <p class="result-title">{{ verificationMessage.title }}</p>
              <p class="result-desc">{{ verificationMessage.description }}</p>
            </div>
            <button v-if="verificationMessage.undoBtn" class="undo-btn" @click="undoVerification">UNDO</button>
          </div>
        </div>
      </section>

      <!-- Right: Today's Guest List -->
      <section class="guest-list-section">
        <div class="guest-list-header">
          <h2>Today's Guest List</h2>
          <button class="download-btn">⬇ Download Daily Manifest</button>
        </div>

        <div class="guest-list">
          <div
            v-for="guest in filteredGuests"
            :key="guest.id"
            class="guest-card"
            :class="{ checked: guest.checked }"
          >
            <img :src="guest.avatar" :alt="guest.name" class="guest-avatar" />
            <div class="guest-info">
              <h3 class="guest-name">{{ guest.name }}</h3>
              <p class="guest-package">{{ guest.package }}</p>
              <p class="guest-booking">#{{ guest.bookingCode }}</p>
            </div>
            <div class="guest-time">
              <span class="time">{{ guest.time }}</span>
              <span class="status" :class="guest.statusClass">{{ guest.status }}</span>
            </div>
            <div v-if="guest.checked" class="checked-badge">✓</div>
          </div>

          <button v-if="filteredGuests.length === 0" class="view-all-btn">
            VIEW ALL 24 BOOKINGS FOR TODAY
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { getProviderBookings, checkInBooking } from "../../services/api";

const props = withDefaults(
  defineProps<{
    searchQuery?: string;
  }>(),
  {
    searchQuery: "",
  },
);

interface Guest {
  id: string;
  name: string;
  package: string;
  bookingCode: string;
  time: string;
  status: string;
  statusClass: string;
  avatar: string;
  checked: boolean;
}

const bookingCode = ref("");
const verificationMessage = ref<{
  type: string;
  icon: string;
  title: string;
  description: string;
  undoBtn?: boolean;
} | null>(null);

const bookingCodeDigits = computed(() => bookingCode.value.split(""));

const guests = ref<Guest[]>([]);
const isLoading = ref(true);

function mapBookingToGuest(booking: any): Guest {
  const bkDate = new Date(booking.date);
  const hours = bkDate.getHours();
  const minutes = bkDate.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  const timeStr = `${h12}:${String(minutes).padStart(2, "0")} ${ampm}`;

  const bkStatus = (booking.booking_status || "").toLowerCase();
  const statusMap: Record<string, { status: string; statusClass: string }> = {
    confirmed: { status: "Arrival Expected", statusClass: "arrival" },
    pending: { status: "Pending", statusClass: "arrival" },
    cancelled: { status: "Cancelled", statusClass: "delayed" },
    completed: { status: "Completed", statusClass: "checked-in" },
    refunded: { status: "Refunded", statusClass: "delayed" },
  };
  const mapped = statusMap[bkStatus] || { status: "Arrival Expected", statusClass: "arrival" };

  return {
    id: booking.id,
    name: booking.user?.name || booking.user?.email || "Unknown",
    package: `PAX ${booking.quantity || 1}${booking.service_name ? " · " + booking.service_name : ""}`,
    bookingCode: booking.reference_code || "N/A",
    time: timeStr,
    status: mapped.status,
    statusClass: mapped.statusClass,
    avatar: booking.user?.profile_picture || `https://picsum.photos/40/40?random=${Math.random()}`,
    checked: bkStatus === "completed",
  };
}

const mockFallback = () => [
  { id: "1", name: "Chen Srey-Mom", package: "PAX 2", bookingCode: "BT-8022", time: "09:30 AM", status: "Arrival Expected", statusClass: "arrival", avatar: "https://picsum.photos/40/40?random=1", checked: false },
  { id: "2", name: "Liam Henderson", package: "PAX 1", bookingCode: "BT-8045", time: "CHECKED IN 08:12", status: "Sunrise Meditation", statusClass: "checked-in", avatar: "https://picsum.photos/40/40?random=2", checked: true },
  { id: "3", name: "Elena Rodriguez", package: "PAX 4", bookingCode: "BT-9112", time: "Delayed", status: "Arriving 10:15", statusClass: "delayed", avatar: "https://picsum.photos/40/40?random=3", checked: false },
  { id: "4", name: "Marcus Weber", package: "PAX 2", bookingCode: "BT-9140", time: "11:00 AM", status: "Angkor Archeology Tour", statusClass: "tour", avatar: "https://picsum.photos/40/40?random=4", checked: false },
];

onMounted(async () => {
  try {
    const res = await getProviderBookings();
    const list = res?.data || [];
    guests.value = list.map(mapBookingToGuest);
  } catch {
    guests.value = mockFallback();
  } finally {
    isLoading.value = false;
  }
  window.addEventListener("keydown", handleGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalKeydown);
});

function handleGlobalKeydown(e: KeyboardEvent) {
  // Ignore if user is typing in an input or textarea
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement
  ) {
    return;
  }

  const key = e.key.toUpperCase();

  if (/^[A-Z0-9]$/.test(key)) {
    addDigit(key);
  } else if (e.key === "Backspace") {
    if (bookingCode.value.length > 0) {
      bookingCode.value = bookingCode.value.slice(0, -1);
    }
  } else if (e.key === "Enter") {
    verifyCode();
  } else if (e.key === "Escape") {
    clearCode();
  }
}

const filteredGuests = computed(() => {
  if (!props.searchQuery.trim()) {
    return guests.value;
  }
  const query = props.searchQuery.toLowerCase();
  return guests.value.filter(
    (guest) =>
      guest.name.toLowerCase().includes(query) ||
      guest.bookingCode.toLowerCase().includes(query)
  );
});

function addDigit(digit: string) {
  if (bookingCode.value.length < 6) {
    bookingCode.value += digit;
  }
}

function clearCode() {
  bookingCode.value = "";
  verificationMessage.value = null;
}

function verifyCode() {
  if (bookingCode.value.length !== 6) {
    verificationMessage.value = {
      type: "error",
      icon: "⚠",
      title: "Invalid Code",
      description: "Please enter all 6 digits.",
    };
    return;
  }

  const match = guests.value.find(
    (g) => g.bookingCode.replace(/[^A-Z0-9]/gi, "").toUpperCase() === bookingCode.value.toUpperCase()
  );

  if (match) {
    if (match.checked) {
      verificationMessage.value = {
        type: "success",
        icon: "✓",
        title: "Guest Already Verified",
        description: `${match.name} • ${match.package} • #${match.bookingCode}`,
      };
      return;
    }

    // Call check-in API
    checkInBooking(match.id)
      .then(() => {
        match.checked = true;
        match.status = "Completed";
        match.statusClass = "checked-in";
        verificationMessage.value = {
          type: "success",
          icon: "✓",
          title: "Guest Successfully Verified",
          description: `${match.name} • ${match.package} • #${match.bookingCode}`,
          undoBtn: false,
        };
      })
      .catch((err: any) => {
        verificationMessage.value = {
          type: "error",
          icon: "✕",
          title: "Verification Failed",
          description: err.response?.data?.message || "Could not complete check-in.",
        };
      });
  } else {
    verificationMessage.value = {
      type: "error",
      icon: "✕",
      title: "Code Not Found",
      description: "This booking code does not match any reservations.",
    };
  }
}

function undoVerification() {
  bookingCode.value = "";
  verificationMessage.value = null;
}
</script>

<style scoped>
.manifest-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f5f5f5;
}

.manifest-header {
  /* header is now provided by ProviderHeader component */
  display: block;
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 32px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.header-icons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.provider-profile {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0f6e70, #efb34f);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
}

.avatar--image {
  background: transparent;
}

.avatar--image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}

.manifest-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px 24px;
  flex: 1;
}

.check-in-section {
  background: white;
  border-radius: 6px;
  padding: 24px;
}

.check-in-section h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #1a1a1a;
}

.booking-code-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.code-display {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.digit {
  display: grid;
  place-items: center;
  background: #f5f5f5;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  width: 60px;
  height: 60px;
}

.alphanumeric-keyboard {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.keyboard-row {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.key {
  display: grid;
  place-items: center;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  width: 40px;
  height: 50px;
  padding: 0;
  color: #1a1a1a;
}

.key:hover {
  background: #efefef;
  border-color: #ccc;
}

.special-key {
  width: 60px;
}

.clear-btn {
  background: #ffe8e8;
  color: #d73a49;
}

.check-btn {
  background: #b3f5e0;
  color: #0f6e70;
}

.info-box {
  display: flex;
  gap: 10px;
  background: #fff9e6;
  border-radius: 6px;
  padding: 10px;
  font-size: 11px;
  color: #8b6f47;
  line-height: 1.5;
}

.info-icon {
  flex: 0 0 20px;
  display: grid;
  place-items: center;
  background: #f0e6cc;
  border-radius: 50%;
  font-weight: 600;
}

.info-box p {
  margin: 0;
}

.verification-result {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  align-items: flex-start;
}

.verification-result.success {
  background: #e8f5f0;
  border-left: 4px solid #0f6e70;
}

.verification-result.error {
  background: #ffe8e8;
  border-left: 4px solid #d73a49;
}

.result-icon {
  font-size: 20px;
  flex: 0 0 24px;
  display: grid;
  place-items: center;
}

.result-title {
  margin: 0 0 2px 0;
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
}

.result-desc {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.verification-result.success .result-title {
  color: #0f6e70;
}

.undo-btn {
  margin-left: auto;
  padding: 4px 8px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  color: #666;
}

.undo-btn:hover {
  background: #f5f5f5;
}

.guest-list-section {
  background: white;
  border-radius: 6px;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.guest-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.guest-list-header h2 {
  margin: 0;
  font-size: 18px;
  color: #1a1a1a;
}

.download-btn {
  padding: 8px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #1a1a1a;
}

.download-btn:hover {
  background: #f5f5f5;
}

.guest-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.guest-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  transition: all 0.2s;
}

.guest-card:hover {
  background: #f0f0f0;
}

.guest-card.checked {
  background: #e8f5f0;
}

.guest-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.guest-info {
  flex: 1;
}

.guest-name {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
}

.guest-package {
  margin: 2px 0 0 0;
  font-size: 11px;
  color: #0f6e70;
  font-weight: 500;
}

.guest-booking {
  margin: 2px 0 0 0;
  font-size: 11px;
  color: #999;
}

.guest-time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  font-size: 11px;
}

.time {
  color: #1a1a1a;
  font-weight: 600;
}

.status {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
}

.status.arrival {
  background: #fff4e6;
  color: #9b6b1f;
}

.status.checked-in {
  background: #e8f5f0;
  color: #0f6e70;
}

.status.delayed {
  background: #ffe8e8;
  color: #d73a49;
}

.status.tour {
  background: #e8f0ff;
  color: #0e5ba8;
}

.checked-badge {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  background: #0f6e70;
  color: white;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
}

.view-all-btn {
  padding: 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #0f6e70;
}

.view-all-btn:hover {
  background: #f5f5f5;
}

@media (max-width: 1024px) {
  .manifest-content {
    grid-template-columns: 1fr;
  }
}
</style>
