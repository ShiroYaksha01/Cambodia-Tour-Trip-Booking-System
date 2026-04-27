<template>
  <div class="min-h-screen bg-gradient-to-b from-[#f9faf8] to-[#f3f4f1] border-t border-[#0e7f76]/10 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-[#142125]">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded bg-[#f4a71d] text-[#1b2a2a] text-xl font-bold shadow-[0_8px_18px_rgba(0,0,0,0.15)] mb-6">✦</div>
      <h2 class="text-3xl font-extrabold text-[#1d2427] tracking-tight">
        Confirm Your Journey
      </h2>
      <p class="mt-3 text-[0.98rem] text-[#69757a] max-w-[22rem] mx-auto">
        Please enter your preferred details to finalize your curated experience.
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white/90 backdrop-blur-md py-10 px-6 shadow-[0_12px_24px_rgba(10,109,102,0.06)] rounded-xl sm:px-10 border border-[#5f6d74]/10 relative overflow-hidden">
        
        <!-- Subtle background accent -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(245,164,28,0.08),transparent_70%)] pointer-events-none text-transparent"></div>

        <form class="space-y-6 relative z-10" @submit.prevent="submitBooking">
          <div class="grid gap-2">
            <label for="date" class="block text-[0.88rem] font-semibold text-[#3b4548]">
              Reservation Date
            </label>
            <div class="relative bg-white rounded-lg border border-[#5f6d74]/20 shadow-[0_1px_0_rgba(17,24,39,0.02)] h-[42px] flex items-center px-3 transition-colors focus-within:border-[#0d7e73] focus-within:ring-1 focus-within:ring-[#0d7e73]">
              <input
                id="date"
                name="date"
                type="date"
                v-model="form.date"
                class="w-full bg-transparent border-0 outline-none text-[#233036] text-[0.95rem]"
              />
            </div>
            <p v-if="errors.date" class="mt-1 text-[0.85rem] text-red-600 font-medium">
              {{ errors.date }}
            </p>
          </div>

          <div class="grid gap-2">
            <label for="quantity" class="block text-[0.88rem] font-semibold text-[#3b4548]">
              Number of Guests
            </label>
            <div class="relative bg-white rounded-lg border border-[#5f6d74]/20 shadow-[0_1px_0_rgba(17,24,39,0.02)] h-[42px] flex items-center px-3 transition-colors focus-within:border-[#0d7e73] focus-within:ring-1 focus-within:ring-[#0d7e73]">
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                v-model="form.quantity"
                class="w-full bg-transparent border-0 outline-none text-[#233036] text-[0.95rem]"
              />
            </div>
            <p v-if="errors.quantity" class="mt-1 text-[0.85rem] text-red-600 font-medium">
              {{ errors.quantity }}
            </p>
          </div>

          <!-- API Error Message -->
          <div v-if="apiError" class="rounded-md bg-red-50/80 p-4 border border-red-200 mt-2">
            <div class="flex">
               <div class="flex-shrink-0 text-red-500 font-bold mr-3">!</div>
              <div>
                <h3 class="text-[0.88rem] font-semibold text-red-800">Booking failed</h3>
                <div class="mt-1 text-[0.85rem] text-red-700 leading-snug">
                  <p>{{ apiError }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-2">
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center items-center py-2.5 px-4 rounded-lg shadow-[0_12px_24px_rgba(10,109,102,0.25)] text-[0.95rem] font-bold text-white bg-gradient-to-b from-[#0e7f76] to-[#0a6d66] hover:from-[#0c7068] hover:to-[#085a54] disabled:opacity-75 disabled:cursor-wait transition-all focus:outline-none"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? 'Processing...' : 'Confirm Reservation →' }}
            </button>
          </div>
        </form>
      </div>
      
      <!-- Footer Link matching LoginView -->
      <footer class="mt-12 flex justify-center text-[#8d9497] text-[0.64rem] tracking-[0.14em] font-bold">
         <span>© 2024 THE HERITAGE CURATOR. ALL RIGHTS RESERVED.</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiPost, getAuthToken, saveBookingLocally } from '../../utils/api'

const router = useRouter()
const route = useRoute()

const rawId = route.params.id
const serviceId = Array.isArray(rawId) ? rawId[0] : rawId || 'angkor-wat-tour'

const form = reactive({
  date: '',
  quantity: 1,
})

const errors = reactive({
  date: '',
  quantity: '',
})

const isLoading = ref(false)
const apiError = ref('')

const validateForm = () => {
  let isValid = true
  errors.date = ''
  errors.quantity = ''

  if (!form.date) {
    errors.date = 'Reservation date is required.'
    isValid = false
  }

  if (!form.quantity || form.quantity < 1) {
    errors.quantity = 'Must include at least 1 guest.'
    isValid = false
  }

  return isValid
}

const submitBooking = async () => {
  if (!validateForm()) return

  isLoading.value = true
  apiError.value = ''

  try {
    const payload = {
      serviceId,
      date: form.date,
      quantity: Number(form.quantity),
    }

    const token = getAuthToken()

    if (token) {
      const response = await apiPost<{ success: boolean; data: Record<string, unknown> }>('/booking', payload)
      if (!response.success) {
        throw new Error('Unable to complete booking. Please try again.')
      }
      saveBookingLocally(response.data)
    } else {
      const bookingId = Math.random().toString(36).slice(2, 10)
      saveBookingLocally({
        id: bookingId,
        serviceId,
        serviceName: 'Angkor Wat Sunrise Experience',
        date: form.date,
        quantity: Number(form.quantity),
        status: 'confirmed',
      })
    }

    router.push({ name: 'booking-success' })
  } catch (error: any) {
    apiError.value = error.message || 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>
