<template>
  <div class="service-detail-page">
    <CustomerNavbar />

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="skeleton-shell">
      <div class="two-col">
        <div class="left-col">
          <div class="skeleton-block" style="height:28px;width:40%"></div>
          <div class="skeleton-block" style="height:48px;width:80%;margin-top:16px"></div>
          <div class="skeleton-block" style="height:420px;margin-top:24px"></div>
          <div class="skeleton-block" style="height:160px;margin-top:24px"></div>
          <div class="skeleton-block" style="height:200px;margin-top:24px"></div>
        </div>
        <div class="right-col">
          <div class="skeleton-block" style="height:380px"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="fetchError" class="error-state">
      <div class="error-icon">🏜</div>
      <h2>Experience Not Found</h2>
      <p>{{ fetchError }}</p>
      <button @click="router.push({ name: 'customer-explore' })" class="btn-cta">Explore Tours</button>
    </div>

    <!-- Content -->
    <main v-else-if="service" class="detail-main">
      <!-- Category label + title + tags + destination meta (Moved outside for alignment) -->
      <section class="hero-section hero-full-width">
        <div class="category-row">
          <span class="category-label">Tour Package</span>
          <span class="meta-divider">·</span>
          <span class="duration-badge">{{ tourPackage?.num_days || 1 }} Days</span>
        </div>
        <h1 class="service-title">{{ service.title }}</h1>
        <div class="destination-meta">
          <span class="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 13 8 13s8-7.6 8-13a8 8 0 0 0-8-8z"/></svg>
            {{ tourPackage?.departure_point || 'Departure' }}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          <span class="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 13 8 13s8-7.6 8-13a8 8 0 0 0-8-8z"/></svg>
            {{ tourPackage?.destination || 'Destination' }}
          </span>
        </div>
        <div class="tags-row">
          <span v-for="tag in displayTags" :key="tag" class="tag-pill">{{ tag }}</span>
        </div>
      </section>

      <div class="two-col">
        <!-- ========== LEFT COLUMN ========== -->
        <div class="left-col">
          <!-- Photo Gallery -->
          <section class="gallery-section">
            <div class="gallery-layout">
              <div class="gallery-main">
                <img :src="currentMainImage" :alt="service.title" />
              </div>
              <div class="gallery-sidebar">
                <div 
                  v-for="(img, i) in galleryImages" 
                  :key="i" 
                  class="sidebar-thumb"
                  :class="{ active: currentMainImage === img }"
                  @click="activeImageUrl = img"
                >
                  <img :src="img" :alt="service.title + ' ' + (i + 1)" />
                </div>
              </div>
            </div>
          </section>

          <!-- The Tour Overview -->
          <section class="content-section">
            <div class="section-heading">
              <span class="accent-bar"></span>
              <h2>The Tour Overview</h2>
            </div>
            <p class="body-text">{{ service.description || 'No description available.' }}</p>
          </section>

          <!-- What's Included -->
          <section class="content-section">
            <div class="section-heading">
              <span class="accent-bar"></span>
              <h2>What's Included</h2>
            </div>
            <div class="inclusion-chips">
              <div class="inclusion-chip" :class="{ included: tourPackage?.includes_accommodation }">
                <span class="chip-icon">{{ tourPackage?.includes_accommodation ? '✓' : '✗' }}</span>
                <span>Accommodation</span>
              </div>
              <div class="inclusion-chip" :class="{ included: tourPackage?.includes_transportation }">
                <span class="chip-icon">{{ tourPackage?.includes_transportation ? '✓' : '✗' }}</span>
                <span>Transportation</span>
              </div>
              <div class="inclusion-chip" :class="{ included: tourPackage?.includes_meals }">
                <span class="chip-icon">{{ tourPackage?.includes_meals ? '✓' : '✗' }}</span>
                <span>Meals</span>
              </div>
            </div>
          </section>

          <!-- Expedition Sequence -->
          <section class="content-section">
            <div class="section-heading">
              <span class="accent-bar"></span>
              <h2>Expedition Sequence</h2>
            </div>
            <div v-if="itineraryDays.length > 0" class="timeline">
              <template v-for="(day, di) in itineraryDays" :key="day.id || di">
                <div class="timeline-day-header">
                  <span class="day-marker">Day {{ day.day_number }}</span>
                  <span class="day-title-text">{{ day.title }}</span>
                </div>
                <p v-if="day.summary" class="day-summary">{{ day.summary }}</p>
                <div v-for="(act, ai) in day.activities" :key="act.id || ai" class="timeline-item">
                  <div class="timeline-left">
                    <span class="time-label">{{ formatTime(act.time_of_day) }}</span>
                  </div>
                  <div class="timeline-connector">
                    <div class="timeline-dot"></div>
                    <div v-if="!isLastActivity(di, ai, day.activities)" class="timeline-line"></div>
                  </div>
                  <div class="timeline-content">
                    <h4 class="activity-title">{{ act.activity_title }}</h4>
                    <span v-if="act.location" class="activity-location">{{ act.location }}</span>
                    <p v-if="act.description" class="activity-desc">{{ act.description }}</p>
                  </div>
                </div>
              </template>
            </div>
            <div v-else class="empty-state-text">
              <p>No itinerary details available yet.</p>
            </div>
          </section>

          <!-- Provider Card -->
          <section class="content-section">
            <div class="section-heading">
              <span class="accent-bar"></span>
              <h2>Operated By</h2>
            </div>
            <div class="provider-card">
              <div class="provider-top">
                <div class="provider-logo">
                  <img v-if="provider?.logo" :src="provider.logo" :alt="provider?.company_name" />
                  <span v-else class="provider-logo-fallback">🏛</span>
                </div>
                <div class="provider-info">
                  <div class="provider-name-row">
                    <h3>{{ provider?.company_name || 'Tour Operator' }}</h3>
                    <span v-if="provider?.is_verified" class="verified-badge" title="Verified Provider">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                      Verified
                    </span>
                  </div>
                  <p class="provider-desc">{{ provider?.description || 'Professional tour operator in Cambodia.' }}</p>
                </div>
              </div>
              <div v-if="provider?.facebook_url || provider?.telegram_url" class="provider-links">
                <a v-if="provider?.facebook_url" :href="provider.facebook_url" target="_blank" class="provider-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  Facebook
                </a>
                <a v-if="provider?.telegram_url" :href="provider.telegram_url" target="_blank" class="provider-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.67l-2.967-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.943.916z"/></svg>
                  Telegram
                </a>
              </div>
            </div>
          </section>
        </div>

        <!-- ========== RIGHT BOOKING PANEL ========== -->
        <div class="right-col">
          <div class="booking-panel">
            <div class="booking-price">
              <span class="price-value">${{ pricePerUnit }}</span>
              <span class="price-unit">/ person</span>
            </div>

            <div class="booking-field">
              <label class="field-label">Travel Date</label>
              <div class="field-readonly">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>{{ formatDate(tourPackage?.travel_date) }}</span>
              </div>
            </div>

            <div class="booking-field">
              <label class="field-label">Departure Point</label>
              <div class="field-readonly">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 13 8 13s8-7.6 8-13a8 8 0 0 0-8-8z"/></svg>
                <span>{{ tourPackage?.departure_point || 'N/A' }}</span>
              </div>
            </div>

            <div class="booking-field">
              <label class="field-label">Guests</label>
              <div class="stepper">
                <button @click="guests = Math.max(1, guests - 1)" class="stepper-btn" :disabled="guests <= 1">−</button>
                <span class="stepper-value">{{ guests }}</span>
                <button @click="guests = Math.min(maxGuests, guests + 1)" class="stepper-btn" :disabled="guests >= maxGuests">+</button>
              </div>
            </div>

            <div class="price-breakdown">
              <div class="breakdown-row">
                <span>${{ pricePerUnit }} × {{ guests }} guest{{ guests > 1 ? 's' : '' }}</span>
                <span>${{ (pricePerUnit * guests).toFixed(2) }}</span>
              </div>
            </div>

            <div class="total-row">
              <span>Total</span>
              <span>${{ (pricePerUnit * guests).toFixed(2) }}</span>
            </div>

            <button @click="handleBooking" class="btn-cta-full">
              Request Reservation
            </button>
          </div>
        </div>
      </div>
    </main>

    <CustomerFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiGet } from '../../utils/api'
import { hasAuthSession } from '../../utils/auth'
import CustomerNavbar from '../../components/customer/CustomerNavbar.vue'
import CustomerFooter from '../../components/customer/CustomerFooter.vue'

const router = useRouter()
const route = useRoute()

interface ItineraryActivity {
  id: string
  day_id?: string
  sort_order?: number
  time_of_day: string
  activity_title: string
  description?: string
  location?: string
  image_url?: string
}

interface ItineraryDay {
  id: string
  service_id?: string
  day_number: number
  title: string
  summary?: string
  activities: ItineraryActivity[]
}

interface TourPackage {
  service_id: string
  num_days: number
  max_people: number
  base_price: number
  travel_date: string
  end_date: string
  departure_point: string
  destination: string
  includes_accommodation: boolean
  includes_transportation: boolean
  includes_meals: boolean
}

interface Provider {
  id: string
  company_name: string
  logo?: string
  description?: string
  is_verified: boolean
  facebook_url?: string
  telegram_url?: string
}

interface ServiceImage {
  id: string
  image_url: string
  is_cover: boolean
  sort_order: number
}

interface Service {
  id: string
  title: string
  description: string
  serviceType: string
  isActive: boolean
  price: number
  location: string
  coverImage?: string
  images: ServiceImage[]
  provider: Provider
  tourPackage: TourPackage
  inventory?: { total_capacity: number; booked_count: number }
}

const service = ref<Service | null>(null)
const isLoading = ref(true)
const fetchError = ref('')
const guests = ref(1)
const activeImageUrl = ref<string | null>(null)

const tourPackage = computed(() => service.value?.tourPackage)
const provider = computed(() => service.value?.provider)
const maxGuests = computed(() => tourPackage.value?.max_people || 10)
const pricePerUnit = computed(() => tourPackage.value?.base_price || service.value?.price || 0)

const itineraryDays = computed<ItineraryDay[]>(() => {
  const days = (service.value?.tourPackage as any)?.itineraryDays
  return Array.isArray(days) ? days : []
})

const displayTags = computed(() => {
  const tags: string[] = []
  const tp = tourPackage.value
  if (tp) {
    tags.push(`${tp.num_days || 1} Days`)
    if (tp.departure_point) tags.push(tp.departure_point)
    if (tp.destination) tags.push(tp.destination)
    if (tp.includes_accommodation) tags.push('Accommodation')
    if (tp.includes_transportation) tags.push('Transport')
    if (tp.includes_meals) tags.push('Meals Included')
  }
  return tags
})

const galleryImages = computed(() => {
  if (!service.value) return []
  const imgs = service.value.images || []
  
  const sorted = [...imgs].sort((a, b) => {
    if (a.is_cover) return -1
    if (b.is_cover) return 1
    return (a.sort_order || 0) - (b.sort_order || 0)
  })

  const results = sorted.map(i => i.image_url)
  
  while (results.length < 4) {
    results.push(`https://placehold.co/800x600/006566/ffffff?text=Tour+Photo+${results.length + 1}`)
  }
  
  return results
})

const currentMainImage = computed(() => activeImageUrl.value || galleryImages.value[0])

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatTime(timeStr?: string): string {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

function isLastActivity(_dayIdx: number, actIdx: number, activities: ItineraryActivity[]): boolean {
  return actIdx === activities.length - 1
}

const fetchService = async () => {
  isLoading.value = true
  fetchError.value = ''
  try {
    const id = route.params.id as string
    const data = await apiGet<any>(`/services/${id}`)
    if (data.serviceType !== 'tour') {
      fetchError.value = 'This service is not a tour package.'
      return
    }
    service.value = data as Service
  } catch (e: any) {
    fetchError.value = e?.message || 'Failed to load tour details.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchService)

const handleBooking = () => {
  if (!hasAuthSession()) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  router.push({ name: 'booking-form', params: { id: service.value?.id } })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');

.service-detail-page {
  --primary: #006566;
  --primary-container: #117f81;
  --secondary: #855300;
  --secondary-container: #fea619;
  --on-secondary-container: #684000;
  --surface: #f8f9fa;
  --surface-container-low: #f3f4f5;
  --surface-container-lowest: #ffffff;
  --surface-container-high: #e7e8e9;
  --on-surface: #191c1d;
  --on-surface-variant: #3e4949;
  --outline-variant: #bdc9c8;
  --primary-fixed: #97f2f3;
  background: var(--surface);
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: var(--on-surface);
}

h1, h2, h3, h4 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  margin: 0;
}

/* ── Skeleton ── */
.skeleton-shell { padding: 2rem 1.75rem; max-width: 1200px; margin: 0 auto; }
.skeleton-block {
  background: var(--surface-container-high);
  border-radius: 12px;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ── Error ── */
.error-state { text-align: center; padding: 6rem 2rem; }
.error-icon { font-size: 3.5rem; margin-bottom: 1rem; }
.error-state h2 { font-size: 1.5rem; color: var(--on-surface); margin-bottom: 0.5rem; }
.error-state p { color: var(--on-surface-variant); margin-bottom: 1.5rem; }

/* ── Main Layout ── */
.detail-main { padding: 1.75rem; max-width: 1200px; margin: 0 auto; }
.two-col { display: grid; grid-template-columns: 1.5fr 360px; gap: 1.75rem; }

@media (max-width: 1024px) {
  .two-col { grid-template-columns: 1fr; }
}

/* ── Left Column ── */
.left-col { display: flex; flex-direction: column; gap: 1.75rem; }

/* ── Right Column ── */
.right-col { position: relative; height: 100%; }

/* ── Hero Section ── */
.hero-section { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 2rem; }
.hero-full-width { grid-column: 1 / -1; }
.category-row { display: flex; align-items: center; gap: 0.5rem; }
.category-label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--primary);
  background: rgba(0, 101, 102, 0.08);
  padding: 4px 12px;
  border-radius: 999px;
}
.meta-divider { color: var(--outline-variant); }
.duration-badge { font-size: 0.8rem; font-weight: 500; color: var(--on-surface-variant); }
.service-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--on-surface);
  line-height: 1.2;
  letter-spacing: -0.02em;
}
.destination-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--on-surface-variant);
  font-size: 0.9rem;
}
.meta-item { display: flex; align-items: center; gap: 0.3rem; }
.tags-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.25rem; }
.tag-pill {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--primary);
  background: rgba(0, 101, 102, 0.08);
  padding: 4px 12px;
  border-radius: 999px;
}

/* ── Gallery ── */
.gallery-layout { 
  display: flex;
  flex-direction: column;
  gap: 0.75rem; 
}
.gallery-main { 
  height: 480px;
  border-radius: 12px; 
  overflow: hidden; 
  background: var(--surface-container-high);
}
.gallery-main img { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
  display: block;
  transition: opacity 0.3s ease;
}
.gallery-sidebar { 
  display: flex; 
  flex-direction: row; 
  gap: 0.5rem; 
  overflow-x: auto;
  padding-bottom: 4px;
}
/* Custom scrollbar for sidebar */
.gallery-sidebar::-webkit-scrollbar { height: 4px; }
.gallery-sidebar::-webkit-scrollbar-track { background: transparent; }
.gallery-sidebar::-webkit-scrollbar-thumb { background: var(--outline-variant); border-radius: 10px; }

.sidebar-thumb { 
  width: 80px;
  height: 60px;
  border-radius: 8px; 
  overflow: hidden; 
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  flex-shrink: 0;
  background: var(--surface-container-high);
}
.sidebar-thumb:hover { opacity: 0.8; }
.sidebar-thumb.active { 
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(0, 101, 102, 0.2);
}
.sidebar-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

@media (max-width: 640px) {
  .gallery-main { height: 300px; }
  .sidebar-thumb { width: 70px; height: 52px; }
}

/* ── Content Sections ── */
.content-section { background: var(--surface-container-lowest); border-radius: 12px; padding: 0.9rem; }
.section-heading { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem; }
.accent-bar { display: inline-block; width: 2px; height: 20px; background: var(--primary); border-radius: 1px; flex-shrink: 0; }
.section-heading h2 { font-size: 1.1rem; font-weight: 700; color: var(--on-surface); }
.body-text { color: var(--on-surface-variant); line-height: 1.7; font-size: 0.95rem; font-weight: 400; }

/* ── Inclusion Chips ── */
.inclusion-chips { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.inclusion-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
  background: var(--surface-container-low);
  color: var(--on-surface-variant);
}
.inclusion-chip.included { background: rgba(0, 101, 102, 0.08); color: var(--primary); }
.chip-icon { font-weight: 700; font-size: 0.8rem; }

/* ── Timeline ── */
.timeline { position: relative; padding-left: 0; }
.timeline-day-header { display: flex; align-items: center; gap: 0.75rem; margin: 1.25rem 0 0.5rem; }
.day-marker {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700; font-size: 0.75rem;
  color: var(--primary); background: rgba(0, 101, 102, 0.08);
  padding: 3px 10px; border-radius: 999px;
}
.day-title-text { font-weight: 600; color: var(--on-surface); font-size: 0.95rem; font-family: 'Plus Jakarta Sans', sans-serif; }
.day-summary { color: var(--on-surface-variant); font-size: 0.85rem; margin: 0 0 0.75rem; padding-left: 0.25rem; }
.timeline-item { display: grid; grid-template-columns: 60px 24px 1fr; gap: 0.5rem; margin-bottom: 0.25rem; }
.timeline-left { text-align: right; }
.time-label { font-size: 0.7rem; font-weight: 600; color: var(--on-surface-variant); text-transform: uppercase; white-space: nowrap; }
.timeline-connector { display: flex; flex-direction: column; align-items: center; }
.timeline-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--primary); flex-shrink: 0;
}
.timeline-line {
  width: 2px; flex: 1; min-height: 24px;
  background: linear-gradient(to bottom, #006566, #fea619, #006566);
  opacity: 0.3;
}
.timeline-content { padding-bottom: 0.75rem; }
.activity-title { font-size: 0.9rem; font-weight: 600; color: var(--on-surface); margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
.activity-location { font-size: 0.75rem; color: var(--primary); font-weight: 500; display: inline-block; margin-top: 2px; }
.activity-desc { font-size: 0.82rem; color: var(--on-surface-variant); margin-top: 4px; line-height: 1.5; }

.empty-state-text { color: var(--on-surface-variant); font-size: 0.9rem; padding: 1rem 0; }

/* ── Provider Card ── */
.provider-card {
  background: var(--surface-container-low);
  border-radius: 12px;
  padding: 1rem;
}
.provider-top { display: flex; gap: 0.9rem; }
.provider-logo {
  width: 48px; height: 48px; border-radius: 12px;
  background: var(--surface-container-lowest);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; flex-shrink: 0;
}
.provider-logo img { width: 100%; height: 100%; object-fit: cover; }
.provider-logo-fallback { font-size: 1.5rem; }
.provider-info { flex: 1; }
.provider-name-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; }
.provider-name-row h3 { font-size: 0.95rem; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; }
.verified-badge {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 0.65rem; font-weight: 600; color: var(--primary);
  background: rgba(0, 101, 102, 0.08); padding: 2px 8px; border-radius: 999px;
}
.provider-desc { font-size: 0.82rem; color: var(--on-surface-variant); line-height: 1.5; }
.provider-links { display: flex; gap: 0.75rem; margin-top: 0.75rem; }
.provider-link {
  display: inline-flex; align-items: center; gap: 0.35rem;
  font-size: 0.8rem; font-weight: 500; color: var(--primary);
  text-decoration: none; transition: opacity 0.2s;
}
.provider-link:hover { opacity: 0.7; }

/* ── Booking Panel ── */
.right-col { position: relative; height: 100%; }
.booking-panel {
  background: var(--surface-container-lowest);
  border-radius: 12px;
  padding: 1.5rem;
  position: sticky;
  top: 5rem;
  height: 552px; /* Matches gallery height (480 + 12 gap + 60 thumbs) */
  box-shadow: 0 0 24px -4px rgba(25, 28, 29, 0.06);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  z-index: 10;
}
.booking-price { display: flex; align-items: baseline; gap: 0.3rem; }
.price-value { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 2rem; font-weight: 800; color: var(--on-surface); }
.price-unit { font-size: 0.9rem; color: var(--on-surface-variant); font-weight: 400; }
.booking-field { display: flex; flex-direction: column; gap: 0.4rem; }
.field-label { font-size: 0.75rem; font-weight: 600; color: var(--on-surface-variant); text-transform: uppercase; letter-spacing: 0.05em; }
.field-readonly {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 10px 14px; background: var(--surface-container-low);
  border-radius: 6px; font-size: 0.9rem; color: var(--on-surface);
}
.stepper {
  display: flex; align-items: center; gap: 0;
  background: var(--surface-container-low); border-radius: 6px;
  overflow: hidden; width: fit-content;
}
.stepper-btn {
  width: 38px; height: 36px; border: none; background: transparent;
  font-size: 1.1rem; font-weight: 600; color: var(--on-surface);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.stepper-btn:hover:not(:disabled) { background: var(--surface-container-high); }
.stepper-btn:disabled { color: var(--outline-variant); cursor: not-allowed; }
.stepper-value {
  min-width: 40px; text-align: center;
  font-weight: 600; font-size: 0.95rem;
}
.price-breakdown { border-top: 1px solid rgba(189, 201, 200, 0.2); padding-top: 0.75rem; }
.breakdown-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--on-surface-variant); }
.total-row {
  display: flex; justify-content: space-between;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700; font-size: 1.1rem;
  padding-top: 0.75rem; border-top: 1px solid rgba(189, 201, 200, 0.2);
}
.btn-cta {
  padding: 10px 24px; border-radius: 6px; font-weight: 600; font-size: 0.9rem;
  border: none; cursor: pointer; color: #fff;
  background: linear-gradient(135deg, #006566, #117f81);
  transition: opacity 0.2s;
}
.btn-cta-full {
  width: 100%; padding: 12px; border-radius: 6px; font-weight: 700; font-size: 0.95rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
  border: none; cursor: pointer; color: #fff;
  background: linear-gradient(135deg, #006566, #117f81);
  transition: opacity 0.2s;
}
.btn-cta-full:hover, .btn-cta:hover { opacity: 0.9; }
</style>
