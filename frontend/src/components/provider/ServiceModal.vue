<script setup lang="ts">
import { ref, watch, onBeforeUnmount, computed } from 'vue'
import { resolveImageUrl } from '../../utils/api'
import { uploadImage } from '../../services/api'

const props = defineProps<{
  show: boolean
  service?: any
}>()

const emit = defineEmits(['close', 'save'])

const provinces = [
  "Banteay Meanchey", "Battambang", "Kampong Cham", "Kampong Chhnang", "Kampong Speu",
  "Kampong Thom", "Kampot", "Kandal", "Kep", "Koh Kong", "Kratie", "Mondulkiri",
  "Oddar Meanchey", "Pailin", "Phnom Penh", "Preah Vihear", "Preah Sihanouk",
  "Prey Veng", "Pursat", "Ratanakiri", "Siem Reap", "Stung Treng", "Svay Rieng",
  "Takeo", "Tboung Khmum",
]

const defaultForm = () => ({
  title: '',
  description: '',
  price: 0,
  serviceType: 'tour',
  isActive: true,
  generateInventory: true,
  image: '',
  destinations: [],
  destination: '',
  location: '',
  duration: '',
  totalCapacity: 10,
  // Tour
  numDays: 1,
  maxPeople: 10,
  travelDate: '',
  endDate: '',
  departurePoint: '',
  includesAccommodation: false,
  includesTransportation: false,
  includesMeals: false,
  // Accommodation
  hotelName: '',
  address: '',
  starRating: 3,
  roomType: '',
  totalRooms: 1,
  checkInTime: '14:00',
  checkOutTime: '12:00',
  // Transportation
  transportType: 'van',
  vehicleModel: '',
  totalSeats: 1,
  departureTime: '',
  arrivalTime: '',
  pickupNotes: '',
})

const form = ref<any>(defaultForm())
let currentObjectUrl: string | null = null
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)

const minDateTime = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
});

// UI-only date strings for DD/MM/YYYY display
const uiTravelDate = ref('')
const uiEndDate = ref('')

// Helpers to convert between ISO (YYYY-MM-DD) and UI (DD/MM/YYYY)
function isoToUi(iso: string): string {
  if (!iso) return ''
  const parts = iso.split('T')[0].split('-')
  if (parts.length !== 3) return iso
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

function uiToIso(ui: string): string {
  if (!ui) return ''
  const parts = ui.split('/')
  if (parts.length !== 3) return ui
  const d = parts[0].padStart(2, '0')
  const m = parts[1].padStart(2, '0')
  const y = parts[2]
  return `${y}-${m}-${d}`
}

watch(() => props.service, (newVal) => {
  if (newVal) {
    const metadata = newVal.tourPackage || newVal.accommodation || newVal.transportation || {}
    form.value = { 
      ...defaultForm(),
      ...newVal,
      image: newVal.coverImage || '',
      ...metadata,
      totalCapacity: newVal.inventory?.totalCapacity || 10,
    }
    // Set UI dates
    uiTravelDate.value = isoToUi(newVal.tourPackage?.travelDate || '')
    uiEndDate.value = isoToUi(newVal.tourPackage?.endDate || '')
    selectedFile.value = null
  } else {
    form.value = defaultForm()
    uiTravelDate.value = ''
    uiEndDate.value = ''
    selectedFile.value = null
  }
}, { immediate: true })

async function handleSave() {
  try {
    isUploading.value = true
    
    if (selectedFile.value) {
      const res = await uploadImage(selectedFile.value)
      if (res && res.url) {
        form.value.image = res.url
      }
    }

    const travelDateIso = uiToIso(uiTravelDate.value)
    const endDateIso = uiToIso(uiEndDate.value)

    // Construct a clean payload
    const payload: any = {
      title: form.value.title,
      description: form.value.description,
      price: Number(form.value.price) || 0,
      serviceType: form.value.serviceType,
      isActive: form.value.isActive,
      image: form.value.image,
      location: form.value.location,
      duration: form.value.duration,
      totalCapacity: Number(form.value.totalCapacity) || 1,
    }

    // generateInventory is only for creation
    if (!props.service) {
      payload.generateInventory = form.value.generateInventory
    }

    if (form.value.serviceType === 'tour') {
      if (travelDateIso) payload.travelDate = travelDateIso
      if (endDateIso) payload.endDate = endDateIso
      payload.numDays = Number(form.value.numDays) || 1
      payload.maxPeople = Number(form.value.maxPeople) || 1
      payload.departurePoint = form.value.departurePoint
      // destination is required
      payload.destination = form.value.destination || form.value.destinations.join(', ') || form.value.location
      payload.includesAccommodation = form.value.includesAccommodation
      payload.includesTransportation = form.value.includesTransportation
      payload.includesMeals = form.value.includesMeals
    } else if (form.value.serviceType === 'accommodation') {
      payload.hotelName = form.value.hotelName || form.value.title
      payload.address = form.value.address
      payload.starRating = Number(form.value.starRating) || 3
      payload.roomType = form.value.roomType
      payload.totalRooms = Number(form.value.totalRooms) || 1
      if (form.value.checkInTime) payload.checkInTime = form.value.checkInTime
      if (form.value.checkOutTime) payload.checkOutTime = form.value.checkOutTime
    } else if (form.value.serviceType === 'transportation') {
      payload.transportType = form.value.transportType
      payload.vehicleModel = form.value.vehicleModel
      payload.totalSeats = Number(form.value.totalSeats) || 1
      if (form.value.departureTime) payload.departureTime = new Date(form.value.departureTime).toISOString()
      if (form.value.arrivalTime) payload.arrivalTime = new Date(form.value.arrivalTime).toISOString()
      payload.pickupNotes = form.value.pickupNotes
      payload.departurePoint = form.value.departurePoint || form.value.location
      payload.destination = form.value.destination || form.value.location
    }
    
    emit('save', payload)
  } catch (error) {
    console.error('Failed to prepare data:', error)
    alert('Please check your data and try again.')
  } finally {
    isUploading.value = false
  }
}

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement | null
  const f = input?.files?.[0]
  if (f) {
    if (f.size > 10 * 1024 * 1024) {
      alert('File is too large. Please select an image smaller than 10MB.')
      if (input) input.value = ''
      return
    }
    selectedFile.value = f
    if (currentObjectUrl) {
      try { URL.revokeObjectURL(currentObjectUrl) } catch (e) { }
      currentObjectUrl = null
    }
    const url = URL.createObjectURL(f)
    currentObjectUrl = url
    form.value.image = url
  }
}

const addDestination = () => {
  if (!form.value.destination) return
  if (!Array.isArray(form.value.destinations)) form.value.destinations = []
  form.value.destinations.push(form.value.destination)
  form.value.destination = ''
}

onBeforeUnmount(() => {
  if (currentObjectUrl) {
    try { URL.revokeObjectURL(currentObjectUrl) } catch (e) { }
  }
})
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal">
        <header class="modal-header">
          <div>
            <h2>{{ service ? 'Edit Service' : 'Create New Service' }}</h2>
            <div class="modal-subtitle">Heritage Management — angkorklean</div>
          </div>
          <button class="close-btn" @click="emit('close')">✕</button>
        </header>

        <form @submit.prevent="handleSave" class="modal-body">
          <nav class="modal-tabs">
            <button type="button" :class="['tab', {active: form.serviceType === 'tour'}]" @click="form.serviceType = 'tour'">Tour</button>
            <button type="button" :class="['tab', {active: form.serviceType === 'accommodation'}]" @click="form.serviceType = 'accommodation'">Hotel</button>
            <button type="button" :class="['tab', {active: form.serviceType === 'transportation'}]" @click="form.serviceType = 'transportation'">Transport</button>
          </nav>

          <div class="upload-area">
            <label class="upload-drop">
              <input class="upload-input" type="file" accept="image/*" @change="handleFileChange" />
              <div v-if="form.image" class="upload-preview-wrap">
                <img :src="resolveImageUrl(form.image)" alt="cover preview" class="upload-preview"/>
                <div class="upload-overlay">Change cover image</div>
              </div>
              <div v-else class="upload-placeholder">
                <div class="upload-icon">📤</div>
                <div class="upload-text">Upload cover image</div>
                <div class="upload-sub">PNG, JPG up to 5 MB</div>
              </div>
            </label>
          </div>

          <!-- Section: Basic Information (Common) -->
          <div class="section-title">Core Listing Details</div>
          
          <div class="form-group">
            <label>Service Title <span class="required">*</span></label>
            <input v-model="form.title" type="text" placeholder="e.g. Angkor Sunrise Premium" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Province / Region <span class="required">*</span></label>
              <select v-model="form.location" required>
                <option value="" disabled>Select Province</option>
                <option v-for="province in provinces" :key="province" :value="province">
                  {{ province }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Base Price ($) <span class="required">*</span></label>
              <input v-model.number="form.price" type="number" step="0.01" min="0" required />
            </div>
          </div>

          <div class="form-group">
            <label>Short Description</label>
            <textarea v-model="form.description" placeholder="A brief summary for customers..." rows="2"></textarea>
          </div>

          <div class="form-group">
            <label>Duration / Pricing Label</label>
            <input v-model="form.duration" type="text" placeholder="e.g. 3 days / Per night / One way" />
          </div>

          <!-- Section: Tour Specific -->
          <template v-if="form.serviceType === 'tour'">
            <div class="section-title">Tour Specifications</div>
            <div class="form-row">
              <div class="form-group">
                <label>Start Date (DD/MM/YYYY) <span class="required">*</span></label>
                <input v-model="uiTravelDate" type="text" placeholder="DD/MM/YYYY" required />
              </div>
              <div class="form-group">
                <label>End Date (DD/MM/YYYY) <span class="required">*</span></label>
                <input v-model="uiEndDate" type="text" placeholder="DD/MM/YYYY" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Duration (Days) <span class="required">*</span></label>
                <input v-model.number="form.numDays" type="number" min="1" required />
              </div>
              <div class="form-group">
                <label>Max People <span class="required">*</span></label>
                <input v-model.number="form.maxPeople" type="number" min="1" required />
              </div>
            </div>

            <div class="form-group">
              <label>Primary Destination <span class="required">*</span></label>
              <input v-model="form.destination" type="text" placeholder="e.g. Angkor Archaeological Park" required />
            </div>

            <div class="destinations">
              <label>Itinerary Highlights</label>
              <div class="destinations-list" v-if="form.destinations.length">
                <span v-for="(d, i) in form.destinations" :key="i" class="destination-pill">{{ d }}</span>
              </div>
              <div class="destinations-add">
                <input v-model="form.destination_temp" @keyup.enter="addDestination" placeholder="Add specific spot..." />
                <button type="button" @click="addDestination">+ Add</button>
              </div>
            </div>

            <div class="form-group">
              <label>Departure Point</label>
              <input v-model="form.departurePoint" type="text" placeholder="Hotel pickup, Office, etc." />
            </div>

            <div class="checkbox-group">
              <label><input type="checkbox" v-model="form.includesAccommodation" /> Incl. Hotel</label>
              <label><input type="checkbox" v-model="form.includesTransportation" /> Incl. Transport</label>
              <label><input type="checkbox" v-model="form.includesMeals" /> Incl. Meals</label>
            </div>
          </template>

          <!-- Section: Accommodation Specific -->
          <template v-if="form.serviceType === 'accommodation'">
            <div class="section-title">Hotel / Stay Details</div>
            <div class="form-group">
              <label>Hotel Name <span class="required">*</span></label>
              <input v-model="form.hotelName" type="text" placeholder="Property name..." required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Room Type</label>
                <input v-model="form.roomType" type="text" placeholder="e.g. Deluxe Suite" />
              </div>
              <div class="form-group">
                <label>Star Rating (1-5)</label>
                <input v-model.number="form.starRating" type="number" min="1" max="5" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Total Available Rooms <span class="required">*</span></label>
                <input v-model.number="form.totalRooms" type="number" min="1" required />
              </div>
              <div class="form-group">
                <label>Check-in Time</label>
                <input v-model="form.checkInTime" type="time" />
              </div>
            </div>
            <div class="form-group">
              <label>Property Address</label>
              <input v-model="form.address" type="text" placeholder="Street name, number..." />
            </div>
          </template>

          <!-- Section: Transportation Specific -->
          <template v-if="form.serviceType === 'transportation'">
            <div class="section-title">Transfer Details</div>
            <div class="form-row">
              <div class="form-group">
                <label>Vehicle Type <span class="required">*</span></label>
                <select v-model="form.transportType" required>
                  <option value="van">Van</option>
                  <option value="bus">Bus</option>
                  <option value="car">Car</option>
                  <option value="boat">Boat</option>
                  <option value="tuk_tuk">Tuk-Tuk</option>
                </select>
              </div>
              <div class="form-group">
                <label>Capacity (Seats) <span class="required">*</span></label>
                <input v-model.number="form.totalSeats" type="number" min="1" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Departure Location <span class="required">*</span></label>
                <input v-model="form.departurePoint" type="text" placeholder="Pickup point..." required />
              </div>
              <div class="form-group">
                <label>Destination <span class="required">*</span></label>
                <input v-model="form.destination" type="text" placeholder="Drop-off point..." required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Departure Time <span class="required">*</span></label>
                <input v-model="form.departureTime" type="datetime-local" :min="minDateTime" required />
              </div>
              <div class="form-group">
                <label>Vehicle Model</label>
                <input v-model="form.vehicleModel" type="text" placeholder="e.g. Ford Transit 2023" />
              </div>
            </div>
          </template>

          <!-- Section: Visibility & Automation -->
          <div class="section-title">Listing Settings</div>
          <div class="form-group checkbox" v-if="!service">
            <label>
              <input type="checkbox" v-model="form.generateInventory" />
              <span>Auto-generate inventory for the next 30 days</span>
            </label>
          </div>
          <div class="form-group checkbox">
            <label>
              <input type="checkbox" v-model="form.isActive" />
              <span>Active and visible to customers</span>
            </label>
          </div>

          <footer class="modal-footer">
            <div class="footer-actions">
              <button type="button" class="cancel-btn" @click="emit('close')" :disabled="isUploading">Cancel</button>
              <button type="submit" class="create-btn" :disabled="isUploading">
                {{ isUploading ? 'Uploading...' : (service ? 'Update service' : 'Create service') }}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px);
  display: grid; place-items: center; z-index: 1000; padding: 20px;
}
.modal {
  background: #fff; width: 100%; max-width: 600px; max-height: 90vh; border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2); display: flex; flex-direction: column;
}
.modal-header { padding: 16px 24px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { margin: 0; font-size: 1.25rem; color: #173f42; }
.modal-subtitle { font-size: 12px; color: #6b7a7a; margin-top: 4px; }
.close-btn { background: transparent; border: 0; font-size: 1.2rem; color: #999; cursor: pointer; }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
.modal-tabs { display: flex; gap: 12px; margin-bottom: 12px; }
.tab { background: transparent; border: 0; padding: 8px 12px; border-radius: 8px; cursor: pointer; color: #4d6b6b; font-weight: 600; }
.tab.active { background: #eef7f6; color: #0f6e70; box-shadow: inset 0 -2px 0 #0f6e70; }
.upload-area { margin-bottom: 8px; }
.upload-drop { display: block; width: 100%; border: 2px dashed #e6e6e6; border-radius: 8px; padding: 20px; text-align: center; cursor: pointer; background: #fbfbfb; position: relative; overflow: hidden; }
.upload-input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.upload-preview-wrap { position: relative }
.upload-preview { width: 100%; height: 160px; object-fit: cover; border-radius: 6px }
.upload-overlay { position: absolute; left: 12px; bottom: 12px; background: rgba(0,0,0,0.45); color: white; padding: 6px 10px; border-radius: 6px; font-weight:700; font-size: 12px; }
.upload-placeholder .upload-icon { font-size: 22px; }
.upload-text { font-weight: 700; margin-top: 8px; font-size: 14px; }
.upload-sub { font-size: 11px; color: #9aa3a3; margin-top: 4px; }
.section-title { font-size: 0.7rem; font-weight: 800; color: #0f6e70; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 12px; padding-bottom: 6px; border-bottom: 1px solid #f0f7f7; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 0.85rem; font-weight: 700; color: #4a5568; }
.required { color: #e53e3e; margin-left: 2px; }
.form-group input, .form-group textarea, .form-group select { padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font: inherit; outline: none; transition: border-color 0.2s; }
.form-group input:focus, .form-group textarea:focus { border-color: #0f6e70; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.destinations-list { display:flex; gap:8px; flex-wrap:wrap; margin:8px 0; }
.destination-pill { background:#e8f4f0; color:#1b7f6a; padding:6px 10px; border-radius:999px; font-weight:600; font-size: 12px; }
.destinations-add { display:flex; gap:8px; }
.destinations-add input { flex:1 }
.checkbox-group { display: flex; flex-wrap: wrap; gap: 16px; background: #f7fafc; padding: 12px; border-radius: 8px; }
.checkbox-group label { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; cursor: pointer; font-weight: 600; color: #4a5568; }
.checkbox label { display: flex; align-items: center; gap: 10px; font-weight: 600; cursor: pointer; color: #4a5568; font-size: 0.85rem; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 12px; }
.cancel-btn { padding: 10px 20px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; font-weight: 600; color: #4a5568; }
.create-btn { background:#0f8e6f; color:white; padding:10px 24px; border-radius:8px; border:0; cursor:pointer; font-weight:700; transition: background 0.2s; }
.create-btn:hover { background: #0a5c5d; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>