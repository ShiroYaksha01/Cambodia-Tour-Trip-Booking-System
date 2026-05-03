<template>
  <main class="customer-page">
    <div class="customer-frame">
      <CustomerNavbar />

      <section class="search-header">
        <div>
          <p class="eyebrow">Searched Page</p>
          <h1>Discover curated Cambodia trips with a focused search view.</h1>
        </div>
      </section>

      <CustomerSearchEngine />

      <section class="search-bar" aria-label="Search filters">
        <label>
          <span>From</span>
          <select v-model="fromProvince" class="field-chip field-select">
            <option v-for="province in provinces" :key="province" :value="province">
              {{ province }}
            </option>
          </select>
        </label>
        <label>
          <span>To</span>
          <select v-model="toProvince" class="field-chip field-select">
            <option v-for="province in provinces" :key="province" :value="province">
              {{ province }}
            </option>
          </select>
        </label>
        <label>
          <span>Date</span>
          <div style="display:flex;gap:8px;">
            <select v-model="selectedMonth" class="field-chip field-select">
              <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>

            <select v-model="selectedDay" class="field-chip field-select">
              <option v-for="d in daysInMonth" :key="d" :value="d">{{ d }}</option>
            </select>

            <select v-model="selectedYear" class="field-chip field-select">
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </label>
        <label>
          <span>Travelers</span>
          <select v-model="selectedTravelers" class="field-chip field-select">
            <option v-for="traveler in travelerOptions" :key="traveler" :value="traveler">
              {{ traveler }}
            </option>
          </select>
        </label>
        <button type="button" class="search-button" @click="applySearch">Update Search</button>
      </section>

      <section class="results-layout">
        <div class="results-column">
          <div class="section-heading">
            <div>
              <h2>Available Curations</h2>
              <span>({{ filteredTrips.length }} results)</span>
            </div>
            <div class="view-toggle" aria-label="Results view toggle">
              <button type="button" class="view-toggle__active">▦</button>
              <button type="button">☰</button>
            </div>
          </div>

          <article
            v-for="trip in filteredTrips"
            :key="trip.title"
            class="trip-card"
            :class="{ 'trip-card--featured': trip.featured }"
          >
            <div class="trip-image" :style="{ backgroundImage: trip.image }">
              <span v-if="trip.badge" class="trip-badge">{{ trip.badge }}</span>
            </div>

            <div class="trip-content">
              <div class="trip-topline">
                <span class="trip-provider">{{ trip.provider }}</span>
                <span class="trip-rating">★ {{ trip.rating }}</span>
              </div>

              <h3>{{ trip.title }}</h3>

              <div class="trip-meta">
                <span>{{ trip.operator }}</span>
                <span>{{ trip.duration }}</span>
              </div>

              <div class="trip-footer">
                <strong>${{ trip.price }}</strong>
                <div class="trip-actions">
                  <a href="#details">Details</a>
                  <button type="button">Book Now</button>
                </div>
              </div>
            </div>
          </article>

          <article v-if="filteredTrips.length === 0" class="empty-results">
            <h3>No trips match this route</h3>
            <p>Try a different province pair to see matching Cambodia trip options.</p>
          </article>
        </div>

        <aside class="details-column" id="details">
          <article class="detail-card">
            <div class="detail-hero">
              <div class="detail-hero__image">
                <span class="trip-badge trip-badge--gold">Premium Choice</span>
                <div>
                  <h3>{{ activeTrip.title }}</h3>
                </div>
              </div>
            </div>

            <div class="stats-grid">
              <article>
                <span>SEATS</span>
                <strong>{{ activeTrip.seats }}</strong>
              </article>
              <article>
                <span>DURATION</span>
                <strong>{{ activeTrip.duration }}</strong>
              </article>
              <article>
                <span>RATING</span>
                <strong>{{ activeTrip.detailRating }}</strong>
              </article>
            </div>

            <section class="itinerary">
              <div class="section-label">Itinerary Breakdown</div>
              <div class="timeline-item">
                <span class="timeline-dot"></span>
                <div>
                  <strong>{{ activeTrip.departureTime }} - Depart</strong>
                  <p>{{ activeTrip.departureNote }}</p>
                </div>
              </div>
              <div class="timeline-item">
                <span class="timeline-dot"></span>
                <div>
                  <strong>{{ activeTrip.midpointTime }} - Heritage Stop</strong>
                  <p>{{ activeTrip.midpointNote }}</p>
                </div>
              </div>
              <div class="timeline-item">
                <span class="timeline-dot"></span>
                <div>
                  <strong>{{ activeTrip.arrivalTime }} - Arrival</strong>
                  <p>{{ activeTrip.arrivalNote }}</p>
                </div>
              </div>
            </section>

            <section class="inclusions">
              <div class="section-label">Service Inclusions</div>
              <div class="inclusion-grid">
                <span>Free Starlink Wi-Fi</span>
                <span>Premium Snacks</span>
                <span>Extra Legroom</span>
                <span>Concierge Assistance</span>
              </div>
            </section>

            <section class="pricing-box">
              <div class="pricing-row">
                <span>Base Fare (2 travelers)</span>
                <strong>${{ activeTrip.baseFare }}</strong>
              </div>
              <div class="pricing-row">
                <span>Tourism Heritage Tax (5%)</span>
                <strong>${{ activeTrip.tax }}</strong>
              </div>
              <div class="pricing-row">
                <span>Booking Fee</span>
                <strong class="waived">WAIVED</strong>
              </div>

              <div class="total-row">
                <span>Total Amount</span>
                <strong>${{ activeTrip.total }}</strong>
              </div>
            </section>

            <button type="button" class="confirm-button">Confirm & Book Now →</button>
          </article>
        </aside>
      </section>

      <footer class="customer-footer">
        <div>
          <strong>Anajak Tour</strong>
          <p>© 2024 Anajak Tour. A Digital Concierge Experience.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#">About Us</a>
          <a href="#">Sustainability</a>
          <a href="#">Khmer Heritage</a>
          <a href="#">Terms of Service</a>
        </nav>
      </footer>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CustomerNavbar from '../../components/customer/CustomerNavbar.vue'
import CustomerSearchEngine from '../../components/customer/CustomerSearchEngine.vue'

const provinces = [
  'Banteay Meanchey',
  'Battambang',
  'Kampong Cham',
  'Kampong Chhnang',
  'Kampong Speu',
  'Kampong Thom',
  'Kampot',
  'Kandal',
  'Kep',
  'Koh Kong',
  'Kratie',
  'Mondulkiri',
  'Oddar Meanchey',
  'Pailin',
  'Phnom Penh',
  'Preah Sihanouk',
  'Preah Vihear',
  'Pursat',
  'Ratanakiri',
  'Siem Reap',
  'Stung Treng',
  'Svay Rieng',
  'Takeo',
  'Tboung Khmum',
  'Prey Veng',
]

const fromProvince = ref('Phnom Penh')
const toProvince = ref('Siem Reap')
const travelerOptions = ['1 Person', '2 People', '3 People', '4 People', '5 People', '6 People']

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1 // 1-12
const currentDay = now.getDate()

const months = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
]

const years = [currentYear, currentYear + 1, currentYear + 2]

const selectedMonth = ref(currentMonth)
const selectedDay = ref(currentDay)
const selectedYear = ref(currentYear)

const selectedTravelers = ref(travelerOptions[1])

const daysInMonth = computed(() => {
  const days = new Date(selectedYear.value, selectedMonth.value, 0).getDate()
  return Array.from({ length: days }, (_, i) => i + 1)
})
const appliedFromProvince = ref(fromProvince.value)
const appliedToProvince = ref(toProvince.value)

const trips = [
  {
    title: 'The Royal Khmer Expedition: PP to SR',
    from: 'Phnom Penh',
    to: 'Siem Reap',
    provider: 'Luxury Private Coach',
    operator: 'Royal Majestic Tours',
    duration: '08:00 AM · 5.5h',
    detailRating: '4.9',
    seats: '04 Left',
    departureTime: '08:00 AM',
    departureNote: 'Luxury lounge pickup at Riverside Phnom Penh and luggage concierge service.',
    midpointTime: '10:30 AM',
    midpointNote: 'Refreshments at Siem Village and traditional coffee stop.',
    arrivalTime: '01:30 PM',
    arrivalNote: 'Direct drop-off with a short orientation in Siem Reap Central.',
    price: 450,
    baseFare: '840.00',
    tax: '42.00',
    total: '882.00',
    rating: '4.9 (124)',
    featured: true,
    badge: 'FEATURED',
    image: 'linear-gradient(135deg, rgba(55, 88, 42, 0.95), rgba(18, 64, 77, 0.55)), radial-gradient(circle at 20% 25%, rgba(255,255,255,0.5), transparent 28%), linear-gradient(135deg, #688c3f, #243f2f)',
  },
  {
    title: 'Heritage Path: Scenic River Route',
    from: 'Kampong Cham',
    to: 'Phnom Penh',
    provider: 'Boutique Shuttle',
    operator: 'Mekong Link',
    duration: '09:30 AM · 6h',
    detailRating: '4.7',
    seats: '10 Left',
    departureTime: '09:30 AM',
    departureNote: 'Pickup near the Mekong riverside and curated boarding assistance.',
    midpointTime: '11:10 AM',
    midpointNote: 'Scenic river pause and local fruit tasting stop.',
    arrivalTime: '03:15 PM',
    arrivalNote: 'Arrival at Phnom Penh central transfer point.',
    price: 280,
    baseFare: '520.00',
    tax: '26.00',
    total: '546.00',
    rating: '4.7 (89)',
    featured: false,
    badge: '',
    image: 'linear-gradient(135deg, rgba(57, 33, 22, 0.9), rgba(189, 98, 35, 0.35)), radial-gradient(circle at 70% 40%, rgba(255,255,255,0.22), transparent 25%), linear-gradient(135deg, #8f5a2f, #3c2419)',
  },
  {
    title: 'Executive Flight: Express Corridor',
    from: 'Phnom Penh',
    to: 'Sihanoukville',
    provider: 'Cultural Air Link',
    operator: 'Angkor Air',
    duration: '10:15 AM · 45m',
    detailRating: '5.0',
    seats: '08 Left',
    departureTime: '10:15 AM',
    departureNote: 'Airport lounge check-in with priority boarding support.',
    midpointTime: '10:40 AM',
    midpointNote: 'In-flight refreshments and scenic coastal approach.',
    arrivalTime: '11:00 AM',
    arrivalNote: 'Direct arrival at Sihanoukville transfer gate.',
    price: 820,
    baseFare: '1,580.00',
    tax: '79.00',
    total: '1,659.00',
    rating: '5.0 (142)',
    featured: false,
    badge: '',
    image: 'linear-gradient(135deg, rgba(13, 29, 41, 0.92), rgba(241, 187, 85, 0.38)), radial-gradient(circle at 35% 30%, rgba(255,255,255,0.3), transparent 22%), linear-gradient(135deg, #0c2538, #5d6f2e)',
  },
]

const filteredTrips = computed(() =>
  trips.filter((trip) => trip.from === appliedFromProvince.value && trip.to === appliedToProvince.value),
)

const activeTrip = computed(() => filteredTrips.value[0] ?? trips[0])

function applySearch() {
  appliedFromProvince.value = fromProvince.value
  appliedToProvince.value = toProvince.value
}
</script>

<style scoped>
.customer-page {
  min-height: 100vh;
  background: #151515;
  padding: 14px;
  box-sizing: border-box;
}

.customer-frame {
  min-height: calc(100vh - 28px);
  background: linear-gradient(180deg, #f7f8f6 0%, #eff2ef 100%);
  border-radius: 2px;
  padding: 14px 14px 18px;
  display: grid;
  gap: 14px;
}

.search-header {
  padding: 0 4px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #1d3a43;
  font-size: 0.82rem;
  font-weight: 700;
}

h1 {
  margin: 0;
  color: #21363d;
  font-size: clamp(1.1rem, 2vw, 1.45rem);
  font-weight: 700;
}

.search-bar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)) 170px;
  gap: 10px;
  padding: 14px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(16, 31, 31, 0.08);
}

.search-bar label {
  display: grid;
  gap: 8px;
}

.search-bar span {
  color: #879492;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.field-chip {
  min-height: 36px;
  display: flex;
  align-items: center;
  border: 1px solid #e4e7e4;
  border-radius: 3px;
  padding: 0 12px;
  background: #fff;
  color: #2f4748;
  font-size: 0.84rem;
}

.field-select {
  width: 100%;
  appearance: none;
  padding-right: 32px;
  cursor: pointer;
}

.field-select:focus {
  outline: 2px solid rgba(14, 111, 113, 0.18);
  outline-offset: 2px;
}

.search-button {
  align-self: end;
  min-height: 36px;
  border: 0;
  border-radius: 3px;
  background: #0e6f71;
  color: #fff;
  font: inherit;
  font-weight: 700;
}

.results-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) 400px;
  gap: 16px;
  align-items: start;
}

.results-column {
  display: grid;
  gap: 12px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 2px 0;
}

.section-heading h2 {
  margin: 0;
  color: #2d3b3b;
  font-size: 1.1rem;
  font-weight: 700;
}

.section-heading span {
  color: #6e7c79;
  font-size: 0.78rem;
}

.view-toggle {
  display: inline-flex;
  gap: 6px;
}

.view-toggle button {
  width: 24px;
  height: 24px;
  border: 1px solid #dce1de;
  background: #fff;
  color: #6b7a78;
  border-radius: 3px;
}

.view-toggle__active {
  background: #0d7576 !important;
  color: #fff !important;
  border-color: #0d7576 !important;
}

.trip-card {
  display: grid;
  grid-template-columns: 170px minmax(0, 1fr);
  gap: 12px;
  padding: 10px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e8ebe8;
  box-shadow: 0 10px 22px rgba(16, 31, 31, 0.08);
}

.empty-results {
  padding: 16px;
  border: 1px dashed #cfd6d2;
  border-radius: 4px;
  background: #fff;
}

.empty-results h3 {
  margin: 0 0 6px;
  color: #1e2f30;
}

.empty-results p {
  margin: 0;
  color: #6b7a78;
  font-size: 0.82rem;
}

.trip-card--featured {
  border-color: #0e6f71;
  box-shadow: 0 10px 22px rgba(14, 111, 113, 0.18);
}

.trip-image {
  min-height: 150px;
  border-radius: 2px;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
}

.trip-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 8px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.86);
  color: #0f5c5f;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.trip-badge--gold {
  background: rgba(216, 173, 60, 0.94);
  color: #fff8e8;
}

.trip-content {
  display: grid;
  gap: 10px;
  padding-right: 2px;
}

.trip-topline,
.trip-meta,
.trip-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.trip-provider {
  color: #0f7576;
  font-size: 0.7rem;
  font-weight: 700;
}

.trip-rating {
  color: #de8b2f;
  font-size: 0.72rem;
  font-weight: 700;
}

.trip-content h3 {
  margin: 0;
  color: #18282a;
  font-size: 0.98rem;
  line-height: 1.25;
}

.trip-meta {
  justify-content: flex-start;
  gap: 14px;
  color: #7c8885;
  font-size: 0.74rem;
}

.trip-footer strong {
  color: #1c2224;
  font-size: 1.35rem;
}

.trip-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trip-actions a,
.trip-actions button {
  min-height: 30px;
  padding: 0 14px;
  border-radius: 2px;
  font: inherit;
  font-size: 0.75rem;
}

.trip-actions a {
  display: inline-grid;
  place-items: center;
  color: #0e6f71;
  text-decoration: none;
}

.trip-actions button {
  border: 1px solid #e3e8e5;
  background: #fff;
  color: #1d2324;
}

.detail-card {
  padding: 0 0 16px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e7ebe8;
  box-shadow: 0 14px 28px rgba(16, 31, 31, 0.08);
  overflow: hidden;
}

.detail-hero__image {
  min-height: 218px;
  padding: 16px;
  display: flex;
  align-items: end;
  background:
    linear-gradient(135deg, rgba(43, 83, 31, 0.92), rgba(15, 70, 78, 0.45)),
    radial-gradient(circle at 25% 20%, rgba(255, 255, 255, 0.42), transparent 28%),
    linear-gradient(135deg, #6d8f48, #233b2d);
  color: #fff;
}

.detail-hero h3 {
  margin: 0;
  max-width: 14ch;
  font-size: 1.45rem;
  line-height: 1.05;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 12px 14px 8px;
}

.stats-grid article {
  padding: 10px 12px;
  background: #f5f7f6;
  border-radius: 2px;
  text-align: center;
}

.stats-grid span,
.section-label {
  color: #6f7c79;
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.stats-grid strong {
  display: block;
  margin-top: 6px;
  color: #163739;
  font-size: 1rem;
}

.itinerary,
.inclusions,
.pricing-box {
  padding: 10px 14px 0;
}

.section-label {
  margin-bottom: 10px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  margin-top: 5px;
  border-radius: 999px;
  background: #0e6f71;
}

.timeline-item strong {
  display: block;
  color: #1e2f30;
  font-size: 0.78rem;
}

.timeline-item p {
  margin: 4px 0 0;
  color: #6b7a78;
  font-size: 0.72rem;
  line-height: 1.5;
}

.inclusion-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.inclusion-grid span {
  padding: 8px 10px;
  border-radius: 2px;
  background: #f5f7f6;
  color: #2c4444;
  font-size: 0.74rem;
}

.pricing-box {
  display: grid;
  gap: 8px;
  margin-top: 4px;
}

.pricing-row,
.total-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  font-size: 0.76rem;
}

.pricing-row {
  color: #5f6c69;
}

.pricing-row strong {
  color: #3f4849;
  font-weight: 700;
}

.waived {
  color: #0e7a72 !important;
}

.total-row {
  padding-top: 8px;
  margin-top: 4px;
  border-top: 1px solid #eef0ef;
}

.total-row span {
  color: #1d2e2f;
  font-weight: 700;
  text-transform: uppercase;
}

.total-row strong {
  color: #0e6f71;
  font-size: 1.3rem;
}

.confirm-button {
  width: calc(100% - 28px);
  margin: 14px 14px 0;
  min-height: 40px;
  border: 0;
  border-radius: 3px;
  background: linear-gradient(135deg, #0e6f71, #0d5d60);
  color: #fff;
  font: inherit;
  font-weight: 700;
}

.customer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-top: 4px;
  padding: 18px 6px 6px;
  border-top: 1px solid rgba(35, 52, 54, 0.08);
  color: #60716f;
}

.customer-footer strong {
  display: block;
  color: #263c40;
  font-size: 0.84rem;
}

.customer-footer p {
  margin: 6px 0 0;
  font-size: 0.72rem;
}

.customer-footer nav {
  display: flex;
  align-items: center;
  gap: 26px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.customer-footer a {
  color: #6d7d7b;
  font-size: 0.74rem;
  text-decoration: none;
}

@media (max-width: 1240px) {
  .search-bar,
  .results-layout {
    grid-template-columns: 1fr;
  }

  .trip-card {
    grid-template-columns: 150px minmax(0, 1fr);
  }

  .confirm-button {
    width: calc(100% - 24px);
  }
}

@media (max-width: 900px) {
  .customer-page {
    padding: 8px;
  }

  .customer-frame {
    padding: 12px;
  }

  .trip-card,
  .customer-footer,
  .trip-footer,
  .section-heading {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid,
  .inclusion-grid {
    grid-template-columns: 1fr;
  }

  .customer-footer nav {
    justify-content: flex-start;
  }
}
</style>
