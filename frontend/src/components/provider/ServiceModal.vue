<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  service?: any
}>()

const emit = defineEmits(['close', 'save'])

const defaultForm = () => ({
  title: '',
  description: '',
  price: 0,
  serviceType: 'tour',
  isActive: true,
  image: '',
  location: '',
  duration: '',
  // Inventory
  totalCapacity: 10,
  // Tour
  numDays: 1,
  maxPeople: 10,
  travelDate: '',
  endDate: '',
  departurePoint: '',
  destination: '',
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

const form = ref(defaultForm())

watch(() => props.service, (newVal) => {
  if (newVal) {
    // Flatten metadata for the form
    const metadata = newVal.tourPackage || newVal.accommodation || newVal.transportation || {}
    form.value = { 
      ...defaultForm(),
      ...newVal,
      image: newVal.coverImage || '',
      ...metadata,
      // Handle Date objects from backend
      travelDate: newVal.tourPackage?.travelDate ? new Date(newVal.tourPackage.travelDate).toISOString().split('T')[0] : '',
      endDate: newVal.tourPackage?.endDate ? new Date(newVal.tourPackage.endDate).toISOString().split('T')[0] : '',
      departureTime: newVal.transportation?.departureTime ? new Date(newVal.transportation.departureTime).toISOString().slice(0, 16) : '',
      arrivalTime: newVal.transportation?.arrivalTime ? new Date(newVal.transportation.arrivalTime).toISOString().slice(0, 16) : '',
      totalCapacity: newVal.inventory?.totalCapacity || 10,
    }
  } else {
    form.value = defaultForm()
  }
}, { immediate: true })

function handleSave() {
  emit('save', { ...form.value })
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="emit('close')">
      <div class="modal">
        <header class="modal-header">
          <h2>{{ service ? 'Edit Service' : 'Add New Service' }}</h2>
          <button class="close-btn" @click="emit('close')">✕</button>
        </header>

        <form @submit.prevent="handleSave" class="modal-body">
          <!-- Common Fields -->
          <div class="section-title">Basic Information</div>
          <div class="form-group">
            <label>Service Title</label>
            <input v-model="form.title" type="text" placeholder="e.g. Angkor Sunrise Premium" required />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="form.description" placeholder="Describe your service..." rows="2"></textarea>
          </div>

          <div class="form-group">
            <label>Cover Image URL</label>
            <input v-model="form.image" type="text" placeholder="https://example.com/image.jpg" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Service Type</label>
              <select v-model="form.serviceType">
                <option value="tour">Tour</option>
                <option value="accommodation">Accommodation</option>
                <option value="transportation">Transportation</option>
              </select>
            </div>
            <div class="form-group">
              <label>Price ($)</label>
              <input v-model.number="form.price" type="number" step="0.01" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Location</label>
              <input v-model="form.location" type="text" placeholder="e.g. Siem Reap" />
            </div>
            <div class="form-group">
              <label>Duration/Note</label>
              <input v-model="form.duration" type="text" placeholder="e.g. 3 days / Per night" />
            </div>
          </div>

          <!-- Tour Specific -->
          <template v-if="form.serviceType === 'tour'">
            <div class="section-title">Tour Details</div>
            <div class="form-row">
              <div class="form-group">
                <label>Number of Days</label>
                <input v-model.number="form.numDays" type="number" min="1" />
              </div>
              <div class="form-group">
                <label>Max People</label>
                <input v-model.number="form.maxPeople" type="number" min="1" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Start Date</label>
                <input v-model="form.travelDate" type="date" />
              </div>
              <div class="form-group">
                <label>End Date</label>
                <input v-model="form.endDate" type="date" />
              </div>
            </div>
            <div class="form-group">
              <label>Departure Point</label>
              <input v-model="form.departurePoint" type="text" placeholder="Hotel pickup, Airport, etc." />
            </div>
            <div class="checkbox-group">
              <label><input type="checkbox" v-model="form.includesAccommodation" /> Incl. Accommodation</label>
              <label><input type="checkbox" v-model="form.includesTransportation" /> Incl. Transport</label>
              <label><input type="checkbox" v-model="form.includesMeals" /> Incl. Meals</label>
            </div>
          </template>

          <!-- Accommodation Specific -->
          <template v-if="form.serviceType === 'accommodation'">
            <div class="section-title">Accommodation Details</div>
            <div class="form-group">
              <label>Hotel/Property Name</label>
              <input v-model="form.hotelName" type="text" />
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
                <label>Total Rooms</label>
                <input v-model.number="form.totalRooms" type="number" min="1" />
              </div>
              <div class="form-group">
                <label>Check-in Time</label>
                <input v-model="form.checkInTime" type="time" />
              </div>
            </div>
          </template>

          <!-- Transportation Specific -->
          <template v-if="form.serviceType === 'transportation'">
            <div class="section-title">Transportation Details</div>
            <div class="form-row">
              <div class="form-group">
                <label>Vehicle Type</label>
                <select v-model="form.transportType">
                  <option value="van">Van</option>
                  <option value="bus">Bus</option>
                  <option value="car">Car</option>
                  <option value="boat">Boat</option>
                  <option value="tuk_tuk">Tuk-Tuk</option>
                </select>
              </div>
              <div class="form-group">
                <label>Total Seats</label>
                <input v-model.number="form.totalSeats" type="number" min="1" />
              </div>
            </div>
            <div class="form-group">
              <label>Vehicle Model</label>
              <input v-model="form.vehicleModel" type="text" placeholder="e.g. Ford Transit 2023" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Departure Time</label>
                <input v-model="form.departureTime" type="datetime-local" />
              </div>
              <div class="form-group">
                <label>Arrival Time (Est.)</label>
                <input v-model="form.arrivalTime" type="datetime-local" />
              </div>
            </div>
          </template>

          <div class="form-group checkbox">
            <label>
              <input type="checkbox" v-model="form.isActive" />
              Active and visible to customers
            </label>
          </div>

          <footer class="modal-footer">
            <button type="button" class="cancel-btn" @click="emit('close')">Cancel</button>
            <button type="submit" class="save-btn">Save Service</button>
          </footer>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: #fff;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #173f42;
}

.close-btn {
  background: transparent;
  border: 0;
  font-size: 1.2rem;
  color: #999;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 800;
  color: #0f6e70;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 8px;
  padding-bottom: 4px;
  border-bottom: 2px solid #f0f7f7;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
}

.form-group input, 
.form-group textarea, 
.form-group select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font: inherit;
  outline: none;
}

.form-group input:focus, 
.form-group textarea:focus {
  border-color: #0f6e70;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  cursor: pointer;
}

.checkbox label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 400;
  cursor: pointer;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.cancel-btn {
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
}

.save-btn {
  padding: 10px 24px;
  border-radius: 8px;
  border: 0;
  background: #0f6e70;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.save-btn:hover {
  background: #0a5c5d;
}

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>