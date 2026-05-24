<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{ breadcrumb?: string }>()
const router = useRouter()
const showProfile = ref(false)

const authUser = computed(() => {
  try { 
    const stored = localStorage.getItem('auth_user')
    if (stored) return JSON.parse(stored)
    // Fallback to seeded admin data if not in storage (for dev convenience)
    return {
      username: 'admin',
      email: 'admin@tourbooking.local',
      role: 'admin'
    }
  }
  catch { 
    return { username: 'admin', email: 'admin@tourbooking.local', role: 'admin' } 
  }
})

const adminName    = computed(() => authUser.value?.username || 'Admin')
const adminEmail   = computed(() => authUser.value?.email    || 'admin@tourbooking.local')
const adminRole    = computed(() => authUser.value?.role     || 'admin')
const adminInitial = computed(() => adminName.value.charAt(0).toUpperCase())

const displayBreadcrumb = computed(() => {
  if (!props.breadcrumb) return 'Management / Central'
  const parts = props.breadcrumb.split(' / ')
  if (parts.length > 1) {
    return `${parts[0]} / <span>${parts[1]}</span>`
  }
  return props.breadcrumb
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('auth_role')
  localStorage.removeItem('auth_user')
  router.push('/login')
}
</script>

<template>
  <header class="navbar">
    <!-- Left: breadcrumb -->
    <div class="breadcrumb" v-html="displayBreadcrumb"></div>

    <!-- Right: profile only -->
    <div class="profile" @click="showProfile = true">
      <div class="profile-info">
        <span class="pname">{{ adminName }}</span>
        <span class="prole">{{ adminRole }}</span>
      </div>
      <div class="avatar">{{ adminInitial }}</div>
    </div>
  </header>

  <!-- Profile modal -->
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
.navbar {
  height: 64px;
  background: white;
  border-bottom: 1px solid #ece7df;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 34px;
}

.breadcrumb { color: #89938f; margin-bottom: 5px; font-size: 17 px; }
.breadcrumb span { color: #006566; font-weight: 600; }

.profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 14px;
  cursor: pointer;
  transition: 0.18s;
}
.profile:hover { background: #f5f2ee; }

.profile-info { text-align: right; }
.pname { display: block; font-size: 14px; font-weight: 600; color: #1d2a26; }
.prole { display: block; font-size: 12px; color: #8a938f; text-transform: capitalize; }

.avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, #006566, #00888a);
  color: white; font-size: 16px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* Modal */
.modal-bd { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 300; }
.overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.32); backdrop-filter: blur(6px); }
.prof-modal {
  position: relative; width: 380px; background: white;
  border-radius: 24px; padding: 32px;
  box-shadow: 0 20px 48px rgba(0,0,0,0.13); z-index: 301;
  animation: pop 0.28s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes pop { from { opacity:0; transform:scale(0.93) translateY(16px); } to { opacity:1; transform:scale(1) translateY(0); } }

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
</style>