<script setup lang="ts">
import { reactive, watch, ref, computed } from 'vue'

const props = defineProps({
  show: Boolean,
  user: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close', 'save'])

const form = reactive({
  id: null as string | null,
  name: '',
  company: '',
  role: 'Client',
  status: '',
  joined: '',
  avatar: '',
  password: ''
})

const isSaving = ref(false)
const avatarMode = ref<'url' | 'upload' | 'none'>('url')
const avatarUrlInput = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const isNewUser = computed(() => !props.user?.name)

watch(() => props.user, (user: any) => {
  if (user) {
    form.id = user.id
    form.name = user.name || ''
    form.company = user.company || ''
    form.role = user.role || 'Client'
    form.status = user.status || 'Active'
    form.joined = user.joined || ''
    form.avatar = user.avatar || ''
    form.password = ''
    avatarUrlInput.value = user.avatar || ''
    avatarMode.value = user.avatar ? 'url' : 'none'
  }
}, { immediate: true })

const onAvatarUrlInput = () => {
  form.avatar = avatarUrlInput.value
}

const onFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    form.avatar = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

const clearAvatar = () => {
  form.avatar = ''
  avatarUrlInput.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const saveChanges = async () => {
  if (!form.name?.trim()) {
    alert('Full Name is required!')
    return
  }
  isSaving.value = true
  await new Promise(r => setTimeout(r, 600))
  emit('save', { ...form })
  isSaving.value = false
  emit('close')
}
</script>

<template>
  <transition name="fade">
    <div v-if="show" class="modal-backdrop">
      <div class="overlay" @click="emit('close')"></div>
      <div class="modal" @click.stop>

        <div class="modal-header">
          <div>
            <p class="label">USER MANAGEMENT</p>
            <h2>{{ isNewUser ? 'Add User' : 'Edit User' }}</h2>
          </div>
          <button class="close-btn" @click="emit('close')">✕</button>
        </div>

        <!-- Avatar Section -->
        <div class="profile-box">
          <div class="avatar-wrap">
            <img v-if="form.avatar" :src="form.avatar" alt="Avatar" class="avatar-img" @error="form.avatar = ''" />
            <div v-else class="avatar-blank">
              {{ form.name?.charAt(0)?.toUpperCase() || '?' }}
            </div>
          </div>
          <div class="avatar-controls">
            <p class="avatar-label">Profile Photo</p>
            <div class="avatar-mode-tabs">
              <button :class="{ active: avatarMode === 'url' }" @click="avatarMode = 'url'">URL</button>
              <button :class="{ active: avatarMode === 'upload' }" @click="avatarMode = 'upload'">Upload</button>
              <button :class="{ active: avatarMode === 'none' }" @click="avatarMode = 'none'; clearAvatar()">None</button>
            </div>
            <div v-if="avatarMode === 'url'" class="avatar-url-row">
              <input v-model="avatarUrlInput" type="text" placeholder="Paste image URL..." @input="onAvatarUrlInput" />
            </div>
            <div v-if="avatarMode === 'upload'" class="avatar-upload-row">
              <input ref="fileInputRef" type="file" accept="image/*" @change="onFileChange" />
            </div>
            <p v-if="avatarMode === 'none'" class="avatar-hint">A placeholder initial will be shown instead.</p>
          </div>
        </div>

        <!-- Form -->
        <div class="form-grid">
          <div class="input-group">
            <label>Full Name <span class="required">*</span></label>
            <input v-model="form.name" type="text" placeholder="e.g. Sovannara Chhim" />
          </div>
          <div class="input-group">
            <label>Status</label>
            <select v-model="form.status">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
          <div class="input-group">
            <label>Email / Company</label>
            <input v-model="form.company" type="text" placeholder="e.g. company@email.com" />
          </div>
          <div class="input-group">
            <label>Role</label>
            <select v-model="form.role">
              <option value="Client">Client</option>
              <option value="Provider">Provider</option>
            </select>
          </div>
          <div class="input-group">
            <label>Joined Date</label>
            <input v-model="form.joined" type="text" placeholder="e.g. Jan 01, 2024" />
          </div>
          <div class="input-group">
            <label>Change Password</label>
            <input v-model="form.password" type="password" placeholder="New password (optional)" />
          </div>
        </div>

        <small class="hint">Password: Leave blank if you don't want to change it.</small>

        <div class="footer">
          <button class="cancel-btn" @click="emit('close')" :disabled="isSaving">Cancel</button>
          <button class="save-btn" @click="saveChanges" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : isNewUser ? 'Add User' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  pointer-events: none;
}
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  pointer-events: auto;
}
.modal {
  position: relative;
  width: 660px;
  background: white;
  border-radius: 28px;
  padding: 36px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 101;
  pointer-events: auto;
  max-height: 90vh;
  overflow-y: auto;
}
@keyframes modalPop {
  from { opacity: 0; transform: scale(0.95) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.label { font-size: 12px; color: #006566; font-weight: 700; letter-spacing: 1.2px; margin: 0; }
.modal-header h2 { margin: 4px 0 0; font-size: 28px; color: #13211c; }
.close-btn {
  width: 44px; height: 44px; border: none;
  background: #f4f2ee; border-radius: 12px;
  font-size: 20px; cursor: pointer; transition: all 0.2s; flex-shrink: 0;
}
.close-btn:hover { background: #e8e4d9; transform: rotate(90deg); }

.profile-box {
  display: flex; align-items: flex-start; gap: 20px;
  background: #f8f6f2; border-radius: 20px;
  padding: 20px; margin-bottom: 28px;
}
.avatar-wrap { flex-shrink: 0; }
.avatar-img { width: 80px; height: 80px; border-radius: 18px; object-fit: cover; }
.avatar-blank {
  width: 80px; height: 80px; border-radius: 18px;
  background: #e8f5f4; color: #006566;
  display: flex; align-items: center; justify-content: center;
  font-size: 30px; font-weight: 700;
}
.avatar-controls { flex: 1; }
.avatar-label { font-size: 13px; font-weight: 600; color: #57645d; margin: 0 0 10px; }
.avatar-mode-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
.avatar-mode-tabs button {
  height: 34px; padding: 0 14px;
  border-radius: 10px; border: 1.5px solid #e5e0d5;
  background: white; font-size: 13px; cursor: pointer; transition: 0.2s;
}
.avatar-mode-tabs button.active { background: #006566; color: white; border-color: #006566; }
.avatar-url-row input {
  width: 100%; height: 42px;
  border: 1.5px solid #e5e0d5; background: #faf8f5;
  border-radius: 12px; padding: 0 14px;
  font-size: 14px; outline: none; transition: 0.2s;
}
.avatar-url-row input:focus { border-color: #006566; background: white; }
.avatar-upload-row input[type="file"] {
  width: 100%; height: 42px;
  border: 1.5px solid #e5e0d5; background: #faf8f5;
  border-radius: 12px; padding: 8px 14px;
  font-size: 14px; cursor: pointer;
}
.avatar-hint { font-size: 12.5px; color: #7b8781; margin: 4px 0 0; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 8px; }
.input-group { display: flex; flex-direction: column; }
.input-group label { margin-bottom: 8px; font-size: 13.5px; font-weight: 600; color: #57645d; }
.required { color: #e74c3c; }
.input-group input,
.input-group select {
  height: 52px; border: 1.5px solid #e5e0d5;
  background: #faf8f5; border-radius: 14px;
  padding: 0 16px; font-size: 15px; transition: all 0.2s;
}
.input-group input:focus,
.input-group select:focus {
  outline: none; border-color: #006566;
  background: white; box-shadow: 0 0 0 3px rgba(0, 101, 102, 0.1);
}

.hint { font-size: 12.5px; color: #7b8781; display: block; }
.footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 28px; }
.cancel-btn, .save-btn {
  height: 50px; padding: 0 28px; border-radius: 14px;
  font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.2s;
}
.cancel-btn { background: white; border: 1.5px solid #e5e0d5; }
.cancel-btn:hover:not(:disabled) { background: #f8f6f2; }
.save-btn { background: #006566; color: white; border: none; }
.save-btn:hover:not(:disabled) { background: #00514f; transform: translateY(-1px); }
.save-btn:disabled { opacity: 0.75; cursor: not-allowed; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>