<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'save'])

const form = reactive({ username: '', email: '', password: '', role: 'customer', status: 'active' })
const errors = reactive({ username: '', email: '', password: '' })
const showPass = ref(false)
const isSaving = ref(false)

watch(() => props.show, (v) => {
  if (v) {
    form.username = ''; form.email = ''; form.password = ''
    form.role = 'customer'; form.status = 'active'
    errors.username = ''; errors.email = ''; errors.password = ''
    showPass.value = false
  }
})

const validate = () => {
  errors.username = form.username.trim() ? '' : 'Required'
  errors.email    = form.email.trim()    ? '' : 'Required'
  errors.password = form.password.trim() ? '' : 'Required'
  return !errors.username && !errors.email && !errors.password
}

const save = async () => {
  if (!validate()) return
  isSaving.value = true
  await new Promise(r => setTimeout(r, 280))
  emit('save', { ...form })
  isSaving.value = false
  emit('close')
}
</script>

<template>
  <transition name="fade">
    <div v-if="show" class="bd">
      <div class="overlay" @click="emit('close')"></div>
      <div class="modal">

        <div class="mhead">
          <div>
            <p class="mlabel">USER MANAGEMENT</p>
            <h2>Add New User</h2>
          </div>
          <button class="xbtn" @click="emit('close')">
            <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="grid">
          <div class="fg" :class="{ err: errors.username }">
            <label>Username <span class="req">*</span></label>
            <input v-model="form.username" type="text" autocomplete="off" placeholder="e.g. Sovannara" />
            <span v-if="errors.username" class="emsg">{{ errors.username }}</span>
          </div>

          <div class="fg" :class="{ err: errors.email }">
            <label>Email <span class="req">*</span></label>
            <input v-model="form.email" type="email" autocomplete="off" placeholder="user@email.com" />
            <span v-if="errors.email" class="emsg">{{ errors.email }}</span>
          </div>

          <div class="fg" :class="{ err: errors.password }">
            <label>Password <span class="req">*</span></label>
            <div class="pass-wrap">
              <input
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Set a password"
              />
              <button class="eye" type="button" @click="showPass = !showPass">
                <svg v-if="!showPass" viewBox="0 0 24 24" fill="none" width="16" height="16">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" width="16" height="16">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <span v-if="errors.password" class="emsg">{{ errors.password }}</span>
          </div>

          <div class="fg">
            <label>Role</label>
            <select v-model="form.role">
              <option value="customer">Customer</option>
              <option value="provider">Provider</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div class="fg span2">
            <label>Status</label>
            <select v-model="form.status">
              <option value="active">Active</option>
              <option value="inactive">Inactive (Disabled)</option>
              <option value="suspended">Suspended (Banned)</option>
            </select>
          </div>
        </div>

        <div class="foot">
          <button class="cbtn" @click="emit('close')" :disabled="isSaving">Cancel</button>
          <button class="sbtn" @click="save" :disabled="isSaving">
            {{ isSaving ? 'Creating...' : 'Add User' }}
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<style scoped>
.bd { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 100; }
.overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.38); backdrop-filter: blur(6px); }
.modal { position: relative; width: 540px; background: white; border-radius: 26px; padding: 34px; box-shadow: 0 20px 48px rgba(0,0,0,0.13); z-index: 101; max-height: 90vh; overflow-y: auto; animation: pop 0.26s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes pop { from { opacity:0; transform:scale(0.94) translateY(16px); } to { opacity:1; transform:scale(1) translateY(0); } }

.mhead { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.mlabel { font-size: 10px; color: #006566; font-weight: 700; letter-spacing: 1.5px; margin: 0 0 4px; }
.mhead h2 { margin: 0; font-size: 22px; color: #13211c; }
.xbtn { width: 36px; height: 36px; border: none; background: #f4f2ee; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.18s; color: #57645d; flex-shrink: 0; }
.xbtn:hover { background: #e8e4d9; transform: rotate(90deg); }

.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.span2 { grid-column: span 2; }
.fg { display: flex; flex-direction: column; }
.fg label { font-size: 12px; font-weight: 600; color: #57645d; margin-bottom: 6px; }
.req { color: #e74c3c; margin-left: 2px; }

.fg input, .fg select { height: 46px; border: 1.5px solid #e5e0d5; background: #faf8f5; border-radius: 12px; padding: 0 13px; font-size: 14px; transition: 0.18s; color: #1d2925; outline: none; }
.fg input:focus, .fg select:focus { border-color: #006566; background: white; box-shadow: 0 0 0 3px rgba(0,101,102,0.08); }
.fg.err input, .fg.err select { border-color: #e74c3c; }
.emsg { font-size: 11px; color: #e74c3c; margin-top: 4px; }

.pass-wrap { position: relative; display: flex; }
.pass-wrap input { flex: 1; padding-right: 42px; }
.eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); border: none; background: none; cursor: pointer; color: #8a938f; display: flex; align-items: center; padding: 0; }
.eye:hover { color: #006566; }

.foot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 22px; }
.cbtn, .sbtn { height: 46px; padding: 0 24px; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer; transition: 0.18s; }
.cbtn { background: white; border: 1.5px solid #e5e0d5; color: #57645d; }
.cbtn:hover:not(:disabled) { background: #f8f6f2; }
.sbtn { background: #006566; color: white; border: none; }
.sbtn:hover:not(:disabled) { background: #00514f; }
.sbtn:disabled, .cbtn:disabled { opacity: 0.55; cursor: not-allowed; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>