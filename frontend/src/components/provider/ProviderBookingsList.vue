<template>
  <section class="ledger-card">
    <div class="ledger-card__header">
      <div>
        <p class="section-kicker">Transaction History</p>
        <h2>Provider Bookings</h2>
        <p>Recent bookings, payment states, and quick settlement actions.</p>
      </div>

      <div class="ledger-card__chips">
        <span class="ledger-chip">Status: {{ statusLabel }}</span>
        <span class="ledger-chip">Sort: {{ sortLabel }}</span>
      </div>
    </div>

    <div v-if="loading" class="ledger-empty">Loading bookings...</div>
    <div v-else-if="error" class="ledger-empty ledger-empty--error">{{ error }}</div>
    <div v-else-if="bookings.length === 0" class="ledger-empty">No bookings found.</div>

    <div v-else class="ledger-table-wrap">
      <table class="ledger-table">
        <thead>
          <tr>
            <th>BOOKING ID</th>
            <th>INITIATED DATE</th>
            <th>DESTINATION</th>
            <th>AMOUNT</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="booking in bookings" :key="booking.id ?? booking.booking_id ?? booking.transaction_id ?? booking.reference ?? booking.service_name">
            <td>
              <strong>{{ bookingCode(booking) }}</strong>
            </td>
            <td>{{ formatDate(bookingDate(booking)) }}</td>
            <td>
              <div class="destination-cell">
                <span class="destination-badge">{{ destinationInitials(booking) }}</span>
                <div>
                  <strong>{{ serviceName(booking) }}</strong>
                  <small>{{ guestLabel(booking) }}</small>
                </div>
              </div>
            </td>
            <td>
              <strong>{{ formatMoney(bookingAmount(booking)) }}</strong>
            </td>
            <td>
              <span :class="statusClass(booking)" class="status-pill">{{ statusText(booking) }}</span>
            </td>
            <td>
              <button class="action-button" type="button">View Details</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
type BookingRecord = {
  id?: string | number
  booking_id?: string | number
  transaction_id?: string | number
  reference?: string
  service_name?: string
  service?: { name?: string; title?: string }
  user?: string | {
    name?: string
    fullName?: string
    firstName?: string
    lastName?: string
  }
  quantity?: number
  qty?: number
  amount?: number | string
  total_amount?: number | string
  price?: number | string
  date?: string
  booking_date?: string
  createdAt?: string
  payment_status?: string
  status?: string
}

const props = defineProps<{
  bookings: BookingRecord[]
  loading: boolean
  error: string
  statusLabel: string
  sortLabel: string
}>()

function normalizedStatus(booking: BookingRecord) {
  return String(booking.payment_status ?? booking.status ?? '').trim().toLowerCase()
}

function statusText(booking: BookingRecord) {
  const value = normalizedStatus(booking)

  if (value === 'paid' || value === 'released' || value === 'success') return 'Paid'
  if (value === 'pending' || value === 'processing' || value === 'hold') return 'Pending'

  return booking.payment_status ?? booking.status ?? 'Unknown'
}

function statusClass(booking: BookingRecord) {
  const value = normalizedStatus(booking)

  if (value === 'paid' || value === 'released' || value === 'success') return 'status-pill status-pill--paid'
  if (value === 'pending' || value === 'processing' || value === 'hold') return 'status-pill status-pill--pending'

  return 'status-pill status-pill--neutral'
}

function bookingCode(booking: BookingRecord) {
  return String(booking.id ?? booking.booking_id ?? booking.transaction_id ?? booking.reference ?? '—')
}

function bookingDate(booking: BookingRecord) {
  return booking.date ?? booking.booking_date ?? booking.createdAt ?? ''
}

function serviceName(booking: BookingRecord) {
  return booking.service_name ?? booking.service?.name ?? booking.service?.title ?? 'Service booking'
}

function guestLabel(booking: BookingRecord) {
  const user = booking.user

  if (!user) return 'Guest details unavailable'
  if (typeof user === 'string') return user

  return user.name ?? user.fullName ?? [user.firstName, user.lastName].filter(Boolean).join(' ') ?? 'Guest'
}

function destinationInitials(booking: BookingRecord) {
  return serviceName(booking)
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

function bookingAmount(booking: BookingRecord) {
  const rawValue = booking.amount ?? booking.total_amount ?? booking.price
  const numericValue = typeof rawValue === 'string' ? Number(rawValue) : rawValue
  return Number.isFinite(numericValue as number) ? Number(numericValue) : null
}

function formatMoney(value: number | null) {
  if (value === null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value: string) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(parsed)
}
</script>

<style scoped>
.ledger-card {
  background: #fff;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 16px 34px rgba(20, 31, 31, 0.08);
}

.ledger-card__header {
  display: flex;
  gap: 16px;
  align-items: start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-kicker {
  margin: 0 0 8px;
  color: #7a8784;
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.ledger-card h2 {
  margin: 0;
  color: #173f42;
  font-size: 1.2rem;
}

.ledger-card p {
  margin: 6px 0 0;
  color: #72817d;
  font-size: 0.84rem;
}

.ledger-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.ledger-chip {
  padding: 6px 10px;
  border-radius: 999px;
  background: #f0f3f2;
  color: #5d6d6a;
  font-size: 0.72rem;
  font-weight: 700;
}

.ledger-empty {
  padding: 18px;
  border-radius: 12px;
  background: #f7f8f7;
  color: #4d5d5b;
}

.ledger-empty--error {
  background: #fff4f4;
  color: #b53d3d;
}

.ledger-table-wrap {
  overflow-x: auto;
  border: 1px solid #edf0ef;
  border-radius: 14px;
}

.ledger-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

.ledger-table thead {
  background: #fafafa;
}

.ledger-table th {
  padding: 14px 16px;
  text-align: left;
  color: #6c7b77;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
}

.ledger-table td {
  padding: 16px;
  border-top: 1px solid #f0f1f0;
  color: #263f41;
  vertical-align: middle;
  font-size: 0.9rem;
}

.ledger-table tbody tr:hover {
  background: #fbfcfc;
}

.ledger-table strong {
  color: #1b3031;
}

.destination-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.destination-cell small {
  display: block;
  margin-top: 4px;
  color: #71817d;
}

.destination-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #edf7f6;
  color: #0f6e70;
  font-size: 0.72rem;
  font-weight: 800;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
}

.status-pill--paid {
  background: #d9f1e4;
  color: #15613c;
}

.status-pill--pending {
  background: #f7e7b4;
  color: #815900;
}

.status-pill--neutral {
  background: #edf0ef;
  color: #5d6d6a;
}

.action-button {
  border: 1px solid #d7dfdc;
  background: #fff;
  color: #0f6e70;
  padding: 8px 12px;
  border-radius: 10px;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
}

@media (max-width: 960px) {
  .ledger-card__header {
    flex-direction: column;
  }

  .ledger-card__chips {
    justify-content: flex-start;
  }
}
</style>