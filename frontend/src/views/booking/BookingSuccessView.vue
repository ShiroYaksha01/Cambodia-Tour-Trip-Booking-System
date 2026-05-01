<template>
  <div class="min-h-screen bg-[#fcfcfb] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#142125]">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-[2.5rem] shadow-[0_40px_80px_rgba(10,109,102,0.12)] border border-[#5f6d74]/5 overflow-hidden relative">
        
        <!-- Header Decor -->
        <div class="h-32 bg-[#0e7f76] relative overflow-hidden">
           <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,167,29,0.3),transparent_70%)]"></div>
           <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                 <svg class="h-8 w-8 text-white animate-[bounce_2s_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                 </svg>
              </div>
           </div>
        </div>

        <div class="p-10 text-center">
          <span class="text-[0.65rem] font-bold text-[#bf7d10] tracking-[0.3em] uppercase block mb-4">Confirmed</span>
          <h2 class="text-3xl font-extrabold text-[#1d2427] mb-4 tracking-tight">Journey Secured</h2>
          <p class="text-[#69757a] text-[0.95rem] leading-relaxed mb-10 px-4">
            Your credentials have been authenticated and your place in the heritage expedition is reserved.
          </p>

          <!-- Details Card -->
          <div class="bg-[#f7fbfa] rounded-3xl p-6 border border-[#0e7f76]/10 text-left mb-10 space-y-4">
             <div class="flex justify-between items-center">
                <span class="text-[0.65rem] font-bold text-[#8b9498] uppercase tracking-widest">Reference</span>
                <span class="text-sm font-bold text-[#142125] font-mono">{{ bookingId.slice(0, 13) }}...</span>
             </div>
             <div class="flex justify-between items-center">
                <span class="text-[0.65rem] font-bold text-[#8b9498] uppercase tracking-widest">Expedition Date</span>
                <span class="text-sm font-bold text-[#142125]">{{ bookingDate || 'Pending' }}</span>
             </div>
             <div class="pt-4 border-t border-[#0e7f76]/5 flex justify-between items-center">
                <span class="text-[0.65rem] font-bold text-[#0e7f76] uppercase tracking-widest">Status</span>
                <span class="flex items-center gap-1.5 text-xs font-extrabold text-[#0e7f76]">
                   <span class="w-1.5 h-1.5 rounded-full bg-[#0e7f76]"></span>
                   Confirmed
                </span>
             </div>
          </div>

          <!-- Actions -->
          <div class="space-y-4">
            <button
              @click="goToHistory"
              class="w-full h-14 rounded-2xl bg-[#142125] text-white font-bold text-sm shadow-xl hover:bg-black transition-all transform hover:-translate-y-1"
            >
              Access to Booking History
            </button>
            <button
              @click="router.push('/')"
              class="w-full h-14 rounded-2xl bg-transparent text-[#69757a] font-bold text-sm hover:text-[#142125] transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 py-4 text-center border-t border-gray-100">
           <span class="text-[0.55rem] font-bold text-gray-400 tracking-[0.2em] uppercase">The Heritage Curator Official Receipt</span>
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
const bookingId = ref('')
const bookingDate = ref('')

const goToHistory = () => {
  router.push({ name: 'booking-history' })
}

onMounted(async () => {
  const rawId = route.query.id
  const id = Array.isArray(rawId) ? rawId[0] : rawId
  if (!id || typeof id !== 'string') return

  bookingId.value = id

  try {
    const response = await apiGet<{ success: boolean; data: { bookingDate?: string } }>(`/booking/${id}`)
    if (response.success && response.data.bookingDate) {
      bookingDate.value = new Date(response.data.bookingDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    }
  } catch {
    // Already confirmed, just show fallback
  }
})
</script>
