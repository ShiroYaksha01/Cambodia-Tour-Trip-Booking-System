<script setup lang="ts">
</script>

<template>
  <aside class="sidebar">
    <div>
      <div class="sidebar-brand">
        <div class="brand-icon">C</div>
        <div>
          <h2>Admin Central</h2>
          <p>TOUR BOOKING SYSTEM</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <a href="#">Dashboard</a>
        <a href="#" class="active">Clients</a>
        <a href="#">Providers</a>
        <a href="#">Package Oversight</a>
        <a href="#">Booking Ledger</a>
        <a href="#">Review Moderation</a>
      </nav>
    </div>

    <div class="sidebar-footer">
      <p>● System Online</p>
      <a href="#">Logout</a>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 310px;
  height: 100%;
  background: #173937;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 26px 20px;
  flex-shrink: 0;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 34px;
}

.brand-icon {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  background: linear-gradient(135deg, #006566, #00888a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 800;
  flex-shrink: 0;
}

.sidebar-brand h2 { color: white; font-size: 20px; margin: 0; }
.sidebar-brand p { color: rgba(255,255,255,0.45); font-size: 11px; letter-spacing: 2px; margin: 0; }

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-nav a {
  text-decoration: none;
  color: rgba(255,255,255,0.75);
  padding: 14px 16px;
  border-radius: 14px;
  transition: 0.2s;
  font-size: 14px;
}
.sidebar-nav a:hover { background: rgba(255,255,255,0.06); }
.sidebar-nav .active { background: rgba(255,255,255,0.08); color: white; }

.sidebar-footer { color: rgba(255,255,255,0.75); font-size: 13px; }
.sidebar-footer a {
  display: inline-block;
  margin-top: 16px;
  color: #ff6b6b;
  text-decoration: none;
}
</style>