<template>
  <header class="customer-navbar">
    <div class="brand-group">
      <strong class="brand-name">AnajakTour</strong>
    </div>

    <nav class="nav-links" aria-label="Customer navigation">
      <a href="#destinations">Destinations</a>
      <a href="#tours">Tours</a>
      <a href="#experiences" class="nav-links__active">Experiences</a>
      <a href="#curations">Curations</a>
    </nav>

    <div class="toolbar-group">
      <button type="button" class="toolbar-button" aria-label="Notifications">🔔</button>
      <button type="button" class="toolbar-button" aria-label="Wishlist">♡</button>
      <div class="profile-chip">
        <span>Profile</span>
        <span class="avatar" aria-hidden="true">C</span>
      </div>
      <LogoutButton />
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import LogoutButton from '../LogoutButton.vue'

export default defineComponent({
  name: 'CustomerNavbar',
  components: {
    LogoutButton,
  },
})
</script>

<style scoped>
.customer-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 10px 14px;
  background: #fff;
  border-bottom: 1px solid #e5e8e6;
}

.brand-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-name {
  color: #0f3742;
  font-size: 0.95rem;
  font-weight: 700;
}

.nav-links a,
.profile-chip span,
.toolbar-button {
  margin: 0;
  font-size: 0.82rem;
}

.nav-links {
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
  justify-content: center;
}

.nav-links a {
  position: relative;
  padding-bottom: 8px;
  color: #5d6968;
  text-decoration: none;
  transition: color 180ms ease;
}

.nav-links__active,
.nav-links a:hover {
  color: #0f6e70;
}

.nav-links__active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  border-radius: 999px;
  background: #0f6e70;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-button {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #29535b;
}

.profile-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 10px;
  border-radius: 999px;
  border: 1px solid #dbe1df;
  color: #31505a;
}

.avatar {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #0f6e70;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
}

@media (max-width: 980px) {
  .customer-navbar {
    flex-direction: column;
    align-items: stretch;
  }

  .nav-links {
    justify-content: flex-start;
  }

  .toolbar-group {
    justify-content: flex-start;
  }
}
</style>