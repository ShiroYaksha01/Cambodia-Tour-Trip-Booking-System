<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import { apiGet } from '../../utils/api'

interface ServiceImage {
  id: string
  url: string
}

interface Provider {
  id: string
  companyName: string
}

interface Service {
  id: string
  title: string
  serviceType: string
  price: number
  isActive: boolean
  location: string
  rating: number
  createdAt: string
  provider?: Provider
  images?: ServiceImage[]
}

const services = ref<Service[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const activeTab = ref('All Packages')
const currentPage = ref(1)
const search = ref('')
const perPage = 5
const tabs = ['All Packages', 'Tours', 'Accommodations', 'Transportation']

// ─── Computed ─────────────────────────────────────────────────────────────────
const filtered = computed(() => {
  let list = services.value
  if (activeTab.value === 'Tours') list = list.filter(s => s.serviceType === 'tour')
  if (activeTab.value === 'Accommodations') list = list.filter(s => s.serviceType === 'accommodation')
  if (activeTab.value === 'Transportation') list = list.filter(s => s.serviceType === 'transportation')
  
  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter(s =>
    s.title.toLowerCase().includes(q) ||
    (s.location && s.location.toLowerCase().includes(q)) ||
    (s.provider?.companyName && s.provider.companyName.toLowerCase().includes(q))
  )
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
const paged = computed(() => {
  if (currentPage.value > totalPages.value) currentPage.value = 1
  return filtered.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage)
})
const pageNums = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))
const activeCount = computed(() => services.value.filter(s => s.isActive).length)
const inactiveCount = computed(() => services.value.filter(s => !s.isActive).length)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string) => d
  ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
  : '—'

const fmtPrice = (p: number) => `$${Number(p).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const setTab = (t: string) => { activeTab.value = t; currentPage.value = 1 }

// ─── API ──────────────────────────────────────────────────────────────────────
async function fetchServices() {
  loading.value = true; error.value = null
  try {
    const res = await apiGet<any>('/services')
    services.value = Array.isArray(res) ? res : (res.data || [])
  } catch (e: any) {
    error.value = e.message || 'Failed to load packages'
  } finally {
    loading.value = false
  }
}

const exportCSV = () => {
  const rows = [['ID','Title','Type','Provider','Price','Status','Created At'], ...services.value.map(s => [s.id, s.title, s.serviceType, s.provider?.companyName || 'N/A', s.price, s.isActive ? 'Active' : 'Inactive', fmtDate(s.createdAt)])]
  const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })
  Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'packages.csv' }).click()
}

onMounted(fetchServices)
</script>

<template>
  <AdminLayout breadcrumb="Management / Tour Packages" @search="(q) => search = q">
    <div class="page-header">
      <div class="header-left">
        <h1>Packages & Quality Control</h1>
        <p class="description">Review, monitor, and audit tour packages listed by providers across the platform.</p>
      </div>
      <div class="stats">
        <div class="stat-card">
          <p>ACTIVE PACKAGES</p>
          <h2>{{ activeCount }}</h2>
        </div>
        <div class="stat-card warning">
          <p>INACTIVE / PENDING</p>
          <h2>{{ inactiveCount }}</h2>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-box">
      <div class="spinner"></div><span>Loading packages...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-box err">
      <p>⚠️ {{ error }}</p>
      <button class="sec-btn" @click="fetchServices">Retry</button>
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
          <button class="sec-btn" title="Refresh Data" @click="fetchServices">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
          <button class="sec-btn" @click="exportCSV">Export CSV</button>
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
              <th>PACKAGE & PROVIDER</th>
              <th>TYPE</th>
              <th>LOCATION</th>
              <th>PRICE</th>
              <th>STATUS</th>
              <th>DATE LISTED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in paged" :key="s.id">
              <td>
                <div class="pkg-info">
                  <div class="av">
                    <img v-if="s.images && s.images.length > 0" :src="s.images[0].url" alt="" />
                    <span v-else>{{ s.title.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div>
                    <h4>{{ s.title }}</h4>
                    <p>{{ s.provider?.companyName || 'Unknown Provider' }}</p>
                  </div>
                </div>
              </td>
              <td><span class="role">{{ s.serviceType }}</span></td>
              <td class="muted">{{ s.location || '—' }}</td>
              <td class="price-val">{{ fmtPrice(s.price) }}</td>
              <td><span class="status" :class="s.isActive ? 'active' : 'inactive'">{{ s.isActive ? 'Active' : 'Inactive' }}</span></td>
              <td>{{ fmtDate(s.createdAt) }}</td>
              <td>
                <router-link :to="`/service/${s.id}`" class="edit-btn">View</router-link>
              </td>
            </tr>
            <tr v-if="paged.length === 0">
              <td colspan="7" class="empty">
                {{ search ? `No results for "${search}" in ${activeTab}` : `No packages in "${activeTab}"` }}
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
</template>

<style scoped>
* { box-sizing: border-box; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; gap: 24px; }
.header-left { flex: 1; }
h1 { font-size: 1.8rem; color: #111827; margin: 0 0 10px; font-weight: 700; }
.description { color: #6B7280; max-width: 520px; margin: 0; font-size: 0.9rem; line-height: 1.5; }

.stats { display: flex; gap: 16px; flex-shrink: 0; }
.stat-card { width: 200px; background: #ffffff; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #E5E7EB; }
.stat-card p { color: #6B7280; font-size: 0.75rem; margin: 0; letter-spacing: 0.5px; font-weight: 700; text-transform: uppercase; }
.stat-card h2 { margin: 12px 0 0; font-size: 2rem; color: #148A74; font-weight: 700; }
.warning h2 { color: #F59E0B; }

.state-box { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 72px 0; color: #6B7280; background: #ffffff; border-radius: 16px; border: 1px solid #E5E7EB; }
.state-box.err { color: #EF4444; }
.spinner { width: 30px; height: 30px; border: 2.5px solid #F3F4F6; border-top-color: #148A74; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

.table-card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #E5E7EB; }

.toolbar { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; gap: 12px; border-bottom: 1px solid #E5E7EB; }
.tabs { display: flex; gap: 8px; }
.tabs button { height: 40px; padding: 0 16px; border-radius: 8px; border: none; background: #F3F4F6; cursor: pointer; font-size: 0.85rem; transition: 0.18s; font-weight: 600; color: #4B5563; font-family: inherit; }
.tabs button:hover { background: #E5E7EB; }
.tabs .active { background: #148A74; color: #ffffff; }

.toolbar-right { display: flex; gap: 12px; align-items: center; }

.sec-btn { height: 40px; padding: 0 18px; border-radius: 8px; border: none; cursor: pointer; font-size: 0.85rem; transition: 0.18s; white-space: nowrap; font-weight: 600; font-family: inherit; }
.sec-btn { background: #F3F4F6; color: #4B5563; }
.sec-btn:hover { background: #E5E7EB; color: #111827; }

.search-hint { padding: 12px 24px; font-size: 0.85rem; color: #6B7280; background: #F9FAFB; border-bottom: 1px solid #E5E7EB; }

.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th { padding: 14px 24px; font-size: 0.72rem; color: #9CA3AF; background: transparent; border-bottom: 1px solid #E5E7EB; letter-spacing: 0.05em; font-weight: 700; text-transform: uppercase; }
td { padding: 16px 24px; border-bottom: 1px solid #F3F4F6; vertical-align: middle; font-size: 0.85rem; color: #111827; }
tr:hover td { background: #F9FAFB; }
tr:last-child td { border-bottom: none; }

.muted { color: #6B7280; }
.price-val { font-weight: 700; color: #148A74; }

.pkg-info { display: flex; align-items: center; gap: 12px; }
.av { width: 44px; height: 44px; border-radius: 8px; background: #F3F4F6; color: #148A74; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 700; flex-shrink: 0; overflow: hidden; }
.av img { width: 100%; height: 100%; object-fit: cover; }
.pkg-info h4 { margin: 0 0 2px; color: #111827; font-size: 0.9rem; font-weight: 600; }
.pkg-info p { margin: 0; color: #6B7280; font-size: 0.75rem; font-family: monospace; }

.role { padding: 4px 12px; border-radius: 999px; background: rgba(20, 138, 116, 0.1); color: #148A74; font-size: 0.72rem; font-weight: 700; text-transform: capitalize; }
.status { padding: 4px 12px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; text-transform: capitalize; }
.status.active { background: rgba(20, 138, 116, 0.1); color: #148A74; }
.status.inactive { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }

.edit-btn { height: 34px; padding: 0 14px; border-radius: 6px; border: 1px solid #E5E7EB; background: #ffffff; color: #111827; cursor: pointer; transition: 0.18s; font-size: 0.8rem; font-weight: 600; font-family: inherit; }
.edit-btn:hover { background: #148A74; color: #ffffff; border-color: #148A74; }
.empty { text-align: center; color: #6B7280; padding: 48px !important; font-size: 0.9rem; }

.pagination { display: flex; justify-content: flex-end; gap: 8px; padding: 20px 24px; border-top: 1px solid #E5E7EB; }
.pagination button { width: 36px; height: 36px; border-radius: 8px; border: 1px solid transparent; background: #F3F4F6; color: #4B5563; cursor: pointer; font-size: 0.85rem; transition: 0.18s; font-weight: 600; font-family: inherit; }
.pagination button:hover { background: #E5E7EB; color: #111827; }
.pagination .active { background: #148A74; color: #ffffff; border-color: #148A74; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
