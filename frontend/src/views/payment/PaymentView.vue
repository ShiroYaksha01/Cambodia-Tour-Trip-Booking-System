<template>
  <div class="min-h-screen bg-[#fcfcfb] py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#142125]">
    <div class="max-w-4xl mx-auto">
      <!-- Stepper / Breadcrumb -->
      <nav class="flex items-center justify-center gap-4 mb-12">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-[#0e7f76]/20 text-[#0e7f76] flex items-center justify-center text-xs font-bold">1</div>
          <span class="text-xs font-bold text-[#8b9498] uppercase tracking-widest">Details</span>
        </div>
        <div class="w-12 h-px bg-gray-200"></div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-[#0e7f76] text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-[#0e7f76]/20">2</div>
          <span class="text-xs font-bold text-[#142125] uppercase tracking-widest">Payment</span>
        </div>
        <div class="w-12 h-px bg-gray-200"></div>
        <div class="flex items-center gap-2 opacity-40">
          <div class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">3</div>
          <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Success</span>
        </div>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        <!-- Summary Side -->
        <div v-if="booking" class="bg-[#142125] rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden order-2 lg:order-1">
          <div class="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(244,167,29,0.15),transparent_70%)]"></div>
          
          <div class="relative z-10">
            <span class="text-[#f4a71d] text-[0.65rem] font-bold tracking-[0.3em] uppercase block mb-4">Investment Summary</span>
            <h2 class="text-3xl font-extrabold mb-8 leading-tight">{{ booking.service?.title || 'Heritage Experience' }}</h2>
            
            <div class="space-y-6 mb-12">
              <div class="flex justify-between items-center py-4 border-b border-white/10">
                <span class="text-sm text-white/60 font-medium">Date</span>
                <span class="text-sm font-bold">{{ formatDate(booking.bookingDate) }}</span>
              </div>
              <div class="flex justify-between items-center py-4 border-b border-white/10">
                <span class="text-sm text-white/60 font-medium">Explorers</span>
                <span class="text-sm font-bold">{{ booking.quantity }} Guests</span>
              </div>
              <div class="flex justify-between items-center py-4 border-b border-white/10">
                <span class="text-sm text-white/60 font-medium">Unit Price</span>
                <span class="text-sm font-bold">${{ booking.service?.price }}</span>
              </div>
            </div>

            <div class="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
              <div class="flex justify-between items-baseline">
                <span class="text-sm font-bold text-[#f4a71d] uppercase tracking-widest">Total Amount</span>
                <span class="text-4xl font-extrabold text-white">${{ booking.totalPrice }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Skeleton Summary -->
        <div v-else class="bg-[#142125] rounded-3xl p-10 h-96 animate-pulse order-2 lg:order-1">
           <div class="h-4 w-24 bg-white/10 rounded mb-4"></div>
           <div class="h-10 w-3/4 bg-white/10 rounded mb-12"></div>
           <div class="space-y-6">
              <div class="h-8 w-full bg-white/10 rounded"></div>
              <div class="h-8 w-full bg-white/10 rounded"></div>
           </div>
        </div>

        <!-- Payment Side -->
        <div class="order-1 lg:order-2">
          <div class="mb-10">
            <h1 class="text-4xl font-extrabold text-[#1d2427] tracking-tight mb-3">Secure Payment</h1>
            <p class="text-[#69757a] text-[1rem] leading-relaxed">Select your preferred gateway to finalize your reservation.</p>
          </div>

          <div class="space-y-4 mb-10">
            <button 
              v-for="method in paymentMethods" 
              :key="method.id"
              @click="selectedMethod = method.id"
              class="w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all group"
              :class="selectedMethod === method.id ? 'border-[#0e7f76] bg-[#0e7f76]/5' : 'border-gray-100 bg-white hover:border-gray-200'"
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl">
                  {{ method.icon }}
                </div>
                <div class="text-left">
                  <p class="font-bold text-[#142125]">{{ method.name }}</p>
                  <p class="text-xs text-[#8b9498] font-medium">{{ method.description }}</p>
                </div>
              </div>
              <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center" :class="selectedMethod === method.id ? 'border-[#0e7f76] bg-[#0e7f76]' : 'border-gray-200'">
                <div v-if="selectedMethod === method.id" class="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </button>
          </div>

          <!-- Action -->
          <button 
            @click="handlePayment"
            :disabled="!selectedMethod || isLoading"
            class="w-full h-16 rounded-2xl bg-[#0e7f76] text-white font-extrabold text-lg shadow-2xl shadow-[#0e7f76]/30 hover:shadow-[#0e7f76]/50 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          >
            <span v-if="!isLoading" class="relative z-10">Complete Reservation</span>
            <span v-else class="relative z-10 flex items-center justify-center gap-3">
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Processing...
            </span>
          </button>

          <p class="mt-6 text-center text-[#8d9497] text-[0.7rem] font-medium">
            <span class="text-[#0e7f76]">🔒</span> Your transaction is encrypted and secured by national banking standards.
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiGet } from '../../utils/api'

const router = useRouter()
const route = useRoute()
const bookingId = route.params.id

const booking = ref<any>(null)
const isLoading = ref(false)
const selectedMethod = ref('')

const paymentMethods = [
  { id: 'aba', name: 'ABA Bank', description: 'Instant transfer via ABA Mobile', icon: '🏦' },
  { id: 'bakong', name: 'Bakong QR', description: 'Scan to pay with KHQR', icon: '📱' },
  { id: 'visa', name: 'VISA / MasterCard', description: 'Credit or Debit Card', icon: '💳' }
]

const fetchBooking = async () => {
  try {
    const response = await apiGet<{ success: boolean; data: any }>(`/booking/${bookingId}`)
    if (response.success) {
      booking.value = response.data
    }
  } catch (error) {
    console.error('Failed to load booking:', error)
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

const handlePayment = async () => {
  isLoading.value = true
  
  // Simulated payment processing delay
  setTimeout(() => {
    isLoading.value = false
    router.push({ name: 'booking-success', query: { id: bookingId } })
  }, 2000)
}

onMounted(fetchBooking)
</script>
