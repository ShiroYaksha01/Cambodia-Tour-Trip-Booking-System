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
          <div class="skeleton-block" style="height:180px;margin-top:24px"></div>
        </div>
        <div class="right-col">
          <div class="skeleton-block" style="height:380px"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="fetchError" class="error-state">
      <div class="error-icon">🚐</div>
      <h2>Transfer Not Found</h2>
      <p>{{ fetchError }}</p>
      <button @click="router.push({ name: 'customer-explore' })" class="btn-cta">Explore Transport</button>
    </div>

    <!-- Content -->
    <main v-else-if="service" class="detail-main">
      <!-- Category label + Title + Route meta + Tags (Moved outside for alignment) -->
      <section class="hero-section hero-full-width">
        <div class="category-row">
          <span class="category-label">Transportation</span>
          <span class="meta-divider">·</span>
          <span class="type-badge">{{ formatTransportType(transport?.transportType) }}</span>
        </div>
        <h1 class="service-title">{{ service.title }}</h1>
        <div class="route-meta">
          <div class="route-stop">
            <span class="route-dot filled"></span>
            <span class="route-place">{{ transport?.departurePoint || 'Departure' }}</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="route-arrow"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          <div class="route-stop">
            <span class="route-dot outlined"></span>
            <span class="route-place">{{ transport?.destination || 'Destination' }}</span>
          </div>
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
                  <img :src="img" :alt="'Vehicle photo ' + (i + 1)" />
                </div>
              </div>
            </div>
          </section>

          <!-- About This Transfer -->
          <section class="content-section">
            <div class="section-heading">
              <span class="accent-bar"></span>
              <h2>About This Transfer</h2>
            </div>
            <p class="body-text">{{ service.description || 'No description available for this transfer service.' }}</p>
          </section>

          <!-- Vehicle Specifications -->
          <section class="content-section">
            <div class="section-heading">
              <span class="accent-bar"></span>
              <h2>Vehicle Specifications</h2>
            </div>
            <div class="specs-row">
              <div class="spec-chip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <div>
                  <span class="spec-value">{{ transport?.totalSeats || 0 }}</span>
                  <span class="spec-label">Total Seats</span>
                </div>
              </div>
              <div class="spec-chip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                <div>
                  <span class="spec-value">{{ formatTransportType(transport?.transportType) }}</span>
                  <span class="spec-label">Vehicle Type</span>
                </div>
              </div>
              <div class="spec-chip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                <div>
                  <span class="spec-value">{{ transport?.vehicleModel || 'Standard' }}</span>
                  <span class="spec-label">Model</span>
                </div>
              </div>
              <div class="spec-chip">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <div>
                  <span class="spec-value">{{ estimatedTravelTime }}</span>
                  <span class="spec-label">Est. Duration</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Route Information -->
          <section class="content-section">
            <div class="section-heading">
              <span class="accent-bar"></span>
              <h2>Route Information</h2>
            </div>
            <div class="route-timeline-card">
              <!-- Departure -->
              <div class="route-timeline-item">
                <div class="rt-connector">
                  <div class="rt-dot filled"></div>
                </div>
                <div class="rt-content">
                  <h4 class="rt-title">Departure</h4>
                  <span class="rt-place">{{ transport?.departurePoint || 'Departure Point' }}</span>
                  <span class="rt-time">{{ formatDateTime(transport?.departureTime) }}</span>
                </div>
              </div>

              <!-- Pickup Notes -->
              <div v-if="transport?.pickupNotes" class="pickup-notes">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span>{{ transport.pickupNotes }}</span>
              </div>

              <!-- Connector line -->
              <div class="rt-line"></div>

              <!-- Arrival -->
              <div class="route-timeline-item">
                <div class="rt-connector">
                  <div class="rt-dot outlined"></div>
                </div>
                <div class="rt-content">
                  <h4 class="rt-title">Arrival</h4>
                  <span class="rt-place">{{ transport?.destination || 'Destination' }}</span>
                  <span class="rt-time">{{ formatDateTime(transport?.arrivalTime) }}</span>
                </div>
              </div>
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
                  <img v-if="provider?.logo" :src="provider.logo" :alt="provider?.companyName" />
                  <span v-else class="provider-logo-fallback">🏛</span>
                </div>
                <div class="provider-info">
                  <div class="provider-name-row">
                    <h3>{{ provider?.companyName || 'Transport Operator' }}</h3>
                    <span v-if="provider?.isVerified" class="verified-badge" title="Verified Provider">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                      Verified
                    </span>
                  </div>
                  <p class="provider-desc">{{ provider?.description || 'Professional transportation provider in Cambodia.' }}</p>
                </div>
              </div>
              <div v-if="provider?.facebookUrl || provider?.telegramUrl" class="provider-links">
                <a v-if="provider?.facebookUrl" :href="provider.facebookUrl" target="_blank" class="provider-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  Facebook
                </a>
                <a v-if="provider?.telegramUrl" :href="provider.telegramUrl" target="_blank" class="provider-link">
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
              <span class="price-value">${{ pricePerSeat }}</span>
              <span class="price-unit">/ seat</span>
            </div>

            <div class="booking-field">
              <label class="field-label">Scheduled Departure</label>
              <div class="field-readonly">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>{{ formatDateTime(transport?.departureTime) }}</span>
              </div>
            </div>

            <div class="booking-field">
              <label class="field-label">Pickup Location</label>
              <div class="field-readonly">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 13 8 13s8-7.6 8-13a8 8 0 0 0-8-8z"/></svg>
                <span>{{ transport?.departurePoint || 'N/A' }}</span>
              </div>
            </div>

            <div class="booking-field">
              <label class="field-label">Passengers</label>
              <div class="stepper">
                <button @click="passengers = Math.max(1, passengers - 1)" class="stepper-btn" :disabled="passengers <= 1">−</button>
                <span class="stepper-value">{{ passengers }}</span>
                <button @click="passengers = Math.min(maxPassengers, passengers + 1)" class="stepper-btn" :disabled="passengers >= maxPassengers">+</button>
              </div>
            </div>

            <div class="price-breakdown">
              <div class="breakdown-row">
                <span>${{ pricePerSeat }} × {{ passengers }} passenger{{ passengers > 1 ? 's' : '' }}</span>
                <span>${{ (pricePerSeat * passengers).toFixed(2) }}</span>
              </div>
            </div>

            <div class="total-row">
              <span>Total</span>
              <span>${{ (pricePerSeat * passengers).toFixed(2) }}</span>
            </div>

            <button @click="handleBooking" class="btn-secondary-full">
              Confirm Booking
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

interface Transportation {
  serviceId: string
  transportType: string
  vehicleModel?: string
  totalSeats: number
  pricePerSeat: number
  departurePoint: string
  destination: string
  departureTime: string
  arrivalTime?: string
  pickupNotes?: string
}

interface Provider {
  id: string
  companyName: string
  logo?: string
  description?: string
  isVerified: boolean
  facebookUrl?: string
  telegramUrl?: string
}

interface ServiceImage {
  id: string
  imageUrl: string
  isCover: boolean
  sortOrder: number
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
  transportation: Transportation
}

const service = ref<Service | null>(null)
const isLoading = ref(true)
const fetchError = ref('')
const passengers = ref(1)
const activeImageUrl = ref<string | null>(null)

const transport = computed(() => service.value?.transportation)
const provider = computed(() => service.value?.provider)
const pricePerSeat = computed(() => transport.value?.pricePerSeat || service.value?.price || 0)
const maxPassengers = computed(() => transport.value?.totalSeats || 1)

const estimatedTravelTime = computed(() => {
  const t = transport.value
  if (!t?.departureTime || !t?.arrivalTime) return 'N/A'
  const dep = new Date(t.departureTime).getTime()
  const arr = new Date(t.arrivalTime).getTime()
  const diffMs = arr - dep
  if (diffMs <= 0) return 'N/A'
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
  if (hours > 0) return `${hours}h`
  return `${mins}m`
})

const displayTags = computed(() => {
  const tags: string[] = []
  const t = transport.value
  if (t) {
    tags.push(formatTransportType(t.transportType))
    if (t.vehicleModel) tags.push(t.vehicleModel)
    tags.push(`${t.totalSeats} Seats`)
    if (t.departurePoint) tags.push(t.departurePoint)
    if (t.destination) tags.push(t.destination)
  }
  return tags.slice(0, 5)
})

const galleryImages = computed(() => {
  if (!service.value) return []
  const imgs = service.value.images || []
  
  const sorted = [...imgs].sort((a, b) => {
    if (a.isCover) return -1
    if (b.isCover) return 1
    return (a.sortOrder || 0) - (b.sortOrder || 0)
  })

  const results = sorted.map(i => i.imageUrl)
  
  while (results.length < 4) {
    results.push(`https://placehold.co/800x600/006566/ffffff?text=Vehicle+Photo+${results.length + 1}`)
  }
  
  return results
})

const currentMainImage = computed(() => activeImageUrl.value || galleryImages.value[0])

function formatTransportType(type?: string): string {
  if (!type) return 'Standard'
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const fetchService = async () => {
  isLoading.value = true
  fetchError.value = ''
  try {
    const id = route.params.id as string
    const data = await apiGet<any>(`/services/${id}`)
    if (data.serviceType !== 'transportation') {
      fetchError.value = 'This service is not a transportation option.'
      return
    }
    service.value = data as Service
  } catch (e: any) {
    fetchError.value = e?.message || 'Failed to load transport details.'
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
  router.push({ 
    name: 'booking-form', 
    params: { id: service.value?.id },
    query: {
      quantity: passengers.value,
      date: transport.value?.departureTime ? new Date(transport.value.departureTime).toISOString().split('T')[0] : undefined
    }
  })
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
.type-badge { font-size: 0.8rem; font-weight: 500; color: var(--on-surface-variant); }
.service-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--on-surface);
  line-height: 1.2;
  letter-spacing: -0.02em;
}
.route-meta {
  display: flex; align-items: center; gap: 0.6rem;
  color: var(--on-surface-variant); font-size: 0.9rem;
}
.route-stop { display: flex; align-items: center; gap: 0.35rem; }
.route-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.route-dot.filled { background: var(--primary); }
.route-dot.outlined { background: transparent; border: 2px solid var(--primary); }
.route-arrow { flex-shrink: 0; color: var(--outline-variant); }
.route-place { font-weight: 500; }
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

/* ── Vehicle Specs ── */
.specs-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
.spec-chip {
  display: flex; align-items: center; gap: 0.6rem;
  background: var(--surface-container-low);
  padding: 0.75rem; border-radius: 12px;
}
.spec-chip svg { color: var(--primary); flex-shrink: 0; }
.spec-value { display: block; font-weight: 700; font-size: 0.85rem; color: var(--on-surface); }
.spec-label { display: block; font-size: 0.7rem; color: var(--on-surface-variant); }

/* ── Route Timeline Card ── */
.route-timeline-card {
  background: var(--surface-container-low);
  border-radius: 12px; padding: 1rem 1rem 1rem 1.5rem;
}
.route-timeline-item { display: flex; gap: 0.75rem; align-items: flex-start; }
.rt-connector { display: flex; flex-direction: column; align-items: center; width: 20px; flex-shrink: 0; }
.rt-dot { width: 12px; height: 12px; border-radius: 50%; }
.rt-dot.filled { background: var(--primary); }
.rt-dot.outlined { background: transparent; border: 2px solid var(--primary); }
.rt-content { padding-bottom: 0.25rem; }
.rt-title { font-size: 0.85rem; font-weight: 700; color: var(--on-surface); margin: 0; }
.rt-place { display: block; font-size: 0.8rem; color: var(--on-surface-variant); }
.rt-time { font-size: 0.75rem; color: var(--primary); font-weight: 500; }

.pickup-notes {
  display: flex; align-items: flex-start; gap: 0.5rem;
  margin: 0.25rem 0 0.25rem 28px;
  padding: 8px 12px; background: rgba(0, 101, 102, 0.06);
  border-radius: 8px; font-size: 0.78rem; color: var(--on-surface-variant);
  line-height: 1.4;
}
.pickup-notes svg { color: var(--primary); flex-shrink: 0; margin-top: 1px; }

.rt-line {
  width: 2px; height: 24px; margin-left: 25px;
  background: linear-gradient(to bottom, #006566, #fea619);
  opacity: 0.3;
}

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
.field-readonly {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 10px 14px; background: var(--surface-container-low);
  border-radius: 6px; font-size: 0.9rem; color: var(--on-surface);
}
.stepper {
  display: flex; align-items: center;
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
.stepper-value { min-width: 40px; text-align: center; font-weight: 600; font-size: 0.95rem; }

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
.btn-secondary-full {
  width: 100%; padding: 12px; border-radius: 6px; font-weight: 700; font-size: 0.95rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
  border: none; cursor: pointer;
  background: #fea619; color: #684000;
  transition: opacity 0.2s;
}
.btn-secondary-full:hover { opacity: 0.9; }
.btn-cta:hover { opacity: 0.9; }
</style>
