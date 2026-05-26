<template>
  <header class="provider-header">
    <div class="header-left">
      <h1>{{ title }}</h1>
      <div v-if="showControls" class="header-controls">
        <div class="search-container">
          <input
            :value="searchQuery"
            @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            type="text"
            :placeholder="searchPlaceholder"
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
      </div>
    </div>
    <div class="header-icons">
      <div class="provider-profile">
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
      </div>
      <button class="icon-btn">🔔</button>
      <button class="icon-btn">❓</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  title: string;
  searchQuery?: string;
  searchPlaceholder?: string;
  showControls?: boolean;
}

withDefaults(defineProps<Props>(), {
  searchQuery: "",
  searchPlaceholder: "Search...",
  showControls: true,
});

defineEmits<{
  "update:searchQuery": [value: string];
}>();

const authUser = computed(() => {
  try {
    const rawUser = localStorage.getItem("auth_user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
});

const providerName = computed(() => authUser.value?.username || "Provider");
const providerProfileImage = computed(() => authUser.value?.profilePicture || "");
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
  padding: 20px 30px;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  gap: 20px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex: 1;
}

.header-left h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
}

.header-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  font-size: 14px;
  background: #f9f9f9;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #0f6e70;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(15, 110, 112, 0.1);
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #999;
  pointer-events: none;
}

.header-icons {
  display: flex;
  align-items: center;
  gap: 20px;
}

.provider-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 15px;
  background: #f5f5f5;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.provider-profile:hover {
  background: #efefef;
}

.avatar {
  width: 40px;
  height: 40px;
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
  background: linear-gradient(135deg, #0f6e70 0%, #158a8c 100%);
  color: white;
}

.provider-profile__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.provider-profile__text strong {
  font-size: 14px;
  color: #1a1a1a;
  line-height: 1.2;
}

.provider-profile__text span {
  font-size: 12px;
  color: #999;
  line-height: 1.2;
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
  }

  .header-left h1 {
    font-size: 24px;
  }

  .header-controls {
    flex-wrap: wrap;
  }

  .search-container {
    max-width: 100%;
    flex: 1;
    min-width: 200px;
  }

  .provider-profile__text {
    display: none;
  }
}
</style>
