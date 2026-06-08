<script setup lang="ts">
import { reactive, watch, ref } from 'vue'

const props = defineProps({ show: Boolean, user: { type: Object, default: () => ({}) } })
const emit = defineEmits(['close', 'save'])

const form = reactive({ id: '', username: '', email: '', password: '', role: 'Customer', status: 'Active', joined: '' })
const showPass = ref(false)
const isSaving = ref(false)

watch(() => props.user, (u: any) => {
  if (u) {
    form.id       = u.id       || ''
    form.username = u.username || ''
    form.email    = u.email    || ''
    form.role     = u.role     || 'Customer'
    form.status   = u.status   || 'Active'
    form.joined   = u.joined   || ''
    form.password = ''
    showPass.value = false
  }
}, { immediate: true })

const save = async () => {
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

        <!-- Dummy inputs: tricks browser into autofilling these instead of real fields -->
        <input type="text"     style="display:none" autocomplete="username" />
        <input type="password" style="display:none" autocomplete="new-password" />

        <div class="mhead">
          <div>
            <p class="mlabel">USER MANAGEMENT</p>
            <h2>Edit User</h2>
          </div>
          <button class="xbtn" @click="emit('close')">
            <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Identity card (read-only display) -->
        <div class="id-card">
          <div class="id-av">{{ form.username?.charAt(0)?.toUpperCase() || '?' }}</div>
          <div>
            <p class="id-name">{{ form.username || '—' }}</p>
            <p class="id-email">{{ form.email }}</p>
          </div>
        </div>

        <div class="grid">
          <div class="fg">
            <label>Username</label>
            <input v-model="form.username" type="text" autocomplete="off" placeholder="Username" />
          </div>

          <div class="fg">
            <label>Status</label>
            <select v-model="form.status">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive (Disabled)</option>
              <option value="Suspended">Suspended (Banned)</option>
            </select>
          </div>

          <div class="fg span2">
            <label>Email</label>
            <input v-model="form.email" type="text" autocomplete="off" placeholder="user@email.com" />
          </div>

          <div class="fg span2">
            <label>
              New Password
              <span class="opt">leave blank to keep current</span>
            </label>
            <div class="pass-wrap">
              <input
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                autocomplete="new-password"
                readonly
                onfocus="this.removeAttribute('readonly')"
                placeholder="Enter new password to change..."
              />
              <button class="eye" type="button" @click="showPass = !showPass" :title="showPass ? 'Hide' : 'Show'">
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
          </div>

          <div class="fg span2">
            <label>Join Date <span class="readonly-tag">read-only</span></label>
            <input :value="form.joined" disabled class="dis" />
          </div>
        </div>

        <div class="foot">
          <button class="cbtn" @click="emit('close')" :disabled="isSaving">Cancel</button>
          <button class="sbtn" @click="save" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<style scoped>
.bd { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 100; }
.overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.38); backdrop-filter: blur(6px); }
.modal { position: relative; width: 560px; background: white; border-radius: 26px; padding: 34px; box-shadow: 0 20px 48px rgba(0,0,0,0.13); z-index: 101; max-height: 90vh; overflow-y: auto; animation: pop 0.26s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes pop { from { opacity:0; transform:scale(0.94) translateY(16px); } to { opacity:1; transform:scale(1) translateY(0); } }

.mhead { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.mlabel { font-size: 10px; color: #006566; font-weight: 700; letter-spacing: 1.5px; margin: 0 0 4px; }
.mhead h2 { margin: 0; font-size: 22px; color: #13211c; }
.xbtn { width: 36px; height: 36px; border: none; background: #f4f2ee; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.18s; color: #57645d; flex-shrink: 0; }
.xbtn:hover { background: #e8e4d9; transform: rotate(90deg); }

.id-card { display: flex; align-items: center; gap: 12px; background: #f8f6f2; border-radius: 14px; padding: 14px 18px; margin-bottom: 20px; }
.id-av { width: 48px; height: 48px; border-radius: 13px; background: #e8f5f4; color: #006566; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; flex-shrink: 0; }
.id-name { margin: 0 0 2px; font-size: 14px; font-weight: 600; color: #1d2925; }
.id-email { margin: 0; font-size: 12px; color: #7b8781; }

.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.span2 { grid-column: span 2; }
.fg { display: flex; flex-direction: column; }
.fg label { font-size: 12px; font-weight: 600; color: #57645d; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
.opt { font-size: 11px; color: #aab0ac; font-weight: 400; }
.readonly-tag { font-size: 11px; color: #aab0ac; font-weight: 400; background: #f0ede8; padding: 2px 8px; border-radius: 20px; }

.fg input, .fg select { height: 46px; border: 1.5px solid #e5e0d5; background: #faf8f5; border-radius: 12px; padding: 0 13px; font-size: 14px; transition: 0.18s; color: #1d2925; outline: none; }
.fg input:focus, .fg select:focus { border-color: #006566; background: white; box-shadow: 0 0 0 3px rgba(0,101,102,0.08); }
.dis { color: #b0b8b4 !important; cursor: not-allowed; background: #f4f2ee !important; }

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