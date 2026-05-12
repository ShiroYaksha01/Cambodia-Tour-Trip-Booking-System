<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['search'])

const searchQuery = ref('')
const showProfile = ref(false)

const onSearch = () => {
  emit('search', searchQuery.value)
}
</script>

<template>
  <header class="navbar">
    <div class="left-section">
      <div class="brand">
        <div class="logo">
          <span>C</span>
        </div>
        <div class="brand-text">
          <h2>The Heritage Curator</h2>
          <p>TOUR BOOKING SYSTEM</p>
        </div>
      </div>

      <div class="search-box">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6 6a7.5 7.5 0 0 0 10.65 10.65Z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or user ID..."
          @input="onSearch"
        />
        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''; onSearch()">✕</button>
      </div>
    </div>

    <div class="right-section">
      <button class="icon-btn">🔔</button>
      <!-- <button class="icon-btn">⚙️</button> -->

      <div class="profile" @click="showProfile = true">
        <div class="profile-info">
          <h4>Admin Profile</h4>
          <p>Super Administrator</p>
        </div>
        <img src="https://i.pravatar.cc/100?img=12" alt="Admin" />
      </div>
    </div>
  </header>

  <!-- Admin Profile Modal -->
  <transition name="fade">
    <div v-if="showProfile" class="modal-backdrop">
      <div class="overlay" @click="showProfile = false"></div>
      <div class="profile-modal" @click.stop>
        <button class="close-btn" @click="showProfile = false">✕</button>

        <div class="profile-header">
          <img src="https://i.pravatar.cc/100?img=12" alt="Admin" class="profile-avatar" />
          <div>
            <p class="role-label">ADMINISTRATOR</p>
            <h2>Admin Profile</h2>
            <p class="role-sub">Super Administrator</p>
          </div>
        </div>

        <div class="profile-details">
          <div class="detail-row">
            <span class="detail-label">Email</span>
            <span class="detail-value">admin@heritagecurator.com</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Role</span>
            <span class="detail-value">Super Administrator</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Last Login</span>
            <span class="detail-value">Today, 09:14 AM</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="status-badge">Active</span>
          </div>
        </div>

        <div class="profile-actions">
          <button class="action-outline">Edit Profile</button>
          <button class="action-danger">Logout</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.navbar {
  height: 82px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #ece7df;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 34px;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 32px;
  flex: 1;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 260px;
}

.logo {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, #006566, #00888a);
  color: white;
  font-weight: 800;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(0, 101, 102, 0.2);
  flex-shrink: 0;
}

.brand-text h2 { font-size: 22px; color: #1c2925; margin-bottom: 2px; }
.brand-text p { font-size: 11px; letter-spacing: 2px; color: #8a938f; }

.search-box {
  flex: 1;
  max-width: 520px;
  height: 50px;
  position: relative;
}

.search-box input {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  border: 1px solid #ece7df;
  background: #f7f5f2;
  padding: 0 40px 0 46px;
  outline: none;
  font-size: 14px;
  transition: 0.2s;
}

.search-box input:focus {
  border-color: #006566;
  background: white;
  box-shadow: 0 0 0 3px rgba(0, 101, 102, 0.08);
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #8a938f;
}

.clear-btn {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  color: #8a938f;
  cursor: pointer;
  font-size: 13px;
  padding: 2px 4px;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: none;
  background: #f5f2ee;
  cursor: pointer;
  transition: 0.2s;
}
.icon-btn:hover { background: #ece7df; }

.profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 18px;
  border-left: 1px solid #ece7df;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 14px;
  transition: 0.2s;
}
.profile:hover { background: #f5f2ee; }

.profile-info { text-align: right; }
.profile-info h4 { font-size: 14px; color: #1d2a26; }
.profile-info p { font-size: 12px; color: #8a938f; }

.profile img {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
}

/* Admin Profile Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
}

.profile-modal {
  position: relative;
  width: 440px;
  background: white;
  border-radius: 28px;
  padding: 36px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
  animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 201;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.94) translateY(16px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 38px;
  height: 38px;
  border: none;
  background: #f4f2ee;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: 0.2s;
}
.close-btn:hover { background: #e8e4d9; transform: rotate(90deg); }

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 22px;
  object-fit: cover;
}

.role-label {
  font-size: 11px;
  color: #006566;
  font-weight: 700;
  letter-spacing: 1.5px;
  margin-bottom: 4px;
}

.profile-header h2 { font-size: 24px; color: #13211c; margin: 0 0 4px; }
.role-sub { font-size: 13px; color: #7b8781; }

.profile-details {
  background: #f8f6f2;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label { font-size: 13px; color: #8a938f; font-weight: 500; }
.detail-value { font-size: 13.5px; color: #1d2a26; font-weight: 500; }

.status-badge {
  padding: 5px 14px;
  border-radius: 999px;
  background: #e8f7f5;
  color: #00817f;
  font-size: 12.5px;
  font-weight: 600;
}

.profile-actions {
  display: flex;
  gap: 12px;
}

.action-outline, .action-danger {
  flex: 1;
  height: 48px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.action-outline {
  background: white;
  border: 1.5px solid #e5e0d5;
  color: #1d2a26;
}
.action-outline:hover { background: #f8f6f2; }

.action-danger {
  background: #fff0f0;
  border: none;
  color: #c93b3b;
}
.action-danger:hover { background: #ffe0e0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>