<template>
  <header class="provider-header">
    <div class="header-left">
      <h1>{{ title }}</h1>
      <div v-if="showControls" class="header-controls">
        <div class="search-container">
          <MagnifyingGlassIcon class="search-icon" aria-hidden="true" />
          <input
            :value="searchQuery"
            @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            type="text"
            :placeholder="searchPlaceholder"
            class="search-input"
          />
        </div>
      </div>
    </div>
    <div class="header-icons">
      <button class="date-range-btn" type="button">
        <CalendarDaysIcon aria-hidden="true" />
        <span>{{ currentDateLabel }}</span>
      </button>
      <RouterLink :to="{ name: 'provider-settings' }" class="provider-profile provider-profile-link" aria-label="Open profile settings">
        <div v-if="providerProfileImage" class="avatar avatar--image">
          <img :src="providerProfileImage" :alt="providerName" />
        </div>
        <div v-else class="avatar avatar--initials" aria-hidden="true">
          {{ providerInitials }}
        </div>
        <div class="provider-profile__text">
          <strong>{{ providerName }}</strong>
          <span>{{ providerRoleLabel }}</span>
        </div>
        <ChevronDownIcon class="chevron-icon" aria-hidden="true" />
      </RouterLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { CalendarDaysIcon, ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/vue/24/outline";
import { resolveImageUrl } from "../utils/api";

interface Props {
  title: string;
  searchQuery?: string;
  searchPlaceholder?: string;
  showControls?: boolean;
}

withDefaults(defineProps<Props>(), {
  searchQuery: "",
  searchPlaceholder: "Search services, bookings, inventory...",
  showControls: true,
});

defineEmits<{
  "update:searchQuery": [value: string];
}>();

const authUser = computed(() => {
  try {
    const rawUser = localStorage.getItem("auth_user") || localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
});

const providerName = computed(() => authUser.value?.username || "Provider");
const providerProfileImage = computed(() => resolveImageUrl(authUser.value?.profilePicture));
const currentDateLabel = new Date().toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const providerRoleLabel = computed(() => {
  const role = authUser.value?.role || "";
  const roleLabels: Record<string, string> = {
    admin: "Administrator",
    provider: "Service Provider",
    customer: "Traveler",
  };
  return roleLabels[role] || "User";
});

const providerInitials = computed(() => {
  const name = providerName.value.trim();
  if (!name) return "P";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2) || "P";
});
</script>

<style scoped>
.provider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 92px;
  padding: 16px 34px;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #e5e7eb;
  box-sizing: border-box;
  backdrop-filter: blur(18px);
  gap: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
  min-width: 0;
}

.header-left h1 {
  margin: 0;
  min-width: max-content;
  color: #111827;
  font-size: clamp(1.35rem, 2vw, 1.9rem);
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1;
}

.header-controls {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 520px;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 14px;
  background: #f3f4f6;
  border: 1px solid transparent;
  border-radius: 999px;
  transition:
    background 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.search-input {
  width: 100%;
  border: 0;
  outline: none;
  color: #111827;
  background: transparent;
  font-size: 0.88rem;
}

.search-container:focus-within {
  background: #ffffff;
  border-color: rgba(20, 138, 116, 0.42);
  box-shadow: 0 0 0 4px rgba(20, 138, 116, 0.08);
}

.search-icon {
  width: 17px;
  height: 17px;
  color: #9ca3af;
  flex: 0 0 auto;
}

.header-icons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-range-btn,
.provider-profile {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.date-range-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 13px;
  border-radius: 999px;
  color: #4b5563;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: default;
}

.date-range-btn svg {
  width: 18px;
  height: 18px;
  color: #148a74;
}

.provider-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 5px 12px 5px 6px;
  border-radius: 999px;
  cursor: pointer;
}

.provider-profile-link {
  color: inherit;
  text-decoration: none;
}

.date-range-btn:hover,
.provider-profile:hover {
  border-color: rgba(20, 138, 116, 0.28);
  box-shadow: 0 10px 26px rgba(17, 24, 39, 0.08);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

.avatar--image {
  overflow: hidden;
}

.avatar--image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar--initials {
  background: #148a74;
  color: white;
}

.provider-profile__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.provider-profile__text strong {
  font-size: 14px;
  color: #111827;
  line-height: 1.2;
}

.provider-profile__text span {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.2;
}

.chevron-icon {
  width: 16px;
  height: 16px;
  color: #9ca3af;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.icon-btn:hover {
  background: #efefef;
}

.icon-btn:active {
  background: #e0e0e0;
}

@media (max-width: 768px) {
  .provider-header {
    flex-direction: column;
    padding: 15px 20px;
    gap: 15px;
  }

  .header-left {
    width: 100%;
    align-items: flex-start;
    gap: 14px;
  }

  .header-left h1 {
    font-size: 24px;
  }

  .header-controls {
    flex-wrap: wrap;
    width: 100%;
  }

  .search-container {
    max-width: 100%;
    flex: 1;
    min-width: 200px;
  }

  .provider-profile__text {
    display: none;
  }

  .date-range-btn {
    display: none;
  }
}
</style>
