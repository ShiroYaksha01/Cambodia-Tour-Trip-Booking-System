<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { hasAuthSession } from '../../utils/auth'
import { resolveImageUrl } from '../../utils/api'
import CustomerNavbar from '../../components/customer/CustomerNavbar.vue'
import CustomerFooter from '../../components/customer/CustomerFooter.vue'
import CustomerServiceCard from '../../components/customer/CustomerServiceCard.vue'
import CustomerHomePageSearch from '../../components/customer/CustomerHomePageSearch.vue'
import { fetchServices } from '../../services/api'

const router = useRouter()
const route = useRoute()

const allServices = ref<any[]>([])
const isLoading = ref(true)
const activeTab = ref('all')
const hasSearched = ref(false)

const appliedFilters = ref<any>(null)

const handleSearch = (filters: any) => {
  // Instead of handling it here, push to URL so it's shareable and consistent
  router.push({ name: 'customer-explore', query: filters })
}

const applyFiltersFromQuery = () => {
  if (Object.keys(route.query).length > 0) {
    hasSearched.value = true
    const type = route.query.type as string || 'all'
    activeTab.value = type
    appliedFilters.value = { ...route.query }
  } else {
    hasSearched.value = false
    activeTab.value = 'all'
    appliedFilters.value = null
  }
}

watch(() => route.query, () => {
  applyFiltersFromQuery()
})

const filteredServices = computed(() => {
  let list = allServices.value

  if (appliedFilters.value) {
    const filters = appliedFilters.value
    list = list.filter((service) => {
      if (filters.type !== 'all' && service.serviceType !== filters.type) return false

      if (filters.type === 'all') {
        if (filters.title && !service.title.toLowerCase().includes(filters.title.toLowerCase())) return false
        return true
      }

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
    if (activeTab.value !== 'all') {
      list = list.filter(s => s.serviceType === activeTab.value)
    }
  }

  return list
})

function handleBook(tour: any) {
  if (!hasAuthSession()) {
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }
  router.push({ name: 'booking-form', params: { id: tour.id } })
}

function goToDetail(service: any) {
  const st = service?.serviceType
  if (st === 'tour') router.push({ name: 'customer-tour-detail', params: { id: service.id } })
  else if (st === 'accommodation') router.push({ name: 'customer-hotel-detail', params: { id: service.id } })
  else if (st === 'transportation') router.push({ name: 'customer-transport-detail', params: { id: service.id } })
  else router.push({ name: 'service-detail', params: { id: service.id } })
}

const goToProviderDetail = (tour: any) => {
  const providerId = tour.provider?.id || tour.providerId || tour.provider_id;

  if (!providerId) {
    console.error("Provider ID not found in tour:", tour);
    return;
  }

  router.push({
    name: "provider-detail",
    params: { id: providerId },
  });
};

onMounted(async () => {
  applyFiltersFromQuery()
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
      <section class="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500 text-white py-20 px-4">
        <div class="absolute inset-0 bg-[url('https://freedomdestinations.co.uk/wp-content/uploads/Angkor-Wat-Cambodia-4.jpg')] bg-cover bg-center opacity-20" />
        
        <div class="relative max-w-7xl mx-auto text-center">
          <h1 class="text-3xl md:text-5xl font-bold mb-4">Explore Your Next Adventure</h1>
          <p class="text-white/80 max-w-2xl mx-auto text-lg">Find the best tours, hotels, and transportation across Cambodia.</p>
        </div>
      </section>

      <!-- Search Section (Floating) -->
      <section class="relative z-10 -mt-10 px-4">
        <div class="max-w-5xl mx-auto">
          <CustomerHomePageSearch @search="handleSearch" />
        </div>
      </section>

      <!-- Results Section -->
      <section class="max-w-7xl mx-auto px-4 py-16">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Search Results</h2>
            <p class="text-gray-500 text-sm mt-1">
              {{ filteredServices.length }} {{ activeTab === 'all' ? 'service' : activeTab }}{{ filteredServices.length !== 1 ? 's' : '' }} found
            </p>
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
            :service="service"
            @click="goToDetail(service)"
            @book="handleBook"
            @provider-detail="goToProviderDetail"
          />
        </div>

        <div v-else class="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-xl font-bold text-gray-900">No results found</h3>
          <p class="text-gray-500 mt-2 max-w-sm mx-auto">Try adjusting your filters or searching in a different province to find what you're looking for.</p>
          <button @click="router.push({ name: 'customer-explore' })" class="mt-6 text-emerald-600 font-bold hover:underline">
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
