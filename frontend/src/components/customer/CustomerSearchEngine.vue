<template>
  <section id="search" class="search-engine">
    <div class="search-hero">
      <div>
        <p class="eyebrow">Search engine</p>
        <h1>Find your perfect stay or trip in Cambodia</h1>
        <p class="intro-copy">
          Book unforgettable travel experiences, accommodation, and transportation with trusted local providers.
        </p>
      </div>

      <div class="hero-badge">
        <strong>{{ filteredServices.length }}</strong>
        <span>options available</span>
      </div>
    </div>

    <div class="search-container">
      <div class="search-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <div class="search-panel">
        <form @submit.prevent="handleSearch" class="search-form">
          <!-- TOUR TAB -->
          <template v-if="activeTab === 'tour'">
            <label>
              <span>Location</span>
              <select v-model="tourForm.location">
                <option value="">Anywhere in Cambodia</option>
                <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
              </select>
            </label>
            <label>
              <span>Date</span>
              <input type="date" v-model="tourForm.date" :min="minDate" />
            </label>
            <label>
              <span>Title (Optional)</span>
              <input type="text" v-model="tourForm.title" placeholder="e.g. Angkor Wat" />
            </label>
          </template>

          <!-- ACCOMMODATION TAB -->
          <template v-else-if="activeTab === 'accommodation'">
            <label>
              <span>Location</span>
              <select v-model="accommodationForm.location">
                <option value="">Anywhere in Cambodia</option>
                <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
              </select>
            </label>
            <label>
              <span>Check-in</span>
              <input type="date" v-model="accommodationForm.checkIn" :min="minDate" />
            </label>
            <label>
              <span>Check-out</span>
              <input type="date" v-model="accommodationForm.checkOut" :min="accommodationForm.checkIn || minDate" />
            </label>
            <label>
              <span>Guests</span>
              <input type="number" v-model="accommodationForm.travelers" min="1" max="20" />
            </label>
          </template>

          <!-- TRANSPORTATION TAB -->
          <template v-else-if="activeTab === 'transportation'">
            <label>
              <span>From</span>
              <select v-model="transportationForm.from">
                <option value="">Select origin</option>
                <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
              </select>
            </label>
            <label>
              <span>To</span>
              <select v-model="transportationForm.to">
                <option value="">Select destination</option>
                <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
              </select>
            </label>
            <label>
              <span>Date</span>
              <input type="date" v-model="transportationForm.date" :min="minDate" />
            </label>
            <label>
              <span>Time</span>
              <input type="time" v-model="transportationForm.time" :min="minTime" />
            </label>
            <label>
              <span>Passengers</span>
              <input type="number" v-model="transportationForm.travelers" min="1" max="50" />
            </label>
          </template>

          <button type="submit" class="search-submit-btn">Search</button>
        </form>
      </div>
    </div>

    <!-- Results Section -->
    <div class="search-results-grid" v-if="filteredServices.length > 0">
      <CustomerServiceCard
        v-for="service in filteredServices"
        :key="service.id"
        :service="service"
        @book="handleBook"
        class="service-card-item"
      />
    </div>
    <div v-else-if="hasSearched" class="no-results">
      <div class="no-results-content">
        <h3>No matches found</h3>
        <p>Try adjusting your filters or searching for a different location.</p>
        <button @click="resetFilters" class="reset-btn">Reset All Filters</button>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { fetchServices } from '../../services/api'
import CustomerServiceCard, { type Tour } from './CustomerServiceCard.vue'
import { useRouter } from 'vue-router'


export default defineComponent({
  name: 'CustomerSearchEngine',
  components: {
    CustomerServiceCard
  },
  setup() {
    const router = useRouter()
    const services = ref<any[]>([])
    const activeTab = ref('tour')
    const hasSearched = ref(false)
    const appliedFilters = ref<any>(null)

    const tabs = [
      { id: 'tour', label: 'Tour', icon: '🗺️' },
      { id: 'accommodation', label: 'Accommodation', icon: '🏨' },
      { id: 'transportation', label: 'Transportation', icon: '🚐' },
    ]

    const provinces = [
      'Phnom Penh', 'Siem Reap', 'Preah Sihanouk', 'Battambang', 'Kampot',
      'Kep', 'Koh Kong', 'Kratie', 'Mondulkiri', 'Ratanakiri', 'Pursat',
      'Banteay Meanchey', 'Kampong Cham', 'Kampong Chhnang', 'Kampong Speu',
      'Kampong Thom', 'Kandal', 'Oddar Meanchey', 'Pailin', 'Preah Vihear',
      'Stung Treng', 'Svay Rieng', 'Takeo', 'Tboung Khmum', 'Prey Veng'
    ]

    const getCambodiaDate = () => {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Phnom_Penh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date())
    }

    const getCambodiaTime = () => {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Phnom_Penh',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(new Date())
    }

    const minDate = computed(() => getCambodiaDate())

    const minTime = computed(() => {
      if (transportationForm.date === minDate.value) {
        return getCambodiaTime()
      }
      return '00:00'
    })

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

    onMounted(async () => {
      try {
        const data = await fetchServices()
        services.value = Array.isArray(data) ? data : []
      } catch (error) {
        console.error('Failed to fetch services:', error)
      }
    })

    function handleSearch() {
      hasSearched.value = true
      appliedFilters.value = {
        type: activeTab.value,
        ...(activeTab.value === 'tour' ? { ...tourForm } : {}),
        ...(activeTab.value === 'accommodation' ? { ...accommodationForm } : {}),
        ...(activeTab.value === 'transportation' ? { ...transportationForm } : {}),
      }
    }

    const filteredServices = computed(() => {
      if (!appliedFilters.value) return services.value

      const filters = appliedFilters.value
      return services.value.filter((service) => {
        // Filter by type
        if (service.serviceType !== filters.type) return false

        // Tab-specific filters
        if (filters.type === 'tour') {
          if (filters.location && !service.location?.toLowerCase().includes(filters.location.toLowerCase())) return false
          if (filters.title && !service.title.toLowerCase().includes(filters.title.toLowerCase())) return false
          // Date filtering logic would depend on how travelDate is stored and if we want exact match or range
          if (filters.date && service.tourPackage?.travelDate) {
            const serviceDate = new Date(service.tourPackage.travelDate).toISOString().split('T')[0]
            if (serviceDate !== filters.date) return false
          }
        } else if (filters.type === 'accommodation') {
          if (filters.location && !service.location?.toLowerCase().includes(filters.location.toLowerCase())) return false
          // Check-in/out logic would be more complex, for now simple location + capacity check
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
    })

    function handleBook(tour: Tour) {
      router.push({ name: 'booking-form', params: { id: tour.id } })
    }

    function resetFilters() {
      tourForm.location = ''
      tourForm.date = ''
      tourForm.title = ''
      accommodationForm.location = ''
      accommodationForm.checkIn = ''
      accommodationForm.checkOut = ''
      accommodationForm.travelers = 2
      transportationForm.from = ''
      transportationForm.to = ''
      transportationForm.date = ''
      transportationForm.time = ''
      transportationForm.travelers = 2
      hasSearched.value = false
      appliedFilters.value = null
    }

    return {
      tabs,
      activeTab,
      provinces,
      tourForm,
      accommodationForm,
      transportationForm,
      handleSearch,
      filteredServices,
      hasSearched,
      handleBook,
      resetFilters,
      minDate,
      minTime
    }
  },
})
</script>

<style scoped>
.search-engine {
  display: grid;
  gap: 22px;
}

.search-hero {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
}

.eyebrow {
  margin: 0 0 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #5d6d68;
  font-size: 0.75rem;
}

h1 {
  margin: 0;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  line-height: 1.1;
  max-width: 25ch;
  color: #10333d;
}

.intro-copy {
  max-width: 44rem;
  margin-top: 16px;
  color: #45606b;
  line-height: 1.7;
}

.hero-badge {
  min-width: 160px;
  padding: 18px 20px;
  border-radius: 24px;
  background: linear-gradient(180deg, #10333d, #1e5963);
  color: #f5fbf7;
  box-shadow: 0 24px 48px rgba(16, 51, 61, 0.18);
  text-align: center;
}

.hero-badge strong {
  display: block;
  font-size: 2.2rem;
  line-height: 1;
}

.hero-badge span {
  display: block;
  margin-top: 8px;
  color: rgba(245, 251, 247, 0.75);
}

.search-container {
  background: #fff;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(16, 51, 61, 0.1);
  border: 1px solid rgba(16, 51, 61, 0.05);
}

.search-tabs {
  display: flex;
  background: #f8fbf8;
  border-bottom: 1px solid rgba(16, 51, 61, 0.08);
}

.tab-btn {
  flex: 1;
  padding: 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  color: #5d6d68;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.95rem;
}

.tab-btn.active {
  background: #fff;
  color: #006566;
  box-shadow: 0 -3px 0 #006566 inset;
}

.tab-icon {
  font-size: 1.2rem;
}

.search-panel {
  padding: 24px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.search-form label {
  flex: 1;
  min-width: 180px;
  display: grid;
  gap: 8px;
}

.search-form span {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5d6d68;
  font-weight: 700;
}

.search-form input,
.search-form select {
  width: 100%;
  border: 1px solid rgba(16, 51, 61, 0.12);
  border-radius: 12px;
  background: #f8fbf8;
  color: #10333d;
  min-height: 48px;
  padding: 0 14px;
  font: inherit;
  box-sizing: border-box;
}

.search-submit-btn {
  min-height: 48px;
  padding: 0 32px;
  border: 0;
  border-radius: 12px;
  background: #006566;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.search-submit-btn:hover {
  background: #004d4d;
}

.search-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.no-results {
  padding: 60px 20px;
  text-align: center;
  background: #fff;
  border-radius: 28px;
  border: 1px dashed rgba(16, 51, 61, 0.15);
  margin-top: 24px;
}

.no-results h3 {
  margin: 0 0 12px;
  color: #10333d;
  font-size: 1.5rem;
}

.no-results p {
  color: #5d6d68;
  margin-bottom: 24px;
}

.reset-btn {
  padding: 10px 24px;
  background: transparent;
  border: 1px solid #006566;
  color: #006566;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 900px) {
  .search-hero {
    flex-direction: column;
    align-items: flex-start;
  }
  .search-form label {
    min-width: 100%;
  }
  .search-submit-btn {
    width: 100%;
  }
}
</style>
