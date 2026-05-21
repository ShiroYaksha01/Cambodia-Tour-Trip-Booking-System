<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  service?: any
}>()

const emit = defineEmits(['close', 'save'])

const form = ref({
  title: '',
  description: '',
  price: 0,
  serviceType: 'tour',
  isActive: true,
})

watch(() => props.service, (newVal) => {
  if (newVal) {
    form.value = { 
      title: newVal.title || '',
      description: newVal.description || '',
      price: newVal.price || 0,
      serviceType: newVal.serviceType || 'tour',
      isActive: newVal.isActive !== undefined ? newVal.isActive : true
    }
  } else {
    form.value = {
      title: '',
      description: '',
      price: 0,
      serviceType: 'tour',
      isActive: true,
    }
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
          <div class="form-group">
            <label>Service Title</label>
            <input v-model="form.title" type="text" placeholder="e.g. Angkor Sunrise Premium" required />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="form.description" placeholder="Describe your service..." rows="3"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Base Price ($)</label>
              <input v-model.number="form.price" type="number" step="0.01" required />
            </div>
            <div class="form-group">
              <label>Service Type</label>
              <select v-model="form.serviceType">
                <option value="tour">Tour</option>
                <option value="accommodation">Accommodation</option>
                <option value="transportation">Transportation</option>
              </select>
            </div>
          </div>

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
}

.modal {
  background: #fff;
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.checkbox label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 400;
  cursor: pointer;
}

.modal-footer {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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