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
          <button class="download-btn" type="button" @click="downloadDailyManifest">⬇ Download Daily Manifest</button>
        </div>

        <div v-if="isLoading" class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>

        <div v-else class="guest-list">
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

          <div v-if="filteredGuests.length === 0" class="text-center py-10 text-gray-500">
            No bookings found for today.
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { getProviderBookings, checkInBooking } from "../../services/api";
import { resolveImageUrl } from "../../utils/api";

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

const bookingCodeDigits = computed(() => {
  const digits = bookingCode.value.split("");
  while (digits.length < 6) digits.push("");
  return digits;
});

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
    completed_checkin: { status: "Completed", statusClass: "checked-in" },
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
    avatar: resolveImageUrl(booking.user?.profile_picture) || `https://picsum.photos/40/40?random=${Math.random()}`,
    checked: bkStatus === "completed" || bkStatus === "completed_checkin",
  };
}

async function loadBookings() {
  try {
    const res = await getProviderBookings();
    const data = res.data || res;
    const list = Array.isArray(data) ? data : data.data || [];
    guests.value = list.map(mapBookingToGuest);
  } catch (err) {
    console.error("Failed to fetch bookings:", err);
    guests.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  await loadBookings();
  window.addEventListener("keydown", handleGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalKeydown);
});

function handleGlobalKeydown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

  const key = e.key.toUpperCase();
  if (/^[A-Z0-9]$/.test(key)) {
    addDigit(key);
  } else if (e.key === "Backspace") {
    bookingCode.value = bookingCode.value.slice(0, -1);
  } else if (e.key === "Enter") {
    verifyCode();
  } else if (e.key === "Escape") {
    clearCode();
  }
}

const filteredGuests = computed(() => {
  const query = props.searchQuery.trim().toLowerCase();
  if (!query) return guests.value;
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

function downloadDailyManifest() {
  const headers = ["Guest", "Package", "Booking Code", "Time", "Status"];
  const rows = filteredGuests.value.map((guest) => [
    guest.name,
    guest.package,
    guest.bookingCode,
    guest.time,
    guest.status,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "daily-manifest.csv";
  link.click();
  URL.revokeObjectURL(url);
}

async function verifyCode() {
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

    try {
      await checkInBooking(match.id);
      await loadBookings();
      verificationMessage.value = {
        type: "success",
        icon: "✓",
        title: "Guest Successfully Verified",
        description: `${match.name} • ${match.package} • #${match.bookingCode}`,
        undoBtn: false,
      };
    } catch (err: any) {
      verificationMessage.value = {
        type: "error",
        icon: "✕",
        title: "Verification Failed",
        description: err.response?.data?.message || "Could not complete check-in.",
      };
    }
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

.manifest-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 24px;
  flex: 1;
}

.check-in-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.check-in-section h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #1a1a1a;
  font-weight: 700;
}

.booking-code-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-label {
  font-size: 11px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.code-display {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.digit {
  display: grid;
  place-items: center;
  background: #f9f9f9;
  border-radius: 8px;
  border: 2px solid #eee;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  width: 54px;
  height: 64px;
  transition: all 0.2s;
}

.digit:not(:empty) {
  border-color: #0f6e70;
  background: white;
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
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.2s;
  width: 38px;
  height: 48px;
  color: #333;
  box-shadow: 0 2px 0 #eee;
}

.key:hover {
  background: #f5f7f7;
  transform: translateY(-1px);
}

.key:active {
  transform: translateY(1px);
  box-shadow: none;
}

.special-key {
  width: 58px;
}

.clear-btn {
  background: #fff5f5;
  color: #e53e3e;
  border-color: #feb2b2;
}

.check-btn {
  background: #f0fff4;
  color: #2f855a;
  border-color: #9ae6b4;
}

.info-box {
  display: flex;
  gap: 12px;
  background: #ebf8ff;
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
  color: #2b6cb0;
  line-height: 1.5;
}

.info-icon {
  font-weight: 800;
  font-size: 16px;
}

.info-box p {
  margin: 0;
}

.verification-result {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  align-items: center;
}

.verification-result.success {
  background: #f0fff4;
  border-left: 4px solid #38a169;
}

.verification-result.error {
  background: #fff5f5;
  border-left: 4px solid #e53e3e;
}

.result-icon {
  font-size: 24px;
}

.result-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
}

.result-desc {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #666;
}

.guest-list-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}

.guest-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.guest-list-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.download-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #1a1a1a;
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
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  transition: all 0.2s;
  position: relative;
}

.guest-card:hover {
  background: #f3f4f6;
}

.guest-card.checked {
  background: #f0fff4;
  border: 1px solid #c6f6d5;
}

.guest-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.guest-info {
  flex: 1;
}

.guest-name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
}

.guest-package {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #0f6e70;
  font-weight: 600;
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
}

.time {
  font-size: 12px;
  color: #1a1a1a;
  font-weight: 700;
}

.status {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.status.arrival { background: #feebc8; color: #9c4221; }
.status.checked-in { background: #c6f6d5; color: #22543d; }
.status.delayed { background: #fed7d7; color: #822727; }

.checked-badge {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  background: #38a169;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 800;
}

@media (max-width: 1024px) {
  .manifest-content {
    grid-template-columns: 1fr;
  }
}
</style>
