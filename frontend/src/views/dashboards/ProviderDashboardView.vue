<template>
  <div class="provider-suite">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Provider Suite</h2>
        <p class="subtitle">HERITAGE MANAGEMENT</p>
      </div>
      <nav class="sidebar-nav">
        <a href="#" class="nav-item" :class="{ active: activeNav === 'command' }" @click="activeNav = 'command'">
          <span class="icon">⚙️</span>
          Command Center
        </a>
        <a href="#" class="nav-item" :class="{ active: activeNav === 'service' }" @click="activeNav = 'service'">
          <span class="icon">🛠️</span>
          Service Manager
        </a>
        <a href="#" class="nav-item" :class="{ active: activeNav === 'inventory' }" @click="activeNav = 'inventory'">
          <span class="icon">📊</span>
          Inventory & Pricing
        </a>
        <a href="#" class="nav-item" :class="{ active: activeNav === 'guest' }" @click="activeNav = 'guest'">
          <span class="icon">👥</span>
          Guest Manifest
        </a>
        <a href="#" class="nav-item" :class="{ active: activeNav === 'financial' }" @click="activeNav = 'financial'">
          <span class="icon">💰</span>
          Financial Ledger
        </a>
        <a href="#" class="nav-item" :class="{ active: activeNav === 'chat' }" @click="activeNav = 'chat'">
          <span class="icon">💬</span>
          Customer Chat
        </a>
        <a href="#" class="nav-item" :class="{ active: activeNav === 'brand' }" @click="activeNav = 'brand'">
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
              <option>April 2024</option>
            </select>
            <div class="header-buttons">
              <button class="btn-secondary">Tours</button>
              <button class="btn-secondary">Stays</button>
              <button class="btn-secondary">Transport</button>
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
            <h2>Inventory Matrix</h2>
            <p class="description">Master availability control for peak season operations.</p>
          </div>

          <div class="services-grid">
            <div class="services-header">
              <div class="header-cell">SERVICE TYPE</div>
              <div class="header-cell">MON<br>01</div>
              <div class="header-cell">TUE<br>02</div>
              <div class="header-cell">WED<br>03</div>
              <div class="header-cell">THU<br>04</div>
            </div>

            <div class="service-row" v-for="service in services" :key="service.id">
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

          <!-- Metrics -->
          <div class="metrics-row">
            <div class="metric">
              <div class="metric-value">84.2%</div>
              <div class="metric-label">Avg. Occupancy</div>
              <span class="trend-up">📈</span>
            </div>
            <div class="metric">
              <div class="metric-value">12</div>
              <div class="metric-label">Low Stock Alerts</div>
              <span class="alert-icon">⚠️</span>
            </div>
            <div class="metric">
              <div class="metric-value">3</div>
              <div class="metric-label">Active Surcharges</div>
              <span class="active-icon">⚡</span>
            </div>
            <div class="metric">
              <div class="metric-value">+$12.4k</div>
              <div class="metric-label">Month-on-Month Revenue</div>
              <span class="revenue-icon">📊</span>
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
            <div class="date-display">
              <span class="calendar-icon">📅</span>
              <div>
                <p class="date-range">April 13 - April 16, 2024</p>
                <p class="date-label">Khmer New Year Period</p>
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
            <p class="helper-text">Sets base capacity for 4 selected services across 4 days.</p>
          </div>

          <div class="config-section">
            <label>PRICING ENGINE</label>
            <div class="pricing-badge">SMART RULE</div>
            <div class="pricing-rules">
              <div class="rule-item">
                <input type="checkbox" checked>
                <span>+20% Seasonal Surcharge</span>
                <p class="rule-desc">Applied to Holiday range</p>
                <button class="btn-remove">✕</button>
              </div>
              <div class="rule-item">
                <input type="checkbox">
                <span>$10 Fixed Holiday Fee</span>
                <p class="rule-desc">Add-on per person</p>
              </div>
              <div class="rule-item">
                <input type="checkbox">
                <span>Early Bird Discount</span>
                <p class="rule-desc">-15% for bookings > 30 days</p>
              </div>
            </div>
            <button class="btn-link">Define New Seasonal Rule</button>
          </div>

          <button class="btn-update">Update 16 Cells</button>
          <button class="btn-discard">Discard Changes</button>
        </aside>
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
        <button class="btn-icon-large">⚡</button>
        <div class="tip-box">
          <p class="tip-title">Curator Tip</p>
          <p class="tip-text">Peak season prices are typically 25% higher during Khmer New Year. Ensure your availability is maximized!</p>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const activeNav = ref("inventory");

const services = ref([
  {
    id: 1,
    name: "Angkor Sunrise",
    type: "Private Tour",
    image: "https://via.placeholder.com/50x50?text=Angkor",
    availability: [
      { price: 45, slots: 24 },
      { price: 49, slots: 2 },
      { price: 45, slots: 16 },
      { price: 45, slots: 9 },
    ],
  },
  {
    id: 2,
    name: "Floating Village",
    type: "Shared Tour",
    image: "https://via.placeholder.com/50x50?text=Village",
    availability: [
      { price: 28, slots: 15 },
      { price: 28, slots: 15 },
      { price: 28, slots: 12 },
      { price: 28, slots: 10 },
    ],
  },
  {
    id: 3,
    name: "Night Food Tour",
    type: "Tuk-Tuk Event",
    image: "https://via.placeholder.com/50x50?text=Food",
    availability: [
      { price: 32, slots: 8 },
      { price: 32, slots: 9 },
      { price: 32, slots: 12 },
      { price: 32, slots: 12 },
    ],
  },
]);
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
</style>
