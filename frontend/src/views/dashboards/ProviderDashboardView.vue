<template>
  <div class="provider-dashboard-view">
    <main class="main-content">
      <div class="content-wrapper">
        <section class="inventory-section">
          <div class="section-header">
            <h2>{{ activeCategoryData.title }}</h2>
            <p class="description">{{ activeCategoryData.description }}</p>
            <div class="category-tabs">
              <button
                v-for="cat in categoryKeys"
                :key="cat"
                :class="['tab-btn', { active: activeCategory === cat }]"
                @click="activeCategory = cat"
              >{{ categoryLabel(cat) }}</button>
            </div>
          </div>

          <div class="services-grid" :style="gridStyle">
            <div class="services-header" :style="rowGridStyle">
              <div class="header-cell">SERVICE TYPE</div>
              <div v-for="day in activeCategoryData.days" :key="day.label" class="header-cell">
                {{ day.label }} {{ day.date }}
              </div>
            </div>

            <div class="service-row" :style="rowGridStyle" v-for="service in filteredServices.slice(0, 5)" :key="service.id" @click="openServiceDetail(service)" style="cursor: pointer;">
              <div class="service-info">
                <img :src="serviceImageUrl(service.image)" :alt="service.name" class="service-image" @error="handleImageError">
                <div class="service-details">
                  <h3>{{ service.name }}</h3>
                  <p>{{ service.type }}</p>
                </div>
              </div>
              <div class="availability-cell" v-for="(avail, idx) in service.availability" :key="idx" :class="{ empty: avail.isEmpty }">
                <template v-if="!avail.isEmpty">
                  <div class="price">${{ avail.price }}</div>
                  <div class="slots">{{ avail.slots }} Left</div>
                </template>
              </div>
            </div>
          </div>
        </section>

        <aside class="config-panel">
          <div class="panel-header">
            <h3>Bulk Configuration</h3>
            <button type="button" class="close-btn" aria-label="Reset configuration" @click="discardMatrixChanges">✕</button>
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
              <span class="capacity-value">{{ capacity }}</span>
              <div class="capacity-buttons">
                <button type="button" class="btn-icon" aria-label="Decrease capacity" @click="adjustCapacity(-1)">−</button>
                <button type="button" class="btn-icon" aria-label="Increase capacity" @click="adjustCapacity(1)">+</button>
              </div>
            </div>
            <p class="helper-text">{{ activeCategoryData.capacityHelper }}</p>
          </div>

          <div class="config-section">
            <label>{{ activeCategoryData.panelLabel }}</label>
            <div class="pricing-badge">{{ activeCategoryData.panelBadge }}</div>
            <div class="pricing-rules">
              <div v-if="pricingRuleEnabled" class="rule-item">
                <input v-model="seasonalSurchargeEnabled" type="checkbox">
                <div>
                  <span>{{ activeCategoryData.primaryRule.title }}</span>
                  <p class="rule-desc">{{ activeCategoryData.primaryRule.description }}</p>
                </div>
                <button type="button" class="btn-remove" aria-label="Remove pricing rule" @click="pricingRuleEnabled = false">✕</button>
              </div>
              <button v-else type="button" class="btn-discard" @click="restorePricingRule">Restore Smart Rule</button>
            </div>
          </div>

          <button type="button" class="btn-update" @click="updateMatrix">{{ activeCategoryData.updateAction }}</button>
          <p v-if="panelMessage" class="panel-message">{{ panelMessage }}</p>
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
              <img :src="serviceImageUrl(selectedService.image)" :alt="selectedService.name" class="modal-image" @error="handleImageError">
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
            <button type="button" class="btn-cancel" @click="closeServiceDetail">Close</button>
            <!-- <button type="button" class="btn-edit" @click="startEditing" v-if="!isEditingService">Done</button> -->
            <!-- <button type="button" class="btn-edit" @click="saveServiceChanges" v-else>Save Changes</button> -->
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { getProviderDashboardStats, getProviderInventory } from "../../services/api";
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

type ServiceRow = { id: string; name: string; type: string; image: string; availability: Array<{ price: number; slots: number }>; };
type CategoryKey = "all" | "tours" | "stays" | "transport";

const selectedService = ref<ServiceRow | null>(null);
const isEditingService = ref(false);
const editingAvailability = ref<Array<{ price: number; slots: number }>>([]);
const showDatePicker = ref(false);
const capacity = ref(25);
const seasonalSurchargeEnabled = ref(true);
const pricingRuleEnabled = ref(true);
const panelMessage = ref("");

const categoryData = ref<Record<CategoryKey, any>>({
  all: { title: "All Services", description: "Overview of all services and availability.", days: [], services: [], metrics: { occupancy: "0%", alerts: "0", revenue: "$0" }, capacityHelper: "Sets base capacity.", panelLabel: "Pricing Engine", panelBadge: "SMART RULE", primaryRule: { title: "+20% Seasonal Surcharge", description: "Holiday range" }, updateAction: "Update All" },
  tours: { title: "Tour Inventory", description: "Master availability control for tours.", days: [], services: [], metrics: { occupancy: "0%", alerts: "0", revenue: "$0" }, capacityHelper: "Sets base capacity for services.", panelLabel: "Pricing Engine", panelBadge: "SMART RULE", primaryRule: { title: "+20% Seasonal Surcharge", description: "Holiday range" }, updateAction: "Update Matrix" },
  stays: { title: "Accommodation Matrix", description: "Manage room availability.", days: [], services: [], metrics: { occupancy: "0%", alerts: "0", revenue: "$0" }, capacityHelper: "Sets base capacity for rooms.", panelLabel: "Pricing Engine", panelBadge: "SMART RULE", primaryRule: { title: "Standard Rate", description: "Base pricing" }, updateAction: "Update Stays" },
  transport: { title: "Fleet Matrix", description: "Vehicle availability.", days: [], services: [], metrics: { occupancy: "0%", alerts: "0", revenue: "$0" }, capacityHelper: "Sets fleet capacity.", panelLabel: "Pricing Engine", panelBadge: "SMART RULE", primaryRule: { title: "Standard Rate", description: "Base pricing" }, updateAction: "Update Fleet" },
});

const categoryKeys = computed<CategoryKey[]>(() => ["all", "tours", "stays", "transport"]);

const categoryLabel = (cat: CategoryKey) => {
  switch (cat) {
    case "all": return "All";
    case "tours": return "Tours";
    case "stays": return "Stays";
    case "transport": return "Transport";
  }
};

const activeCategory = ref<CategoryKey>("all");

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function mapServiceType(type: string): CategoryKey {
  if (type === 'accommodation') return 'stays';
  if (type === 'transportation') return 'transport';
  return 'tours';
}

onMounted(async () => {
  try {
    const [statsRes, invRes] = await Promise.all([
      getProviderDashboardStats(),
      getProviderInventory(),
    ]);
    if (statsRes.data) stats.value = statsRes.data;

    const invData = invRes.data || invRes;
    const list = Array.isArray(invData) ? invData : invData.data || [];

    const grouped: Record<CategoryKey, any[]> = { all: [], tours: [], stays: [], transport: [] };
    const allDates: Record<CategoryKey, Date[]> = { all: [], tours: [], stays: [], transport: [] };

    for (const svc of list) {
      const cat = mapServiceType(svc.serviceType || 'tour');
      const slotMap = new Map<string, any>();
      const rawSlots: any[] = (svc.slots || []).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      rawSlots.forEach((s: any) => {
        const d = new Date(s.date);
        const key = d.toDateString();
        if (!slotMap.has(key)) slotMap.set(key, s);
        if (!allDates[cat].some(ex => ex.toDateString() === key)) {
          allDates[cat].push(d);
        }
        if (!allDates['all'].some(ex => ex.toDateString() === key)) {
          allDates['all'].push(d);
        }
      });

      grouped[cat].push({ svc, slotMap, cat });
      grouped['all'].push({ svc, slotMap, cat });
    }

    for (const cat of ['all', 'tours', 'stays', 'transport'] as CategoryKey[]) {
      allDates[cat].sort((a, b) => a.getTime() - b.getTime());
      const days = allDates[cat].slice(0, 5).map(d => ({
        label: DAY_NAMES[d.getDay()],
        date: String(d.getDate()).padStart(2, '0'),
        raw: d,
      }));

      const services = (grouped[cat] || []).map((entry: any) => {
        const svc = entry.svc;
        const slotMap = entry.slotMap;
        return {
          id: svc.id,
          name: svc.title || 'Untitled',
          type: svc.serviceType || 'tour',
          image: svc.coverImage || '',
          availability: days.map((day: any) => {
            const key = day.raw.toDateString();
            const s = slotMap.get(key);
            return {
              price: s ? Number(s.price) || 0 : null,
              slots: s ? (s.availableSlots ?? 0) : null,
              isEmpty: !s,
            };
          }),
        };
      });

      categoryData.value[cat] = {
        ...categoryData.value[cat],
        days,
        services,
      };
    }
  } catch (err) {
    console.error("Failed to fetch dashboard data", err);
  }
});

const activeCategoryData = computed(() => {
  const data = categoryData.value[activeCategory.value] || categoryData.value.tours;
  return {
    ...data,
    metrics: { ...data.metrics, occupancy: stats.value.avgOccupancy, alerts: stats.value.lowStockAlerts, revenue: stats.value.revpar }
  };
});

const dayCount = computed(() => activeCategoryData.value.days?.length || 4);

const gridStyle = computed(() => ({
  gridTemplateColumns: `minmax(260px, 2fr) repeat(${dayCount.value}, minmax(110px, 1fr))`,
}));

const rowGridStyle = computed(() => ({
  gridTemplateColumns: `minmax(260px, 2fr) repeat(${dayCount.value}, minmax(110px, 1fr))`,
}));

const filteredServices = computed(() => {
  const services = activeCategoryData.value.services;
  if (!props.searchQuery.trim()) return services;
  const query = props.searchQuery.toLowerCase();
  return services.filter((s: ServiceRow) => s.name.toLowerCase().includes(query) || s.type.toLowerCase().includes(query));
});

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

const selectedDateRangeLabel = computed(() => `${uiStartDate.value} - ${uiEndDate.value}`);
const selectedDateRangeSubtitle = computed(() => "Selected Period");

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

const fallbackImage = "/angkor.png";

const serviceImageUrl = (image?: string) => {
  if (!image) return fallbackImage;
  if (image.startsWith("/")) return image;
  return resolveImageUrl(image) || fallbackImage;
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target.src.endsWith(fallbackImage)) return;
  target.src = fallbackImage;
};

const adjustCapacity = (delta: number) => {
  capacity.value = Math.max(1, capacity.value + delta);
  panelMessage.value = "";
};

const updateMatrix = () => {
  for (const service of categoryData.value[activeCategory.value].services) {
    service.availability = service.availability.map((availability: { price: number; slots: number }) => {
      const price = seasonalSurchargeEnabled.value && pricingRuleEnabled.value
        ? Math.round(availability.price * 1.2)
        : availability.price;
      return {
        ...availability,
        price,
        slots: Math.min(capacity.value, Math.max(0, availability.slots)),
      };
    });
  }

  panelMessage.value = "Matrix updated locally. Backend sync will apply when the API is available.";
};

const discardMatrixChanges = () => {
  capacity.value = 25;
  seasonalSurchargeEnabled.value = true;
  pricingRuleEnabled.value = true;
  resetDatePicker();
  panelMessage.value = "Configuration reset.";
};

const restorePricingRule = () => {
  pricingRuleEnabled.value = true;
  seasonalSurchargeEnabled.value = true;
  panelMessage.value = "";
};
</script>

<style scoped>
.provider-dashboard-view {
  min-height: 100%;
  color: #111827;
}

.main-content {
  width: 100%;
}

.content-wrapper {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 28px;
  align-items: start;
}

.inventory-section {
  min-width: 0;
}

.section-header {
  margin-bottom: 22px;
  padding-left: 20px;
  border-left: 4px solid #f5a623;
}

.section-header h2 {
  margin: 0;
  color: #111827;
  font-size: 0.875rem;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 1.1;
}

.description {
  margin: 10px 0 0;
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.5;
}

.category-tabs {
  display: flex;
  gap: 4px;
  margin-top: 14px;
  padding: 4px;
  border-radius: 10px;
  background: #f3f4f6;
  width: fit-content;
}

.tab-btn {
  padding: 8px 18px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 400;
  cursor: pointer;
  transition: all 180ms ease;
}

.tab-btn:hover {
  color: #111827;
}

.tab-btn.active {
  background: #ffffff;
  color: #148a74;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.services-grid,
.config-panel {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 14px 34px rgba(17, 24, 39, 0.05);
}

.services-grid {
  overflow-x: auto;
}

.services-header,
.service-row {
  display: grid;
  min-width: 760px;
}

.services-header {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.header-cell {
  padding: 16px;
  color: #6b7280;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1.55;
}

.header-cell:first-child {
  text-align: left;
}

.service-row {
  align-items: stretch;
  min-height: 96px;
  border-bottom: 1px solid #eef2f3;
  transition: background 180ms ease;
}

.service-row:last-child {
  border-bottom: 0;
}

.service-row:hover {
  background: #fbfdfc;
}

.service-info {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 18px 16px;
}

.service-image {
  width: 60px;
  height: 60px;
  flex: 0 0 auto;
  border-radius: 12px;
  object-fit: cover;
  background: #f3f4f6;
}

.service-details {
  min-width: 0;
}

.service-details h3 {
  margin: 0;
  color: #111827;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.25;
}

.service-details p {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.availability-cell {
  display: grid;
  place-content: center;
  gap: 6px;
  min-height: 96px;
  padding: 16px 10px;
  text-align: center;
  border-left: 1px solid #f1f5f5;
}

.availability-cell.empty {
  background: #fafbfc;
  border-left-color: #eef2f3;
}

.price {
  color: #111827;
  font-size: 0.875rem;
  font-weight: 400;
}

.slots {
  width: fit-content;
  margin: 0 auto;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(20, 138, 116, 0.1);
  color: #148a74;
  font-size: 0.875rem;
  font-weight: 400;
}

.config-panel {
  position: sticky;
  top: 18px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 24px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-header h3 {
  margin: 0;
  color: #111827;
  font-size: 0.875rem;
  font-weight: 400;
}

.close-btn,
.btn-remove,
.btn-icon {
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #4b5563;
  cursor: pointer;
  transition:
    background 180ms ease,
    border-color 180ms ease,
    color 180ms ease;
}

.close-btn,
.btn-remove {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 400;
}

.close-btn:hover,
.btn-remove:hover,
.btn-icon:hover {
  border-color: rgba(20, 138, 116, 0.24);
  background: rgba(20, 138, 116, 0.08);
  color: #148a74;
}

.config-section {
  display: grid;
  gap: 12px;
}

.config-section > label,
.field-group label {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.date-display {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
  color: #111827;
  cursor: pointer;
}

.date-display-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  text-align: left;
}

.calendar-icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 10px;
  background: rgba(20, 138, 116, 0.1);
}

.date-range,
.date-label {
  margin: 0;
}

.date-range {
  color: #111827;
  font-size: 0.875rem;
  font-weight: 400;
}

.date-label {
  margin-top: 4px;
  color: #6b7280;
  font-size: 0.875rem;
}

.date-picker-popover {
  padding: 14px;
  border: 1px solid #e7ebea;
  background: #fff;
  box-shadow: 0 18px 42px rgba(17, 24, 39, 0.12);
  border-radius: 12px;
}

.field-group {
  display: grid;
  gap: 6px;
}

.field-group + .field-group {
  margin-top: 10px;
}

.field-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  color: #111827;
  background: #f9fafb;
}

.field-group input:focus {
  outline: none;
  border-color: rgba(20, 138, 116, 0.45);
  box-shadow: 0 0 0 4px rgba(20, 138, 116, 0.08);
}

.picker-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  justify-content: flex-end;
}

.capacity-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
}

.capacity-value {
  color: #111827;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1;
}

.capacity-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 400;
}

.helper-text,
.rule-desc {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

.pricing-badge {
  width: fit-content;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(245, 166, 35, 0.14);
  color: #b67912;
  font-size: 0.875rem;
  font-weight: 400;
  letter-spacing: 0.06em;
}

.pricing-rules {
  display: grid;
  gap: 10px;
}

.rule-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: start;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
}

.rule-item input {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: #148a74;
}

.rule-item span {
  color: #111827;
  font-weight: 400;
  line-height: 1.3;
}

.panel-message {
  margin: -4px 0 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(20, 138, 116, 0.1);
  color: #117864;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.45;
}

.btn-update,
.btn-discard,
.picker-apply,
.picker-cancel,
.btn-edit,
.btn-cancel {
  min-height: 42px;
  padding: 10px 16px;
  border-radius: 10px;
  font: inherit;
  font-weight: 400;
  cursor: pointer;
}

.btn-update,
.picker-apply,
.btn-edit {
  border: 0;
  background: #148a74;
  color: #ffffff;
  box-shadow: 0 14px 30px rgba(20, 138, 116, 0.18);
}

.btn-update:hover,
.picker-apply:hover,
.btn-edit:hover {
  background: #117864;
}

.btn-discard,
.picker-cancel,
.btn-cancel {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #4b5563;
}

.btn-discard:hover,
.picker-cancel:hover,
.btn-cancel:hover {
  background: #f3f4f6;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(17, 24, 39, 0.5);
}

.modal-content {
  width: min(100%, 560px);
  border-radius: 16px;
  background: white;
  padding: 24px;
  box-shadow: 0 24px 80px rgba(17, 24, 39, 0.25);
}

.modal-header,
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.modal-header h2 {
  margin: 0;
  color: #111827;
  font-size: 0.875rem;
  font-weight: 400;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
  cursor: pointer;
}

.modal-body {
  display: grid;
  gap: 16px;
  margin: 20px 0;
}

.modal-image {
  width: 100%;
  height: 220px;
  border-radius: 12px;
  object-fit: cover;
  background: #f3f4f6;
}

.info-group label {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 400;
  text-transform: uppercase;
}

.info-group p {
  margin: 6px 0 0;
  color: #111827;
  font-weight: 400;
}

@media (max-width: 1180px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .config-panel {
    position: static;
  }
}

@media (max-width: 720px) {
  .section-header {
    padding-left: 12px;
  }

  .section-header h2 {
    font-size: 0.875rem;
  }

  .description {
    font-size: 0.875rem;
  }

  .category-tabs {
    width: 100%;
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
  }

  .tab-btn {
    white-space: nowrap;
    padding: 6px 14px;
    font-size: 0.875rem;
  }

  .services-header,
  .service-row {
    min-width: 600px;
  }

  .header-cell {
    padding: 10px 8px;
    font-size: 0.875rem;
  }

  .service-info {
    padding: 12px 10px;
    gap: 10px;
  }

  .service-image {
    width: 44px;
    height: 44px;
  }

  .service-details h3 {
    font-size: 0.875rem;
  }

  .service-details p {
    font-size: 0.875rem;
  }

  .availability-cell {
    min-height: 72px;
    padding: 10px 6px;
  }

  .price {
    font-size: 0.875rem;
  }

  .slots {
    font-size: 0.875rem;
    padding: 2px 8px;
  }

  .config-panel {
    padding: 16px;
  }

  .modal-overlay {
    padding: 12px;
  }

  .modal-content {
    padding: 16px;
    border-radius: 12px;
  }

  .modal-header h2 {
    font-size: 0.875rem;
  }

  .modal-image {
    height: 160px;
  }

  .info-group p {
    font-size: 0.875rem;
  }

  .btn-update,
  .btn-discard,
  .btn-edit,
  .btn-cancel {
    min-height: 38px;
    padding: 8px 14px;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    gap: 16px;
  }

  .services-header,
  .service-row {
    min-width: 460px;
  }

  .header-cell {
    padding: 8px 4px;
    font-size: 0.875rem;
  }

  .service-info {
    padding: 10px 8px;
    gap: 8px;
  }

  .service-image {
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }

  .service-details h3 {
    font-size: 0.875rem;
  }

  .availability-cell {
    min-height: 64px;
    padding: 8px 4px;
  }

  .price {
    font-size: 0.875rem;
  }

  .config-panel {
    padding: 12px;
    gap: 16px;
  }

  .panel-header h3 {
    font-size: 0.875rem;
  }

  .date-display-button {
    padding: 10px;
  }

  .capacity-value {
    font-size: 0.875rem;
  }

  .modal-overlay {
    padding: 8px;
    align-items: flex-end;
  }

  .modal-content {
    width: 100%;
    border-radius: 12px 12px 0 0;
    max-height: 85vh;
    overflow-y: auto;
  }

  .modal-image {
    height: 140px;
  }

  .modal-footer {
    flex-direction: column-reverse;
    gap: 8px;
  }

  .modal-footer button {
    width: 100%;
  }

  .rule-item {
    grid-template-columns: auto 1fr;
    padding: 10px;
    gap: 8px;
  }

  .rule-item .btn-remove {
    grid-column: 1 / -1;
    justify-self: end;
  }
}
</style>
