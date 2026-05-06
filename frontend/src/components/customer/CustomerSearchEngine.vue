<template>
  <section id="search" class="search-engine">
    <div class="search-hero">
      <div>
        <p class="eyebrow">Search engine</p>
        <h1>Find the right Cambodia trip in minutes</h1>
        <p class="intro-copy">
          Compare destinations, duration, budget, and style in one view. The trip finder updates
          instantly as you refine your search.
        </p>
      </div>

      <div class="hero-badge">
        <strong>{{ filteredTrips.length }}</strong>
        <span>trips match your filters</span>
      </div>
    </div>

     <form class="search-panel" @submit.prevent="applySearch">
      <label>
        <span>Destination</span>
        <input v-model="form.keyword" type="search" placeholder="Phnom Penh, Siem Reap, Koh Rong" />
      </label>

      <label>
        <span>Travel style</span>
        <select v-model="form.style">
          <option value="all">All styles</option>
          <option value="heritage">Heritage</option>
          <option value="nature">Nature</option>
          <option value="beach">Beach</option>
          <option value="city">City</option>
        </select>
      </label> 

      <label>
        <span>Budget</span>
        <select v-model="form.budget">
          <option value="all">Any budget</option>
          <option value="low">Under $300</option>
          <option value="mid">$300 - $700</option>
          <option value="high">Above $700</option>
        </select>
      </label>

      <label>
        <span>Travelers</span>
        <input v-model.number="form.travelers" type="number" min="1" max="12" />
      </label>

      <label>
        <span></span>
        <input v-model="form.month" type="month" />
      </label>

      <button type="submit">Search Trips</button>
    </form>

    
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue'

type Style = 'heritage' | 'nature' | 'beach' | 'city'
type Budget = 'low' | 'mid' | 'high'

type Trip = {
  id: number
  destination: string
  title: string
  summary: string
  style: Style
  region: string
  duration: string
  price: number
  capacity: number
  gradient: string
}

const trips: Trip[] = [
  {
    id: 1,
    destination: 'Siem Reap',
    title: 'Angkor Sunrise Heritage Escape',
    summary: 'Temple dawn views with guided storytelling, private transfer, and curated dining.',
    style: 'heritage',
    region: 'Northwest',
    duration: '3 days',
    price: 420,
    capacity: 6,
    gradient: 'linear-gradient(135deg, #0d4b45, #f3c85f)',
  },
  {
    id: 2,
    destination: 'Koh Rong',
    title: 'Island Resort & Reef Day Pass',
    summary: 'Relaxed shoreline stay with snorkeling access, boat transfer, and sunset dinner.',
    style: 'beach',
    region: 'Coastal',
    duration: '4 days',
    price: 680,
    capacity: 4,
    gradient: 'linear-gradient(135deg, #115e59, #8ecae6)',
  },
  {
    id: 3,
    destination: 'Phnom Penh',
    title: 'Royal Capital City Circuit',
    summary: 'Boutique hotel, riverfront dining, and museum hopping in a compact city break.',
    style: 'city',
    region: 'Central',
    duration: '2 days',
    price: 260,
    capacity: 8,
    gradient: 'linear-gradient(135deg, #1f2937, #d4a373)',
  },
  {
    id: 4,
    destination: 'Mondulkiri',
    title: 'Waterfall and Forest Retreat',
    summary: 'Nature-focused itinerary with mountain views, slow travel, and cultural stops.',
    style: 'nature',
    region: 'East',
    duration: '5 days',
    price: 740,
    capacity: 5,
    gradient: 'linear-gradient(135deg, #2d6a4f, #d8f3dc)',
  },
]

export default defineComponent({
  name: 'CustomerSearchEngine',
  setup() {
    const form = reactive({
      keyword: '',
      style: 'all' as Style | 'all',
      budget: 'all' as Budget | 'all',
      travelers: 2,
      month: '',
    })

    const appliedQuery = ref({
      keyword: '',
      style: 'all' as Style | 'all',
      budget: 'all' as Budget | 'all',
      travelers: 2,
      month: '',
    })

    function applySearch() {
      appliedQuery.value = { ...form }
    }

    const filteredTrips = computed(() => {
      const query = appliedQuery.value
      const keyword = query.keyword.trim().toLowerCase()

      return trips.filter((trip) => {
        const matchesKeyword =
          keyword.length === 0 ||
          trip.destination.toLowerCase().includes(keyword) ||
          trip.title.toLowerCase().includes(keyword) ||
          trip.summary.toLowerCase().includes(keyword)

        const matchesStyle = query.style === 'all' || trip.style === query.style
        const matchesBudget =
          query.budget === 'all' ||
          (query.budget === 'low' && trip.price < 300) ||
          (query.budget === 'mid' && trip.price >= 300 && trip.price <= 700) ||
          (query.budget === 'high' && trip.price > 700)
        const matchesCapacity = trip.capacity >= query.travelers

        return matchesKeyword && matchesStyle && matchesBudget && matchesCapacity
      })
    })

    applySearch()

    return {
      form,
      filteredTrips,
      applySearch,
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
  font-size: clamp(2.2rem, 4vw, 4rem);
  line-height: 0.95;
  max-width: 11ch;
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

.search-panel {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr)) auto;
  gap: 14px;
  padding: 18px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(16, 51, 61, 0.08);
  box-shadow: 0 24px 50px rgba(16, 51, 61, 0.08);
}

.search-panel label {
  display: grid;
  gap: 8px;
}

.search-panel span {
  font-size: 0.76rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5d6d68;
}

.search-panel input,
.search-panel select {
  width: 100%;
  border: 1px solid rgba(16, 51, 61, 0.12);
  border-radius: 16px;
  background: #f8fbf8;
  color: #10333d;
  min-height: 48px;
  padding: 0 14px;
  font: inherit;
  box-sizing: border-box;
}

.search-panel input:focus,
.search-panel select:focus {
  outline: 2px solid rgba(17, 95, 89, 0.18);
  border-color: rgba(17, 95, 89, 0.42);
}

.search-panel button {
  align-self: end;
  min-height: 48px;
  padding: 0 18px;
  border: 0;
  border-radius: 16px;
  background: #006566;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.search-results {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.trip-card {
  overflow: hidden;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(16, 51, 61, 0.08);
  box-shadow: 0 20px 40px rgba(16, 51, 61, 0.08);
}

.trip-card__image {
  min-height: 170px;
  padding: 18px;
  display: flex;
  align-items: end;
  justify-content: flex-end;
  color: #fef9f1;
  font-weight: 700;
}

.trip-card__body {
  padding: 18px;
  display: grid;
  gap: 14px;
}

.trip-card__top {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
}

.trip-card__top p {
  margin: 0 0 6px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6a7b76;
  font-size: 0.74rem;
}

.trip-card__top h2 {
  margin: 0;
  font-size: 1.35rem;
  line-height: 1.15;
  color: #10333d;
}

.trip-card__top strong {
  font-size: 1.5rem;
  color: #0d4b45;
}

.trip-card__body > p {
  margin: 0;
  color: #48616b;
  line-height: 1.6;
}

.trip-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.trip-tags span {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(16, 51, 61, 0.06);
  color: #27424b;
  font-size: 0.85rem;
}

@media (max-width: 1200px) {
  .search-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .search-panel button {
    grid-column: 1 / -1;
    width: 100%;
  }

  .search-results {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .search-hero {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 640px) {
  .search-panel {
    grid-template-columns: 1fr;
  }
}
</style>