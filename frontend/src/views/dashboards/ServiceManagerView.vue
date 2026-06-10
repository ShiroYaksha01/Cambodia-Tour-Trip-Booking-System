<template>
  <div class="provider-suite">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Provider Suite</h2>
        <p class="subtitle">HERITAGE MANAGEMENT</p>
      </div>

      <nav class="sidebar-nav">
        <RouterLink class="nav-item" :to="{ name: 'provider-dashboard' }" exact-active-class="active">
          <span class="icon">⚙️</span>
          Command Center
        </RouterLink>
        <RouterLink class="nav-item" :to="{ name: 'provider-service' }" exact-active-class="active">
          <span class="icon">🛠️</span>
          Service Manager
        </RouterLink>
        <RouterLink class="nav-item" :to="{ name: 'provider-inventory' }" exact-active-class="active">
          <span class="icon">📊</span>
          Inventory & Pricing
        </RouterLink>
        <RouterLink class="nav-item" :to="{ name: 'provider-manifest' }" exact-active-class="active">
          <span class="icon">👥</span>
          Guest Manifest
        </RouterLink>
        <RouterLink class="nav-item" :to="{ name: 'provider-ledger' }" exact-active-class="active">
          <span class="icon">💰</span>
          Financial Ledger
        </RouterLink>
        <RouterLink class="nav-item" :to="{ name: 'provider-settings' }" exact-active-class="active">
          <span class="icon">⚙️</span>
          Settings
        </RouterLink>
      </nav>
    </aside>

    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <h1>Service Manager</h1>
          <div class="header-controls">
            <select class="month-select">
              <option>April 2026</option>
            </select>
            <div class="header-buttons">
              <button
                v-for="category in categoryOptions"
                :key="category.value"
                class="btn-secondary"
                :class="{ active: selectedCategory === category.value }"
                type="button"
                @click="selectedCategory = category.value"
              >
                {{ category.label }}
              </button>
              <button class="btn-primary" @click="openCreateModal">Create New Service</button>
            </div>
          </div>
        </div>
      </header>

      <div class="content-wrapper">
        <section class="inventory-section">
          <div class="section-header">
            <h2>{{ selectedCategoryLabel }}</h2>
            <p class="description">{{ selectedCategoryDescription }}</p>
          </div>

          <div class="services-grid">
            <div class="services-header service-manager-header">
              <div class="header-cell">SERVICE DETAILS</div>
              <div class="header-cell">DESTINATIONS</div>
              <div class="header-cell">PRICING</div>
              <div class="header-cell">STATUS</div>
              <div class="header-cell">ACTIONS</div>
            </div>

            <article v-for="(item, index) in paginatedServiceItems" :key="item.id || index" class="service-row service-manager-row">
              <div class="service-info">
                <img :src="resolveImageUrl(item.coverImage) || 'https://via.placeholder.com/120'" :alt="item.title" class="service-image" />
                <div class="service-details">
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.description || 'No description' }}</p>
                </div>
              </div>

              <div class="destinations">
                <span v-if="item.location">{{ item.location }}</span>
                <span v-else class="text-gray-400">Not set</span>
              </div>

              <div class="pricing">
                <strong>${{ Number(item.price).toFixed(2) }}</strong>
                <p>Per ticket</p>
              </div>

              <div class="status">
                <span class="status-pill" :class="item.isActive ? 'live' : 'draft'">
                  {{ item.isActive ? 'Live' : 'Draft' }}
                </span>
              </div>

              <div class="actions">
                <button @click.stop="toggleActionMenu(index)">⋯</button>
                <div v-if="actionMenuIndex === index" class="action-menu">
                  <button class="action-menu-item" @click="startEditService(item)">Update</button>
                  <button class="action-menu-item danger" @click="deleteServiceItem(item)">Delete</button>
                </div>
              </div>
            </article>

            <div class="table-foot service-manager-foot">
              <p>Showing {{ paginatedServiceItems.length }} of {{ filteredServiceItems.length }} services</p>
              <div>
                <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">Previous</button>
                <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">Next</button>
              </div>
            </div>
          </div>
        </section>

        <aside v-if="showFocusPanel" class="config-panel">
          <div class="panel-header">
            <h3>Service Focus</h3>
            <button class="close-btn" type="button" @click="showFocusPanel = false">✕</button>
          </div>

          <div class="config-section">
            <label>QUICK STATS</label>
            <div class="pricing-rules">
              <div class="rule-item">
                <span>Total Services</span>
                <p class="rule-desc">{{ services.length }} curated offerings</p>
              </div>
              <div class="rule-item">
                <span>Active Listings</span>
                <p class="rule-desc">{{ services.filter(s => s.isActive).length }} live on marketplace</p>
              </div>
            </div>
          </div>

          <div class="config-section">
            <label>AVAILABLE ACTIONS</label>
            <div class="pricing-rules">
              <div class="rule-item">
                <span>Bulk Update</span>
                <p class="rule-desc">Use category filters, then update services one by one from the actions menu.</p>
              </div>
            </div>
          </div>

          <button class="btn-update secondary" type="button" @click="showBulkUpdateInfo">Bulk Update Info</button>
          <button class="btn-update" @click="openCreateModal">Create New Offering</button>
        </aside>
      </div>

      <ServiceModal :show="showModal" :service="selectedService" @close="closeModal" @save="handleSaveService" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import ServiceModal from "../../components/provider/ServiceModal.vue";
import { fetchMyServices, createService, updateService, deleteService } from "../../services/api";
import { resolveImageUrl } from "../../utils/api";

const props = withDefaults(
  defineProps<{
    searchQuery?: string;
  }>(),
  {
    searchQuery: "",
  },
);

const services = ref<any[]>([]);
const selectedCategory = ref("all");
const showModal = ref(false);
const selectedService = ref<any>(null);
const actionMenuIndex = ref<number | null>(null);
const currentPage = ref(1);
const pageSize = 6;
const showFocusPanel = ref(true);

const categoryOptions = [
  { label: "All Services", value: "all" },
  { label: "Tours", value: "tour" },
  { label: "Hotels", value: "accommodation" },
  { label: "Transport", value: "transportation" },
] as const;

const selectedCategoryLabel = computed(() => {
  const found = categoryOptions.find((category) => category.value === selectedCategory.value);
  return found ? found.label : "All Services";
});

const selectedCategoryDescription = computed(() => {
  const descriptions: Record<string, string> = {
    all: "Browse all provider services by category.",
    tour: "Manage and curate your premium temple expeditions and cultural walks.",
    accommodation: "Manage hotel stays, room bundles, and guest accommodations.",
    transportation: "Manage transfers, shuttles, and private transport options.",
  };
  return descriptions[selectedCategory.value] || descriptions.all;
});

async function loadServices() {
  try {
    const res = await fetchMyServices();
    // API might return the list directly or wrapped in a data property
    services.value = Array.isArray(res) ? res : res.data || [];
  } catch (err) {
    console.error("Failed to fetch services:", err);
    services.value = [];
  }
}

onMounted(loadServices);

const filteredServiceItems = computed(() => {
  const query = props.searchQuery.trim().toLowerCase();

  return services.value.filter((item) => {
    const matchesCategory = selectedCategory.value === "all" || item.serviceType === selectedCategory.value;
    const matchesSearch =
      !query ||
      item.title.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.location && item.location.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredServiceItems.value.length / pageSize)));

const paginatedServiceItems = computed(() => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value;
  const start = (currentPage.value - 1) * pageSize;
  return filteredServiceItems.value.slice(start, start + pageSize);
});

function openCreateModal() {
  selectedService.value = null;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedService.value = null;
}

function toggleActionMenu(i: number) {
  actionMenuIndex.value = actionMenuIndex.value === i ? null : i;
}

function showBulkUpdateInfo() {
  alert("Bulk update is handled through the filtered service list for now. Select a category, open a service action menu, then update each matching service.");
}

function startEditService(item: any) {
  selectedService.value = item;
  showModal.value = true;
  actionMenuIndex.value = null;
}

async function deleteServiceItem(item: any) {
  const ok = window.confirm(`Delete "${item.title}"? This cannot be undone.`);
  if (!ok) {
    actionMenuIndex.value = null;
    return;
  }
  
  try {
    await deleteService(item.id);
    await loadServices();
  } catch (err) {
    console.error("Failed to delete service:", err);
    alert("Failed to delete service. Please try again.");
  }
  actionMenuIndex.value = null;
}

async function handleSaveService(formData: any) {
  try {
    if (selectedService.value && selectedService.value.id) {
      await updateService(selectedService.value.id, formData);
    } else {
      await createService(formData);
    }
    
    await loadServices();
    closeModal();
  } catch (err: any) {
    console.error("Failed to save service:", err);
    const serverMessage = err.response?.data?.message;
    const errorDetail = Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage;
    alert(`Failed to save service: ${errorDetail || 'Please check your information and try again.'}`);
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.provider-suite {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.sidebar {
  width: 200px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
  overflow-y: auto;
}

.sidebar-header {
  margin-bottom: 30px;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 11px;
  color: #999;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  text-decoration: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #f0f0f0;
}

.nav-item.active {
  background: #e8f4f0;
  color: #1b7f6a;
  border-left: 3px solid #1b7f6a;
  padding-left: 9px;
}

.nav-item .icon {
  font-size: 16px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.header-left h1 {
  margin: 0;
  font-size: 24px;
  color: #1a1a1a;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.month-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  background: white;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.btn-secondary {
  padding: 8px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f9f9f9;
}

.btn-secondary.active {
  background: #e8f4f0;
  border-color: #bfe0d8;
  color: #1b7f6a;
  font-weight: 600;
}

.btn-primary {
  padding: 8px 16px;
  background: #1b7f6a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #166a57;
}

.content-wrapper {
  display: flex;
  flex: 1;
  padding: 30px;
  gap: 30px;
}

.inventory-section {
  flex: 1;
}

.section-header {
  margin-bottom: 20px;
  border-left: 4px solid #f0ad4e;
  padding-left: 15px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1a1a1a;
}

.description {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #999;
}

.services-grid {
  background: white;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 20px;
}

.services-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  padding: 12px;
}

.service-manager-header {
  letter-spacing: 1px;
}

.header-cell {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-align: center;
  text-transform: uppercase;
}

.header-cell:first-child {
  text-align: left;
}

.service-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  border-bottom: 1px solid #f0f0f0;
  padding: 12px;
  align-items: center;
}

.service-manager-row {
  cursor: default;
}

.service-row:last-of-type {
  border-bottom: none;
}

.service-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
}

.service-details h3 {
  margin: 0;
  font-size: 14px;
  color: #1a1a1a;
}

.service-details p {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #999;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.destinations {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.destinations span {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 8px 12px;
  background: #e8f4f0;
  color: #1b7f6a;
  font-size: 12px;
  font-weight: 600;
}

.pricing {
  text-align: center;
}

.pricing strong {
  font-size: 14px;
  font-weight: 600;
  color: #1b7f6a;
}

.pricing p {
  font-size: 12px;
  color: #999;
  margin: 2px 0 0 0;
}

.status {
  text-align: center;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 62px;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-pill.live {
  background: #e7f6eb;
  color: #2d8b49;
}

.status-pill.draft {
  background: #eef1f4;
  color: #6a7580;
}

.actions {
  text-align: center;
  position: relative;
}

.actions button {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(111, 126, 134, 0.15);
  border-radius: 999px;
  background: #fff;
  color: #5e6a73;
  cursor: pointer;
}

.action-menu {
  position: absolute;
  background: white;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  border-radius: 8px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  right: 12px;
  z-index: 50;
}

.action-menu-item {
  background: transparent;
  border: 0;
  padding: 8px 12px;
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  color: #1a1a1a;
}

.action-menu-item:hover {
  background: #f5f7f7;
}

.action-menu-item.danger {
  color: #c0392b;
}

.table-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 6px 18px;
  color: #7d8790;
  font-size: 13px;
}

.table-foot div {
  display: flex;
  gap: 10px;
}

.page-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.config-panel {
  width: 280px;
  background: white;
  border-radius: 6px;
  padding: 20px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
}

.config-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.config-section label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #999;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.pricing-rules {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-item {
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.rule-item span {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
}

.rule-desc {
  margin: 2px 0 0 0;
  font-size: 11px;
  color: #999;
}

.btn-update {
  width: 100%;
  padding: 12px;
  background: #1b7f6a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  margin-top: 20px;
}

.btn-update.secondary {
  background: #eef3f2;
  color: #25504a;
  margin-top: 12px;
}

@media (max-width: 1180px) {
  .provider-suite {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .content-wrapper {
    flex-direction: column;
  }

  .config-panel {
    width: 100%;
    max-height: none;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-controls {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-buttons {
    flex-wrap: wrap;
  }

  .services-header,
  .service-row {
    grid-template-columns: 1.5fr 1fr 1fr 0.8fr 0.5fr;
  }
}
</style>
