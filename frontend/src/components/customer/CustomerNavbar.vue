<template>
  <header class="customer-navbar">
    <router-link :to="{ name: 'customer-homepage' }" class="brand-link">
      <div class="brand-group">
        <strong class="brand-name">AnajakTour</strong>
      </div>
    </router-link>

    <nav class="nav-links" aria-label="Customer navigation">
      <router-link :to="{ name: 'customer-homepage' }">Destinations</router-link>
      <router-link :to="{ name: 'customer-homepage' }">Tours</router-link>
      <router-link :to="{ name: 'customer-homepage' }">Experiences</router-link>
      <router-link :to="{ name: 'customer-homepage' }">Curations</router-link>
    </nav>

    <div class="toolbar-group">
      <button type="button" class="toolbar-button" aria-label="Notifications">
        🔔
      </button>
      <button type="button" class="toolbar-button" aria-label="Wishlist">
        ♡
      </button>
      <router-link :to="{ name: 'customer-profile' }" class="profile-chip">
        <span>{{ userName }}</span>
        <span class="avatar" aria-hidden="true">{{ userInitial }}</span>
      </router-link>
      <LogoutButton />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import LogoutButton from "../LogoutButton.vue";

const userName = ref("Profile");
const userInitial = ref("U");

onMounted(() => {
  const rawUser = localStorage.getItem("user");
  if (rawUser) {
    try {
      const user = JSON.parse(rawUser);
      if (user.name) {
        userName.value = user.name;
        userInitial.value = user.name.charAt(0).toUpperCase();
      }
    } catch (e) {
      console.error("Failed to parse user data", e);
    }
  }
});
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

.brand-link {
  text-decoration: none;
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

.nav-links a.router-link-active,
.nav-links a:hover {
  color: #0f6e70;
}

.nav-links a.router-link-active::after {
  content: "";
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
