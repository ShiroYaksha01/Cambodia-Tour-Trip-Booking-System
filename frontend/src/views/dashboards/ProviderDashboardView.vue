<template>
  <div class="provider-dashboard-view">
    <main class="main-content">
      <div class="content-wrapper">
        <section class="inventory-section">
          <div class="section-header">
            <h2>{{ activeCategoryData.title }}</h2>
            <p class="description">{{ activeCategoryData.description }}</p>
          </div>

          <div class="services-grid">
            <div class="services-header">
              <div class="header-cell">SERVICE TYPE</div>
              <div v-for="day in activeCategoryData.days" :key="day.label" class="header-cell">
                {{ day.label }}<br>{{ day.date }}
              </div>
            </div>

            <div class="service-row" v-for="service in filteredServices" :key="service.id" @click="openServiceDetail(service)" style="cursor: pointer;">
              <div class="service-info">
                <img :src="resolveImageUrl(service.image)" :alt="service.name" class="service-image">
                <div class="service-details">
                  <h3>{{ service.name }}</h3>
                  <p>{{ service.type }}</p>
                </div>
              </div>
              <div class="availability-cell" v-for="(avail, idx) in service.availability" :key="idx">
                <div class="price">${{ avail.price }}</div>
                <div class="slots">{{ avail.slots }} Left</div>
              </div>
            </div>
          </div>
        </section>

        <aside class="config-panel">
          <div class="panel-header">
            <h3>Bulk Configuration</h3>
            <button class="close-btn">✕</button>
          </div>

          <div class="config-section">
            <label>SELECTED DATE RANGE</label>
            <button type="button" class="date-display date-display-button" @click="showDatePicker = !showDatePicker">
              <span class="calendar-icon">📅</span>
              <div>
                <p class="date-range">{{ selectedDateRangeLabel }}</p>
                <p class="date-label">{{ selectedDateRangeSubtitle }}</p>
              </div>
            </button>

            <div v-if="showDatePicker" class="date-picker-popover">
              <div class="field-group compact">
                <label>Start Date (DD/MM/YYYY)</label>
                <input v-model="uiStartDate" type="text" placeholder="DD/MM/YYYY" />
              </div>
              <div class="field-group compact">
                <label>End Date (DD/MM/YYYY)</label>
                <input v-model="uiEndDate" type="text" placeholder="DD/MM/YYYY" />
              </div>
              <div class="picker-actions">
                <button type="button" class="picker-cancel" @click="resetDatePicker">Cancel</button>
                <button type="button" class="picker-apply" @click="applyDatePicker">Apply</button>
              </div>
            </div>
          </div>

          <div class="config-section">
            <label>INVENTORY CAPACITY</label>
            <div class="capacity-control">
              <span class="capacity-value">25</span>
              <div class="capacity-buttons">
                <button class="btn-icon">−</button>
                <button class="btn-icon">+</button>
              </div>
            </div>
            <p class="helper-text">{{ activeCategoryData.capacityHelper }}</p>
          </div>

          <div class="config-section">
            <label>{{ activeCategoryData.panelLabel }}</label>
            <div class="pricing-badge">{{ activeCategoryData.panelBadge }}</div>
            <div class="pricing-rules">
              <div class="rule-item">
                <input type="checkbox" checked>
                <span>{{ activeCategoryData.primaryRule.title }}</span>
                <p class="rule-desc">{{ activeCategoryData.primaryRule.description }}</p>
                <button class="btn-remove">✕</button>
              </div>
            </div>
          </div>

          <button class="btn-update">{{ activeCategoryData.updateAction }}</button>
          <button class="btn-discard">Discard Changes</button>
        </aside>
      </div>

      <div v-if="selectedService" class="modal-overlay" @click="closeServiceDetail">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ selectedService.name }}</h2>
            <button class="modal-close" @click="closeServiceDetail">✕</button>
          </div>
          <div class="modal-body">
            <div class="modal-image-section">
              <img :src="resolveImageUrl(selectedService.image)" :alt="selectedService.name" class="modal-image">
            </div>
            <div class="modal-info">
              <div class="info-group">
                <label>Type</label>
                <p>{{ selectedService.type }}</p>
              </div>
              <div class="info-group">
                <label>Total Available</label>
                <p class="total-slots">{{ editingAvailability.reduce((sum, a) => sum + a.slots, 0) }} slots</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeServiceDetail">Close</button>
            <button class="btn-edit" @click="startEditing" v-if="!isEditingService">Edit Service</button>
            <button class="btn-edit" @click="saveServiceChanges" v-else>Save Changes</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { getProviderDashboardStats } from "../../services/api";
import { resolveImageUrl } from "../../utils/api";

const props = withDefaults(
  defineProps<{
    searchQuery?: string;
  }>(),
  {
    searchQuery: "",
  },
);

const stats = ref({
  avgOccupancy: '...',
  revpar: '...',
  lowStockAlerts: '...',
  khmerNewYear: '...',
});

onMounted(async () => {
  try {
    const res = await getProviderDashboardStats();
    if (res.data) stats.value = res.data;
  } catch (err) {
    console.error("Failed to fetch dashboard stats", err);
  }
});

type ServiceRow = { id: number; name: string; type: string; image: string; availability: Array<{ price: number; slots: number }>; };
type CategoryKey = "tours" | "stays" | "transport";

const selectedService = ref<ServiceRow | null>(null);
const isEditingService = ref(false);
const editingAvailability = ref<Array<{ price: number; slots: number }>>([]);
const showDatePicker = ref(false);

// Date Helpers
const isoToUi = (iso: string) => {
  if (!iso) return ''
  const parts = iso.split('-')
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : iso
}
const uiToIso = (ui: string) => {
  if (!ui) return ''
  const parts = ui.split('/')
  return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : ui
}

const getCurrentDateIso = () => new Date().toISOString().split('T')[0];

const startDate = ref(getCurrentDateIso());
const endDate = ref(getCurrentDateIso());
const uiStartDate = ref(isoToUi(startDate.value));
const uiEndDate = ref(isoToUi(endDate.value));
const activeCategory = ref<CategoryKey>("tours");

const selectedDateRangeLabel = computed(() => `${uiStartDate.value} - ${uiEndDate.value}`);
const selectedDateRangeSubtitle = computed(() => "Selected Period");

const categoryData: Record<CategoryKey, any> = {
  tours: {
    title: "Inventory Matrix",
    description: "Master availability control for peak season tours.",
    days: [{ label: "MON", date: "01" }, { label: "TUE", date: "02" }, { label: "WED", date: "03" }, { label: "THU", date: "04" }],
    services: [{ id: 1, name: "Angkor Sunrise", type: "Tour", image: "", availability: [{ price: 45, slots: 24 }] }],
    metrics: { occupancy: "84.2%", alerts: "12", revenue: "$12.4k" },
    capacityHelper: "Sets base capacity for services.",
    panelLabel: "Pricing Engine",
    panelBadge: "SMART RULE",
    primaryRule: { title: "+20% Seasonal Surcharge", description: "Holiday range" },
    updateAction: "Update Matrix",
  },
  stays: {
    title: "Accommodation Matrix",
    description: "Manage room availability and seasonal rates.",
    days: [{ label: "MON", date: "01" }, { label: "TUE", date: "02" }, { label: "WED", date: "03" }, { label: "THU", date: "04" }],
    services: [],
    metrics: { occupancy: "0%", alerts: "0", revenue: "$0" },
    capacityHelper: "Sets base capacity for rooms.",
    panelLabel: "Pricing Engine",
    panelBadge: "SMART RULE",
    primaryRule: { title: "Standard Rate", description: "Base pricing" },
    updateAction: "Update Stays",
  },
  transport: {
    title: "Fleet Matrix",
    description: "Vehicle availability and transfer scheduling.",
    days: [{ label: "MON", date: "01" }, { label: "TUE", date: "02" }, { label: "WED", date: "03" }, { label: "THU", date: "04" }],
    services: [],
    metrics: { occupancy: "0%", alerts: "0", revenue: "$0" },
    capacityHelper: "Sets fleet capacity.",
    panelLabel: "Pricing Engine",
    panelBadge: "SMART RULE",
    primaryRule: { title: "Standard Rate", description: "Base pricing" },
    updateAction: "Update Fleet",
  },
};

const activeCategoryData = computed(() => {
  const data = categoryData[activeCategory.value] || categoryData.tours;
  return {
    ...data,
    metrics: { ...data.metrics, occupancy: stats.value.avgOccupancy, alerts: stats.value.lowStockAlerts, revenue: stats.value.revpar }
  };
});

const filteredServices = computed(() => {
  const services = activeCategoryData.value.services;
  if (!props.searchQuery.trim()) return services;
  const query = props.searchQuery.toLowerCase();
  return services.filter((s: ServiceRow) => s.name.toLowerCase().includes(query) || s.type.toLowerCase().includes(query));
});

const applyDatePicker = () => {
  startDate.value = uiToIso(uiStartDate.value);
  endDate.value = uiToIso(uiEndDate.value);
  showDatePicker.value = false;
};

const resetDatePicker = () => {
  uiStartDate.value = isoToUi(startDate.value);
  uiEndDate.value = isoToUi(endDate.value);
  showDatePicker.value = false;
};

const openServiceDetail = (service: ServiceRow) => {
  selectedService.value = service;
  editingAvailability.value = JSON.parse(JSON.stringify(service.availability));
  isEditingService.value = false;
};

const closeServiceDetail = () => { selectedService.value = null; isEditingService.value = false; };
const startEditing = () => { isEditingService.value = true; };
const saveServiceChanges = () => { if (selectedService.value) { selectedService.value.availability = JSON.parse(JSON.stringify(editingAvailability.value)); isEditingService.value = false; } };
</script>

<style scoped>
/* Keeping clean layout styles */
.provider-dashboard-view { display: flex; flex-direction: column; min-height: 100vh; background: #f5f5f5; }
.main-content { flex: 1; overflow-y: auto; }
.content-wrapper { display: flex; padding: 30px; gap: 30px; }
.inventory-section { flex: 1; }
.section-header { margin-bottom: 20px; border-left: 4px solid #f0ad4e; padding-left: 15px; }
.services-grid { background: white; border-radius: 6px; overflow: hidden; }
.services-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; background: #f5f5f5; padding: 12px; }
.header-cell { font-size: 12px; font-weight: 600; color: #666; text-align: center; }
.service-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; border-bottom: 1px solid #f0f0f0; padding: 12px; align-items: center; }
.service-image { width: 50px; height: 50px; border-radius: 4px; object-fit: cover; }
.config-panel { width: 280px; background: white; border-radius: 6px; padding: 20px; }
.date-picker-popover { margin-top: 10px; padding: 12px; border: 1px solid #e7ebea; background: #fff; box-shadow: 0 12px 24px rgba(0,0,0,0.1); border-radius: 8px; }
.field-group input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-top: 5px; }
.picker-actions { display: flex; gap: 10px; margin-top: 10px; justify-content: flex-end; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; border-radius: 12px; width: 90%; max-width: 500px; padding: 24px; }
.btn-edit { background: #1b7f6a; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.btn-cancel { background: white; border: 1px solid #ddd; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
</style>