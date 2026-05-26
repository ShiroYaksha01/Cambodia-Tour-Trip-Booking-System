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

.sec-btn { height: 40px; padding: 0 18px; border-radius: 12px; border: none; cursor: pointer; font-size: 13px; transition: 0.18s; white-space: nowrap; font-weight: 600; }
.sec-btn { background: #f3f0eb; color: #1d2925; }
.sec-btn:hover { background: #e8e4d9; }

.search-hint { padding: 10px 24px; font-size: 13px; color: #73807b; background: #faf8f5; border-bottom: 1px solid #f2ede7; }

.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 14px 24px; font-size: 10px; color: #8d9792; background: #faf8f5; border-bottom: 1px solid #f2ede7; letter-spacing: 0.8px; font-weight: 800; }
td { padding: 16px 24px; border-bottom: 1px solid #f5f1ea; vertical-align: middle; }
.muted { color: #7f8b86; font-size: 13px; }
.price-val { font-weight: 700; color: #006566; font-size: 14px; }

.pkg-info { display: flex; align-items: center; gap: 12px; }
.av { width: 44px; height: 44px; border-radius: 12px; background: #e8f5f4; color: #006566; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; flex-shrink: 0; overflow: hidden; }
.av img { width: 100%; height: 100%; object-fit: cover; }
.pkg-info h4 { margin: 0 0 2px; color: #1d2925; font-size: 14px; line-height: 1.2; }
.pkg-info p { margin: 0; color: #7f8b86; font-size: 11px; }

.role { padding: 4px 12px; border-radius: 999px; background: #e8f5f4; color: #006566; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.status { padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.status.active { background: #e8f7f5; color: #00817f; }
.status.inactive { background: #fff4e3; color: #c78c1c; }

.edit-btn { height: 34px; padding: 0 16px; border-radius: 10px; border: none; background: #f3f0eb; cursor: pointer; transition: 0.18s; font-size: 13px; font-weight: 600; }
.edit-btn:hover { background: #e8e4d9; }
.empty { text-align: center; color: #89938f; padding: 48px !important; font-size: 14px; }

.pagination { display: flex; justify-content: flex-end; gap: 8px; padding: 20px 24px; }
.pagination button { width: 36px; height: 36px; border-radius: 10px; border: none; background: #f3f0eb; cursor: pointer; font-size: 13px; transition: 0.18s; font-weight: 600; }
.pagination button:hover { background: #e8e4d9; }
.pagination .active { background: #006566; color: white; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
