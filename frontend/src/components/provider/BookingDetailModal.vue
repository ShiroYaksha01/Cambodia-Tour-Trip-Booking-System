<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal">
          <div class="modal-header">
            <div class="modal-header-left">
              <div class="modal-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <h2>Booking Details</h2>
                <p class="modal-ref">#{{ bookingCode }}</p>
              </div>
            </div>
            <button class="close-btn" @click="$emit('close')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="detail-section">
              <div class="detail-row">
                <span class="detail-label">Service</span>
                <span class="detail-value">{{ serviceName }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Guest</span>
                <span class="detail-value">{{ guestLabel }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">{{ formatDate(bookingDate) }}</span>
              </div>
            </div>

            <div class="divider" />

            <div class="detail-section">
              <div class="amount-row">
                <span class="detail-label">Total Amount</span>
                <span class="amount-value">{{ formatMoney(bookingAmount) }}</span>
              </div>
            </div>

            <div class="divider" />

            <div class="detail-section">
              <div class="detail-row">
                <span class="detail-label">Status</span>
                <span :class="['status-badge', statusClass]">{{ statusText }}</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="$emit('close')">Close</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  bookingCode: string
  serviceName: string
  guestLabel: string
  bookingDate: string
  bookingAmount: number | null
  statusText: string
  statusClass: string
}>()

defineEmits<{
  close: []
}>()

function formatDate(value: string) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(parsed)
}

function formatMoney(value: number | null) {
  if (value === null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: #fff;
  width: 100%;
  max-width: 420px;
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #edf0ef;
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #edf7f6;
  color: #0f6e70;
  display: grid;
  place-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.05rem;
  color: #173f42;
  font-weight: 700;
}

.modal-ref {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: #71817d;
  font-weight: 500;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #8a9a97;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.15s;
}

.close-btn:hover {
  background: #f0f3f2;
}

.modal-body {
  padding: 20px 24px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 0.82rem;
  color: #71817d;
  font-weight: 500;
}

.detail-value {
  font-size: 0.9rem;
  color: #1b3031;
  font-weight: 600;
  text-align: right;
  max-width: 60%;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f6e70;
}

.divider {
  height: 1px;
  background: #edf0ef;
  margin: 16px 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.status-badge.status-pill--paid {
  background: #d9f1e4;
  color: #15613c;
}

.status-badge.status-pill--pending {
  background: #f7e7b4;
  color: #815900;
}

.status-badge.status-pill--neutral {
  background: #edf0ef;
  color: #5d6d6a;
}

.modal-footer {
  padding: 16px 24px 20px;
  display: flex;
  justify-content: flex-end;
}

.btn-secondary {
  padding: 10px 24px;
  border-radius: 10px;
  border: 1px solid #d7dfdc;
  background: #fff;
  color: #0f6e70;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-secondary:hover {
  background: #f0f3f2;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal {
  transform: scale(0.95) translateY(10px);
}

.modal-leave-to .modal {
  transform: scale(0.95) translateY(10px);
}
</style>
