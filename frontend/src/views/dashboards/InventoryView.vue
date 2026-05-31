<template>
  <div class="inventory-shell">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-mark">🏛️</div>
        <div>
          <h1>Angkor Treasures</h1>
          <p>VERIFIED PROVIDER</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <RouterLink class="nav-item" :to="{ name: 'provider-dashboard' }" active-class="active">
          <span>🗓️</span>
          Inventory
        </RouterLink>
        <RouterLink class="nav-item" :to="{ name: 'provider-service' }" active-class="active">
          <span>👥</span>
          Manifest
        </RouterLink>
        <RouterLink class="nav-item" :to="{ name: 'provider-dashboard' }" active-class="active">
          <span>💳</span>
          Finance
        </RouterLink>
        <a href="#" class="nav-item" @click.prevent>
          <span>💬</span>
          Messages
        </a>
        <a href="#" class="nav-item" @click.prevent>
          <span>⚙️</span>
          Settings
        </a>
      </nav>

      <button class="new-booking-btn">New Booking</button>

      <div class="sidebar-footer">
        <button class="footer-link">Support</button>
        <button class="footer-link">Logout</button>
      </div>
    </aside>

    <main class="inventory-main">
      <header class="topbar">
        <div class="topbar-title">Inventory & Pricing</div>
        <div class="sync-pill">⟳ Syncing: All OTAs</div>
        <div class="topbar-user">
          <span class="bell">🔔</span>
          <div class="user-meta">
            <strong>The Heritage Curator</strong>
            <span>Master Admin</span>
          </div>
          <img class="avatar" src="https://via.placeholder.com/40" alt="User avatar" />
        </div>
      </header>

      <section class="metrics-row">
        <article class="metric-card metric-teal">
          <p>AVG. OCCUPANCY</p>
          <h3>84.2%</h3>
          <span>+12% from March</span>
        </article>
        <article class="metric-card metric-gold">
          <p>REVPAR</p>
          <h3>$142.50</h3>
          <span>Optimal Pricing Active</span>
        </article>
        <article class="metric-card metric-red">
          <p>LOW STOCK ALERTS</p>
          <h3>04</h3>
          <span>1 Action required: April 14</span>
        </article>
        <article class="metric-card metric-neutral">
          <p>KHMER NEW YEAR</p>
          <h3>98%</h3>
          <span>Peak Demand Season</span>
        </article>
      </section>

      <section class="content-grid">
        <div class="left-panel">
          <div class="calendar-card">
            <div class="calendar-header">
              <button class="icon-btn">‹</button>
              <h2>April 2026</h2>
              <button class="icon-btn">›</button>
              <div class="view-toggle">
                <button>Month</button>
                <button class="active">Fortnight</button>
              </div>
            </div>

            <div class="inventory-table">
              <div class="inventory-head">
                <span>PRODUCT / SERVICE</span>
                <span>TUE 10</span>
                <span>TUE 11</span>
                <span>TUE 12</span>
                <span>SAT 13</span>
                <span>SUN 14</span>
              </div>

              <button
                v-for="item in inventoryItems"
                :key="item.name"
                class="inventory-row"
                @click="selectedItem = item"
              >
                <div class="item-info">
                  <img :src="item.image" :alt="item.name" />
                  <div>
                    <h3>{{ item.name }}</h3>
                    <p>{{ item.subtitle }}</p>
                  </div>
                </div>
                <div v-for="(day, index) in item.days" :key="index" class="day-cell" :class="day.status">
                  <strong>{{ day.label }}</strong>
                  <span>{{ day.price }}</span>
                </div>
              </button>
            </div>

            <div class="legend-row">
              <div><span class="dot available"></span> Available</div>
              <div><span class="dot low"></span> Low Stock (&lt;10%)</div>
              <div><span class="dot peak"></span> Khmer New Year (Peak)</div>
              <a href="#">Export Matrix</a>
            </div>
          </div>
        </div>

        <aside class="right-panel">
          <div class="panel-card">
            <h3>Pricing Engine</h3>
            <div class="field-group">
              <label>Rule Type</label>
              <select>
                <option>Add % Markup</option>
              </select>
            </div>
            <div class="field-group">
              <label>Value</label>
              <input type="text" value="25" />
            </div>
            <div class="field-group switch-row">
              <label>Auto-Apply Logic</label>
              <div class="switch-on">Apply only when stock &lt; 20%</div>
            </div>
            <button class="primary-action amber">Update Market Prices</button>
          </div>

          <div class="panel-card">
            <h3>Inventory Controller</h3>
            <div class="notice-box">
              <strong>KRH New Year Focus</strong>
              <p>Apr 13-16 is designated as a high-demand peak period.</p>
            </div>
            <div class="two-col">
              <div class="field-group">
                <label>Start Date</label>
                <input type="text" value="04/13/2026" />
              </div>
              <div class="field-group">
                <label>End Date</label>
                <input type="text" value="04/16/2026" />
              </div>
            </div>
            <div class="field-group">
              <label>Max Pax / Daily Limit</label>
              <input type="text" value="15" />
              <small>Value auto-triggers at 100% occupancy.</small>
            </div>
            <button class="secondary-action">Batch Process Dates</button>
          </div>

          <div class="panel-card small">
            <h3>Recent Changes</h3>
            <ul class="changes-list">
              <li><span class="bullet teal"></span> Price Override Applied</li>
              <li><span class="bullet amber"></span> Auto-Close Triggered</li>
            </ul>
          </div>
        </aside>
      </section>

      <button class="floating-save">💾</button>

      <div v-if="selectedItem" class="detail-drawer" @click.self="selectedItem = null">
        <div class="drawer-card">
          <div class="drawer-header">
            <div>
              <p>Selected Item</p>
              <h3>{{ selectedItem.name }}</h3>
            </div>
            <button class="icon-btn" @click="selectedItem = null">✕</button>
          </div>
          <img :src="selectedItem.image" :alt="selectedItem.name" class="drawer-image" />
          <p class="drawer-subtitle">{{ selectedItem.subtitle }}</p>
          <div class="drawer-grid">
            <div v-for="(day, index) in selectedItem.days" :key="index" class="drawer-day">
              <strong>{{ day.label }}</strong>
              <span>{{ day.price }}</span>
              <small>{{ day.status }}</small>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

type InventoryDay = {
  label: string;
  price: string;
  status: string;
};

type InventoryItem = {
  name: string;
  subtitle: string;
  image: string;
  days: InventoryDay[];
};

const selectedItem = ref<InventoryItem | null>(null);

const inventoryItems: InventoryItem[] = [
  {
    name: "Angkor Wat Sunrise Premium",
    subtitle: "Daily Departures (4am)",
    image: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=120&q=80",
    days: [
      { label: "19 left", price: "$85", status: "available" },
      { label: "12 left", price: "$85", status: "available" },
      { label: "19 left", price: "$85", status: "available" },
      { label: "8 left", price: "$120", status: "peak" },
      { label: "2 left", price: "$120", status: "low" },
    ],
  },
  {
    name: "Floating Village Photography",
    subtitle: "Afternoons Boat Tour",
    image: "https://images.unsplash.com/photo-1528184039939-bd03972bd974?auto=format&fit=crop&w=120&q=80",
    days: [
      { label: "14 left", price: "$45", status: "available" },
      { label: "27 left", price: "$45", status: "available" },
      { label: "10 left", price: "$45", status: "available" },
      { label: "29 left", price: "$45", status: "available" },
      { label: "17 left", price: "$45", status: "available" },
    ],
  },
  {
    name: "Khmer Cooking Masterclass",
    subtitle: "Limited to 12 Pax",
    image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=120&q=80",
    days: [
      { label: "7 left", price: "$65", status: "available" },
      { label: "8 left", price: "$65", status: "available" },
      { label: "CLOSED", price: "$65", status: "closed" },
      { label: "5 left", price: "$65", status: "available" },
      { label: "5 left", price: "$65", status: "available" },
    ],
  },
];
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.inventory-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 236px 1fr;
  background: #f6f8f7;
  color: #20313a;
}

.sidebar {
  display: flex;
  flex-direction: column;
  padding: 18px 16px 16px;
  background: #f9fbfa;
  border-right: 1px solid rgba(33, 49, 58, 0.06);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: #0f7c7f;
  color: #fff;
  font-size: 18px;
}

.sidebar-brand h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.sidebar-brand p {
  margin: 2px 0 0;
  font-size: 11px;
  color: #9ca7ae;
  letter-spacing: 0.08em;
}

.sidebar-nav {
  display: grid;
  gap: 8px;
  margin-top: 28px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  color: #54707a;
  font-size: 14px;
}

.nav-item.active {
  background: #eef8f5;
  color: #0f7c7f;
  box-shadow: inset 3px 0 0 #0f7c7f;
}

.nav-item span {
  width: 18px;
  text-align: center;
}

.new-booking-btn {
  margin-top: auto;
  border: 0;
  border-radius: 8px;
  padding: 12px 14px;
  background: #0f7c7f;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 10px 20px rgba(15, 124, 127, 0.25);
}

.sidebar-footer {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.footer-link {
  border: 0;
  background: transparent;
  text-align: left;
  padding: 2px 0;
  color: #6c7a82;
}

.inventory-main {
  position: relative;
  padding: 14px 14px 16px;
  overflow: hidden;
}

.topbar {
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.topbar-title {
  font-size: 18px;
  font-weight: 700;
  color: #26444b;
}

.sync-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #f1f3f2;
  color: #6a757d;
  font-size: 12px;
}

.topbar-user {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 10px;
}

.bell {
  font-size: 16px;
  color: #64727b;
}

.user-meta {
  display: grid;
  line-height: 1.1;
  text-align: right;
}

.user-meta strong {
  font-size: 13px;
}

.user-meta span {
  font-size: 11px;
  color: #7f8a92;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.metric-card {
  min-height: 90px;
  border-radius: 10px;
  background: white;
  padding: 16px 18px;
  box-shadow: 0 10px 26px rgba(33, 49, 58, 0.06);
  border-top: 4px solid transparent;
}

.metric-card p {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: #7c8a92;
  font-weight: 700;
}

.metric-card h3 {
  margin: 8px 0 4px;
  font-size: 28px;
  line-height: 1;
}

.metric-card span {
  font-size: 12px;
  color: #7d8a91;
}

.metric-teal {
  border-top-color: #119a9a;
}

.metric-teal h3,
.metric-teal span {
  color: #0b7f80;
}

.metric-gold {
  border-top-color: #bb7e21;
}

.metric-gold h3 {
  color: #b67912;
}

.metric-red {
  border-top-color: #d64235;
}

.metric-red h3 {
  color: #c7261a;
}

.metric-neutral {
  border-top-color: #d2a14f;
}

.metric-neutral h3 {
  color: #3d4f57;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 292px;
  gap: 14px;
  align-items: start;
}

.left-panel {
  min-width: 0;
}

.calendar-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 26px rgba(33, 49, 58, 0.06);
  overflow: hidden;
}

.calendar-header {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 10px;
}

.calendar-header h2 {
  margin: 0;
  font-size: 16px;
}

.icon-btn {
  border: 0;
  background: transparent;
  color: #4f666f;
  cursor: pointer;
  font-size: 18px;
}

.view-toggle {
  display: flex;
  gap: 6px;
}

.view-toggle button {
  border: 0;
  background: #edf0ee;
  color: #4f666f;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
}

.view-toggle button.active {
  background: #0f7c7f;
  color: #fff;
}

.inventory-table {
  border-top: 1px solid #eef1f0;
}

.inventory-head,
.inventory-row {
  display: grid;
  grid-template-columns: 2.2fr repeat(5, minmax(0, 1fr));
  gap: 10px;
  align-items: center;
}

.inventory-head {
  padding: 12px 16px;
  color: #75838b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  border-bottom: 1px solid #eef1f0;
}

.inventory-row {
  width: 100%;
  border: 0;
  background: transparent;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f3f2;
  text-align: left;
}

.inventory-row:hover {
  background: #fafcfc;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-info img {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  object-fit: cover;
  flex: 0 0 auto;
}

.item-info h3 {
  margin: 0;
  font-size: 14px;
}

.item-info p {
  margin: 4px 0 0;
  color: #77848c;
  font-size: 11px;
}

.day-cell {
  display: grid;
  place-items: center;
  min-height: 56px;
  border-radius: 8px;
  background: #fbfbfa;
  color: #51656f;
}

.day-cell strong {
  font-size: 12px;
  line-height: 1.05;
}

.day-cell span {
  font-size: 11px;
  color: #7d8b92;
  margin-top: 4px;
}

.day-cell.available strong {
  color: #0b7f80;
}

.day-cell.peak {
  background: #fff4df;
}

.day-cell.peak strong {
  color: #9d6a10;
}

.day-cell.low strong {
  color: #c33a31;
}

.day-cell.closed {
  background: #f0f2f3;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 2px 0;
  color: #5d6e76;
  font-size: 12px;
}

.legend-row > div {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.legend-row a {
  margin-left: auto;
  color: #0f7c7f;
  text-decoration: none;
  font-weight: 700;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.available {
  background: #0b7f80;
}

.dot.low {
  background: #d64336;
}

.dot.peak {
  background: #f0b25c;
}

.right-panel {
  display: grid;
  gap: 14px;
}

.panel-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 26px rgba(33, 49, 58, 0.06);
  padding: 14px;
}

.panel-card h3 {
  margin: 0 0 12px;
  font-size: 15px;
}

.field-group {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
}

.field-group label {
  font-size: 11px;
  color: #75838b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}

.field-group input,
.field-group select {
  width: 100%;
  border: 1px solid #e6eae7;
  background: #f9fbfa;
  border-radius: 6px;
  padding: 10px 12px;
  color: #20313a;
}

.field-group small {
  color: #7b8a91;
}

.switch-row {
  align-items: start;
}

.switch-on {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1c6e6f;
  font-size: 13px;
}

.primary-action,
.secondary-action {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 10px 12px;
  font-weight: 700;
  cursor: pointer;
}

.primary-action.amber {
  background: #f5a623;
  color: white;
}

.secondary-action {
  background: white;
  color: #0f7c7f;
  border-color: #0f7c7f;
}

.notice-box {
  background: #fff7eb;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
}

.notice-box strong {
  display: block;
  color: #9d6a10;
  font-size: 13px;
}

.notice-box p {
  margin: 4px 0 0;
  color: #7b6b4b;
  font-size: 12px;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.small {
  padding-bottom: 12px;
}

.changes-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
  color: #30424b;
  font-size: 13px;
}

.changes-list li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bullet {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.bullet.teal {
  background: #0f7c7f;
}

.bullet.amber {
  background: #f5a623;
}

.floating-save {
  position: fixed;
  right: 20px;
  bottom: 18px;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 12px;
  background: #0f7c7f;
  color: #fff;
  box-shadow: 0 14px 28px rgba(15, 124, 127, 0.3);
}

.detail-drawer {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: flex-end;
  z-index: 30;
}

.drawer-card {
  width: min(360px, 92vw);
  background: white;
  height: 100%;
  padding: 16px;
  box-shadow: -20px 0 40px rgba(0, 0, 0, 0.14);
  overflow-y: auto;
}

.drawer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.drawer-header p {
  margin: 0;
  color: #7b8a91;
  font-size: 11px;
  text-transform: uppercase;
}

.drawer-header h3 {
  margin: 4px 0 0;
  font-size: 18px;
}

.drawer-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 10px;
}

.drawer-subtitle {
  margin: 10px 0 14px;
  color: #63737c;
}

.drawer-grid {
  display: grid;
  gap: 10px;
}

.drawer-day {
  padding: 10px 12px;
  border-radius: 10px;
  background: #f8faf9;
  display: grid;
  gap: 2px;
}

.drawer-day strong {
  font-size: 13px;
}

.drawer-day span {
  color: #0f7c7f;
  font-weight: 700;
}

.drawer-day small {
  color: #76858d;
}

@media (max-width: 1220px) {
  .inventory-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }

  .topbar,
  .content-grid,
  .metrics-row,
  .two-col {
    grid-template-columns: 1fr;
  }

  .topbar-user {
    justify-self: start;
  }

  .legend-row {
    flex-wrap: wrap;
  }

  .legend-row a {
    margin-left: 0;
    width: 100%;
  }
}
</style>