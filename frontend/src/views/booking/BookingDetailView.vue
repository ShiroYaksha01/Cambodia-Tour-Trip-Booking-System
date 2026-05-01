<template>
  <div class="min-h-screen bg-gradient-to-b from-[#f9faf8] to-[#f3f4f1] py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#142125]">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <button @click="router.back()" class="flex items-center text-sm font-bold text-[#69757a] hover:text-[#0e7f76] transition-colors">
          <span class="mr-2">←</span> Back to Dossier
        </button>
        <div class="px-3 py-1 rounded-full bg-white shadow-sm border border-[#5f6d74]/10 text-[0.7rem] font-bold tracking-widest uppercase text-[#8b9498]">
          Reference: {{ booking?.id }}
        </div>
      </div>

      <!-- Main Card -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <svg class="animate-spin h-8 w-8 text-[#0e7f76]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div v-else-if="error" class="bg-white p-8 rounded-xl shadow-sm border border-red-100 text-center">
        <p class="text-red-600 font-medium">{{ error }}</p>
      </div>

      <div v-else-if="booking" class="bg-white rounded-2xl shadow-[0_20px_40px_rgba(10,109,102,0.06)] border border-[#5f6d74]/10 overflow-hidden relative">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0e7f76] via-[#f4a71d] to-[#0a6d66]"></div>
        
        <div class="p-8 sm:p-10">
          <div class="flex justify-between items-start mb-10">
            <div>
              <span class="text-[0.7rem] font-bold text-[#bf7d10] tracking-[0.2em] uppercase block mb-2">Reserved Experience</span>
              <h1 class="text-3xl font-extrabold text-[#1d2427] leading-tight">{{ booking.service?.title || 'Heritage Experience' }}</h1>
            </div>
            <div 
              class="px-4 py-2 rounded-lg text-[0.75rem] font-bold tracking-wider uppercase border"
              :class="{
                'bg-[#fff9e6] text-[#b37400] border-[#f4a71d]/20': booking.status === 'pending',
                'bg-[#e6f2f1] text-[#0a6d66] border-[#0e7f76]/20': booking.status === 'confirmed',
                'bg-gray-50 text-gray-600 border-gray-200': booking.status === 'cancelled'
              }"
            >
              {{ booking.status }}
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10 pb-8 border-b border-[#5f6d74]/5">
            <div>
              <p class="text-[0.65rem] font-bold text-[#8b9498] uppercase tracking-widest mb-1.5">Scheduled Date</p>
              <p class="text-[1.1rem] font-extrabold text-[#142125]">{{ formatDate(booking.bookingDate) }}</p>
            </div>
            <div>
              <p class="text-[0.65rem] font-bold text-[#8b9498] uppercase tracking-widest mb-1.5">Guest Count</p>
              <p class="text-[1.1rem] font-extrabold text-[#142125]">{{ booking.quantity }} Explorers</p>
            </div>
          </div>

          <div class="space-y-6">
             <div class="flex justify-between items-center py-2">
                <span class="text-[0.9rem] text-[#69757a]">Unit Price</span>
                <span class="text-[0.95rem] font-bold text-[#142125]">${{ booking.service?.price }}</span>
             </div>
             <div class="flex justify-between items-center pt-4 border-t border-[#5f6d74]/10">
                <span class="text-[1.1rem] font-extrabold text-[#1d2427]">Total Investment</span>
                <span class="text-[1.5rem] font-extrabold text-[#0e7f76]">${{ booking.totalPrice }}</span>
             </div>
          </div>

          <div class="mt-12 pt-8 border-t border-[#5f6d74]/5 flex gap-4">
             <button class="flex-1 py-3.5 px-6 rounded-lg bg-[#142125] text-white text-[0.9rem] font-bold shadow-lg hover:bg-black transition-all">
                Download Receipt
             </button>
             <button v-if="booking.status === 'pending'" class="flex-1 py-3.5 px-6 rounded-lg border border-red-200 text-red-600 text-[0.9rem] font-bold hover:bg-red-50 transition-all">
                Cancel Reservation
             </button>
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
import { useRoute, useRouter } from 'vue-router'
import { apiGet } from '../../utils/api'

const route = useRoute()
const router = useRouter()
const booking = ref<any>(null)
const isLoading = ref(true)
const error = ref('')

const fetchBookingDetail = async () => {
  const id = route.params.id
  isLoading.value = true
  error.value = ''

  try {
    const response = await apiGet<{ success: boolean; data: any }>(`/booking/${id}`)
    if (response.success) {
      booking.value = response.data
    } else {
      throw new Error('Failed to load reservation details.')
    }
  } catch (err: any) {
    error.value = err.message || 'Unable to retrieve your reservation.'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string) => {
  try {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  } catch (e) {
    return dateString
  }
}

onMounted(() => {
  fetchBookingDetail()
})
</script>
