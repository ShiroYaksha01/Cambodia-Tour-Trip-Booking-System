<template>
  <div class="min-h-screen bg-gradient-to-b from-[#f9faf8] to-[#f3f4f1] py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#142125]">
    <div class="max-w-4xl mx-auto">
      <div class="mb-10 flex items-center gap-4">
        <div class="w-10 h-10 rounded bg-[#f4a71d] flex items-center justify-center text-xl font-bold text-[#1b2a2a] shadow-md">✦</div>
        <div>
          <h1 class="text-3xl font-extrabold text-[#1d2427] tracking-tight">Booking History</h1>
          <p class="text-[0.95rem] text-[#69757a] mt-1">Review your scheduled heritage experiences.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-16">
        <svg class="animate-spin h-8 w-8 text-[#0e7f76]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white/80 backdrop-blur border border-red-200 p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
        <div class="flex items-start">
          <div class="flex-shrink-0 mt-0.5">
             <div class="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">!</div>
          </div>
          <div class="ml-3">
            <h3 class="text-[0.95rem] text-red-800 font-bold mb-1">Failed to retrieve dossier</h3>
            <p class="text-[0.88rem] text-red-700 leading-relaxed">{{ error }}</p>
            <div class="mt-4">
               <button @click="fetchBookings" class="text-[0.85rem] font-bold text-red-700 underline hover:text-red-900 transition-colors">
                 Try Again
               </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="bookings.length === 0" class="bg-white/90 rounded-xl shadow-[0_12px_24px_rgba(10,109,102,0.04)] border border-[#5f6d74]/10 text-center py-20 px-4 relative overflow-hidden backdrop-blur-sm">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,164,28,0.03),transparent_60%)] pointer-events-none"></div>
        <div class="w-16 h-16 mx-auto rounded-full border-2 border-[#5f6d74]/20 flex items-center justify-center text-[#8b9498] text-2xl font-serif italic mb-4">No.</div>
        <h3 class="mt-2 text-xl font-extrabold text-[#1d2427]">No Experiences Found</h3>
        <p class="mt-2 text-[0.95rem] text-[#69757a] max-w-sm mx-auto">You haven't scheduled any heritage tours yet. Ready to start your journey?</p>
        <div class="mt-8">
          <router-link to="/dashboard" class="inline-flex items-center justify-center py-2.5 px-6 rounded-lg shadow-md text-[0.95rem] font-bold text-[#1b2a2a] bg-[#f4a71d] hover:bg-[#e49b18] transition-all transform hover:-translate-y-0.5">
            Explore Experiences →
          </router-link>
        </div>
      </div>

      <!-- Bookings List -->
      <div v-else class="space-y-6">
        <div v-for="booking in bookings" :key="booking.id" class="bg-white rounded-xl shadow-[0_8px_16px_rgba(10,109,102,0.04)] border border-[#5f6d74]/10 overflow-hidden hover:shadow-[0_12px_24px_rgba(10,109,102,0.08)] transition-all relative">
          
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0e7f76] to-[#0a6d66]" v-if="booking.status === 'confirmed'"></div>
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#f4a71d]" v-if="booking.status === 'pending'"></div>
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-gray-400" v-if="booking.status === 'cancelled'"></div>

          <div class="p-6 pl-8">
            <div class="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div>
                <p class="text-[0.75rem] text-[#8b9498] font-bold tracking-widest uppercase mb-1.5">ID: {{ booking.id }}</p>
                <h3 class="text-[1.25rem] font-extrabold text-[#1d2427] leading-tight">{{ booking.serviceName || 'Heritage Experience' }}</h3>
              </div>
              <span 
                class="px-3 py-1.5 inline-flex text-[0.75rem] tracking-wider uppercase font-bold rounded-full shadow-sm border"
                :class="{
                  'bg-[#fff9e6] text-[#b37400] border-[#f4a71d]/20': booking.status === 'pending',
                  'bg-[#e6f2f1] text-[#0a6d66] border-[#0e7f76]/20': booking.status === 'confirmed',
                  'bg-gray-50 text-gray-600 border-gray-200': booking.status === 'cancelled'
                }"
              >
                {{ booking.status }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[0.95rem] border-t border-[#5f6d74]/5 pt-4">
              <div class="flex items-center text-[#69757a]">
                <span class="mr-2 text-[#b0b7ba]">Date:</span>
                <strong class="text-[#142125]">{{ formatDate(booking.date) }}</strong>
              </div>
              <div class="flex items-center text-[#69757a]">
                <span class="mr-2 text-[#b0b7ba]">Guests:</span>
                <strong class="text-[#142125]">{{ booking.quantity }}</strong>
              </div>
            </div>
            
            <div class="mt-5 text-right flex justify-end gap-4">
              <router-link 
                :to="{ name: 'booking-detail', params: { id: booking.id } }"
                class="text-[0.85rem] font-bold text-[#0e7f76] hover:text-[#0a6d66] transition-colors"
              >
                Manage Reservation →
              </router-link>
              <button class="text-[0.85rem] font-bold text-[#bf7d10] hover:text-[#e49b18] transition-colors">
                View Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <footer class="mt-16 text-center text-[#8d9497] text-[0.64rem] tracking-[0.14em] font-bold">
         <span>© 2024 THE HERITAGE CURATOR. ALL RIGHTS RESERVED.</span>
      </footer>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiGet } from '../../utils/api'

interface Booking {
  id: string | number
  serviceId: string | number
  serviceName: string
  date: string
  quantity: number
  status: 'pending' | 'confirmed' | 'cancelled'
  totalPrice?: number
}

const bookings = ref<Booking[]>([])
const isLoading = ref(true)
const error = ref('')

const mapBooking = (raw: any): Booking => ({
  id: raw.id,
  serviceId: raw.serviceId ?? raw.service?.id ?? 'unknown',
  serviceName: raw.service?.title ?? raw.serviceName ?? 'Heritage Experience',
  date: raw.bookingDate ?? raw.date ?? '',
  quantity: raw.quantity ?? 1,
  status: raw.status ?? 'confirmed',
  totalPrice: raw.totalPrice,
})

const fetchBookings = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const response = await apiGet<{ success: boolean; data: any[] }>('/booking/user')
    if (!response.success) {
      throw new Error('Failed to load booking history.')
    }
    bookings.value = response.data.map(mapBooking)
  } catch (err: any) {
    error.value = err?.message || 'Unable to load booking history.'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string) => {
  try {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  } catch (e) {
    return dateString
  }
}

onMounted(() => {
  fetchBookings()
})
</script>
