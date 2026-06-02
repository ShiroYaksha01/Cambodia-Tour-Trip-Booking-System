<template>
  <div class="service-detail-page">
    <CustomerNavbar />

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="skeleton-shell">
      <div class="two-col">
        <div class="left-col">
          <div class="skeleton-block" style="height:28px;width:30%"></div>
          <div class="skeleton-block" style="height:48px;width:70%;margin-top:16px"></div>
          <div class="skeleton-block" style="height:420px;margin-top:24px"></div>
          <div class="skeleton-block" style="height:160px;margin-top:24px"></div>
          <div class="skeleton-block" style="height:140px;margin-top:24px"></div>
        </div>
        <div class="right-col">
          <div class="skeleton-block" style="height:400px"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="fetchError" class="error-state">
      <div class="error-icon">🏨</div>
      <h2>Property Not Found</h2>
      <p>{{ fetchError }}</p>
      <button @click="router.push({ name: 'customer-explore' })" class="btn-cta">Explore Hotels</button>
    </div>

    <!-- Content -->
    <main v-else-if="service" class="detail-main">
      <!-- Category label + hotel name + star rating + address + tags (Moved outside for alignment) -->
      <section class="hero-section hero-full-width">
        <div class="category-row">
          <span class="category-label">Accommodation</span>
          <span class="meta-divider">·</span>
          <div class="stars-row">
            <span v-for="s in 5" :key="s" class="star" :class="{ filled: s <= (accommodation?.star_rating || 0) }">★</span>
          </div>
        </div>
        <h1 class="service-title">{{ accommodation?.hotel_name || service.title }}</h1>
        <div class="address-meta">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 13 8 13s8-7.6 8-13a8 8 0 0 0-8-8z"/></svg>
          <span>{{ accommodation?.address || service.location || 'Address not specified' }}</span>
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
                <img :src="currentMainImage" :alt="accommodation?.hotel_name || service.title" />
              </div>
              <div class="gallery-sidebar">
                <div 
                  v-for="(img, i) in galleryImages" 
                  :key="i" 
                  class="sidebar-thumb"
                  :class="{ active: currentMainImage === img }"
                  @click="activeImageUrl = img"
                >
                  <img :src="img" :alt="'Hotel photo ' + (i + 1)" />
                </div>
              </div>
            </div>
          </section>

          <!-- About This Property -->
          <section class="content-section">
            <div class="section-heading">
              <span class="accent-bar"></span>
              <h2>About This Property</h2>
            </div>
            <p class="body-text">{{ service.description || 'No description available for this property.' }}</p>
          </section>

          <!-- Room Details -->
          <section class="content-section">
            <div class="section-heading">
              <span class="accent-bar"></span>
              <h2>Room Details</h2>
            </div>
            <div class="room-card">
              <h3 class="room-type-name">{{ accommodation?.room_type || 'Standard Room' }}</h3>
              <div class="room-stats">
                <div class="room-stat">
                  <span class="stat-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </span>
                  <div>
                    <span class="stat-value">{{ accommodation?.total_rooms || 0 }}</span>
                    <span class="stat-label">Total Rooms</span>
                  </div>
                </div>
                <div class="room-stat">
                  <span class="stat-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </span>
                  <div>
                    <span class="stat-value">${{ accommodation?.price_per_night || pricePerNight }}</span>
                    <span class="stat-label">Per Night</span>
                  </div>
                </div>
                <div class="room-stat">
                  <span class="stat-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </span>
                  <div>
                    <span class="stat-value">{{ accommodation?.check_in_time || '14:00' }}</span>
                    <span class="stat-label">Check-in</span>
                  </div>
                </div>
                <div class="room-stat">
                  <span class="stat-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </span>
                  <div>
                    <span class="stat-value">{{ accommodation?.check_out_time || '12:00' }}</span>
                    <span class="stat-label">Check-out</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Provider Card -->
          <section class="content-section">
            <div class="section-heading">
              <span class="accent-bar"></span>
              <h2>Managed By</h2>
            </div>
            <div class="provider-card">
              <div class="provider-top">
                <div class="provider-logo">
                  <img v-if="provider?.logo" :src="provider.logo" :alt="provider?.company_name" />
                  <span v-else class="provider-logo-fallback">🏛</span>
                </div>
                <div class="provider-info">
                  <div class="provider-name-row">
                    <h3>{{ provider?.company_name || 'Property Manager' }}</h3>
                    <span v-if="provider?.is_verified" class="verified-badge" title="Verified Provider">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                      Verified
                    </span>
                  </div>
                  <p class="provider-desc">{{ provider?.description || 'Professional hospitality provider in Cambodia.' }}</p>
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
              <span class="price-value">${{ pricePerNight }}</span>
              <span class="price-unit">/ night</span>
            </div>

            <div class="booking-field">
              <label class="field-label">Check-in Date</label>
              <input type="date" v-model="checkInDate" class="field-input" :min="todayStr" />
            </div>

            <div class="booking-field">
              <label class="field-label">Check-out Date</label>
              <input type="date" v-model="checkOutDate" class="field-input" :min="minCheckoutStr" />
            </div>

            <div class="steppers-row">
              <div class="booking-field">
                <label class="field-label">Rooms</label>
                <div class="stepper">
                  <button @click="rooms = Math.max(1, rooms - 1)" class="stepper-btn" :disabled="rooms <= 1">−</button>
                  <span class="stepper-value">{{ rooms }}</span>
                  <button @click="rooms = Math.min(maxRooms, rooms + 1)" class="stepper-btn" :disabled="rooms >= maxRooms">+</button>
                </div>
              </div>
              <div class="booking-field">
                <label class="field-label">Guests</label>
                <div class="stepper">
                  <button @click="hotelGuests = Math.max(1, hotelGuests - 1)" class="stepper-btn" :disabled="hotelGuests <= 1">−</button>
                  <span class="stepper-value">{{ hotelGuests }}</span>
                  <button @click="hotelGuests = Math.min(10, hotelGuests + 1)" class="stepper-btn" :disabled="hotelGuests >= 10">+</button>
                </div>
              </div>
            </div>

            <div class="price-breakdown">
              <div class="breakdown-row">
                <span>${{ pricePerNight }} × {{ nights }} night{{ nights > 1 ? 's' : '' }} × {{ rooms }} room{{ rooms > 1 ? 's' : '' }}</span>
                <span>${{ computedTotal.toFixed(2) }}</span>
              </div>
            </div>

            <div class="total-row">
              <span>Total</span>
              <span>${{ computedTotal.toFixed(2) }}</span>
            </div>

            <button @click="handleBooking" class="btn-cta-full">
              Reserve Now
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

interface Accommodation {
  service_id: string
  hotel_name: string
  address?: string
  star_rating: number
  room_type: string
  total_rooms: number
  price_per_night: number
  check_in_time: string
  check_out_time: string
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
  accommodation: Accommodation
  inventory?: { total_capacity: number }
}

const service = ref<Service | null>(null)
const isLoading = ref(true)
const fetchError = ref('')
const checkInDate = ref('')
const checkOutDate = ref('')
const rooms = ref(1)
const hotelGuests = ref(1)
const activeImageUrl = ref<string | null>(null)

const accommodation = computed(() => service.value?.accommodation)
const provider = computed(() => service.value?.provider)
const pricePerNight = computed(() => accommodation.value?.price_per_night || service.value?.price || 0)
const maxRooms = computed(() => accommodation.value?.total_rooms || 1)

const todayStr = computed(() => new Date().toISOString().split('T')[0])
const minCheckoutStr = computed(() => {
  if (!checkInDate.value) return todayStr.value
  const d = new Date(checkInDate.value)
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})

const nights = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return 1
  const ci = new Date(checkInDate.value).getTime()
  const co = new Date(checkOutDate.value).getTime()
  const diff = Math.ceil((co - ci) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff)
})

const computedTotal = computed(() => pricePerNight.value * nights.value * rooms.value)

const displayTags = computed(() => {
  const tags: string[] = []
  const acc = accommodation.value
  if (acc) {
    tags.push(`${acc.star_rating || 0}-Star Hotel`)
    tags.push(acc.room_type || 'Standard')
    if (acc.address) tags.push(acc.address.split(',').pop()?.trim() || acc.address)
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
    results.push(`https://placehold.co/800x600/006566/ffffff?text=Hotel+Photo+${results.length + 1}`)
  }
  
  return results
})

const currentMainImage = computed(() => activeImageUrl.value || galleryImages.value[0])

const fetchService = async () => {
  isLoading.value = true
  fetchError.value = ''
  try {
    const id = route.params.id as string
    const data = await apiGet<any>(`/services/${id}`)
    if (data.serviceType !== 'accommodation') {
      fetchError.value = 'This service is not an accommodation.'
      return
    }
    service.value = data as Service
    const today = new Date()
    checkInDate.value = today.toISOString().split('T')[0]
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    checkOutDate.value = tomorrow.toISOString().split('T')[0]
  } catch (e: any) {
    fetchError.value = e?.message || 'Failed to load hotel details.'
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
.stars-row { display: flex; gap: 2px; }
.star { font-size: 1rem; color: var(--outline-variant); }
.star.filled { color: #fea619; }

.service-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--on-surface);
  line-height: 1.2;
  letter-spacing: -0.02em;
}
.address-meta {
  display: flex; align-items: center; gap: 0.4rem;
  color: var(--on-surface-variant); font-size: 0.9rem;
}
.tags-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.25rem; }
.tag-pill {
  font-size: 0.75rem; font-weight: 500;
  color: var(--primary); background: rgba(0, 101, 102, 0.08);
  padding: 4px 12px; border-radius: 999px;
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

/* ── Room Card ── */
.room-card { background: var(--surface-container-low); border-radius: 12px; padding: 1rem; }
.room-type-name { font-size: 1rem; font-weight: 700; margin-bottom: 0.9rem; }
.room-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.room-stat {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.6rem; background: var(--surface-container-lowest);
  border-radius: 8px;
}
.stat-icon { color: var(--primary); flex-shrink: 0; }
.stat-value { display: block; font-weight: 700; font-size: 0.9rem; color: var(--on-surface); }
.stat-label { display: block; font-size: 0.7rem; color: var(--on-surface-variant); }

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
.provider-name-row h3 { font-size: 0.95rem; font-weight: 700; }
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
.field-input {
  padding: 10px 14px; background: var(--surface-container-low);
  border: 1px solid rgba(189, 201, 200, 0.2); border-radius: 6px;
  font-size: 0.9rem; color: var(--on-surface); font-family: 'Inter', sans-serif;
  outline: none; transition: border-color 0.2s;
}
.field-input:focus { border-color: var(--primary); }
.steppers-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
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
.btn-cta-full {
  width: 100%; padding: 12px; border-radius: 6px; font-weight: 700; font-size: 0.95rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
  border: none; cursor: pointer; color: #fff;
  background: linear-gradient(135deg, #006566, #117f81);
  transition: opacity 0.2s;
}
.btn-cta-full:hover { opacity: 0.9; }
</style>
