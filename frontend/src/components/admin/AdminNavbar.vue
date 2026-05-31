<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { clearAuthData } from '../../utils/auth'

const props = defineProps<{ 
  breadcrumb?: string
  searchPlaceholder?: string
}>()

const emit = defineEmits(['search'])
const router = useRouter()
const showProfile = ref(false)
const searchQuery = ref('')

const authUser = computed(() => {
  try {
    const stored = localStorage.getItem('auth_user') || localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
})

const adminName    = computed(() => authUser.value?.username || 'Admin')
const adminEmail   = computed(() => authUser.value?.email    || 'admin@tourbooking.local')
const adminRole    = computed(() => authUser.value?.role     || 'admin')
const adminInitial = computed(() => adminName.value.substring(0, 2).toUpperCase())

const handleLogout = () => {
  clearAuthData()
  router.push('/login')
}

const onSearchInput = () => {
  emit('search', searchQuery.value)
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <button class="menu-trigger" aria-label="Toggle Menu" type="button">
        <span class="menu-icon">☰</span>
      </button>
      <div class="searchbar">
        <span class="searchbar__icon" aria-hidden="true">⌕</span>
        <input
          v-model.trim="searchQuery"
          type="search"
          :placeholder="props.searchPlaceholder || 'Search bookings, clients, providers...'"
          @input="onSearchInput"
        />
        <span class="search-shortcut">⌘K</span>
      </div>
    </div>

    <div class="topbar-actions">
      <div class="profile-chip" @click="showProfile = true">
        <div class="avatar">{{ adminInitial }}</div>
        <div class="profile-meta">
          <strong>{{ adminName }}</strong>
          <span>{{ adminRole === 'admin' ? 'System Administrator' : adminRole }}</span>
        </div>
        <span class="chevron-down">▾</span>
      </div>
    </div>
  </header>

  <!-- Profile modal (Keeping existing functionality but styling it slightly to match) -->
  <transition name="fade">
    <div v-if="showProfile" class="modal-bd">
      <div class="overlay" @click="showProfile = false"></div>
      <div class="prof-modal">
        <button class="xbtn" @click="showProfile = false">
          <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="prof-head">
          <div class="prof-av">{{ adminInitial }}</div>
          <div>
            <p class="prof-label">ADMINISTRATOR</p>
            <h3>{{ adminName }}</h3>
            <p class="prof-sub">{{ adminRole }}</p>
          </div>
        </div>
        <div class="prof-details">
          <div class="drow"><span>Email</span><span>{{ adminEmail }}</span></div>
          <div class="drow"><span>Role</span><span class="capitalize">{{ adminRole }}</span></div>
          <div class="drow"><span>Status</span><span class="badge-active">Active</span></div>
        </div>
        <button class="logout-btn" @click="handleLogout">Logout</button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #ffffff;
  border-bottom: 1px solid #edf2f5;
  padding: 12px 28px;
  height: 58px;
  box-sizing: border-box;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.menu-trigger {
  display: none;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #5e6e70;
  cursor: pointer;
}

.searchbar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #e4ebed;
  border-radius: 7px;
  height: 34px;
  width: 100%;
  max-width: 360px;
  padding: 0 12px;
  transition: all 0.2s ease;
}

.searchbar:focus-within {
  border-color: #0f6e70;
  box-shadow: 0 0 0 2px rgba(15, 110, 112, 0.08);
}

.searchbar__icon {
  font-size: 1.1rem;
  color: #9ea9ab;
}

.searchbar input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.88rem;
  color: #173f42;
  background: transparent;
}

.searchbar input::placeholder {
  color: #9ea9ab;
}

.search-shortcut {
  font-size: 0.72rem;
  background: #f1f3f5;
  color: #9ea9ab;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 32px;
  padding: 2px 8px 2px 6px;
  border-radius: 8px;
  border: 1px solid #e4ebed;
  background: #ffffff;
  cursor: pointer;
}

.profile-meta {
  text-align: left;
}

.profile-meta strong {
  display: block;
  font-size: 0.82rem;
  color: #173f42;
  font-weight: 700;
}

.profile-meta span {
  display: none; /* Matching the compact dashboard style */
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #0f6e70;
  color: #ffffff;
  font-size: 0.66rem;
  font-weight: bold;
  display: grid;
  place-items: center;
}

.chevron-down {
  font-size: 0.72rem;
  color: #9ea9ab;
}

/* Modal */
.modal-bd { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 300; }
.overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.32); backdrop-filter: blur(6px); }
.prof-modal {
  position: relative; width: 380px; background: white;
  border-radius: 24px; padding: 32px;
  box-shadow: 0 20px 48px rgba(0,0,0,0.13); z-index: 301;
}

.xbtn {
  position: absolute; top: 16px; right: 16px;
  width: 34px; height: 34px; border: none;
  background: #f4f2ee; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: 0.18s; color: #57645d;
}
.xbtn:hover { background: #e8e4d9; transform: rotate(90deg); }

.prof-head { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.prof-av {
  width: 64px; height: 64px; border-radius: 18px;
  background: linear-gradient(135deg, #006566, #00888a);
  color: white; font-size: 24px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.prof-label { font-size: 10px; color: #006566; font-weight: 700; letter-spacing: 1.5px; margin: 0 0 3px; }
.prof-head h3 { margin: 0 0 3px; font-size: 20px; color: #13211c; }
.prof-sub { font-size: 13px; color: #7b8781; text-transform: capitalize; margin: 0; }

.prof-details { background: #f8f6f2; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
.drow { display: flex; justify-content: space-between; font-size: 13px; }
.drow span:first-child { color: #8a938f; }
.drow span:last-child { color: #1d2a26; font-weight: 500; }
.capitalize { text-transform: capitalize; }
.badge-active { background: #e8f7f5; color: #00817f; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }

.logout-btn { width: 100%; height: 46px; border-radius: 13px; border: none; background: #fff0f0; color: #c93b3b; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.18s; }
.logout-btn:hover { background: #ffe0e0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 1024px) {
  .menu-trigger {
    display: block;
  }
}
</style>