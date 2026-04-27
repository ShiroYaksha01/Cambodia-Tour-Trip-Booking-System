<template>
  <div class="min-h-screen bg-gradient-to-b from-[#f9faf8] to-[#f3f4f1] py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#142125]">
    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-[0_12px_24px_rgba(10,109,102,0.06)] overflow-hidden border border-[#5f6d74]/10">
      <div class="md:flex">
        <!-- Mock Image placeholder -->
        <div class="md:w-1/2 h-64 md:h-auto bg-[#0a4b47] relative flex flex-col items-center justify-center text-[#f8faf7]">
          <div class="w-12 h-12 rounded bg-[#f4a71d] mb-4 flex items-center justify-center text-xl font-bold text-[#1b2a2a] shadow-lg">✦</div>
          <span class="font-medium tracking-widest text-sm uppercase">Curated Experience</span>
        </div>

        <div class="p-8 md:w-1/2 flex flex-col justify-center">
          <div class="text-sm text-[#bf7d10] font-semibold tracking-wide uppercase mb-1">Heritage Tour</div>
          <h1 class="text-3xl font-extrabold text-[#1d2427] leading-tight">Angkor Wat Sunrise Experience</h1>
          <div class="w-12 h-[3px] rounded-full bg-[#f4a71d] mt-4 mb-5"></div>
          
          <p class="text-[#69757a] text-[0.98rem] leading-relaxed">
            Experience the majestic beauty of Angkor Wat at sunrise. This guided journey into the heart of the Khmer Empire offers historical insights and stunning, timeless views.
          </p>

          <div class="mt-8 flex items-center">
            <span class="text-3xl font-bold text-[#142125]">$45.00</span>
            <span class="ml-2 text-sm font-medium text-[#8b9498] lowercase tracking-wide">/ guest</span>
          </div>

          <div class="mt-8 pt-6 border-t border-[#616d74]/10">
            <button
              @click="handleBookNow"
              class="w-full flex justify-center py-3.5 px-4 rounded-lg shadow-[0_12px_24px_rgba(10,109,102,0.25)] text-[0.95rem] font-bold text-white bg-gradient-to-b from-[#0e7f76] to-[#0a6d66] hover:from-[#0c7068] hover:to-[#085a54] transition-all transform hover:-translate-y-0.5 focus:outline-none"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const handleBookNow = () => {
  const rawId = route.params.id
  const serviceId = Array.isArray(rawId) ? rawId[0] : rawId || 'angkor-wat-tour'
  router.push({ name: 'booking-form', params: { id: serviceId } })
}
</script>
