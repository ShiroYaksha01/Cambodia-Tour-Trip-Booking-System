<template>
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
        <!-- ALL TAB -->
        <template v-if="activeTab === 'all'">
          <label class="all-search-label">
            <span>Search Anything</span>
            <input type="text" v-model="tourForm.title" placeholder="Find tours, hotels, or transfers..." />
          </label>
        </template>

        <!-- TOUR TAB -->
        <template v-else-if="activeTab === 'tour'">
          <label>
            <span>Location</span>
            <select v-model="tourForm.location">
              <option value="">Anywhere</option>
              <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
            </select>
          </label>
          <label>
            <span>Date</span>
            <input type="date" v-model="tourForm.date" :min="minDate" />
          </label>
          <label>
            <span>Title (Optional)</span>
            <input type="text" v-model="tourForm.title" placeholder="Search by name" />
          </label>
        </template>

        <!-- ACCOMMODATION TAB -->
        <template v-else-if="activeTab === 'accommodation'">
          <label>
            <span>Location</span>
            <select v-model="accommodationForm.location">
              <option value="">Anywhere</option>
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
            <input type="number" v-model="accommodationForm.travelers" min="1" />
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
            <input type="number" v-model="transportationForm.travelers" min="1" />
          </label>
        </template>

        <button type="submit" class="search-submit-btn">Search Trips</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue'

export default defineComponent({
  name: 'CustomerHomePageSearch',
  emits: ['search'],
  setup(_, { emit }) {
    const activeTab = ref('all')

    const tabs = [
      { id: 'all', label: 'All', icon: '🔍' },
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

    function handleSearch() {
      const filters = {
        type: activeTab.value,
        ...(activeTab.value === 'all' ? { title: tourForm.title } : {}),
        ...(activeTab.value === 'tour' ? { ...tourForm } : {}),
        ...(activeTab.value === 'accommodation' ? { ...accommodationForm } : {}),
        ...(activeTab.value === 'transportation' ? { ...transportationForm } : {}),
      }
      emit('search', filters)
    }

    return {
      tabs,
      activeTab,
      provinces,
      tourForm,
      accommodationForm,
      transportationForm,
      handleSearch,
      minDate,
      minTime
    }
  },
})
</script>

<style scoped>
.search-container {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(16, 51, 61, 0.1);
  border: 1px solid rgba(16, 51, 61, 0.05);
  transition: all 0.2s ease;
}

:global(.dark) .search-container {
  background: #1f2937;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.search-tabs {
  display: flex;
  background: #f8fbf8;
  border-bottom: 1px solid rgba(16, 51, 61, 0.08);
  transition: all 0.2s ease;
}

:global(.dark) .search-tabs {
  background: #111827;
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 14px;
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
}

:global(.dark) .tab-btn {
  color: #9ca3af;
}

.tab-btn.active {
  background: #fff;
  color: #006566;
  box-shadow: 0 -3px 0 #006566 inset;
}

:global(.dark) .tab-btn.active {
  background: #1f2937;
  color: #34d399;
  box-shadow: 0 -3px 0 #34d399 inset;
}

.search-panel {
  padding: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}

.search-form label {
  flex: 1;
  min-width: 150px;
  display: grid;
  gap: 6px;
}

.all-search-label {
  flex: 3 !important;
}

.search-form span {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5d6d68;
  font-weight: 700;
}

:global(.dark) .search-form span {
  color: #d1d5db;
}

.search-form input,
.search-form select {
  width: 100%;
  border: 1px solid rgba(16, 51, 61, 0.12);
  border-radius: 10px;
  background: #f8fbf8;
  color: #10333d;
  min-height: 44px;
  padding: 0 12px;
  font: inherit;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

:global(.dark) .search-form input,
:global(.dark) .search-form select {
  background: #374151;
  border-color: rgba(255, 255, 255, 0.2);
  color: #f3f4f6;
}

:global(.dark) .search-form input::placeholder {
  color: #9ca3af;
}

.search-form input:focus,
.search-form select:focus {
  border-color: #006566;
}

:global(.dark) .search-form input:focus,
:global(.dark) .search-form select:focus {
  border-color: #34d399;
}

.search-submit-btn {
  min-height: 44px;
  padding: 0 24px;
  border: 0;
  border-radius: 10px;
  background: #006566;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-submit-btn:hover {
  background: #004d4d;
}

:global(.dark) .search-submit-btn {
  background: #059669;
}

:global(.dark) .search-submit-btn:hover {
  background: #047857;
}

@media (max-width: 768px) {
  .search-form label {
    min-width: 100%;
  }
  .search-submit-btn {
    width: 100%;
  }
}
</style>
