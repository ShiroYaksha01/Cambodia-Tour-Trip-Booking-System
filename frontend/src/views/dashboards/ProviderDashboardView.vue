<template>
  <div class="provider-suite">
    <!-- Sidebar -->
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

    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="header">
        <div class="header-left">
          <h1>The Heritage Curator</h1>
          <div class="header-controls">
            <select class="month-select">
              <option>April 2026</option>
            </select>
            <div class="search-container">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search services..."
                class="search-input"
              />
              <span class="search-icon">🔍</span>
            </div>
            <div class="header-buttons">
              <button
                class="btn-secondary"
                :class="{ active: activeCategory === 'tours' }"
                @click="activeCategory = 'tours'"
              >
                Tours
              </button>
              <button
                class="btn-secondary"
                :class="{ active: activeCategory === 'stays' }"
                @click="activeCategory = 'stays'"
              >
                Stays
              </button>
              <button
                class="btn-secondary"
                :class="{ active: activeCategory === 'transport' }"
                @click="activeCategory = 'transport'"
              >
                Transport
              </button>
              <button class="btn-primary">Sync All Calendars</button>
            </div>
          </div>
        </div>
        <div class="header-icons">
          <button class="icon-btn">🔔</button>
          <button class="icon-btn">❓</button>
        </div>
      </header>

      <!-- Content Area -->
      <div class="content-wrapper">
        <!-- Inventory Matrix -->
        <section class="inventory-section">
          <div class="section-header">
            <h2>{{ activeCategoryData.title }}</h2>
            <p class="description">{{ activeCategoryData.description }}</p>
          </div>

          <div class="services-grid">
            <div class="services-header">
              <div class="header-cell">SERVICE TYPE</div>
              <div v-for="day in activeCategoryData.days" :key="day.label" class="header-cell">
                {{ day.label }}<br>{{ day.date }}
              </div>
            </div>

            <div class="service-row" v-for="service in filteredServices" :key="service.id" @click="openServiceDetail(service)" style="cursor: pointer;">
              <div class="service-info">
                <img :src="service.image" :alt="service.name" class="service-image">
                <div class="service-details">
                  <h3>{{ service.name }}</h3>
                  <p>{{ service.type }}</p>
                </div>
              </div>
              <div class="availability-cell" v-for="(avail, idx) in service.availability" :key="idx">
                <div class="price">${{ avail.price }}</div>
                <div class="slots">{{ avail.slots }} Left</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Right Panel: Bulk Configuration -->
        <aside class="config-panel">
          <div class="panel-header">
            <h3>Bulk Configuration</h3>
            <button class="close-btn">✕</button>
          </div>

          <div class="config-section">
            <label>SELECTED DATE RANGE</label>
            <button type="button" class="date-display date-display-button" @click="showDatePicker = !showDatePicker">
              <span class="calendar-icon">📅</span>
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
            <label>INVENTORY CAPACITY</label>
            <div class="capacity-control">
              <span class="capacity-value">25</span>
              <div class="capacity-buttons">
                <button class="btn-icon">−</button>
                <button class="btn-icon">+</button>
              </div>
            </div>
            <p class="helper-text">{{ activeCategoryData.capacityHelper }}</p>
          </div>

          <div class="config-section">
            <label>{{ activeCategoryData.panelLabel }}</label>
            <div class="pricing-badge">{{ activeCategoryData.panelBadge }}</div>
            <div class="pricing-rules">
              <div class="rule-item">
                <input type="checkbox" checked>
                <span>{{ activeCategoryData.primaryRule.title }}</span>
                <p class="rule-desc">{{ activeCategoryData.primaryRule.description }}</p>
                <button class="btn-remove">✕</button>
              </div>
              <div class="rule-item">
                <input type="checkbox">
                <span>{{ activeCategoryData.secondaryRule.title }}</span>
                <p class="rule-desc">{{ activeCategoryData.secondaryRule.description }}</p>
              </div>
              <div class="rule-item">
                <input type="checkbox">
                <span>{{ activeCategoryData.tertiaryRule.title }}</span>
                <p class="rule-desc">{{ activeCategoryData.tertiaryRule.description }}</p>
              </div>
            </div>
            <button class="btn-link">{{ activeCategoryData.ruleAction }}</button>
          </div>

          <button class="btn-update">{{ activeCategoryData.updateAction }}</button>
          <button class="btn-discard">Discard Changes</button>
        </aside>
      </div>
      <!-- Detail Modal -->
      <div v-if="selectedService" class="modal-overlay" @click="closeServiceDetail">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ selectedService.name }}</h2>
            <button class="modal-close" @click="closeServiceDetail">✕</button>
          </div>
          <div class="modal-body">
            <div class="modal-image-section">
              <img :src="selectedService.image" :alt="selectedService.name" class="modal-image">
            </div>
            <div class="modal-info">
              <div class="info-group">
                <label>Type</label>
                <p>{{ selectedService.type }}</p>
              </div>
              <div class="info-group">
                <label>Availability Schedule</label>
                <div class="availability-table">
                  <div class="avail-header">
                    <span v-for="day in activeCategoryData.days" :key="day.label">{{ day.label }} {{ day.date }}</span>
                  </div>
                  <div class="avail-row" v-if="isEditingService">
                    <div v-for="(avail, idx) in editingAvailability" :key="idx" class="avail-item editable">
                      <div class="input-group compact">
                        <label>Price</label>
                        <input v-model.number="avail.price" type="number" min="0" step="0.01" />
                      </div>
                      <div class="input-group compact">
                        <label>Slots</label>
                        <input v-model.number="avail.slots" type="number" min="0" />
                      </div>
                    </div>
                  </div>
                  <div class="avail-row" v-else>
                    <div v-for="(avail, idx) in selectedService.availability" :key="idx" class="avail-item">
                      <div class="avail-price">${{ avail.price }}</div>
                      <div class="avail-slots">{{ avail.slots }} slots</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="info-group">
                <label>Total Available</label>
                <p class="total-slots">{{ editingAvailability.reduce((sum, a) => sum + a.slots, 0) }} slots</p>
              </div>
              <div class="info-group">
                <label>Average Price</label>
                <p class="avg-price">${{ (editingAvailability.reduce((sum, a) => sum + a.price, 0) / editingAvailability.length).toFixed(2) }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <template v-if="!isEditingService">
              <button class="btn-cancel" @click="closeServiceDetail">Close</button>
              <button class="btn-edit" @click="startEditing">Edit Service</button>
            </template>
            <template v-else>
              <button class="btn-cancel" @click="cancelEditing">Cancel</button>
              <button class="btn-edit" @click="saveServiceChanges">Save Changes</button>
            </template>
          </div>
        </div>
      </div>
      <!-- Footer -->
      <footer class="footer">
        <div class="curator-info">
          <img src="https://via.placeholder.com/40" alt="Somnang Chen" class="avatar">
          <div>
            <p class="name">Somnang Chen</p>
            <p class="role">Senior Curator</p>
          </div>
        </div>
        <button class="btn-icon-large"></button>
        <div class="tip-box">
          <p class="tip-title">Curator Tip</p>
          <p class="tip-text">Peak season prices are typically 25% higher during Khmer New Year. Ensure your availability is maximized!</p>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

type ServiceRow = {
  id: number;
  name: string;
  type: string;
  image: string;
  availability: Array<{ price: number; slots: number }>;
};

type CategoryKey = "tours" | "stays" | "transport";

type CategoryData = {
  title: string;
  description: string;
  days: Array<{ label: string; date: string }>;
  services: ServiceRow[];
  metrics: {
    occupancy: string;
    occupancyLabel: string;
    alerts: string;
    alertsLabel: string;
    rules: string;
    rulesLabel: string;
    revenue: string;
    revenueLabel: string;
  };
  capacityHelper: string;
  panelLabel: string;
  panelBadge: string;
  primaryRule: { title: string; description: string };
  secondaryRule: { title: string; description: string };
  tertiaryRule: { title: string; description: string };
  ruleAction: string;
  updateAction: string;
};

const selectedService = ref<ServiceRow | null>(null);
const isEditingService = ref(false);
const editingAvailability = ref<Array<{ price: number; slots: number }>>([]);
const showDatePicker = ref(false);
const startDate = ref("2026-04-13");
const endDate = ref("2026-04-16");
const draftStartDate = ref(startDate.value);
const draftEndDate = ref(endDate.value);
const activeCategory = ref<CategoryKey>("tours");
const searchQuery = ref("");

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

const selectedDateRangeLabel = computed(() => `${formatDate(startDate.value)} - ${formatDate(endDate.value)}`);
const selectedDateRangeSubtitle = computed(() => "Khmer New Year Period");

const filteredServices = computed(() => {
  const services = activeCategoryData.value.services;
  if (!searchQuery.value.trim()) {
    return services;
  }
  const query = searchQuery.value.toLowerCase();
  return services.filter(
    (service) =>
      service.name.toLowerCase().includes(query) ||
      service.type.toLowerCase().includes(query)
  );
});

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

const categoryData: Record<CategoryKey, CategoryData> = {
  tours: {
    title: "Inventory Matrix",
    description: "Master availability control for peak season tours.",
    days: [
      { label: "MON", date: "01" },
      { label: "TUE", date: "02" },
      { label: "WED", date: "03" },
      { label: "THU", date: "04" },
    ],
    services: [
      { id: 1, name: "Angkor Sunrise", type: "Private Tour", image: "https://picsum.photos/50/50?random=1", availability: [{ price: 45, slots: 24 }, { price: 49, slots: 2 }, { price: 45, slots: 16 }, { price: 45, slots: 9 }] },
      { id: 2, name: "Floating Village", type: "Shared Tour", image: "https://picsum.photos/50/50?random=2", availability: [{ price: 28, slots: 15 }, { price: 28, slots: 15 }, { price: 28, slots: 12 }, { price: 28, slots: 10 }] },
      { id: 3, name: "Night Food Tour", type: "Tuk-Tuk Event", image: "https://picsum.photos/50/50?random=3", availability: [{ price: 32, slots: 8 }, { price: 32, slots: 9 }, { price: 32, slots: 12 }, { price: 32, slots: 12 }] },
    ],
    metrics: {
      occupancy: "84.2%",
      occupancyLabel: "Avg. Occupancy",
      alerts: "12",
      alertsLabel: "Low Stock Alerts",
      rules: "3",
      rulesLabel: "Active Surcharges",
      revenue: "+$12.4k",
      revenueLabel: "Month-on-Month Revenue",
    },
    capacityHelper: "Sets base capacity for 4 selected services across 4 days.",
    panelLabel: "Pricing Engine",
    panelBadge: "SMART RULE",
    primaryRule: { title: "+20% Seasonal Surcharge", description: "Applied to Holiday range" },
    secondaryRule: { title: "$10 Fixed Holiday Fee", description: "Add-on per person" },
    tertiaryRule: { title: "Early Bird Discount", description: "-15% for bookings > 30 days" },
    ruleAction: "Define New Seasonal Rule",
    updateAction: "Update 16 Cells",
  },
  stays: {
    title: "Stay Availability Matrix",
    description: "Manage room inventory, occupancy, and seasonal stay rates.",
    days: [
      { label: "MON", date: "01" },
      { label: "TUE", date: "02" },
      { label: "WED", date: "03" },
      { label: "THU", date: "04" },
    ],
    services: [
      { id: 11, name: "Riverside Suite", type: "Luxury Stay", image: "https://picsum.photos/50/50?random=11", availability: [{ price: 180, slots: 6 }, { price: 195, slots: 4 }, { price: 210, slots: 3 }, { price: 225, slots: 2 }] },
      { id: 12, name: "Heritage Villa", type: "Boutique Stay", image: "https://picsum.photos/50/50?random=12", availability: [{ price: 140, slots: 8 }, { price: 145, slots: 7 }, { price: 155, slots: 5 }, { price: 160, slots: 4 }] },
      { id: 13, name: "Courtyard Bungalow", type: "Family Stay", image: "https://picsum.photos/50/50?random=13", availability: [{ price: 95, slots: 12 }, { price: 95, slots: 10 }, { price: 105, slots: 8 }, { price: 110, slots: 7 }] },
    ],
    metrics: {
      occupancy: "76.8%",
      occupancyLabel: "Room Occupancy",
      alerts: "8",
      alertsLabel: "Room Hold Alerts",
      rules: "5",
      rulesLabel: "Stay Rate Rules",
      revenue: "+$18.9k",
      revenueLabel: "Stay Revenue",
    },
    capacityHelper: "Sets room capacity and rate controls across 4 stay categories.",
    panelLabel: "Rate Engine",
    panelBadge: "STAY RULE",
    primaryRule: { title: "+18% Peak Stay Rate", description: "Applied during high-demand nights" },
    secondaryRule: { title: "$20 Weekend Cleaning Fee", description: "Applied per booking" },
    tertiaryRule: { title: "Long Stay Discount", description: "-10% for 5+ night bookings" },
    ruleAction: "Define New Stay Rule",
    updateAction: "Update Stay Rates",
  },
  transport: {
    title: "Transport Allocation Matrix",
    description: "Track vehicle availability, route capacity, and peak transfers.",
    days: [
      { label: "MON", date: "01" },
      { label: "TUE", date: "02" },
      { label: "WED", date: "03" },
      { label: "THU", date: "04" },
    ],
    services: [
      { id: 21, name: "Airport Shuttle", type: "Shared Transfer", image: "https://picsum.photos/50/50?random=21", availability: [{ price: 22, slots: 18 }, { price: 22, slots: 20 }, { price: 25, slots: 16 }, { price: 25, slots: 14 }] },
      { id: 22, name: "Temple Van", type: "Private Transfer", image: "https://picsum.photos/50/50?random=22", availability: [{ price: 40, slots: 10 }, { price: 40, slots: 9 }, { price: 45, slots: 8 }, { price: 45, slots: 6 }] },
      { id: 23, name: "Sunset Tuk-Tuk", type: "Local Ride", image: "https://picsum.photos/50/50?random=23", availability: [{ price: 14, slots: 24 }, { price: 14, slots: 22 }, { price: 16, slots: 18 }, { price: 16, slots: 18 }] },
    ],
    metrics: {
      occupancy: "68.4%",
      occupancyLabel: "Fleet Occupancy",
      alerts: "6",
      alertsLabel: "Vehicle Alerts",
      rules: "4",
      rulesLabel: "Transport Rules",
      revenue: "+$9.7k",
      revenueLabel: "Transport Revenue",
    },
    capacityHelper: "Sets vehicle allocation and route capacity across 4 transport services.",
    panelLabel: "Dispatch Engine",
    panelBadge: "TRANSPORT RULE",
    primaryRule: { title: "+15% Peak Transfer Surcharge", description: "Applied during busy arrival windows" },
    secondaryRule: { title: "$8 Late Pickup Fee", description: "Applied when departure is delayed" },
    tertiaryRule: { title: "Early Dispatch Discount", description: "-12% for off-peak rides" },
    ruleAction: "Define New Transport Rule",
    updateAction: "Update Fleet Capacity",
  },
};

const activeCategoryData = computed(() => categoryData[activeCategory.value]);

const openServiceDetail = (service: ServiceRow) => {
  selectedService.value = service;
  editingAvailability.value = JSON.parse(JSON.stringify(service.availability));
  isEditingService.value = false;
};

const closeServiceDetail = () => {
  selectedService.value = null;
  isEditingService.value = false;
};

const startEditing = () => {
  isEditingService.value = true;
};

const cancelEditing = () => {
  if (selectedService.value) {
    editingAvailability.value = JSON.parse(JSON.stringify(selectedService.value.availability));
  }
  isEditingService.value = false;
};

const saveServiceChanges = () => {
  if (selectedService.value) {
    selectedService.value.availability = JSON.parse(JSON.stringify(editingAvailability.value));
    isEditingService.value = false;
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.provider-suite {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* Sidebar */
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
  margin: 4px 0 0 0;
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

/* Main Content */
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

.btn-secondary.active {
  background: #e8f4f0;
  border-color: #1b7f6a;
  color: #1b7f6a;
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

/* Content Wrapper */
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

/* Services Grid */
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

.service-row:last-child {
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

.availability-cell {
  text-align: center;
}

.price {
  font-size: 14px;
  font-weight: 600;
  color: #1b7f6a;
}

.slots {
  font-size: 12px;
  color: #999;
}

/* Metrics Row */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-top: 20px;
}

.metric {
  background: white;
  padding: 20px;
  border-radius: 6px;
  text-align: center;
  position: relative;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 12px;
  color: #999;
}

.metric span {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 18px;
}

/* Config Panel */
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
  letter-spacing: 0.5px;
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

.capacity-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.capacity-value {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.capacity-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f0f0f0;
}

.helper-text {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #999;
}

.pricing-badge {
  display: inline-block;
  background: #f0ad4e;
  color: white;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 10px;
}

.pricing-rules {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
  position: relative;
}

.rule-item input[type="checkbox"] {
  margin-top: 4px;
  cursor: pointer;
}

.rule-item span {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
  flex: 1;
}

.rule-desc {
  margin: 2px 0 0 0;
  font-size: 11px;
  color: #999;
}

.btn-remove {
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 14px;
}

.btn-link {
  background: none;
  border: none;
  color: #1b7f6a;
  cursor: pointer;
  font-size: 13px;
  text-decoration: underline;
  padding: 0;
  margin-top: 10px;
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

/* Footer */
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 22px;
  color: #1a1a1a;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #1a1a1a;
}

.modal-body {
  padding: 24px;
}

.modal-image-section {
  margin-bottom: 24px;
}

.modal-image {
  width: 100%;
  height: 300px;
  border-radius: 8px;
  object-fit: cover;
}

.modal-info {
  display: grid;
  gap: 20px;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-group label {
  font-size: 12px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-group p {
  margin: 0;
  font-size: 16px;
  color: #1a1a1a;
}

.total-slots {
  font-size: 20px;
  font-weight: 600;
  color: #1b7f6a;
}

.avg-price {
  font-size: 20px;
  font-weight: 600;
  color: #1b7f6a;
}

.availability-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.avail-header {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: #f5f5f5;
  padding: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-align: center;
}

.avail-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 12px;
}

.avail-item {
  text-align: center;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 6px;
}

.avail-price {
  font-size: 14px;
  font-weight: 600;
  color: #1b7f6a;
}

.avail-slots {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  background: #f9f9f9;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f0f0f0;
}

.btn-edit {
  flex: 1;
  padding: 12px;
  border: none;
  background: #1b7f6a;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-edit:hover {
  background: #166a57;
}

.input-group.compact {
  margin-bottom: 8px;
}

.input-group.compact label {
  font-size: 11px;
  font-weight: 600;
  color: #999;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-group.compact input {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 13px;
  color: #1a1a1a;
}

.avail-item.editable {
  display: grid;
  gap: 6px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 12px 8px 32px;
  font-size: 13px;
  width: 200px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #20a084;
  background-color: #fafafa;
}

.search-icon {
  position: absolute;
  left: 10px;
  font-size: 14px;
  color: #999;
  pointer-events: none;
}
</style>
