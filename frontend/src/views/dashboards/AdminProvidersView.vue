<template>
  <main class="admin-shell">
    <DashboardSidebar role="admin" />

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
          <span class="icon">＋</span> Add New Provider
        </button>
      </div>

      <div class="toolbar-row">
        <div class="search-box">
          <span class="search-icon">⌕</span>
          <input 
            v-model.trim="searchQuery" 
            type="search" 
            placeholder="Search by company, contact, or email..." 
          />
        </div>

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
          <div class="empty-icon">📭</div>
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
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import DashboardSidebar from '../../components/dashboard/DashboardSidebar.vue'
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
.admin-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 264px minmax(0, 1fr);
  gap: 18px;
  padding: 16px;
  background: #262626;
}

.admin-content {
  min-width: 0;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: linear-gradient(180deg, #f3f3f2 0%, #f8f8f6 100%);
  border-radius: 24px;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.heading-group h1 {
  margin: 4px 0 8px;
  font-size: clamp(2rem, 2.5vw, 2.8rem);
  color: #173f42;
  letter-spacing: -0.02em;
}

.eyebrow {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #7d8b88;
  font-weight: 700;
}

.page-description {
  color: #576666;
  max-width: 500px;
  line-height: 1.6;
}

/* Toolbar */
.toolbar-row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #8a9490;
  font-size: 1.2rem;
}

.search-box input {
  width: 100%;
  padding: 12px 12px 12px 48px;
  border-radius: 16px;
  border: 1px solid rgba(20, 31, 31, 0.08);
  background: #fff;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-box input:focus {
  border-color: #0f6e70;
  box-shadow: 0 0 0 4px rgba(15, 110, 112, 0.1);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 4px 16px;
  border-radius: 16px;
  border: 1px solid rgba(20, 31, 31, 0.08);
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #7d8b88;
}

.styled-select {
  border: 0;
  background: transparent;
  padding: 8px 0;
  font-weight: 600;
  color: #173f42;
  outline: none;
  cursor: pointer;
}

/* Table Card */
.table-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  border: 1px solid rgba(18, 31, 31, 0.06);
  box-shadow: 0 10px 30px rgba(18, 31, 31, 0.05);
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(18, 31, 31, 0.05);
}

.header-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-main h2 {
  font-size: 1.25rem;
  margin: 0;
  color: #173f42;
}

.count-badge {
  padding: 4px 10px;
  background: #edf4f3;
  color: #0f6e70;
  border-radius: 99px;
  font-size: 0.75rem;
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
  padding: 16px 24px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #8a9490;
  background: rgba(248, 250, 249, 0.5);
}

.data-row {
  border-bottom: 1px solid rgba(18, 31, 31, 0.03);
  transition: background 0.2s;
}

.data-row:hover {
  background: rgba(15, 110, 112, 0.02);
}

.data-table td {
  padding: 20px 24px;
  vertical-align: middle;
}

.company-cell {
  display: flex;
  align-items: center;
  gap: 14px;
}

.company-logo {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0f6e70, #0a5c5d);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 1.2rem;
}

.company-name {
  display: block;
  font-size: 1rem;
  color: #173f42;
  margin-bottom: 4px;
}

.category-tag {
  font-size: 0.75rem;
  color: #8a9490;
  background: #f1f3f2;
  padding: 2px 8px;
  border-radius: 6px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-name {
  font-weight: 600;
  color: #173f42;
}

.contact-sub {
  font-size: 0.85rem;
  color: #7d8b88;
}

.service-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
}

.stat-number {
  font-size: 1.2rem;
  font-weight: 800;
  color: #173f42;
}

.stat-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #8a9490;
  font-weight: 700;
}

.status-pill {
  display: inline-flex;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
}

.status-pill.active {
  background: #e6f6f2;
  color: #0a6d66;
}

.status-pill.inactive {
  background: #f4f4f5;
  color: #5f6d74;
}

.action-stack {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(18, 31, 31, 0.08);
  background: #fff;
  color: #576666;
  cursor: pointer;
  transition: all 0.2s;
  display: grid;
  place-items: center;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.action-btn.edit:hover {
  background: #edf4f3;
  color: #0f6e70;
  border-color: #0f6e70;
}

.action-btn.activate:hover {
  background: #e6f6f2;
  color: #0a6d66;
  border-color: #0a6d66;
}

.action-btn.deactivate:hover {
  background: #fff4e6;
  color: #b37400;
  border-color: #b37400;
}

.action-btn.delete:hover {
  background: #ffeaea;
  color: #b42f2f;
  border-color: #b42f2f;
}

/* States */
.state-container {
  padding: 60px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #edf4f3;
  border-top-color: #0f6e70;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 3rem;
}

.text-button {
  background: none;
  border: none;
  color: #0f6e70;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

/* Buttons */
.primary-button {
  background: linear-gradient(135deg, #0f6e70, #0a5c5d);
  color: #fff;
  border: none;
  padding: 14px 24px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 20px rgba(15, 110, 112, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(15, 110, 112, 0.25);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(23, 63, 66, 0.4);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 24px;
}

.modal-window {
  background: #fff;
  width: 100%;
  max-width: 780px;
  border-radius: 28px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f1f3f2;
}

.modal-body {
  padding: 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section h3 {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #0f6e70;
  margin: 0 0 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group.full-width {
  grid-column: span 2;
}

.input-group label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #173f42;
}

.input-group input,
.input-group select,
.input-group textarea {
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(20, 31, 31, 0.12);
  background: #fdfdfd;
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  border-color: #0f6e70;
}

.modal-footer {
  padding: 24px 32px;
  background: #f8faf9;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.cancel-btn {
  background: none;
  border: none;
  color: #576666;
  font-weight: 700;
  cursor: pointer;
  padding: 12px 20px;
}

.submit-btn {
  background: #0f6e70;
  color: #fff;
  border: none;
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.close-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: #f1f3f2;
  color: #173f42;
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 1.2rem;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }

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
