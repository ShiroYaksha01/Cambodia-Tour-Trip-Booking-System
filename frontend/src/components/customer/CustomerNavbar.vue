<template>
  <header class="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-200">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <router-link :to="{ name: 'customer-homepage' }" class="flex items-center group" aria-label="Anajak Tour home">
          <img
            src="/logo-wordmark.png"
            alt="Anajak Tour"
            class="h-10 w-auto max-w-[178px] sm:max-w-[220px] transition-transform group-hover:scale-[1.02]"
          />
        </router-link>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center gap-8" aria-label="Customer navigation">
          <router-link
            v-for="link in filteredNavLinks"
            :key="link.name"
            :to="{ name: link.routeName }"
            class="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors relative py-2 group"
          >
            {{ link.name }}
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 dark:bg-emerald-400 transition-all group-hover:w-full"
                  :class="{ 'w-full': $route.name === link.routeName }"></span>
          </router-link>
        </nav>

        <!-- Right Side: Profile & Actions -->
        <div class="flex items-center gap-4">
          <template v-if="isAuthenticated">
            <!-- Profile Dropdown/Link -->
            <router-link
              :to="{ name: 'customer-profile' }"
              class="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 transition-all"
            >
              <span class="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 px-1">{{ userName }}</span>
              <div class="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {{ userInitial }}
              </div>
            </router-link>
          </template>

          <template v-else>
            <router-link
              :to="{ name: 'login' }"
              class="px-6 py-2 rounded-full text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 transition-all shadow-md hover:shadow-lg"
            >
              Login
            </router-link>
          </template>

          <!-- Mobile Menu Button (Optional - for future) -->
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="md:hidden p-2 text-gray-500 dark:text-gray-400">
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
      <div v-if="isMobileMenuOpen" class="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 pt-2 pb-6 space-y-2 shadow-xl">
        <router-link
          v-for="link in filteredNavLinks"
          :key="link.name"
          :to="{ name: link.routeName }"
          @click="isMobileMenuOpen = false"
          class="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
          :class="{ 'bg-emerald-50 dark:bg-gray-800 text-emerald-600 dark:text-emerald-400': $route.name === link.routeName }"
        >
          {{ link.name }}
        </router-link>
        
        <template v-if="!isAuthenticated">
          <router-link
            :to="{ name: 'login' }"
            @click="isMobileMenuOpen = false"
            class="block px-4 py-3 text-base font-bold text-white bg-emerald-600 dark:bg-emerald-500 rounded-xl text-center"
          >
            Login
          </router-link>
        </template>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { hasAuthSession } from "../../utils/auth";

const userName = ref("Profile");
const userInitial = ref("U");
const isMobileMenuOpen = ref(false);
const isAuthenticated = ref(hasAuthSession());

const navLinks = [
  { name: 'Home', routeName: 'customer-homepage', requiresAuth: false },
  { name: 'Explore', routeName: 'customer-explore', requiresAuth: false },
  { name: 'My Bookings', routeName: 'booking-history', requiresAuth: false },
];

const filteredNavLinks = computed(() => {
  return navLinks.filter(link => !link.requiresAuth || isAuthenticated.value);
});

onMounted(() => {
  isAuthenticated.value = hasAuthSession();
  const rawUser = localStorage.getItem("user");
  if (rawUser) {
    try {
      const user = JSON.parse(rawUser);
      if (user.username || user.name) {
        userName.value = user.username || user.name;
        userInitial.value = (user.username || user.name).charAt(0).toUpperCase();
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
