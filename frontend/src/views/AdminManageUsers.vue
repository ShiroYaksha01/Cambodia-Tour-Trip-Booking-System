<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminLayout from '../components/admin/AdminLayout.vue'
import EditUserModal from '../components/admin/EditUserModal.vue'

const showModal = ref(false)
const selectedUser = ref<any>(null)
const activeTab = ref('All Users')
const currentPage = ref(1)
const searchQuery = ref('')
const usersPerPage = 5

const tabs = ['All Users', 'Clients', 'Providers']

const users = ref([
  {
    id: 'KH-P-2041',
    name: 'Sovannara Chhim',
    company: 'Angkor Luxe Tours Ltd.',
    role: 'Provider',
    status: 'Active',
    joined: 'Oct 12, 2023',
    avatar: 'https://i.pravatar.cc/150?img=11',
  },
  {
    id: 'KH-P-2055',
    name: 'Rithy Samnang',
    company: 'Independent Cultural Guide',
    role: 'Provider',
    status: 'Inactive',
    joined: 'Nov 04, 2023',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 'KH-C-8812',
    name: 'Eleanor Vance',
    company: 'evance@heritagecurator.com',
    role: 'Client',
    status: 'Active',
    joined: 'Sep 30, 2023',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: 'KH-C-8820',
    name: 'James Thornton',
    company: 'jthornton@luxetravel.com',
    role: 'Client',
    status: 'Active',
    joined: 'Jan 15, 2024',
    avatar: 'https://i.pravatar.cc/150?img=7',
  },
  {
    id: 'KH-P-2060',
    name: 'Dara Pich',
    company: 'Mekong River Expeditions',
    role: 'Provider',
    status: 'Suspended',
    joined: 'Feb 20, 2024',
    avatar: '',
  },
  {
    id: 'KH-C-8830',
    name: 'Sofia Mercer',
    company: 'smercer@outlook.com',
    role: 'Client',
    status: 'Inactive',
    joined: 'Mar 05, 2024',
    avatar: 'https://i.pravatar.cc/150?img=9',
  },
])

const newUserTemplate = {
  id: '',
  name: '',
  company: '',
  role: 'Client',
  status: 'Active',
  joined: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
  avatar: '',
}

const onSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
}

const filteredUsers = computed(() => {
  let list = users.value
  if (activeTab.value === 'Clients') list = list.filter(u => u.role === 'Client')
  if (activeTab.value === 'Providers') list = list.filter(u => u.role === 'Provider')
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    )
  }
  return list
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / usersPerPage)))

const pagedUsers = computed(() => {
  const start = (currentPage.value - 1) * usersPerPage
  return filteredUsers.value.slice(start, start + usersPerPage)
})

const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))

const activeCount = computed(() => users.value.filter(u => u.status === 'Active' && u.role === 'Provider').length)
const pendingCount = computed(() => users.value.filter(u => u.status === 'Inactive' || u.status === 'Suspended').length)

const setTab = (tab: string) => {
  activeTab.value = tab
  currentPage.value = 1
}

const openEdit = (user: any) => {
  selectedUser.value = { ...user }
  showModal.value = true
}

const openAddUser = () => {
  selectedUser.value = {
    ...newUserTemplate,
    id: 'KH-' + (Math.random() > 0.5 ? 'C' : 'P') + '-' + Math.floor(Math.random() * 9000 + 1000),
  }
  showModal.value = true
}

const handleUserUpdate = (updatedUser: any) => {
  const index = users.value.findIndex(u => u.id === updatedUser.id)
  if (index !== -1) {
    users.value[index] = { ...users.value[index], ...updatedUser }
  } else {
    users.value.push({
      id: updatedUser.id,
      name: updatedUser.name,
      company: updatedUser.company || '',
      role: updatedUser.role || 'Client',
      status: updatedUser.status || 'Active',
      joined: updatedUser.joined || newUserTemplate.joined,
      avatar: updatedUser.avatar || '',
    })
  }
}

const exportCSV = () => {
  const headers = ['ID', 'Name', 'Company', 'Role', 'Status', 'Joined']
  const rows = users.value.map(u => [u.id, u.name, u.company, u.role, u.status, u.joined])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'users.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <AdminLayout @search="onSearch">

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <p class="breadcrumb">Management / <span>User & Provider Central</span></p>
        <h1>User & Provider Management</h1>
        <p class="description">Oversee the ecosystem of luxury tour providers and discerning travelers.</p>
      </div>

      <div class="stats">
        <div class="stat-card">
          <p>ACTIVE PROVIDERS</p>
          <h2>{{ activeCount }}</h2>
        </div>
        <div class="stat-card warning">
          <p>PENDING VERIFICATION</p>
          <h2>{{ pendingCount }}</h2>
        </div>
      </div>
    </div>

    <!-- Search hint -->
    <div v-if="searchQuery" class="search-hint">
      Showing results for "<strong>{{ searchQuery }}</strong>" — {{ filteredUsers.length }} found
    </div>

    <!-- Table Card -->
    <div class="table-card">
      <div class="toolbar">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab"
            :class="{ active: activeTab === tab }"
            @click="setTab(tab)"
          >
            {{ tab }}
          </button>
        </div>

        <div class="toolbar-right">
          <button class="secondary-btn" @click="exportCSV">Export CSV</button>
          <button class="primary-btn" @click="openAddUser">+ Add User</button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>USER ID</th>
            <th>NAME & IDENTITY</th>
            <th>ROLE</th>
            <th>STATUS</th>
            <th>JOIN DATE</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in pagedUsers" :key="user.id">
            <td class="id">#{{ user.id }}</td>
            <td>
              <div class="user-info">
                <img v-if="user.avatar" :src="user.avatar" alt="" />
                <div v-else class="avatar-placeholder">
                  {{ user.name?.charAt(0)?.toUpperCase() || '?' }}
                </div>
                <div>
                  <h4>{{ user.name }}</h4>
                  <p>{{ user.company }}</p>
                </div>
              </div>
            </td>
            <td><span class="role">{{ user.role }}</span></td>
            <td><span class="status" :class="user.status.toLowerCase()">{{ user.status }}</span></td>
            <td>{{ user.joined }}</td>
            <td><button class="edit-btn" @click="openEdit(user)">Edit</button></td>
          </tr>

          <tr v-if="pagedUsers.length === 0">
            <td colspan="6" class="empty-state">
              {{ searchQuery ? `No users match "${searchQuery}"` : 'No users found.' }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <button
          v-for="page in pageNumbers"
          :key="page"
          :class="{ active: currentPage === page }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
      </div>
    </div>

  </AdminLayout>

  <EditUserModal
    :show="showModal"
    :user="selectedUser"
    @close="showModal = false"
    @save="handleUserUpdate"
  />
</template>

<style scoped>
* { box-sizing: border-box; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.breadcrumb { color: #89938f; margin-bottom: 12px; font-size: 14px; }
.breadcrumb span { color: #006566; font-weight: 600; }

h1 { font-size: 42px; color: #182420; margin: 0 0 12px; }
.description { color: #73807b; max-width: 500px; margin: 0; }

.search-hint {
  font-size: 14px;
  color: #73807b;
  margin-bottom: 16px;
  padding: 10px 18px;
  background: white;
  border-radius: 12px;
  border: 1px solid #ece7df;
}

.stats { display: flex; gap: 18px; flex-shrink: 0; }
.stat-card {
  width: 220px;
  background: white;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 10px 35px rgba(0,0,0,0.04);
}
.stat-card p { color: #7d8884; font-size: 12px; margin: 0; }
.stat-card h2 { margin: 14px 0 0; font-size: 38px; color: #006566; }
.warning h2 { color: #c58a22; }

.table-card {
  background: white;
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 10px 35px rgba(0,0,0,0.04);
}

.toolbar { padding: 28px; display: flex; justify-content: space-between; }
.tabs { display: flex; gap: 10px; }
.tabs button {
  height: 46px; padding: 0 18px; border-radius: 14px;
  border: none; background: #f3f0eb; cursor: pointer; font-size: 14px; transition: 0.2s;
}
.tabs button:hover { background: #e8e4d9; }
.tabs .active { background: #006566; color: white; }

.toolbar-right { display: flex; gap: 12px; }
.secondary-btn, .primary-btn {
  height: 46px; padding: 0 20px; border-radius: 14px;
  border: none; cursor: pointer; font-size: 14px; transition: 0.2s;
}
.secondary-btn { background: #f3f0eb; }
.secondary-btn:hover { background: #e8e4d9; }
.primary-btn {
  background: #006566; color: white;
  box-shadow: 0 10px 25px rgba(0,101,102,0.25);
}
.primary-btn:hover { background: #00514f; }

table { width: 100%; border-collapse: collapse; }
th {
  text-align: left; padding: 18px 28px; font-size: 12px;
  color: #8d9792; border-top: 1px solid #f2ede7; border-bottom: 1px solid #f2ede7;
}
td { padding: 24px 28px; border-bottom: 1px solid #f5f1ea; }
.id { color: #97a09b; }

.user-info { display: flex; align-items: center; gap: 16px; }
.user-info img { width: 58px; height: 58px; border-radius: 20px; object-fit: cover; }
.avatar-placeholder {
  width: 58px; height: 58px; border-radius: 20px;
  background: #e8f5f4; color: #006566;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 700; flex-shrink: 0;
}
.user-info h4 { margin: 0 0 4px; color: #1d2925; }
.user-info p { margin: 0; color: #7f8b86; font-size: 13px; }

.role {
  padding: 8px 14px; border-radius: 999px;
  background: #e8f5f4; color: #006566; font-size: 13px; font-weight: 600;
}

.status { padding: 8px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; }
.active { background: #e8f7f5; color: #00817f; }
.inactive { background: #fff4e3; color: #c78c1c; }
.suspended { background: #ffe7e7; color: #c93b3b; }

.edit-btn {
  height: 42px; padding: 0 18px; border-radius: 14px;
  border: none; background: #f3f0eb; cursor: pointer; transition: 0.2s;
}
.edit-btn:hover { background: #e8e4d9; }

.empty-state { text-align: center; color: #89938f; padding: 40px !important; }

.pagination { display: flex; justify-content: flex-end; gap: 10px; padding: 26px; }
.pagination button {
  width: 42px; height: 42px; border-radius: 14px;
  border: none; background: #f3f0eb; cursor: pointer; font-size: 14px; transition: 0.2s;
}
.pagination button:hover { background: #e8e4d9; }
.pagination .active { background: #006566; color: white; }
</style>