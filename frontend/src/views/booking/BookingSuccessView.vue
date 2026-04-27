<template>
  <div class="min-h-screen bg-gradient-to-b from-[#f9faf8] to-[#f3f4f1] border-t border-[#0e7f76]/10 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-[#142125]">
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white/90 backdrop-blur-md py-12 px-6 shadow-[0_12px_24px_rgba(10,109,102,0.06)] rounded-xl sm:px-10 text-center border border-[#5f6d74]/10 relative overflow-hidden">
        
        <!-- Subtle background accent -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(14,127,118,0.05),transparent_70%)] pointer-events-none text-transparent"></div>

        <!-- Success Icon -->
        <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-[#0e7f76]/20 to-[#0a6d66]/10 mb-6 shadow-sm border border-[#0e7f76]/10 relative z-10">
          <svg class="h-10 w-10 text-[#0e7f76]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 class="text-3xl font-extrabold text-[#1d2427] mb-3 tracking-tight relative z-10">Reservation Confirmed</h2>
        <p class="text-[0.98rem] text-[#69757a] mb-8 leading-relaxed max-w-[18rem] mx-auto relative z-10">
          Your curated experience has been secured. You can view its details in your dossier.
        </p>

        <div class="relative z-10">
           <button
             @click="goToHistory"
             class="w-full flex justify-center py-3 px-4 rounded-lg shadow-[0_12px_24px_rgba(10,109,102,0.25)] text-[0.95rem] font-bold text-white bg-gradient-to-b from-[#0e7f76] to-[#0a6d66] hover:from-[#0c7068] hover:to-[#085a54] transition-all transform hover:-translate-y-0.5 focus:outline-none"
           >
             View Booking History →
           </button>
        </div>
      </div>
      
      <!-- Footer Link -->
      <footer class="mt-12 flex justify-center text-[#8d9497] text-[0.64rem] tracking-[0.14em] font-bold">
         <span>© 2024 THE HERITAGE CURATOR. ALL RIGHTS RESERVED.</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToHistory = () => {
  router.push({ name: 'booking-history' })
}
</script>
