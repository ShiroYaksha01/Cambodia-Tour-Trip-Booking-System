<template>
  <div class="min-h-screen bg-[#fcfcfb] py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#142125]">
    <div class="max-w-4xl mx-auto">
      <!-- Stepper / Breadcrumb -->
      <nav class="flex items-center justify-center gap-4 mb-12">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-[#0e7f76] text-white flex items-center justify-center text-xs font-bold shadow-lg shadow-[#0e7f76]/20">1</div>
          <span class="text-xs font-bold text-[#142125] uppercase tracking-widest">Details</span>
        </div>
        <div class="w-12 h-px bg-gray-200"></div>
        <div class="flex items-center gap-2 opacity-40">
          <div class="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">2</div>
          <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Success</span>
        </div>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        <!-- Summary Side -->
        <div class="bg-[#142125] rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden order-2 lg:order-1">
          <div class="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(244,167,29,0.15),transparent_70%)]"></div>
          
          <div class="relative z-10">
            <span class="text-[#f4a71d] text-[0.65rem] font-bold tracking-[0.3em] uppercase block mb-4">Your Selection</span>
            <h2 class="text-3xl font-extrabold mb-8 leading-tight">{{ service?.title || 'Heritage Experience' }}</h2>
            
            <div class="space-y-6 mb-12">
              <div class="flex justify-between items-center py-4 border-b border-white/10">
                <span class="text-sm text-white/60 font-medium">Reservation for</span>
                <span class="text-lg font-bold">{{ form.quantity }} Explorers</span>
              </div>
              <div class="flex justify-between items-center py-4 border-b border-white/10">
                <span class="text-sm text-white/60 font-medium">Unit Price</span>
                <span class="text-lg font-bold">${{ service?.price || 0 }}</span>
              </div>
            </div>

            <div class="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
              <div class="flex justify-between items-baseline">
                <span class="text-sm font-bold text-[#f4a71d] uppercase tracking-widest">Total Investment</span>
                <span class="text-4xl font-extrabold text-white">${{ (service?.price || 0) * form.quantity }}</span>
              </div>
            </div>

            <p class="mt-8 text-xs text-white/40 italic leading-relaxed">
              * Final amount includes all curated access fees and private guide credentials. No hidden supplements.
            </p>
          </div>
        </div>

        <!-- Form Side -->
        <div class="order-1 lg:order-2">
          <div class="mb-10">
            <h1 class="text-4xl font-extrabold text-[#1d2427] tracking-tight mb-3">Finalize Journey</h1>
            <p class="text-[#69757a] text-[1rem] leading-relaxed">Configure your exploration schedule and guest credentials.</p>
          </div>

          <form @submit.prevent="submitBooking" class="space-y-8">
            <!-- Date Input -->
            <div class="space-y-3">
              <label class="text-[0.75rem] font-bold text-[#8b9498] uppercase tracking-[0.15em] ml-1">Preferred Date</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#0e7f76]">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <input 
                  type="date" 
                  v-model="form.date"
                  :min="minDate"
                  class="w-full bg-white border border-gray-100 h-14 pl-12 pr-4 rounded-2xl text-[1rem] font-bold text-[#142125] shadow-sm transition-all focus:ring-4 focus:ring-[#0e7f76]/5 focus:border-[#0e7f76] outline-none"
                />
              </div>
              <p v-if="errors.date" class="text-red-500 text-xs font-bold ml-1">{{ errors.date }}</p>
            </div>

            <!-- Quantity Input -->
            <div class="space-y-3">
              <label class="text-[0.75rem] font-bold text-[#8b9498] uppercase tracking-[0.15em] ml-1">Explorer Count</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#0e7f76]">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
                <input 
                  type="number" 
                  v-model="form.quantity"
                  min="1"
                  class="w-full bg-white border border-gray-100 h-14 pl-12 pr-4 rounded-2xl text-[1rem] font-bold text-[#142125] shadow-sm transition-all focus:ring-4 focus:ring-[#0e7f76]/5 focus:border-[#0e7f76] outline-none"
                />
              </div>
              <p v-if="errors.quantity" class="text-red-500 text-xs font-bold ml-1">{{ errors.quantity }}</p>
            </div>

            <!-- Error Banner -->
            <div v-if="apiError" class="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 items-center">
              <span class="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">!</span>
              <p class="text-sm text-red-800 font-bold">{{ apiError }}</p>
            </div>

            <!-- Submit -->
            <button 
              type="submit" 
              :disabled="isLoading || !service"
              class="w-full h-16 rounded-2xl bg-[#0e7f76] text-white font-extrabold text-lg shadow-2xl shadow-[#0e7f76]/30 hover:shadow-[#0e7f76]/50 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-wait relative overflow-hidden"
            >
              <span v-if="!isLoading" class="relative z-10 flex items-center justify-center gap-2">
                Confirm Booking
            
              </span>
              <span v-else class="relative z-10 flex items-center justify-center gap-3">
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing...
              </span>
            </button>
          </form>

          <footer class="mt-12 text-center text-[#8d9497] text-[0.6rem] font-bold tracking-widest uppercase">
            © 2024 The Heritage Curator • Private & Confidential
          </footer>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiPost, apiGet } from '../../utils/api'

const router = useRouter()
const route = useRoute()

const service = ref<any>(null)
const rawId = route.params.id
const serviceId = Array.isArray(rawId) ? rawId[0] : rawId || '19f3d5e8-040f-407f-9386-bdeabab7591e'

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
const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

const fetchService = async () => {
  try {
    service.value = await apiGet(`/services/${serviceId}`)
  } catch (error) {
    console.error('Failed to fetch service details:', error)
  }
}

onMounted(fetchService)

const validateForm = () => {
  let isValid = true
  errors.date = ''
  errors.quantity = ''

  if (!form.date) {
    errors.date = 'Date is required.'
    isValid = false
  }
  if (!form.quantity || form.quantity < 1) {
    errors.quantity = 'Minimum 1 guest.'
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
      bookingDate: form.date,
      quantity: Number(form.quantity),
    }

    const response = await apiPost<{ success: boolean; data: { id: string } }>('/booking', payload)
    if (!response.success) {
       throw new Error('Server declined the reservation.')
    }
    router.push({ name: 'booking-success', query: { id: response.data.id } })
  } catch (error: any) {
    apiError.value = error.message || 'Network error. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>
