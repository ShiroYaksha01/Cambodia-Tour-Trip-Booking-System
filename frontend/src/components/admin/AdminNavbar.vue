<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { BellIcon, CalendarDaysIcon, ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
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
const currentDateLabel = new Date().toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

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
        <MagnifyingGlassIcon class="searchbar__icon" aria-hidden="true" />
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
      <button class="date-range-btn" type="button">
        <CalendarDaysIcon aria-hidden="true" />
        <span>{{ currentDateLabel }}</span>
      </button>
      <button class="notification-btn" type="button" aria-label="Notifications">
        <BellIcon aria-hidden="true" />
      </button>
      <button class="profile-chip" type="button" @click="showProfile = true">
        <div class="avatar">{{ adminInitial }}</div>
        <div class="profile-meta">
          <strong>{{ adminName }}</strong>
          <span>{{ adminRole === 'admin' ? 'System Administrator' : adminRole }}</span>
        </div>
        <ChevronDownIcon class="chevron-icon" aria-hidden="true" />
      </button>
    </div>
  </header>

  <!-- Profile modal (Keeping existing functionality but styling it slightly to match) -->
  <transition name="fade">
    <div v-if="showProfile" class="modal-bd">
      <div class="overlay" @click="showProfile = false"></div>
      <div class="prof-modal">
        <button class="xbtn" @click="showProfile = false" aria-label="Close profile">
          <XMarkIcon aria-hidden="true" />
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
  background: rgba(255, 255, 255, 0.88);
  border-bottom: 1px solid #e7eaee;
  padding: 11px 34px;
  height: 64px;
  box-sizing: border-box;
  backdrop-filter: blur(18px);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.menu-trigger {
  display: none;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.searchbar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f5f5f2;
  border: 1px solid #e7eaee;
  border-radius: 999px;
  height: 40px;
  width: 100%;
  max-width: 410px;
  padding: 0 14px;
  transition: all 0.2s ease;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.03);
}

.searchbar:focus-within {
  background: #ffffff;
  border-color: rgba(20, 138, 116, 0.42);
  box-shadow: 0 0 0 4px rgba(20, 138, 116, 0.08);
}

.searchbar__icon {
  width: 17px;
  height: 17px;
  color: #98a2b3;
}

.searchbar input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.83rem;
  color: #111827;
  background: transparent;
}

.searchbar input::placeholder {
  color: #98a2b3;
}

.search-shortcut {
  font-size: 0.68rem;
  background: #ffffff;
  color: #98a2b3;
  padding: 3px 7px;
  border: 1px solid #e7eaee;
  border-radius: 999px;
  font-weight: 600;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-range-btn,
.notification-btn,
.profile-chip {
  border: 1px solid #e7eaee;
  background: #ffffff;
  cursor: pointer;
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
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.date-range-btn svg {
  width: 17px;
  height: 17px;
  color: var(--accent-primary);
}

.notification-btn {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #667085;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.notification-btn svg {
  width: 18px;
  height: 18px;
}

.date-range-btn:hover,
.notification-btn:hover,
.profile-chip:hover {
  transform: translateY(-1px);
  border-color: rgba(20, 138, 116, 0.28);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.profile-chip {
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 42px;
  padding: 4px 11px 4px 5px;
  border-radius: 999px;
}

.profile-meta {
  text-align: left;
}

.profile-meta strong {
  display: block;
  font-size: 0.82rem;
  color: #111827;
  font-weight: 700;
}

.profile-meta span {
  display: block;
  margin-top: 1px;
  font-size: 0.7rem;
  color: #98a2b3;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #0c2323;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: bold;
  display: grid;
  place-items: center;
}

.chevron-icon {
  width: 14px;
  height: 14px;
  color: #98a2b3;
}

/* Modal */
.modal-bd { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 300; }
.overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.32); backdrop-filter: blur(6px); }
.prof-modal {
  position: relative; width: 380px; background: white;
  border-radius: 24px; padding: 32px;
  box-shadow: 0 20px 50px rgba(15,23,42,0.08); z-index: 301;
}

.xbtn {
  position: absolute; top: 16px; right: 16px;
  width: 34px; height: 34px; border: none;
  background: #f5f5f2; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: 0.18s; color: #57645d;
}

.xbtn svg { width: 16px; height: 16px; }
.xbtn:hover { background: #e8e4d9; transform: rotate(90deg); }

.prof-head { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.prof-av {
  width: 64px; height: 64px; border-radius: 18px;
  background: linear-gradient(135deg, #0c2323, #148a74);
  color: white; font-size: 24px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.prof-label { font-size: 10px; color: #148a74; font-weight: 700; letter-spacing: 1.5px; margin: 0 0 3px; }
.prof-head h3 { margin: 0 0 3px; font-size: 20px; color: #13211c; }
.prof-sub { font-size: 13px; color: #7b8781; text-transform: capitalize; margin: 0; }

.prof-details { background: #f8f6f2; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
.drow { display: flex; justify-content: space-between; font-size: 13px; }
.drow span:first-child { color: #8a938f; }
.drow span:last-child { color: #1d2a26; font-weight: 500; }
.capitalize { text-transform: capitalize; }
.badge-active { background: rgba(20, 138, 116, 0.1); color: #148a74; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }

.logout-btn { width: 100%; height: 46px; border-radius: 13px; border: none; background: #fff0f0; color: #c93b3b; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.18s; }
.logout-btn:hover { background: #ffe0e0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 1024px) {
  .menu-trigger {
    display: block;
  }

  .topbar {
    padding: 10px 18px;
  }

  .date-range-btn span,
  .profile-meta,
  .search-shortcut {
    display: none;
  }
}
</style>
