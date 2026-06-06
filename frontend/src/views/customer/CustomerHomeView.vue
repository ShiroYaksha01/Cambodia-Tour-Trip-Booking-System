<script setup lang="ts">
import CustomerNavbar from '../../components/customer/CustomerNavbar.vue'
import CustomerHomePageSearch from '../../components/customer/CustomerHomePageSearch.vue'
import CustomerServiceCard from '../../components/customer/CustomerServiceCard.vue'
import CustomerFooter from '../../components/customer/CustomerFooter.vue'

import { fetchServices } from '../../services/api'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { hasAuthSession } from '../../utils/auth'
import { resolveImageUrl } from '../../utils/api'

const router = useRouter()
const allServices = ref<any[]>([])
const displayedServices = ref<any[]>([])

const handleBook = (tour: any) => {
  if (!hasAuthSession()) {
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }
  router.push({ name: 'booking-form', params: { id: tour.id } })
}

const goToDetail = (service: any) => {
  const st = service?.serviceType
  if (st === 'tour') router.push({ name: 'customer-tour-detail', params: { id: service.id } })
  else if (st === 'accommodation') router.push({ name: 'customer-hotel-detail', params: { id: service.id } })
  else if (st === 'transportation') router.push({ name: 'customer-transport-detail', params: { id: service.id } })
  else router.push({ name: 'service-detail', params: { id: service.id } })
}

const scrollToBottom = () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth'
  })
}

function mapServiceToTour(service: any) {
  const rawImage = service.coverImage
    || service.images?.find((img: any) => img.isCover)?.imageUrl
    || service.images?.[0]?.imageUrl;
  
  const coverImage = resolveImageUrl(rawImage)
    || 'https://freedomdestinations.co.uk/wp-content/uploads/Angkor-Wat-Cambodia-4.jpg';

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

function handleSearch(filters: any) {
  console.log("Applying filters:", filters)
  displayedServices.value = allServices.value.filter(service => {
    // Skip type filtering if 'all' is selected
    if (filters.type !== 'all' && service.serviceType !== filters.type) return false

    // Tab-specific filters
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
      // Simple capacity check (mocking rooms/people logic)
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
}

//use try-catch to handle errors when fetching data from the API
onMounted(async () => {
  try {
    const data = await fetchServices()
    console.log("API data:", data)

    allServices.value = Array.isArray(data) ? data : []
    displayedServices.value = [...allServices.value]
  } catch (error) {
    console.error("Failed to fetch services:", error)
    allServices.value = []
    displayedServices.value = []
  }
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- Navbar -->
    <CustomerNavbar />

    <!-- Hero Section -->
    <section
      class="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500 text-white"
    >
      <div
        class="absolute inset-0 bg-[url('https://freedomdestinations.co.uk/wp-content/uploads/Angkor-Wat-Cambodia-4.jpg')] bg-cover bg-center opacity-20"
      />

      <div
        class="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32"
      >
        <div class="max-w-3xl">
          <p
            class="inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur"
          >
            Explore Cambodia Beautiful Destinations
          </p>

          <h1
            class="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
          >
            Discover Amazing Tours & Trips Across Cambodia
          </h1>

          <p class="mt-6 text-lg text-white/90 leading-relaxed">
            Book unforgettable travel experiences, island adventures, cultural
            tours, and local activities with trusted travel providers.
          </p>

          <div class="mt-8 flex flex-wrap gap-4">
            <button
              @click="router.push({ name: 'customer-explore' })"
              class="rounded-xl bg-white px-6 py-3 font-semibold text-emerald-700 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
            >
              Explore Tours
            </button>

            <button
              @click="scrollToBottom"
              class="rounded-xl border border-white/40 bg-white/10 px-6 py-3 font-semibold backdrop-blur transition hover:bg-white/20"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Search Section -->
    <section class="relative z-10 -mt-12 px-4">
      <div class="max-w-7xl mx-auto">
        <CustomerHomePageSearch @search="handleSearch" />
      </div>
    </section>

    <!-- Popular Tours -->
    <section class="py-20 px-4">
      <div class="max-w-7xl mx-auto">
        <div
          class="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p class="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Popular Packages
            </p>

            <h2 class="mt-2 text-3xl md:text-4xl font-bold text-gray-900">
              Featured Cambodia Tours
            </h2>

            <p class="mt-4 max-w-2xl text-gray-600">
              Discover handpicked travel experiences designed for adventure,
              relaxation, and cultural exploration.
            </p>
          </div>

          <button
            @click="router.push({ name: 'customer-explore' })"
            class="w-fit rounded-xl border border-emerald-600 px-5 py-3 font-medium text-emerald-600 transition hover:bg-emerald-600 hover:text-white"
          >
            View All Tours
          </button>
        </div>

        <!-- Tour Cards Grid -->
        <div
          v-if="displayedServices.length > 0"
          class="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3"
        >
          <CustomerServiceCard
            v-for="service in displayedServices"
            :key="service.id"
            :tour="mapServiceToTour(service)"
            @click="goToDetail(service)"
            @book="handleBook"
            class="cursor-pointer"
          />
        </div>
        <div v-else class="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p class="text-gray-500 text-lg">No services found matching your criteria.</p>
          <button @click="displayedServices = [...allServices]" class="mt-4 text-emerald-600 font-semibold underline">
            Clear all filters
          </button>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="bg-white py-20 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="text-center max-w-3xl mx-auto">
          <p class="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Why Choose Us
          </p>

          <h2 class="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
            Travel With Confidence
          </h2>

          <p class="mt-5 text-gray-600 leading-relaxed">
            We help travelers discover the beauty of Cambodia with secure
            booking, trusted providers, and unforgettable travel experiences.
          </p>
        </div>

        <div class="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div
            class="rounded-2xl border border-gray-100 bg-gray-50 p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div
              class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl"
            >
              ✈️
            </div>

            <h3 class="text-xl font-semibold text-gray-900">
              Easy Booking
            </h3>

            <p class="mt-3 text-gray-600 leading-relaxed">
              Book your favorite tours quickly with a smooth and secure process.
            </p>
          </div>

          <div
            class="rounded-2xl border border-gray-100 bg-gray-50 p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div
              class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl"
            >
              🏝️
            </div>

            <h3 class="text-xl font-semibold text-gray-900">
              Best Destinations
            </h3>

            <p class="mt-3 text-gray-600 leading-relaxed">
              Explore Cambodia's top islands, temples, and cultural attractions.
            </p>
          </div>

          <div
            class="rounded-2xl border border-gray-100 bg-gray-50 p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div
              class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl"
            >
              ⭐
            </div>

            <h3 class="text-xl font-semibold text-gray-900">
              Trusted Reviews
            </h3>

            <p class="mt-3 text-gray-600 leading-relaxed">
              Real traveler reviews help you choose the best experiences.
            </p>
          </div>

          <div
            class="rounded-2xl border border-gray-100 bg-gray-50 p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div
              class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-2xl"
            >
              💬
            </div>

            <h3 class="text-xl font-semibold text-gray-900">
              24/7 Support
            </h3>

            <p class="mt-3 text-gray-600 leading-relaxed">
              Our support team is available anytime to help your journey.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Destination Banner -->
    <section class="px-4 pb-20">
      <div
        class="relative max-w-7xl mx-auto overflow-hidden rounded-[32px]"
      >
        <img
          src="https://freedomdestinations.co.uk/wp-content/uploads/Angkor-Wat-Cambodia-4.jpg"
          alt="Cambodia"
          class="h-[420px] w-full object-cover"
        />

        <div
          class="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20"
        />

        <div
          class="absolute inset-0 flex items-center px-8 md:px-16"
        >
          <div class="max-w-2xl text-white">
            <p class="text-sm font-semibold uppercase tracking-widest">
              Discover Cambodia
            </p>

            <h2 class="mt-4 text-3xl md:text-5xl font-bold leading-tight">
              Your Next Adventure Starts Here
            </h2>

            <p class="mt-5 text-lg text-white/90 leading-relaxed">
              From ancient temples to tropical islands, Cambodia offers
              unforgettable travel experiences for every traveler.
            </p>

            <button
              @click="router.push({ name: 'customer-explore' })"
              class="mt-8 rounded-xl bg-emerald-500 px-6 py-3 font-semibold transition hover:bg-emerald-400"
            >
              Start Booking
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <CustomerFooter />
  </div>
</template>
