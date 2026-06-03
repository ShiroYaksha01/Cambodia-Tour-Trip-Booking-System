<template>
  <AdminLayout breadcrumb="Management / Settings" @search="(q) => searchQuery = q">
    <section class="admin-content">
      <div class="page-heading">
        <div class="heading-group">
          <p class="eyebrow">Platform Configuration</p>
          <h1>System Settings</h1>
          <p class="page-description">
            Manage global platform rules, service fees, and administrative preferences.
          </p>
        </div>
        
        <div class="toolbar-actions">
          <button class="secondary-button" @click="resetForm">Discard Changes</button>
          <button class="primary-button" @click="saveSettings" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Settings' }}
          </button>
        </div>
      </div>

      <div class="settings-layout">
        <!-- Settings Sidebar / Tabs -->
        <aside class="settings-nav">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['nav-btn', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </aside>

        <!-- Settings Content -->
        <div class="settings-body">
          <div v-if="activeTab === 'general'" class="settings-panel">
            <h2>General Configuration</h2>
            <p class="panel-desc">Basic information about the platform and contact details.</p>
            
            <div class="form-grid">
              <div class="input-group full">
                <label>Platform Name</label>
                <input type="text" v-model="form.platformName" />
              </div>
              <div class="input-group">
                <label>Support Email</label>
                <input type="email" v-model="form.supportEmail" />
              </div>
              <div class="input-group">
                <label>Support Phone</label>
                <input type="tel" v-model="form.supportPhone" />
              </div>
              <div class="input-group full">
                <label>System Maintenance Mode</label>
                <div class="toggle-wrap">
                  <label class="switch">
                    <input type="checkbox" v-model="form.maintenanceMode">
                    <span class="slider round"></span>
                  </label>
                  <span class="toggle-label">Disable user logins temporarily</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'financial'" class="settings-panel">
            <h2>Financial & Fees</h2>
            <p class="panel-desc">Configure commission rates and payment gateway integrations.</p>
            
            <div class="form-grid">
              <div class="input-group">
                <label>Platform Commission Fee (%)</label>
                <input type="number" step="0.1" v-model="form.commissionRate" />
                <span class="hint">Applied to all successful provider bookings.</span>
              </div>
              <div class="input-group">
                <label>Default Currency</label>
                <select v-model="form.currency">
                  <option value="USD">USD ($)</option>
                  <option value="KHR">KHR (៛)</option>
                </select>
              </div>
              <div class="input-group full">
                <label>Enable Auto-Payouts</label>
                <div class="toggle-wrap">
                  <label class="switch">
                    <input type="checkbox" v-model="form.autoPayouts">
                    <span class="slider round"></span>
                  </label>
                  <span class="toggle-label">Automatically disburse funds to providers weekly</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'security'" class="settings-panel">
            <h2>Security Settings</h2>
            <p class="panel-desc">Manage authentication rules and security policies.</p>
            
            <div class="form-grid">
              <div class="input-group full">
                <label>Require Provider Verification</label>
                <div class="toggle-wrap">
                  <label class="switch">
                    <input type="checkbox" v-model="form.requireVerification">
                    <span class="slider round"></span>
                  </label>
                  <span class="toggle-label">Providers must be manually verified before publishing packages</span>
                </div>
              </div>
              <div class="input-group">
                <label>Session Timeout (Minutes)</label>
                <input type="number" v-model="form.sessionTimeout" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </AdminLayout>

  <transition name="fade">
    <div v-if="toast.visible" class="toast success">{{ toast.message }}</div>
  </transition>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import AdminLayout from '../../components/admin/AdminLayout.vue'

const searchQuery = ref('')
const activeTab = ref('general')
const saving = ref(false)

const toast = ref({ visible: false, message: '' })

const tabs = [
  { id: 'general', label: 'General Configuration' },
  { id: 'financial', label: 'Financial & Fees' },
  { id: 'security', label: 'Security & Access' },
]

const form = reactive({
  platformName: 'Tour Booking System',
  supportEmail: 'admin@tourbooking.local',
  supportPhone: '+855 12 345 678',
  maintenanceMode: false,
  commissionRate: 15.0,
  currency: 'USD',
  autoPayouts: true,
  requireVerification: true,
  sessionTimeout: 120,
})

const originalForm = JSON.stringify(form)

const resetForm = () => {
  if (confirm('Are you sure you want to discard unsaved changes?')) {
    Object.assign(form, JSON.parse(originalForm))
  }
}

const saveSettings = () => {
  saving.value = true
  // Mock API call
  setTimeout(() => {
    saving.value = false
    toast.value = { visible: true, message: 'Settings saved successfully.' }
    setTimeout(() => toast.value.visible = false, 3000)
  }, 800)
}
</script>

<style scoped>
.admin-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 24px;
  gap: 20px;
}

.heading-group h1 {
  margin: 6px 0 8px;
  font-size: 1.8rem;
  color: #111827;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.eyebrow {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #148A74;
  font-weight: 700;
  margin: 0;
}

.page-description {
  color: #6B7280;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
  max-width: 600px;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.primary-button {
  background: #148A74;
  color: #ffffff;
  border: none;
  padding: 0 20px;
  height: 40px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.primary-button:hover:not(:disabled) {
  background: #0f6e5c;
}

.primary-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.secondary-button {
  background: #ffffff;
  color: #4B5563;
  border: 1px solid #E5E7EB;
  padding: 0 20px;
  height: 40px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.secondary-button:hover {
  background: #F9FAFB;
  color: #111827;
}

/* Settings Layout */
.settings-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 32px;
  align-items: flex-start;
}

.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-btn {
  text-align: left;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4B5563;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.nav-btn:hover {
  background: #F3F4F6;
  color: #111827;
}

.nav-btn.active {
  background: rgba(20, 138, 116, 0.1);
  color: #148A74;
}

.settings-panel {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.02);
}

.settings-panel h2 {
  margin: 0 0 6px;
  font-size: 1.25rem;
  color: #111827;
  font-weight: 700;
}

.panel-desc {
  margin: 0 0 24px;
  font-size: 0.85rem;
  color: #6B7280;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group.full {
  grid-column: span 2;
}

.input-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}

.input-group input[type="text"],
.input-group input[type="email"],
.input-group input[type="tel"],
.input-group input[type="number"],
.input-group select {
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  background: #F9FAFB;
  font-family: inherit;
  font-size: 0.88rem;
  color: #111827;
  outline: none;
  transition: all 0.2s ease;
}

.input-group input:focus,
.input-group select:focus {
  border-color: #148A74;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(20, 138, 116, 0.1);
}

.hint {
  font-size: 0.75rem;
  color: #9CA3AF;
}

/* Toggle Switch */
.toggle-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-label {
  font-size: 0.85rem;
  color: #4B5563;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #E5E7EB;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #148A74;
}

input:focus + .slider {
  box-shadow: 0 0 1px #148A74;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}

.toast { 
  position: fixed; 
  bottom: 24px; 
  right: 24px; 
  padding: 12px 22px; 
  border-radius: 8px; 
  font-size: 0.85rem; 
  font-weight: 600; 
  z-index: 9999; 
  box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
  background: #ffffff; 
  color: #148A74; 
  border-left: 4px solid #148A74; 
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 1024px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }
  .settings-nav {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 8px;
  }
  .nav-btn {
    white-space: nowrap;
  }
}
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .input-group.full {
    grid-column: span 1;
  }
}
</style>
