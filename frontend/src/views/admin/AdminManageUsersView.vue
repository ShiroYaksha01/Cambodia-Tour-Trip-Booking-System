<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import EditUserModal from '../../components/admin/EditUserModal.vue'
import AddUserModal from '../../components/admin/AddUserModal.vue'
import { apiGet, getAuthHeaders } from '../../utils/api'

interface AdminUser {
  id: string
  username: string
  email: string
  role: 'admin' | 'provider' | 'customer'
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
}

const users         = ref<AdminUser[]>([])
const loading       = ref(false)
const error         = ref<string | null>(null)
const showEditModal = ref(false)
const showAddModal  = ref(false)
const selectedUser  = ref<any>(null)

const activeTab  = ref('All Users')
const currentPage= ref(1)
const search     = ref('')
const perPage    = 5
const tabs       = ['All Users', 'Customers', 'Providers']

const toast = ref({ visible: false, message: '', type: 'success' })
let toastTimer: ReturnType<typeof setTimeout>

const API_BASE = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3000'

// ─── Computed ─────────────────────────────────────────────────────────────────
const filtered = computed(() => {
  let list = users.value
  if (activeTab.value === 'Customers')   list = list.filter(u => u.role === 'customer')
  if (activeTab.value === 'Providers') list = list.filter(u => u.role === 'provider')
  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter(u =>
    u.username.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q)
  )
  return list
})

const totalPages  = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
const paged       = computed(() => {
  if (currentPage.value > totalPages.value) currentPage.value = 1
  return filtered.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage)
})
const pageNums    = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))
const activeCount = computed(() => users.value.filter(u => u.status === 'active' && u.role === 'provider').length)
const pendingCount= computed(() => users.value.filter(u => u.status !== 'active').length)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string) => d
  ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
  : '—'

function showToast(msg: string, type: 'success' | 'error' = 'success') {
  clearTimeout(toastTimer)
  toast.value = { visible: true, message: msg, type }
  toastTimer = setTimeout(() => toast.value.visible = false, 3000)
}

const setTab = (t: string) => { activeTab.value = t; currentPage.value = 1 }
const clearSearch = () => { search.value = ''; currentPage.value = 1 }

// ─── API ──────────────────────────────────────────────────────────────────────
async function fetchUsers() {
  loading.value = true; error.value = null
  try { users.value = await apiGet<AdminUser[]>('/admin/users') }
  catch (e: any) { error.value = e.message || 'Failed to load users' }
  finally { loading.value = false }
}

async function handleEditSave(form: any) {
  try {
    const body: Record<string, any> = {
      username: form.username,
      email:    form.email,
      status:   form.status.toLowerCase(),
    }
    if (form.password?.trim()) body.password = form.password

    const res = await fetch(`${API_BASE}/users/${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(body),
    })
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Update failed') }

    const idx = users.value.findIndex(u => u.id === form.id)
    if (idx !== -1) users.value[idx] = {
      ...users.value[idx],
      username: form.username,
      email:    form.email,
      status:   body.status as any,
    }
    showToast('User updated successfully')
  } catch (e: any) { showToast(e.message || 'Update failed', 'error') }
}

async function handleAddSave(form: any) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({
        username: form.username,
        email:    form.email,
        password: form.password,
        role:     form.role,
      }),
    })
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Create failed') }

    if (form.status && form.status !== 'active') {
      const created = await res.json().catch(() => null)
      if (created?.id) {
        await fetch(`${API_BASE}/users/${created.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ status: form.status }),
        })
      }
    }

    showToast('User created successfully')
    await fetchUsers()
  } catch (e: any) { showToast(e.message || 'Create failed', 'error') }
}

const openEdit = (u: AdminUser) => {
  const roleLabel: Record<string, string> = { customer: 'Customer', provider: 'Provider', admin: 'Admin' }
  selectedUser.value = {
    id:       u.id,
    username: u.username,
    email:    u.email,
    role:     roleLabel[u.role] ?? u.role,
    status:   u.status.charAt(0).toUpperCase() + u.status.slice(1),
    joined:   fmtDate(u.createdAt),
  }
  showEditModal.value = true
}

const exportCSV = () => {
  const rows = [['ID','Username','Email','Role','Status','Joined'], ...users.value.map(u => [u.id, u.username, u.email, u.role, u.status, fmtDate(u.createdAt)])]
  const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
  Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'users.csv' }).click()
}

onMounted(fetchUsers)
</script>

<template>
  <AdminLayout breadcrumb="Management / Manage Users">
    <div class="page-header">
      <div class="header-left">
        <h1>Users Management</h1>
        <p class="description">Oversee the ecosystem of tour providers and discerning travelers.</p>
      </div>
      <div class="stats">
        <div class="stat-card">
          <p>ACTIVE PROVIDERS</p>
          <h2>{{ activeCount }}</h2>
        </div>
        <div class="stat-card warning">
          <p>PENDING / SUSPENDED</p>
          <h2>{{ pendingCount }}</h2>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-box">
      <div class="spinner"></div><span>Loading users...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-box err">
      <p>⚠️ {{ error }}</p>
      <button class="sec-btn" @click="fetchUsers">Retry</button>
    </div>

    <!-- Table Card -->
    <div v-else class="table-card">
      <div class="toolbar">
        <div class="tabs">
          <button
            v-for="tab in tabs" :key="tab"
            :class="{ active: activeTab === tab }"
            @click="setTab(tab)"
          >{{ tab }}</button>
        </div>
        <div class="toolbar-right">
          <div class="search-wrap">
            <svg class="si" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M13 13L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input
              v-model="search"
              type="search"
              placeholder="Search name or email..."
              @search="clearSearch"
            />
          </div>
          <button class="sec-btn" title="Refresh Data" @click="fetchUsers">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
          <button class="sec-btn" @click="exportCSV">Export CSV</button>
          <button class="pri-btn" @click="showAddModal = true">+ Add User</button>
        </div>
      </div>

      <div v-if="search" class="search-hint">
        <strong>{{ filtered.length }}</strong> result{{ filtered.length !== 1 ? 's' : '' }} for
        "<strong>{{ search }}</strong>" in <strong>{{ activeTab }}</strong>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>NAME & IDENTITY</th>
              <th>EMAIL</th>
              <th>ROLE</th>
              <th>STATUS</th>
              <th>JOIN DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in paged" :key="u.id">
              <td>
                <div class="user-info">
                  <div class="av">{{ u.username?.charAt(0)?.toUpperCase() || '?' }}</div>
                  <div>
                    <h4>{{ u.username }}</h4>
                    <p>{{ u.id.slice(0,8) }}...</p>
                  </div>
                </div>
              </td>
              <td class="muted">{{ u.email }}</td>
              <td><span class="role">{{ u.role }}</span></td>
              <td><span class="status" :class="u.status">{{ u.status }}</span></td>
              <td>{{ fmtDate(u.createdAt) }}</td>
              <td><button class="edit-btn" @click="openEdit(u)">Edit</button></td>
            </tr>
            <tr v-if="paged.length === 0">
              <td colspan="6" class="empty">
                {{ search ? `No results for "${search}" in ${activeTab}` : `No users in "${activeTab}"` }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button
          v-for="p in pageNums" :key="p"
          :class="{ active: currentPage === p }"
          @click="currentPage = p"
        >{{ p }}</button>
      </div>
    </div>
  </AdminLayout>

  <EditUserModal :show="showEditModal" :user="selectedUser"
    @close="showEditModal = false" @save="handleEditSave" />
  <AddUserModal :show="showAddModal"
    @close="showAddModal = false" @save="handleAddSave" />

  <transition name="fade">
    <div v-if="toast.visible" class="toast" :class="toast.type">{{ toast.message }}</div>
  </transition>
</template>

<style scoped>
* { box-sizing: border-box; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; gap: 24px; }
.header-left { flex: 1; }
h1 { font-size: 38px; color: #182420; margin: 0 0 10px; }
.description { color: #73807b; max-width: 520px; margin: 0; font-size: 14px; line-height: 1.5; }

.stats { display: flex; gap: 16px; flex-shrink: 0; }
.stat-card { width: 200px; background: white; border-radius: 24px; padding: 24px; box-shadow: 0 8px 28px rgba(0,0,0,0.05); border: 1px solid #f0ede8; }
.stat-card p { color: #7d8884; font-size: 11px; margin: 0; letter-spacing: 0.5px; font-weight: 700; }
.stat-card h2 { margin: 12px 0 0; font-size: 36px; color: #006566; }
.warning h2 { color: #c58a22; }

.state-box { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 72px 0; color: #89938f; background: white; border-radius: 28px; }
.state-box.err { color: #c93b3b; }
.spinner { width: 30px; height: 30px; border: 2.5px solid #f3f0eb; border-top-color: #006566; border-radius: 50%; animation: spin 0.7s linear infinite; }

.table-card { background: white; border-radius: 28px; overflow: hidden; box-shadow: 0 8px 28px rgba(0,0,0,0.05); border: 1px solid #f0ede8; }

.toolbar { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; gap: 12px; border-bottom: 1px solid #f2ede7; }
.tabs { display: flex; gap: 8px; }
.tabs button { height: 40px; padding: 0 16px; border-radius: 12px; border: none; background: #f3f0eb; cursor: pointer; font-size: 13px; transition: 0.18s; font-weight: 600; }
.tabs button:hover { background: #e8e4d9; }
.tabs .active { background: #006566; color: white; }

.toolbar-right { display: flex; gap: 12px; align-items: center; }

.search-wrap { position: relative; display: flex; align-items: center; }
.search-wrap input {
  height: 40px; width: 240px;
  border: 1.5px solid #e5e0d5; border-radius: 12px;
  background: #faf8f5; padding: 0 14px 0 36px;
  font-size: 13px; outline: none; transition: 0.18s;
}
.search-wrap input:focus { border-color: #006566; background: white; }
.si { position: absolute; left: 11px; width: 15px; height: 15px; color: #aab0ac; pointer-events: none; }

.sec-btn, .pri-btn { height: 40px; padding: 0 18px; border-radius: 12px; border: none; cursor: pointer; font-size: 13px; transition: 0.18s; white-space: nowrap; font-weight: 600; }
.sec-btn { background: #f3f0eb; color: #1d2925; }
.sec-btn:hover { background: #e8e4d9; }
.pri-btn { background: #006566; color: white; box-shadow: 0 6px 18px rgba(0,101,102,0.18); }
.pri-btn:hover { background: #00514f; }

.search-hint { padding: 10px 24px; font-size: 13px; color: #73807b; background: #faf8f5; border-bottom: 1px solid #f2ede7; }

.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 14px 24px; font-size: 10px; color: #8d9792; background: #faf8f5; border-bottom: 1px solid #f2ede7; letter-spacing: 0.8px; font-weight: 800; }
td { padding: 16px 24px; border-bottom: 1px solid #f5f1ea; vertical-align: middle; }
.muted { color: #7f8b86; font-size: 13px; }

.user-info { display: flex; align-items: center; gap: 12px; }
.av { width: 40px; height: 40px; border-radius: 12px; background: #e8f5f4; color: #006566; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; flex-shrink: 0; }
.user-info h4 { margin: 0 0 2px; color: #1d2925; font-size: 14px; }
.user-info p { margin: 0; color: #7f8b86; font-size: 11px; }

.role { padding: 4px 12px; border-radius: 999px; background: #e8f5f4; color: #006566; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.status { padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.status.active    { background: #e8f7f5; color: #00817f; }
.status.inactive  { background: #fff4e3; color: #c78c1c; }
.status.suspended { background: #ffe7e7; color: #c93b3b; }

.edit-btn { height: 34px; padding: 0 14px; border-radius: 10px; border: none; background: #f3f0eb; cursor: pointer; transition: 0.18s; font-size: 13px; font-weight: 600; }
.edit-btn:hover { background: #e8e4d9; }
.empty { text-align: center; color: #89938f; padding: 48px !important; font-size: 14px; }

.pagination { display: flex; justify-content: flex-end; gap: 8px; padding: 20px 24px; }
.pagination button { width: 36px; height: 36px; border-radius: 10px; border: none; background: #f3f0eb; cursor: pointer; font-size: 13px; transition: 0.18s; font-weight: 600; }
.pagination button:hover { background: #e8e4d9; }
.pagination .active { background: #006566; color: white; }

.toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 22px; border-radius: 14px; font-size: 13px; font-weight: 600; z-index: 9999; box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
.toast.success { background: #e8f7f5; color: #006566; border: 1.5px solid #006566; }
.toast.error   { background: #ffe7e7; color: #c93b3b; border: 1.5px solid #c93b3b; }
</style>