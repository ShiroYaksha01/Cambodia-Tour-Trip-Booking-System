<template>
  <AdminLayout @search="(q) => searchQuery = q">
    <!-- Scrollable Main Content Viewport -->
    <section class="admin-content">
      <div class="page-heading">
        <div class="heading-group">
          <p class="eyebrow">Platform Administration</p>
          <h1>Manage Providers</h1>
          <p class="page-description">
            Oversee your partner network, verify business details, and manage account accessibility.
          </p>
        </div>

        <button class="primary-button add-btn" type="button" @click="openAddModal">
          <span class="icon">+</span> Add Provider
        </button>
      </div>

          <div class="toolbar-row">
            <div class="filter-group">
              <label class="filter-label">Status</label>
              <select v-model="statusFilter" class="styled-select">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <article class="table-card">
            <header class="card-header">
              <div class="header-main">
                <h2>Provider Network</h2>
                <span class="count-badge">{{ filteredProviders.length }} total</span>
              </div>
            </header>

            <div v-if="loading" class="state-container">
              <div class="loader"></div>
              <p>Syncing provider records...</p>
            </div>

            <div v-else-if="filteredProviders.length === 0" class="state-container empty">
              <div class="empty-icon">□</div>
              <h3>No providers found</h3>
              <p>We couldn't find any providers matching your current filters.</p>
              <button class="text-button" @click="clearFilters">Clear all filters</button>
            </div>

            <div v-else class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Company & Category</th>
                    <th>Contact Details</th>
                    <th>Services</th>
                    <th>Status</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="provider in filteredProviders" :key="provider.id" class="data-row">
                    <td>
                      <div class="company-cell">
                        <div class="company-logo">{{ provider.companyName.charAt(0) }}</div>
                        <div>
                          <strong class="company-name">{{ provider.companyName }}</strong>
                          <span class="category-tag">{{ provider.serviceCategory || 'General' }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="contact-info">
                        <span class="contact-name">{{ provider.contactPerson }}</span>
                        <span class="contact-sub">{{ provider.email }}</span>
                        <span class="contact-sub">{{ provider.phoneNumber }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="service-stat">
                        <span class="stat-number">{{ provider.totalServices }}</span>
                        <span class="stat-label">Services</span>
                      </div>
                    </td>
                    <td>
                      <span :class="['status-pill', provider.status === 'active' ? 'active' : 'inactive']">
                        {{ provider.status === 'active' ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td>
                      <div class="action-stack">
                        <button class="action-btn edit" title="Edit Provider" @click="openEditModal(provider)">
                          ✎
                        </button>
                        <button 
                          :class="['action-btn', provider.status === 'active' ? 'deactivate' : 'activate']" 
                          :title="provider.status === 'active' ? 'Deactivate' : 'Activate'"
                          @click="toggleProviderStatus(provider)"
                        >
                          {{ provider.status === 'active' ? '⊘' : '✓' }}
                        </button>
                        <button class="action-btn delete" title="Delete Provider" @click="deleteProvider(provider)">
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <!-- Modal -->
          <Transition name="fade">
            <div v-if="modalOpen" class="modal-overlay" @click.self="closeModal">
              <div class="modal-window">
                <header class="modal-header">
                  <div class="header-text">
                    <p class="eyebrow">Provider Management</p>
                    <h2>{{ isEditing ? 'Edit Provider Profile' : 'Register New Provider' }}</h2>
                  </div>
                  <button class="close-btn" @click="closeModal">✕</button>
                </header>

                <form class="modal-body" @submit.prevent="submitForm">
                  <div class="form-section">
                    <h3>Business Information</h3>
                    <div class="form-grid">
                      <div class="input-group">
                        <label>Company Name</label>
                        <input v-model.trim="form.companyName" type="text" placeholder="e.g. Angkor Adventures" required />
                      </div>
                      <div class="input-group">
                        <label>Service Category</label>
                        <select v-model="form.serviceCategory">
                          <option value="">Select category</option>
                          <option value="Tour">Tour</option>
                          <option value="Transportation">Transportation</option>
                          <option value="Accommodation">Accommodation</option>
                          <option value="Experience">Experience</option>
                        </select>
                      </div>
                      <div class="input-group full-width">
                        <label>Description</label>
                        <textarea v-model.trim="form.description" rows="3" placeholder="Describe the provider's core business..."></textarea>
                      </div>
                    </div>
                  </div>

                  <div class="form-section">
                    <h3>Contact & Location</h3>
                    <div class="form-grid">
                      <div class="input-group">
                        <label>Contact Person</label>
                        <input v-model.trim="form.contactPerson" type="text" placeholder="Full name" required />
                      </div>
                      <div class="input-group">
                        <label>Email Address</label>
                        <input v-model.trim="form.email" type="email" placeholder="email@example.com" required />
                      </div>
                      <div class="input-group">
                        <label>Phone Number</label>
                        <input v-model.trim="form.phoneNumber" type="tel" placeholder="+855..." required />
                      </div>
                      <div class="input-group">
                        <label>Account Status</label>
                        <select v-model="form.status" required>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div class="input-group full-width">
                        <label>Physical Address</label>
                        <input v-model.trim="form.address" type="text" placeholder="Street, City, Province" />
                      </div>
                    </div>
                  </div>

                  <footer class="modal-footer">
                    <button type="button" class="cancel-btn" @click="closeModal">Cancel</button>
                    <button type="submit" class="submit-btn" :disabled="saving">
                      <span v-if="saving" class="btn-loader"></span>
                      {{ saving ? 'Saving...' : isEditing ? 'Update Provider' : 'Create Provider' }}
                    </button>
                  </footer>
                </form>
              </div>
            </div>
          </Transition>
        </section>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import { apiDelete, apiGet, apiPost, apiPut } from '../../utils/api'

interface ProviderItem {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phoneNumber: string
  address: string
  serviceCategory: string
  description: string
  status: string
  totalServices: number
}

const providers = ref<ProviderItem[]>([])
const searchQuery = ref('')
const statusFilter = ref('')
const loading = ref(false)
const modalOpen = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const currentProviderId = ref<string | null>(null)

const form = reactive({
  companyName: '',
  contactPerson: '',
  email: '',
  phoneNumber: '',
  address: '',
  serviceCategory: '',
  description: '',
  status: 'active',
})

const filteredProviders = computed(() => {
  return providers.value.filter((provider) => {
    const search = searchQuery.value.trim().toLowerCase()
    const matchesSearch = !search || [
      provider.companyName,
      provider.contactPerson,
      provider.email,
      provider.phoneNumber,
      provider.serviceCategory,
    ].some((value) => value.toLowerCase().includes(search))

    const matchesStatus = !statusFilter.value || provider.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

const loadProviders = async () => {
  loading.value = true
  try {
    const query = new URLSearchParams()
    if (searchQuery.value) query.set('q', searchQuery.value)
    if (statusFilter.value) query.set('status', statusFilter.value)

    const response = await apiGet<{ success: boolean; data: ProviderItem[] }>(`/admin/providers?${query.toString()}`)
    providers.value = response.data
  } catch (error) {
    console.warn('Backend unavailable, using mock data for demonstration.', error)
    // Mock data fallback
    providers.value = [
      {
        id: '1',
        companyName: 'Angkor Klean Tours',
        contactPerson: 'Sophea Meas',
        email: 'info@angkorklean.com',
        phoneNumber: '+855 12 345 678',
        address: 'Slokram, Siem Reap',
        serviceCategory: 'Tour',
        description: 'Premier eco-friendly tours around Angkor Wat.',
        status: 'active',
        totalServices: 8
      },
      {
        id: '2',
        companyName: 'Mekong Trails Co.',
        contactPerson: 'Dara Sam',
        email: 'contact@mekongtrails.co',
        phoneNumber: '+855 23 456 789',
        address: 'Riverside, Phnom Penh',
        serviceCategory: 'Experience',
        description: 'Authentic river expeditions and trail hiking.',
        status: 'active',
        totalServices: 5
      },
      {
        id: '3',
        companyName: 'Ratanakiri Jungle Trek',
        contactPerson: 'Vichea Sok',
        email: 'expedition@ratanakiri.com',
        phoneNumber: '+855 34 567 890',
        address: 'Banlung, Ratanakiri',
        serviceCategory: 'Tour',
        description: 'Deep jungle trekking and ethnic village stays.',
        status: 'inactive',
        totalServices: 3
      }
    ]
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
}

const openAddModal = () => {
  isEditing.value = false
  currentProviderId.value = null
  Object.assign(form, {
    companyName: '',
    contactPerson: '',
    email: '',
    phoneNumber: '',
    address: '',
    serviceCategory: '',
    description: '',
    status: 'active',
  })
  modalOpen.value = true
}

const openEditModal = (provider: ProviderItem) => {
  isEditing.value = true
  currentProviderId.value = provider.id
  Object.assign(form, {
    companyName: provider.companyName,
    contactPerson: provider.contactPerson,
    email: provider.email,
    phoneNumber: provider.phoneNumber,
    address: provider.address,
    serviceCategory: provider.serviceCategory,
    description: provider.description,
    status: provider.status,
  })
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
}

const submitForm = async () => {
  saving.value = true
  try {
    if (isEditing.value && currentProviderId.value) {
      await apiPut(`/admin/providers/${currentProviderId.value}`, form)
    } else {
      await apiPost('/admin/providers', form)
    }
    await loadProviders()
    closeModal()
  } catch (error) {
    console.error(error)
    alert(error instanceof Error ? error.message : 'Unable to save provider.')
  } finally {
    saving.value = false
  }
}

const toggleProviderStatus = async (provider: ProviderItem) => {
  try {
    await apiPut(`/admin/providers/${provider.id}`, {
      ...provider,
      status: provider.status === 'active' ? 'inactive' : 'active',
    })
    await loadProviders()
  } catch (error) {
    console.error(error)
    alert(error instanceof Error ? error.message : 'Unable to update provider status.')
  }
}

const deleteProvider = async (provider: ProviderItem) => {
  const confirmed = window.confirm(`Permanently delete provider "${provider.companyName}"? This action cannot be undone.`)
  if (!confirmed) return

  try {
    await apiDelete(`/admin/providers/${provider.id}`)
    await loadProviders()
  } catch (error) {
    console.error(error)
    alert(error instanceof Error ? error.message : 'Unable to delete provider.')
  }
}

watch([searchQuery, statusFilter], () => {
  if (!loading.value) {
    loadProviders()
  }
})

onMounted(() => {
  loadProviders()
})
</script>

<style scoped>
/* Scoped CSS targeting the clean Vercel/Linear/Stripe Startup Mockup Visual Aesthetics */
.admin-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Page heading and banner */
.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid #edf2f5;
  padding-bottom: 24px;
  gap: 20px;
}

.heading-group h1 {
  margin: 6px 0 8px;
  font-size: 1.6rem;
  color: #123c3e;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.eyebrow {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #0f6e70;
  font-weight: 700;
  margin: 0;
}

.page-description {
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.5;
  margin: 0;
  max-width: 600px;
}

/* Toolbar & Filters */
.toolbar-row {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: flex-end;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid #edf2f5;
  height: 38px;
}

.filter-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.styled-select {
  border: 0;
  background: transparent;
  padding: 4px 0;
  font-weight: 600;
  color: #1e293b;
  outline: none;
  cursor: pointer;
  font-size: 0.85rem;
}

/* Table Card Design */
.table-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #edf2f5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #edf2f5;
  background: #ffffff;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-main h2 {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
  color: #123c3e;
}

.count-badge {
  padding: 2px 8px;
  background: rgba(15, 110, 112, 0.06);
  color: #0f6e70;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 700;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 12px 24px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  background: #f8fafb;
  border-bottom: 1px solid #edf2f5;
  font-weight: 700;
}

.data-row {
  border-bottom: 1px solid #edf2f5;
  transition: background 0.15s ease;
}

.data-row:hover {
  background: #f8fafb;
}

.data-row:last-child {
  border-bottom: none;
}

.data-table td {
  padding: 16px 24px;
  vertical-align: middle;
  font-size: 0.88rem;
  color: #334155;
}

.company-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.company-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(15, 110, 112, 0.1);
  color: #0f6e70;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 0.95rem;
}

.company-name {
  display: block;
  font-size: 0.88rem;
  font-weight: 600;
  color: #123c3e;
  margin-bottom: 2px;
}

.category-tag {
  font-size: 0.68rem;
  color: #0f6e70;
  background: rgba(15, 110, 112, 0.06);
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-name {
  font-weight: 600;
  color: #123c3e;
  font-size: 0.88rem;
}

.contact-sub {
  font-size: 0.8rem;
  color: #64748b;
}

.service-stat {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1rem;
  font-weight: 700;
  color: #123c3e;
}

.stat-label {
  font-size: 0.68rem;
  color: #94a3b8;
  font-weight: 600;
}

.status-pill {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.status-pill.active {
  background: rgba(36, 168, 116, 0.1);
  color: #24a874;
}

.status-pill.inactive {
  background: #f1f5f9;
  color: #64748b;
}

.action-stack {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #edf2f5;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: grid;
  place-items: center;
  font-size: 0.88rem;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.action-btn.edit:hover {
  background: rgba(15, 110, 112, 0.08);
  color: #0f6e70;
  border-color: rgba(15, 110, 112, 0.2);
}

.action-btn.activate:hover {
  background: rgba(36, 168, 116, 0.1);
  color: #24a874;
  border-color: rgba(36, 168, 116, 0.2);
}

.action-btn.deactivate:hover {
  background: rgba(229, 154, 24, 0.1);
  color: #e59a18;
  border-color: rgba(229, 154, 24, 0.2);
}

.action-btn.delete:hover {
  background: rgba(241, 93, 93, 0.1);
  color: #f15d5d;
  border-color: rgba(241, 93, 93, 0.2);
}

/* States & Loaders */
.state-container {
  padding: 60px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #64748b;
}

.state-container h3 {
  margin: 0;
  color: #123c3e;
  font-size: 1rem;
  font-weight: 700;
}

.state-container p {
  margin: 0;
  font-size: 0.88rem;
}

.loader {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(15, 110, 112, 0.1);
  border-top-color: #0f6e70;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 2.2rem;
}

.text-button {
  background: none;
  border: none;
  color: #0f6e70;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
}

/* Buttons */
.primary-button {
  background: #0f6e70;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.primary-button:hover {
  background: #0a5c5d;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 110, 112, 0.15);
}

/* Modal Sheets */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(18, 60, 62, 0.25);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 24px;
}

.modal-window {
  background: #ffffff;
  width: 100%;
  max-width: 680px;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(18, 60, 62, 0.15);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border: 1px solid #edf2f5;
}

.modal-header {
  padding: 20px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #edf2f5;
  background: #ffffff;
}

.modal-header h2 {
  font-size: 1.15rem;
  margin: 4px 0 0;
  color: #123c3e;
  font-weight: 700;
}

.modal-body {
  padding: 28px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
  background: #f8fafb;
}

.form-section h3 {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #0f6e70;
  margin: 0 0 16px;
  font-weight: 800;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group.full-width {
  grid-column: span 2;
}

.input-group label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
}

.input-group input,
.input-group select,
.input-group textarea {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #edf2f5;
  background: #ffffff;
  font-family: inherit;
  font-size: 0.88rem;
  outline: none;
  transition: all 0.2s ease;
  color: #334155;
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  border-color: #0f6e70;
  box-shadow: 0 0 0 2px rgba(15, 110, 112, 0.08);
}

.modal-footer {
  padding: 18px 28px;
  background: #ffffff;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #edf2f5;
}

.cancel-btn {
  background: none;
  border: 1px solid #edf2f5;
  color: #64748b;
  font-weight: 700;
  cursor: pointer;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 0.88rem;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f8fafb;
}

.submit-btn {
  background: #0f6e70;
  color: #ffffff;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background: #0a5c5d;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: #f8fafb;
  color: #64748b;
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #edf2f5;
  color: #123c3e;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .input-group.full-width {
    grid-column: span 1;
  }

  .page-heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
