<template>
  <div class="min-h-screen bg-[#fcfcfb] py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#142125]">
    <div class="max-w-5xl mx-auto">
      <!-- Back Navigation -->
      <nav class="mb-8">
        <button 
          @click="router.back()" 
          class="flex items-center text-sm font-bold text-[#8b9498] hover:text-[#0e7f76] transition-all group"
        >
          <span class="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span> 
          Return to Explorations
        </button>
      </nav>

      <!-- Skeleton State -->
      <div v-if="isLoading" class="animate-pulse bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 md:flex">
        <div class="md:w-1/2 h-96 bg-gray-200"></div>
        <div class="p-10 md:w-1/2 space-y-6">
          <div class="h-4 w-24 bg-gray-200 rounded"></div>
          <div class="h-10 w-3/4 bg-gray-200 rounded"></div>
          <div class="h-4 w-full bg-gray-200 rounded"></div>
          <div class="h-4 w-5/6 bg-gray-200 rounded"></div>
          <div class="pt-10 flex justify-between items-center">
            <div class="h-8 w-24 bg-gray-200 rounded"></div>
            <div class="h-12 w-40 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>

      <!-- Content State -->
      <div v-else-if="service" class="bg-white rounded-3xl shadow-[0_32px_64px_rgba(10,109,102,0.08)] overflow-hidden border border-[#5f6d74]/5 md:flex relative">
        <!-- Floating Badge -->
        <div class="absolute top-6 left-6 z-20">
          <div class="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-sm flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span class="text-[0.65rem] font-bold tracking-widest uppercase text-[#0e7f76]">Available Now</span>
          </div>
        </div>

        <!-- Image Gallery Side -->
        <div class="md:w-1/2 relative bg-[#0a3237] overflow-hidden min-h-[400px]">
           <img 
             :src="angkorImage" 
             alt="Angkor Wat Sunrise" 
             class="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
           />           
        </div>

        <!-- Details Side -->
        <div class="p-10 md:p-14 md:w-1/2 flex flex-col justify-center relative">
          <div class="mb-10">
            <div class="inline-flex items-center gap-3 mb-4">
              <span class="text-[0.7rem] font-bold text-[#bf7d10] tracking-[0.25em] uppercase px-3 py-1 rounded bg-[#fff9e6] border border-[#f4a71d]/10">
                {{ service.serviceType }}
              </span>
              <span class="w-1 h-1 rounded-full bg-gray-300"></span>
              <span class="text-[0.7rem] font-bold text-gray-400 tracking-widest uppercase">Concierge Approved</span>
            </div>
            
            <h1 class="text-4xl font-extrabold text-[#1d2427] leading-tight mb-6 tracking-tight">
              {{ service.title }}
            </h1>
            
            <div class="flex gap-4 mb-8">
              <div v-for="tag in ['Expert Guide', 'Private Entry', 'Curated']" :key="tag" class="flex items-center gap-1.5 text-[0.75rem] font-semibold text-[#69757a]">
                <span class="text-[#f4a71d]">✓</span> {{ tag }}
              </div>
            </div>

            <p class="text-[#69757a] text-[1.05rem] leading-relaxed mb-10 font-medium">
              {{ service.description }}
            </p>
          </div>

          <div class="mt-auto pt-10 border-t border-[#5f6d74]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div class="flex flex-col">
              <span class="text-[0.65rem] font-bold text-[#8b9498] uppercase tracking-[0.2em] mb-1">Investment</span>
              <div class="flex items-baseline gap-1">
                <span class="text-4xl font-extrabold text-[#142125]">${{ service.price }}</span>
                <span class="text-[#8b9498] text-sm font-medium">/ explorer</span>
              </div>
            </div>

            <button
              @click="handleBookNow"
              class="relative overflow-hidden group px-10 py-4 rounded-xl shadow-[0_20px_40px_rgba(10,109,102,0.2)] text-base font-bold text-white transition-all transform hover:-translate-y-1 active:scale-95"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-[#0e7f76] to-[#0a6d66] group-hover:scale-105 transition-transform duration-500"></div>
              <span class="relative flex items-center justify-center gap-2">
                Secure Reservation
                <span class="text-xl group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-24">
         <div class="text-5xl mb-6">🏜</div>
         <h2 class="text-2xl font-bold text-gray-900 mb-2">Experience Not Found</h2>
         <p class="text-gray-500 mb-8">The curated journey you are looking for has faded into history.</p>
         <button @click="router.push('/')" class="text-[#0e7f76] font-bold hover:underline">Return to Dashboard</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiGet } from '../../utils/api'
import angkorImage from '../../assets/angkorwat_sunrise.jpg'

const router = useRouter()
const route = useRoute()

const service = ref<any>(null)
const isLoading = ref(true)

const fetchService = async () => {
  isLoading.value = true
  try {
    const rawId = route.params.id
    const id = Array.isArray(rawId) ? rawId[0] : rawId || '19f3d5e8-040f-407f-9386-bdeabab7591e'
    service.value = await apiGet(`/services/${id}`)
  } catch (error) {
    console.error('Failed to fetch service:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchService)

const handleBookNow = () => {
  const id = service.value?.id || '19f3d5e8-040f-407f-9386-bdeabab7591e'
  router.push({ name: 'booking-form', params: { id } })
}
</script>