<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api.js'

interface BookingService {
  id: string
  title: string
  image: string
  date: string
  time: string
  quantity: number
  basePrice: number
  adults: number
}

interface PaymentMethod {
  id: 'visa' | 'aba' | 'bakong'
  label: string
  description: string
  icon: string
}

const router = useRouter()

const selectedPaymentMethod = ref<'visa' | 'aba' | 'bakong' | null>(null)

// Sample booking data (in real app, this would come from route params or store)
const bookingService = ref<BookingService>({
  id: '1',
  title: 'Angkor Wat Sunrise Premium',
  image: 'url_to_image',
  date: 'Oct 24, 2023',
  time: '4:30 AM',
  quantity: 2,
  basePrice: 85.0,
  adults: 2,
})

const paymentMethods: PaymentMethod[] = [
  {
    id: 'visa',
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, JCB',
    icon: '💳',
  },
  {
    id: 'bakong',
    label: 'Bakong KHQR',
    description: 'Scan with any local banking app',
    icon: '📱',
  },
  {
    id: 'aba',
    label: 'ABA Pay',
    description: 'Direct link to ABA Mobile App',
    icon: '🏦',
  },
]

const heritagePreservationFee = 15.0
const taxRate = 0.05

const subtotal = computed(() => bookingService.value.basePrice * bookingService.value.quantity)
const taxes = computed(() => Math.round(subtotal.value * taxRate * 100) / 100)
const total = computed(() => subtotal.value + heritagePreservationFee + taxes.value)

const formData = ref({
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardholderName: '',
})

const handlePaymentSubmit = async () => {
  if (!selectedPaymentMethod.value) {
    alert('Please select a payment method')
    return
  }

  try {
    const paymentPayload = {
      serviceId: bookingService.value.id,
      paymentMethod: selectedPaymentMethod.value,
      amount: total.value,
      quantity: bookingService.value.quantity,
      ...formData.value,
    }

    // Make payment request
    const response = await api.post('/payments/process', paymentPayload)

    if (response.data.success) {
      // Redirect to success page
      router.push({
        name: 'payment-success',
        params: { transactionId: response.data.transactionId },
      })
    }
  } catch (error) {
    console.error('Payment processing error:', error)
    alert('Payment processing failed. Please try again.')
  }
}

const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  const matches = v.match(/\d{4,16}/g)
  const match = (matches && matches[0]) || ''
  const parts = []

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }

  if (parts.length) {
    return parts.join(' ')
  } else {
    return value
  }
}

const handleCardInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  formData.value.cardNumber = formatCardNumber(input.value)
}

const handleExpiryInput = (e: Event) => {
  let value = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4)
  }
  formData.value.expiryDate = value
}

const handleCvvInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  formData.value.cvv = input.value.replace(/\D/g, '').slice(0, 3)
}
</script>

<template>
  <main class="checkout-page">
    <div class="checkout-container">
      <!-- Left Section: Payment Methods -->
      <section class="payment-section">
        <h1 class="section-title">Secure Checkout</h1>
        <p class="section-subtitle">Choose your preferred payment method to complete the reservation.</p>

        <div class="payment-methods">
          <label
            v-for="method in paymentMethods"
            :key="method.id"
            class="payment-option"
            :class="{ 'payment-option--active': selectedPaymentMethod === method.id }"
          >
            <input
              type="radio"
              name="payment-method"
              :value="method.id"
              v-model="selectedPaymentMethod"
              class="payment-radio"
            />
            <div class="payment-option-content">
              <div class="payment-icon">{{ method.icon }}</div>
              <div class="payment-details">
                <h3>{{ method.label }}</h3>
                <p>{{ method.description }}</p>
              </div>
            </div>
          </label>
        </div>

        <!-- Card Payment Form (visible when visa is selected) -->
        <div v-if="selectedPaymentMethod === 'visa'" class="card-form">
          <h3 class="form-title">Card Details</h3>

          <div class="form-group">
            <label for="card-number" class="form-label">Card Number</label>
            <input
              id="card-number"
              type="text"
              placeholder="0000 0000 0000 0000"
              :value="formData.cardNumber"
              @input="handleCardInput"
              class="form-input"
              maxlength="19"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="expiry-date" class="form-label">Expiry Date</label>
              <input
                id="expiry-date"
                type="text"
                placeholder="MM/YY"
                :value="formData.expiryDate"
                @input="handleExpiryInput"
                class="form-input"
                maxlength="5"
              />
            </div>
            <div class="form-group">
              <label for="cvv" class="form-label">CVV</label>
              <input
                id="cvv"
                type="password"
                placeholder="123"
                :value="formData.cvv"
                @input="handleCvvInput"
                class="form-input"
                maxlength="3"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="cardholder-name" class="form-label">Cardholder Name</label>
            <input
              id="cardholder-name"
              type="text"
              placeholder="Name on card"
              v-model="formData.cardholderName"
              class="form-input"
            />
          </div>
        </div>
      </section>

      <!-- Right Section: Booking Summary -->
      <aside class="booking-summary-section">
        <div class="booking-summary">
          <h2 class="summary-title">Booking Summary</h2>

          <!-- Service Card -->
          <div class="service-card">
            <div class="service-image"></div>
            <div class="service-info">
              <div class="service-badge">PREMIUM</div>
              <h3>{{ bookingService.title }}</h3>
              <div class="service-meta">
                <span class="meta-item">📅 {{ bookingService.date }}</span>
                <span class="meta-item">🕐 {{ bookingService.time }}</span>
                <span class="meta-item">👥 {{ bookingService.adults }} Adults</span>
              </div>
            </div>
          </div>

          <!-- Price Breakdown -->
          <div class="price-breakdown">
            <div class="price-row">
              <span>Subtotal ({{ bookingService.quantity }}x ${{ bookingService.basePrice.toFixed(2) }})</span>
              <span>${{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="price-row">
              <span>Heritage Preservation Fee</span>
              <span>${{ heritagePreservationFee.toFixed(2) }}</span>
            </div>
            <div class="price-row">
              <span>Taxes & Processing</span>
              <span>${{ taxes.toFixed(2) }}</span>
            </div>

            <div class="price-total">
              <span>Total</span>
              <span class="total-amount">${{ total.toFixed(2) }}</span>
            </div>
            <p class="total-note">Includes all taxes and fees</p>
          </div>

          <!-- Complete Payment Button -->
          <button
            @click="handlePaymentSubmit"
            :disabled="!selectedPaymentMethod"
            class="complete-payment-btn"
            :class="{ 'btn-disabled': !selectedPaymentMethod }"
          >
            🔒 Complete Payment
          </button>

          <div class="security-info">
            <span>🔒 Secure 256-bit SSL encryption</span>
          </div>
        </div>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem 1rem;
}

.checkout-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

/* Payment Section */
.payment-section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
}

.section-subtitle {
  font-size: 0.9375rem;
  color: #666;
  margin: 0 0 2rem 0;
  line-height: 1.5;
}

/* Payment Methods */
.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-option:hover {
  border-color: #17998b;
  background-color: #f9f9f9;
}

.payment-option--active {
  border-color: #17998b;
  background-color: #f0fffe;
}

.payment-radio {
  width: 20px;
  height: 20px;
  margin-right: 1rem;
  cursor: pointer;
  accent-color: #17998b;
}

.payment-option-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.payment-icon {
  font-size: 1.75rem;
}

.payment-details h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #1a1a1a;
}

.payment-details p {
  font-size: 0.875rem;
  color: #999;
  margin: 0;
}

/* Card Form */
.card-form {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.form-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: #1a1a1a;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9375rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #17998b;
  box-shadow: 0 0 0 3px rgba(23, 153, 139, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Booking Summary Section */
.booking-summary-section {
  position: sticky;
  top: 2rem;
}

.booking-summary {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-title {
  font-size: 1.375rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: #1a1a1a;
}

/* Service Card */
.service-card {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.service-image {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  flex-shrink: 0;
}

.service-info {
  flex: 1;
}

.service-badge {
  display: inline-block;
  background: #f9a825;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.service-info h3 {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: #1a1a1a;
  line-height: 1.3;
}

.service-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item {
  font-size: 0.8125rem;
  color: #666;
}

/* Price Breakdown */
.price-breakdown {
  border-top: 1px solid #e0e0e0;
  padding-top: 1.5rem;
  margin-bottom: 2rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.9375rem;
  color: #666;
}

.price-total {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 2px solid #e0e0e0;
  font-weight: 600;
  font-size: 1.0625rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.total-amount {
  color: #17998b;
  font-size: 1.375rem;
}

.total-note {
  font-size: 0.8125rem;
  color: #999;
  margin: 0;
}

/* Complete Payment Button */
.complete-payment-btn {
  width: 100%;
  padding: 1rem;
  background: #17998b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 1rem;
}

.complete-payment-btn:hover:not(.btn-disabled) {
  background: #0f6b61;
}

.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.security-info {
  text-align: center;
  font-size: 0.8125rem;
  color: #999;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .checkout-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .booking-summary-section {
    position: static;
  }
}

@media (max-width: 640px) {
  .checkout-page {
    padding: 1rem;
  }

  .payment-section,
  .booking-summary {
    padding: 1.5rem;
  }

  .checkout-container {
    gap: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .service-card {
    flex-direction: column;
  }

  .service-image {
    width: 100%;
    height: 150px;
  }
}
</style>
ont-size: 1.0625rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.total-amount {
  color: #17998b;
  font-size: 1.375rem;
}

.total-note {
  font-size: 0.8125rem;
  color: #999;
  margin: 0;
}

/* Complete Payment Button */
.complete-payment-btn {
  width: 100%;
  padding: 1rem;
  background: #17998b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 1rem;
}

.complete-payment-btn:hover:not(.btn-disabled) {
  background: #0f6b61;
}

.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.security-info {
  text-align: center;
  font-size: 0.8125rem;
  color: #999;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .checkout-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .booking-summary-section {
    position: static;
  }
}

@media (max-width: 640px) {
  .checkout-page {
    padding: 1rem;
  }

  .payment-section,
  .booking-summary {
    padding: 1.5rem;
  }

  .checkout-container {
    gap: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .service-card {
    flex-direction: column;
  }

  .service-image {
    width: 100%;
    height: 150px;
  }
}
</style>
