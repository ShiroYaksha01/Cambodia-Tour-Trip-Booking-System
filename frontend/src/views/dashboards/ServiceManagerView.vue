<template>
  <div class="service-manager-page">
    <aside class="sidebar">
      <div class="brand-block">
        <h1>Service Manager</h1>
        <p>ANJAKAK WORKSHOP</p>
      </div>

      <nav class="side-nav">
        <button class="nav-item active">
          <span class="nav-icon">◉</span>
          Tours
        </button>
        <button class="nav-item">
          <span class="nav-icon">▣</span>
          Hotels
        </button>
        <button class="nav-item">
          <span class="nav-icon">⇄</span>
          Transport
        </button>
      </nav>

      <button class="create-service-btn">+ Create New Service</button>

      <div class="sidebar-footer">
        <button class="footer-link">Help Center</button>
        <button class="footer-link">Logout</button>
      </div>
    </aside>

    <main class="content-shell">
      <header class="topbar">
        <div class="search-box">
          <span>⌕</span>
          <input type="text" placeholder="Search services, packages, or room types..." />
        </div>

        <nav class="top-links">
          <a href="#">Dashboard</a>
          <a class="active" href="#">Services</a>
          <a href="#">Analytics</a>
        </nav>

        <div class="top-icons">
          <button>🔔</button>
          <button>⚙</button>
          <button class="avatar-btn">●</button>
        </div>
      </header>

      <section class="hero-card">
        <div class="hero-head">
          <div>
            <h2>Tour Packages</h2>
            <p>Manage and curate your premium temple expeditions and cultural walks.</p>
          </div>

          <div class="hero-actions">
            <button class="ghost-btn">Filter</button>
            <button class="primary-btn">+ New Tour</button>
          </div>
        </div>

        <div class="table-shell">
          <div class="table-head">
            <span>Service Details</span>
            <span>Destinations</span>
            <span>Pricing</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          <article v-for="item in serviceItems" :key="item.name" class="table-row">
            <div class="service-details">
              <img :src="item.image" :alt="item.name" class="thumb" />
              <div>
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

          <div class="table-foot">
            <p>Showing 1 to 3 of 12 tour packages</p>
            <div>
              <button class="page-btn">Previous</button>
              <button class="page-btn">Next</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
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
:global(*) {
  box-sizing: border-box;
}

.service-manager-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 248px 1fr;
  background: linear-gradient(180deg, #eef1ef 0%, #e7ebe8 100%);
  color: #1f2933;
}

.sidebar {
  display: flex;
  flex-direction: column;
  padding: 20px 16px 18px;
  background: rgba(231, 235, 232, 0.95);
  border-right: 1px solid rgba(31, 41, 51, 0.06);
}

.brand-block h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.brand-block p {
  margin: 4px 0 0;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: #98a1a8;
}

.side-nav {
  display: grid;
  gap: 10px;
  margin-top: 34px;
}

.nav-item,
.footer-link,
.create-service-btn,
.ghost-btn,
.primary-btn,
.page-btn,
.top-icons button,
.actions button {
  font: inherit;
}

.nav-item {
  border: 0;
  border-radius: 12px;
  padding: 14px 16px;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #53606a;
  text-align: left;
}

.nav-item.active {
  background: #f3f5f4;
  color: #2b3b45;
  font-weight: 600;
}

.nav-icon {
  width: 18px;
  display: inline-flex;
  justify-content: center;
}

.create-service-btn {
  margin-top: auto;
  border: 0;
  border-radius: 10px;
  padding: 14px 16px;
  background: #0f7c7f;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 12px 28px rgba(15, 124, 127, 0.28);
}

.sidebar-footer {
  display: grid;
  gap: 10px;
  margin-top: 18px;
  color: #66727c;
}

.footer-link {
  border: 0;
  background: transparent;
  text-align: left;
  padding: 4px 2px;
  color: inherit;
}

.content-shell {
  min-width: 0;
  padding: 18px 20px 24px;
}

.topbar {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) auto auto;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  color: #90a0aa;
  box-shadow: 0 8px 24px rgba(20, 35, 40, 0.04);
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #1f2933;
}

.top-links {
  display: flex;
  align-items: center;
  gap: 28px;
  font-size: 14px;
}

.top-links a {
  color: #67727b;
  text-decoration: none;
  padding-bottom: 4px;
}

.top-links a.active {
  color: #2e6f6d;
  font-weight: 700;
  border-bottom: 3px solid #2e6f6d;
}

.top-icons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.top-icons button {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.75);
  color: #55616b;
}

.top-icons .avatar-btn {
  background: linear-gradient(180deg, #0f7c7f, #0c6467);
  color: transparent;
}

.hero-card {
  padding: 26px 28px 24px;
  border-radius: 18px;
  background: rgba(248, 249, 248, 0.94);
  box-shadow: 0 20px 50px rgba(20, 35, 40, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.hero-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.hero-head h2 {
  margin: 0;
  font-size: 28px;
  line-height: 1.1;
}

.hero-head p {
  margin: 8px 0 0;
  color: #7a8790;
}

.hero-actions {
  display: flex;
  gap: 10px;
}

.ghost-btn,
.primary-btn,
.page-btn {
  border-radius: 12px;
  padding: 11px 16px;
  border: 1px solid rgba(111, 126, 134, 0.18);
  background: #fff;
  color: #44515a;
}

.primary-btn {
  border: 0;
  background: #0f7c7f;
  color: #fff;
  box-shadow: 0 12px 24px rgba(15, 124, 127, 0.22);
}

.table-shell {
  background: rgba(255, 255, 255, 0.58);
  border-radius: 18px;
  padding: 18px;
  border: 1px solid rgba(111, 126, 134, 0.1);
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 2.2fr 1fr 0.8fr 0.6fr 0.3fr;
  gap: 14px;
  align-items: center;
}

.table-head {
  padding: 6px 12px 14px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #7c8790;
  font-weight: 700;
}

.table-row {
  margin-top: 14px;
  padding: 18px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 28px rgba(20, 35, 40, 0.04);
}

.service-details {
  display: flex;
  align-items: center;
  gap: 14px;
}

.thumb {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  object-fit: cover;
  flex: 0 0 auto;
}

.service-details h3 {
  margin: 0;
  font-size: 16px;
}

.service-details p,
.pricing p {
  margin: 4px 0 0;
  color: #7b8790;
  font-size: 13px;
}

.destinations {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.destinations span {
  display: inline-flex;
  border-radius: 999px;
  padding: 8px 12px;
  background: #e9f4f2;
  color: #1f7f7f;
  font-size: 12px;
  font-weight: 600;
}

.pricing strong {
  font-size: 20px;
  color: #1e7581;
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

.table-foot div {
  display: flex;
  gap: 10px;
}

@media (max-width: 1180px) {
  .service-manager-page {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }

  .topbar,
  .hero-head,
  .table-head,
  .table-row {
    grid-template-columns: 1fr;
  }

  .topbar {
    display: flex;
    flex-wrap: wrap;
  }

  .hero-head {
    display: flex;
    flex-direction: column;
  }

  .table-row {
    gap: 10px;
  }
}
</style>