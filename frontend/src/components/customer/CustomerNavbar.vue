<template>
  <header class="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <router-link :to="{ name: 'customer-homepage' }" class="flex items-center gap-2 group">
          <div class="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold transition-transform group-hover:scale-110">
            A
          </div>
          <span class="text-xl font-bold tracking-tight text-gray-900">
            Anajak<span class="text-emerald-600">Tour</span>
          </span>
        </router-link>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center gap-8" aria-label="Customer navigation">
          <router-link
            v-for="link in navLinks"
            :key="link.name"
            :to="{ name: link.routeName }"
            class="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors relative py-2 group"
          >
            {{ link.name }}
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all group-hover:w-full"
                  :class="{ 'w-full': $route.name === link.routeName }"></span>
          </router-link>
        </nav>

        <!-- Right Side: Profile & Actions -->
        <div class="flex items-center gap-4">
          <!-- Profile Dropdown/Link -->
          <router-link
            :to="{ name: 'customer-profile' }"
            class="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50 transition-all"
          >
            <span class="hidden sm:block text-sm font-medium text-gray-700 px-1">{{ userName }}</span>
            <div class="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {{ userInitial }}
            </div>
          </router-link>

          <!-- Logout -->
          <LogoutButton />

          <!-- Mobile Menu Button (Optional - for future) -->
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="md:hidden p-2 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform -translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-4 opacity-0"
    >
      <div v-if="isMobileMenuOpen" class="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-6 space-y-2 shadow-xl">
        <router-link
          v-for="link in navLinks"
          :key="link.name"
          :to="{ name: link.routeName }"
          @click="isMobileMenuOpen = false"
          class="block px-4 py-3 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
          :class="{ 'bg-emerald-50 text-emerald-600': $route.name === link.routeName }"
        >
          {{ link.name }}
        </router-link>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import LogoutButton from "../LogoutButton.vue";

const userName = ref("Profile");
const userInitial = ref("U");
const isMobileMenuOpen = ref(false);

const navLinks = [
  { name: 'Home', routeName: 'customer-homepage' },
  { name: 'Explore', routeName: 'customer-explore' },
  { name: 'My Bookings', routeName: 'booking-history' },
];

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
/* Scoped styles kept minimal as we use Tailwind */
.router-link-active {
  @apply text-emerald-600;
}
</style>
