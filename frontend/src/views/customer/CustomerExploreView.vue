<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { hasAuthSession } from '../../utils/auth'
import CustomerNavbar from '../../components/customer/CustomerNavbar.vue'
import CustomerFooter from '../../components/customer/CustomerFooter.vue'
import CustomerServiceCard from '../../components/customer/CustomerServiceCard.vue'
import { fetchServices } from '../../services/api'

const router = useRouter()

const allServices = ref<any[]>([])
const isLoading = ref(true)
const activeTab = ref('tour')
const hasSearched = ref(false)

const provinces = [
  'Phnom Penh', 'Siem Reap', 'Preah Sihanouk', 'Battambang', 'Kampot',
  'Kep', 'Koh Kong', 'Kratie', 'Mondulkiri', 'Ratanakiri', 'Pursat',
  'Banteay Meanchey', 'Kampong Cham', 'Kampong Chhnang', 'Kampong Speu',
  'Kampong Thom', 'Kandal', 'Oddar Meanchey', 'Pailin', 'Preah Vihear',
  'Stung Treng', 'Svay Rieng', 'Takeo', 'Tboung Khmum', 'Prey Veng'
]

// Date/Time helpers
const getCambodiaDate = () => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date())
}

const minDate = computed(() => getCambodiaDate())

// Search Forms
const tourForm = reactive({
  location: '',
  date: minDate.value,
  title: '',
})

const accommodationForm = reactive({
  location: '',
  checkIn: minDate.value,
  checkOut: '',
  travelers: 2,
})

const transportationForm = reactive({
  from: '',
  to: '',
  date: minDate.value,
  time: '',
  travelers: 2,
})

const appliedFilters = ref<any>(null)

const handleSearch = () => {
  hasSearched.value = true
  appliedFilters.value = {
    type: activeTab.value,
    ...(activeTab.value === 'tour' ? { ...tourForm } : {}),
    ...(activeTab.value === 'accommodation' ? { ...accommodationForm } : {}),
    ...(activeTab.value === 'transportation' ? { ...transportationForm } : {}),
  }
}

const filteredServices = computed(() => {
  let list = allServices.value

  if (appliedFilters.value) {
    const filters = appliedFilters.value
    list = list.filter((service) => {
      if (service.serviceType !== filters.type) return false

      if (filters.type === 'tour') {
        if (filters.location && !service.location?.toLowerCase().includes(filters.location.toLowerCase())) return false
        if (filters.title && !service.title.toLowerCase().includes(filters.title.toLowerCase())) return false
        if (filters.date && service.tourPackage?.travelDate) {
          const serviceDate = new Date(service.tourPackage.travelDate).toISOString().split('T')[0]
          if (serviceDate !== filters.date) return false
        }
      } else if (filters.type === 'accommodation') {
        if (filters.location && !service.location?.toLowerCase().includes(filters.location.toLowerCase())) return false
        if (filters.travelers && service.accommodation?.totalRooms < Math.ceil(filters.travelers / 2)) return false
      } else if (filters.type === 'transportation') {
        if (filters.from && !service.transportation?.departurePoint?.toLowerCase().includes(filters.from.toLowerCase())) return false
        if (filters.to && !service.transportation?.destination?.toLowerCase().includes(filters.to.toLowerCase())) return false
        if (filters.date && service.transportation?.departureTime) {
          const serviceDate = new Date(service.transportation.departureTime).toISOString().split('T')[0]
          if (serviceDate !== filters.date) return false
        }
      }
      return true
    })
  } else {
    // By default, just filter by active tab type if no search has been explicitly triggered
    list = list.filter(s => s.serviceType === activeTab.value)
  }

  return list
})

function mapServiceToTour(service: any) {
  const coverImage = service.coverImage
    || service.images?.find((img: any) => img.isCover)?.imageUrl
    || service.images?.[0]?.imageUrl
    || 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800&auto=format&fit=crop';

  return {
    id: service.id,
    title: service.title,
    location: service.location || 'Cambodia',
    description: service.description || '',
    image: coverImage,
    rating: service.rating || 4.5,
    reviews: Math.floor(Math.random() * 100) + 10,
    price: typeof service.price === 'string' ? parseFloat(service.price) : service.price,
    duration: service.duration || 'Flexible',
  }
}

function handleBook(tour: any) {
  if (!hasAuthSession()) {
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }
  router.push({ name: 'booking-form', params: { id: tour.id } })
}

function goToDetail(id: string) {
  router.push({ name: 'service-detail', params: { id } })
}

onMounted(async () => {
  try {
    const data = await fetchServices()
    allServices.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to fetch services:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <CustomerNavbar />

    <main class="flex-grow">
      <!-- Search Header -->
      <section class="bg-emerald-900 text-white py-12 px-4 shadow-inner">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-3xl md:text-4xl font-bold mb-8">Explore Your Next Adventure</h1>
          
          <div class="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl">
            <!-- Tabs -->
            <div class="flex border-b border-gray-100 bg-gray-50/50">
              <button
                v-for="tab in ['tour', 'accommodation', 'transportation']"
                :key="tab"
                @click="activeTab = tab"
                class="flex-1 py-4 px-6 text-sm font-bold uppercase tracking-wider transition-all border-b-2"
                :class="activeTab === tab ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'"
              >
                {{ tab }}
              </button>
            </div>

            <!-- Form -->
            <div class="p-6">
              <form @submit.prevent="handleSearch" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <template v-if="activeTab === 'tour'">
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</label>
                    <select v-model="tourForm.location" class="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none">
                      <option value="">Anywhere</option>
                      <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</label>
                    <input type="date" v-model="tourForm.date" :min="minDate" class="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Keyword</label>
                    <input type="text" v-model="tourForm.title" placeholder="Search title..." class="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
                  </div>
                </template>

                <template v-else-if="activeTab === 'accommodation'">
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</label>
                    <select v-model="accommodationForm.location" class="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none">
                      <option value="">Anywhere</option>
                      <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Check-in</label>
                    <input type="date" v-model="accommodationForm.checkIn" :min="minDate" class="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Guests</label>
                    <input type="number" v-model="accommodationForm.travelers" min="1" class="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
                  </div>
                </template>

                <template v-else-if="activeTab === 'transportation'">
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">From</label>
                    <select v-model="transportationForm.from" class="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none">
                      <option value="">Origin</option>
                      <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">To</label>
                    <select v-model="transportationForm.to" class="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none">
                      <option value="">Destination</option>
                      <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</label>
                    <input type="date" v-model="transportationForm.date" :min="minDate" class="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
                  </div>
                </template>

                <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-emerald-600/20 h-[50px]">
                  Update
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <!-- Results Section -->
      <section class="max-w-7xl mx-auto px-4 py-12">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Search Results</h2>
            <p class="text-gray-500 text-sm mt-1">{{ filteredServices.length }} {{ activeTab }}s found</p>
          </div>
          
          <div class="flex gap-2">
            <!-- Filter chips could go here -->
          </div>
        </div>

        <div v-if="isLoading" class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>

        <div v-else-if="filteredServices.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <CustomerServiceCard
            v-for="service in filteredServices"
            :key="service.id"
            :tour="mapServiceToTour(service)"
            @click="goToDetail(service.id)"
            @book="handleBook"
          />
        </div>

        <div v-else class="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-xl font-bold text-gray-900">No results found</h3>
          <p class="text-gray-500 mt-2 max-w-sm mx-auto">Try adjusting your filters or searching in a different province to find what you're looking for.</p>
          <button @click="appliedFilters = null" class="mt-6 text-emerald-600 font-bold hover:underline">
            Clear all filters
          </button>
        </div>
      </section>
    </main>

    <CustomerFooter />
  </div>
</template>

<style scoped>
/* Custom transitions for form templates if needed */
</style>
