<template>
  <div class="provider-suite">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Provider Suite</h2>
        <p class="subtitle">HERITAGE MANAGEMENT</p>
      </div>

      <nav class="sidebar-nav">
        <RouterLink class="nav-item" :to="{ name: 'provider-dashboard' }" active-class="active">
          <span class="icon">⚙️</span>
          Command Center
        </RouterLink>
        <RouterLink class="nav-item" :to="{ name: 'provider-service' }" active-class="active">
          <span class="icon">🛠️</span>
          Service Manager
        </RouterLink>
        <RouterLink class="nav-item" :to="{ name: 'provider-inventory' }" active-class="active">
          <span class="icon">📊</span>
          Inventory & Pricing
        </RouterLink>
        <a href="#" class="nav-item" @click.prevent>
          <span class="icon">👥</span>
          Guest Manifest
        </a>
        <a href="#" class="nav-item" @click.prevent>
          <span class="icon">💰</span>
          Financial Ledger
        </a>
        <a href="#" class="nav-item" @click.prevent>
          <span class="icon">💬</span>
          Customer Chat
        </a>
        <a href="#" class="nav-item" @click.prevent>
          <span class="icon">🎨</span>
          Brand Settings
        </a>
      </nav>
    </aside>

    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <h1>Service Manager</h1>
          <div class="header-controls">
            <select class="month-select">
              <option>April 2026</option>
            </select>
            <div class="header-buttons">
              <button class="btn-secondary">Tours</button>
              <button class="btn-secondary">Hotels</button>
              <button class="btn-secondary">Transport</button>
              <button class="btn-primary">Create New Service</button>
            </div>
          </div>
        </div>
        <div class="header-icons">
          <button class="icon-btn">🔔</button>
          <button class="icon-btn">❓</button>
        </div>
      </header>

      <div class="content-wrapper">
        <section class="inventory-section">
          <div class="section-header">
            <h2>Tour Packages</h2>
            <p class="description">Manage and curate your premium temple expeditions and cultural walks.</p>
          </div>

          <div class="services-grid">
            <div class="services-header service-manager-header">
              <div class="header-cell">SERVICE DETAILS</div>
              <div class="header-cell">DESTINATIONS</div>
              <div class="header-cell">PRICING</div>
              <div class="header-cell">STATUS</div>
              <div class="header-cell">ACTIONS</div>
            </div>

            <article v-for="item in serviceItems" :key="item.name" class="service-row service-manager-row">
              <div class="service-info">
                <img :src="item.image" :alt="item.name" class="service-image" />
                <div class="service-details">
                  <h3>{{ item.name }}</h3>
                  <p>{{ item.subtitle }}</p>
                </div>
              </div>

              <div class="destinations">
                <span v-for="destination in item.destinations" :key="destination">{{ destination }}</span>
              </div>

              <div class="pricing">
                <strong>{{ item.price }}</strong>
                <p>Per ticket</p>
              </div>

              <div class="status">
                <span class="status-pill" :class="item.status.toLowerCase()">{{ item.status }}</span>
              </div>

              <div class="actions">
                <button>⋯</button>
              </div>
            </article>

            <div class="table-foot service-manager-foot">
              <p>Showing 1 to 3 of 12 tour packages</p>
              <div>
                <button class="page-btn">Previous</button>
                <button class="page-btn">Next</button>
              </div>
            </div>
          </div>
        </section>

        <aside class="config-panel">
          <div class="panel-header">
            <h3>Service Focus</h3>
            <button class="close-btn">✕</button>
          </div>

          <div class="config-section">
            <label>SELECTED SERVICE</label>
            <button type="button" class="date-display date-display-button" @click="showDatePicker = !showDatePicker">
              <span class="calendar-icon">🛠️</span>
              <div>
                <p class="date-range">{{ selectedDateRangeLabel }}</p>
                <p class="date-label">{{ selectedDateRangeSubtitle }}</p>
              </div>
            </button>

            <div v-if="showDatePicker" class="date-picker-popover">
              <div class="field-group compact">
                <label>Start Date</label>
                <input v-model="draftStartDate" type="date" />
              </div>
              <div class="field-group compact">
                <label>End Date</label>
                <input v-model="draftEndDate" type="date" />
              </div>
              <div class="picker-actions">
                <button type="button" class="picker-cancel" @click="resetDatePicker">Cancel</button>
                <button type="button" class="picker-apply" @click="applyDatePicker">Apply</button>
              </div>
            </div>
          </div>

          <div class="config-section">
            <label>AVAILABLE ACTIONS</label>
            <div class="pricing-rules">
              <div class="rule-item">
                <span>View package details</span>
                <p class="rule-desc">Open a service for more information</p>
              </div>
              <div class="rule-item">
                <span>Edit package pricing</span>
                <p class="rule-desc">Update ticket pricing and status</p>
              </div>
              <div class="rule-item">
                <span>Duplicate service</span>
                <p class="rule-desc">Create a copy for a new offering</p>
              </div>
            </div>
          </div>

          <button class="btn-update">Update Tour Package</button>
          <button class="btn-discard">Discard Changes</button>
        </aside>
      </div>

      <footer class="footer">
        <div class="curator-info">
          <img src="https://via.placeholder.com/40" alt="Somnang Chen" class="avatar" />
          <div>
            <p class="name">Somnang Chen</p>
            <p class="role">Service Curator</p>
          </div>
        </div>
        <button class="btn-icon-large"></button>
        <div class="tip-box">
          <p class="tip-title">Curator Tip</p>
          <p class="tip-text">Keep your packages consistent with the provider dashboard layout for easier scanning and management.</p>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const activeNav = ref("service");
const showDatePicker = ref(false);
const startDate = ref("2026-04-13");
const endDate = ref("2026-04-16");
const draftStartDate = ref(startDate.value);
const draftEndDate = ref(endDate.value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

const selectedDateRangeLabel = computed(() => `${formatDate(startDate.value)} - ${formatDate(endDate.value)}`);
const selectedDateRangeSubtitle = computed(() => "Khmer New Year Period");

const applyDatePicker = () => {
  startDate.value = draftStartDate.value;
  endDate.value = draftEndDate.value;
  showDatePicker.value = false;
};

const resetDatePicker = () => {
  draftStartDate.value = startDate.value;
  draftEndDate.value = endDate.value;
  showDatePicker.value = false;
};

const serviceItems = [
  {
    name: "Angkor Wat Sunrise Premium",
    subtitle: "Private Guided • 8 Hours",
    destinations: ["Angkor Wat", "Bayon"],
    price: "$125.00",
    status: "Live",
    image: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=120&q=80",
  },
  {
    name: "Banteay Srei & Countryside",
    subtitle: "Full Day Expedition",
    destinations: ["Banteay Srei"],
    price: "$85.00",
    status: "Draft",
    image: "https://images.unsplash.com/photo-1528184039939-bd03972bd974?auto=format&fit=crop&w=120&q=80",
  },
  {
    name: "Spiritual Alms Giving & Pagoda",
    subtitle: "Cultural Walk • 3 Hours",
    destinations: ["Local Pagoda"],
    price: "$45.00",
    status: "Live",
    image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=120&q=80",
  },
];
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.provider-suite {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.sidebar {
  width: 200px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
  overflow-y: auto;
}

.sidebar-header {
  margin-bottom: 30px;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 11px;
  color: #999;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  text-decoration: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #f0f0f0;
}

.nav-item.active {
  background: #e8f4f0;
  color: #1b7f6a;
  border-left: 3px solid #1b7f6a;
  padding-left: 9px;
}

.nav-item .icon {
  font-size: 16px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.header-left h1 {
  margin: 0;
  font-size: 24px;
  color: #1a1a1a;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.month-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  background: white;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.btn-secondary {
  padding: 8px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f9f9f9;
}

.btn-primary {
  padding: 8px 16px;
  background: #1b7f6a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #166a57;
}

.header-icons {
  display: flex;
  gap: 15px;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
}

.content-wrapper {
  display: flex;
  flex: 1;
  padding: 30px;
  gap: 30px;
}

.inventory-section {
  flex: 1;
}

.section-header {
  margin-bottom: 20px;
  border-left: 4px solid #f0ad4e;
  padding-left: 15px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1a1a1a;
}

.description {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #999;
}

.services-grid {
  background: white;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 20px;
}

.services-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  padding: 12px;
}

.service-manager-header {
  letter-spacing: 1px;
}

.header-cell {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-align: center;
  text-transform: uppercase;
}

.header-cell:first-child {
  text-align: left;
}

.service-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  border-bottom: 1px solid #f0f0f0;
  padding: 12px;
  align-items: center;
}

.service-manager-row {
  cursor: default;
}

.service-row:last-of-type {
  border-bottom: none;
}

.service-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
}

.service-details h3 {
  margin: 0;
  font-size: 14px;
  color: #1a1a1a;
}

.service-details p {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #999;
}

.destinations {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.destinations span {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 8px 12px;
  background: #e8f4f0;
  color: #1b7f6a;
  font-size: 12px;
  font-weight: 600;
}

.pricing {
  text-align: center;
}

.pricing strong {
  font-size: 14px;
  font-weight: 600;
  color: #1b7f6a;
}

.pricing p {
  font-size: 12px;
  color: #999;
  margin: 2px 0 0 0;
}

.status {
  text-align: center;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 62px;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-pill.live {
  background: #e7f6eb;
  color: #2d8b49;
}

.status-pill.draft {
  background: #eef1f4;
  color: #6a7580;
}

.actions {
  text-align: center;
}

.actions button {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(111, 126, 134, 0.15);
  border-radius: 999px;
  background: #fff;
  color: #5e6a73;
}

.table-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 6px 4px;
  color: #7d8790;
  font-size: 13px;
}

.service-manager-foot {
  padding-top: 18px;
}

.table-foot div {
  display: flex;
  gap: 10px;
}

.config-panel {
  width: 280px;
  background: white;
  border-radius: 6px;
  padding: 20px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
}

.config-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.config-section label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #999;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.date-display {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.date-display-button {
  width: 100%;
  border: 0;
  text-align: left;
  cursor: pointer;
}

.date-picker-popover {
  margin-top: 10px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #e7ebea;
  background: #ffffff;
  box-shadow: 0 12px 24px rgba(33, 49, 58, 0.08);
}

.compact {
  margin-bottom: 10px;
}

.compact input {
  width: 100%;
}

.picker-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.picker-cancel,
.picker-apply {
  border: 0;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
}

.picker-cancel {
  background: #f1f3f2;
  color: #55656d;
}

.picker-apply {
  background: #0f7c7f;
  color: #ffffff;
}

.calendar-icon {
  font-size: 20px;
}

.date-range {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}

.date-label {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #999;
}

.pricing-rules {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-item {
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.rule-item span {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
}

.rule-desc {
  margin: 2px 0 0 0;
  font-size: 11px;
  color: #999;
}

.btn-update {
  width: 100%;
  padding: 12px;
  background: #1b7f6a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  margin-top: 20px;
}

.btn-discard {
  width: 100%;
  padding: 10px;
  background: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 8px;
}

.footer {
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 20px 30px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.curator-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.name {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}

.role {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #999;
}

.btn-icon-large {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0ad4e;
  border: none;
  cursor: pointer;
  font-size: 20px;
}

.tip-box {
  margin-left: auto;
  background: #d4f0eb;
  padding: 12px 16px;
  border-radius: 6px;
  border-left: 4px solid #1b7f6a;
}

.tip-title {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #1b7f6a;
}

.tip-text {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #555;
  line-height: 1.4;
}

@media (max-width: 1180px) {
  .provider-suite {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .content-wrapper {
    flex-direction: column;
  }

  .config-panel {
    width: 100%;
    max-height: none;
  }

  .header,
  .footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-controls {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-buttons {
    flex-wrap: wrap;
  }

  .services-header,
  .service-row {
    grid-template-columns: 1.5fr 1fr 1fr 0.8fr 0.5fr;
  }
}
</style>