<template>
  <div class="inventory-shell">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-mark">🏛️</div>
        <div>
          <h1>Angkor Treasures</h1>
          <p>VERIFIED PROVIDER</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <RouterLink class="nav-item" :to="{ name: 'provider-inventory' }" exact-active-class="active">
          <span>🗓️</span>
          Inventory
        </RouterLink>
        <RouterLink class="nav-item" :to="{ name: 'provider-manifest' }" exact-active-class="active">
          <span>👥</span>
          Manifest
        </RouterLink>
        <RouterLink class="nav-item" :to="{ name: 'provider-ledger' }" exact-active-class="active">
          <span>💳</span>
          Finance
        </RouterLink>
        <a href="#" class="nav-item" @click.prevent="showSupport">
          <span>💬</span>
          Messages
        </a>
        <RouterLink class="nav-item" :to="{ name: 'provider-settings' }" exact-active-class="active">
          <span>⚙️</span>
          Settings
        </RouterLink>
      </nav>

      <button class="new-booking-btn" @click="router.push({ name: 'provider-service' })">New Booking</button>

      <div class="sidebar-footer">
        <button class="footer-link" @click="showSupport">Support</button>
        <button class="footer-link" @click="logout">Logout</button>
      </div>
    </aside>

    <main class="inventory-main">
      <header class="topbar">
        <div class="topbar-title">Inventory & Pricing</div>
        <div class="topbar-actions">
          <span v-if="hasChanges" class="unsaved-badge">Unsaved changes</span>
          <button v-if="hasChanges" class="save-btn" @click="saveAll">Save All Changes</button>
          <div class="sync-pill">⟳ Syncing: All OTAs</div>
        </div>
      </header>

      <section class="metrics-row">
        <article class="metric-card metric-teal">
          <p>AVG. OCCUPANCY</p>
          <h3>{{ avgOccupancy }}%</h3>
          <span>+12% from March</span>
        </article>
        <article class="metric-card metric-gold">
          <p>REVPAR</p>
          <h3>${{ revpar }}</h3>
          <span>Optimal Pricing Active</span>
        </article>
        <article class="metric-card metric-red">
          <p>LOW STOCK ALERTS</p>
          <h3>{{ lowStockCount }}</h3>
          <span>{{ lowStockAlerts }}</span>
        </article>
        <article class="metric-card metric-neutral">
          <p>SUMMER DEMAND</p>
          <h3>76%</h3>
          <span>Early Summer Booking Trend</span>
        </article>
      </section>

      <section class="content-grid">
        <div class="left-panel">
          <div class="calendar-card">
            <div class="calendar-header">
              <button class="icon-btn" @click="shiftWeek(-1)">‹</button>
              <h2>{{ currentMonthLabel }}</h2>
              <button class="icon-btn" @click="shiftWeek(1)">›</button>
              <div class="date-scheduler">
                <input v-model="uiScheduleDate" type="text" class="date-picker-input" placeholder="DD/MM/YYYY" @blur="goToDate" />
              </div>
              <div class="view-toggle">
                <button :class="{ active: viewMode === 'month' }" @click="viewMode = 'month'">Month</button>
                <button :class="{ active: viewMode === 'fortnight' }" @click="viewMode = 'fortnight'">Fortnight</button>
              </div>
            </div>

              <div class="inventory-table">
              <div class="inventory-head">
                <span>PRODUCT / SERVICE</span>
                <span v-for="i in 5" :key="i">SCHEDULE {{ i }}</span>
              </div>

              <div
                v-for="(item, itemIdx) in filteredInventoryItems"
                :key="item.id || itemIdx"
                class="inventory-row"
              >
                <div class="item-info" @click="openDrawer(itemIdx)">
                  <img :src="item.image" :alt="item.name" />
                  <div>
                    <h3>{{ item.name }}</h3>
                    <p>{{ item.subtitle }}</p>
                  </div>
                </div>
                <div
                  v-for="(day, dayIdx) in item.days"
                  :key="dayIdx"
                  class="day-cell"
                  :class="day.status"
                  @click="startEdit(itemIdx, dayIdx)"
                >
                  <template v-if="editingItemIdx === itemIdx && editingDayIdx === dayIdx">
                    <input
                      v-model="editUiDate"
                      type="text"
                      class="cell-input cell-date"
                      placeholder="DD/MM/YYYY"
                      @click.stop
                      @keyup.enter="confirmEdit(itemIdx, dayIdx)"
                      @keyup.escape="cancelEdit"
                    />
                    <input
                      v-model.number="editSlots"
                      type="number"
                      min="0"
                      class="cell-input"
                      placeholder="slots"
                      @click.stop
                      @keyup.enter="confirmEdit(itemIdx, dayIdx)"
                      @keyup.escape="cancelEdit"
                    />
                    <input
                      v-model.number="editPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      class="cell-input"
                      placeholder="price"
                      @click.stop
                      @keyup.enter="confirmEdit(itemIdx, dayIdx)"
                      @keyup.escape="cancelEdit"
                    />
                    <div class="cell-actions">
                      <button class="cell-save" @click.stop="confirmEdit(itemIdx, dayIdx)">✓</button>
                      <button class="cell-cancel" @click.stop="cancelEdit">✕</button>
                    </div>
                  </template>
                  <template v-else>
                    <span class="day-date-label">{{ formatShortDate(day.date) }}</span>
                    <strong>{{ dayLabel(day) }}</strong>
                    <span>{{ dayPrice(day) }}</span>
                  </template>
                </div>
              </div>
            </div>

            <div class="legend-row">
              <div><span class="dot available"></span> Available</div>
              <div><span class="dot low"></span> Low Stock (&lt;10%)</div>
              <div><span class="dot peak"></span> Peak Demand</div>
              <a href="#" @click.prevent="exportMatrix">Export Matrix</a>
            </div>
          </div>
        </div>

        <aside class="right-panel">
          <div class="panel-card">
            <h3>Pricing Engine</h3>
            <div class="field-group">
              <label>Rule Type</label>
              <select v-model="pricingRuleType">
                <option value="markup">Add % Markup</option>
                <option value="discount">Apply Discount</option>
                <option value="fixed">Set Fixed Price</option>
              </select>
            </div>
            <div class="field-group">
              <label>Value</label>
              <input v-model.number="pricingValue" type="number" />
            </div>
            <div class="field-group">
              <label>Target Product</label>
              <select v-model="pricingTarget">
                <option value="all">All Products</option>
                <option v-for="item in inventoryItems" :key="item.id || item.name" :value="item.name">{{ item.name }}</option>
              </select>
            </div>
            <div class="field-group switch-row">
              <label>Auto-Apply Logic</label>
              <div class="switch-on">Apply only when stock &lt; 20%</div>
            </div>
            <button class="primary-action amber" @click="applyPricing">Update Market Prices</button>
          </div>

          <div class="panel-card">
            <h3>Inventory Controller</h3>
            <div class="notice-box">
              <strong>Summer Scheduling</strong>
              <p>June–August is the early summer booking window. Adjust inventory accordingly.</p>
            </div>
            <div class="two-col">
              <div class="field-group">
                <label>Start Date</label>
                <input v-model="controllerStartDate" type="text" placeholder="DD/MM/YYYY" />
              </div>
              <div class="field-group">
                <label>End Date</label>
                <input v-model="controllerEndDate" type="text" placeholder="DD/MM/YYYY" />
              </div>
            </div>
            <div class="field-group">
              <label>Max Pax / Daily Limit</label>
              <input v-model.number="controllerMaxPax" type="number" />
              <small>Value auto-triggers at 100% occupancy.</small>
            </div>
            <button class="secondary-action" @click="batchProcess">Batch Process Dates</button>
          </div>

          <div class="panel-card small">
            <h3>Recent Changes</h3>
            <ul class="changes-list">
              <li v-for="(change, i) in recentChanges" :key="i">
                <span class="bullet" :class="change.type"></span>
                {{ change.text }}
              </li>
              <li v-if="recentChanges.length === 0" style="color: #7b8a91; font-size: 14px;">No changes yet</li>
            </ul>
          </div>
        </aside>
      </section>

      <button v-if="hasChanges" class="floating-save" @click="saveAll">💾</button>

      <div v-if="selectedItem" class="detail-drawer" @click.self="cancelDrawer">
        <div class="drawer-card">
          <div class="drawer-header">
            <div>
              <p>Selected Item</p>
              <h3>{{ selectedItem.name }}</h3>
            </div>
            <button class="icon-btn" @click="cancelDrawer">✕</button>
          </div>
          <img :src="selectedItem.image" :alt="selectedItem.name" class="drawer-image" />
          <p class="drawer-subtitle">{{ selectedItem.subtitle }}</p>
          <div class="drawer-grid">
            <div v-for="(_, index) in drawerDays" :key="index" class="drawer-day">
              <div class="drawer-field">
                <label>Date (DD/MM/YYYY)</label>
                <input v-model="drawerUiDates[index]" type="text" class="drawer-date-input" placeholder="DD/MM/YYYY" />
              </div>
              <div class="drawer-field">
                <label>Slots</label>
                <input v-model.number="drawerDays[index].slots" type="number" min="0" />
              </div>
              <div class="drawer-field">
                <label>Price ($)</label>
                <input v-model.number="drawerDays[index].price" type="number" min="0" step="0.01" />
              </div>
              <div class="drawer-field">
                <label>Status</label>
                <select v-model="drawerDays[index].status">
                  <option value="available">Available</option>
                  <option value="low">Low Stock</option>
                  <option value="peak">Peak</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>
          <div class="drawer-footer">
            <button class="drawer-save-btn" @click="saveDrawer">Save Changes</button>
            <button class="drawer-cancel-btn" @click="cancelDrawer">Cancel</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  getProviderInventory,
  updateInventorySlot,
} from "../../services/api";
import { resolveImageUrl } from "../../utils/api";
import { clearAuthData } from "../../utils/auth";

const props = withDefaults(
  defineProps<{
    searchQuery?: string;
  }>(),
  {
    searchQuery: "",
  },
);

const router = useRouter();

type InventoryDay = {
  id: string | null;
  date: string;
  slots: number;
  price: number;
  status: string;
};

type InventoryItem = {
  id: string | null;
  name: string;
  subtitle: string;
  image: string;
  days: InventoryDay[];
};

const selectedItem = ref<InventoryItem | null>(null);
const selectedItemIndex = ref<number | null>(null);
const drawerDays = ref<InventoryDay[]>([]);
const drawerUiDates = ref<string[]>([]);

// Date conversion helpers
function isoToUi(iso: string): string {
  if (!iso) return ''
  const parts = iso.split('T')[0].split('-')
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : iso
}

function uiToIso(ui: string): string {
  if (!ui) return ''
  const parts = ui.split('/')
  return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : ui
}

// Editing state
const editingItemIdx = ref<number | null>(null);
const editingDayIdx = ref<number | null>(null);
const editUiDate = ref("");
const editSlots = ref(0);
const editPrice = ref(0);

// Panel state
const pricingRuleType = ref("markup");
const pricingValue = ref(25);
const pricingTarget = ref("all");
const controllerStartDate = ref("13/07/2026");
const controllerEndDate = ref("16/07/2026");
const controllerMaxPax = ref(15);
const recentChanges = ref<{ type: string; text: string }[]>([]);
const hasChanges = ref(false);
const viewMode = ref<"month" | "fortnight">("fortnight");

const avgOccupancy = ref(76);
const revpar = ref(128);
const lowStockCount = computed(() => {
  return inventoryItems.value.reduce((acc, item) => {
    return acc + item.days.filter(d => d.status === 'low').length;
  }, 0);
});
const lowStockAlerts = computed(() => {
  const count = lowStockCount.value;
  return count > 0 ? `${count} items need attention` : "All systems normal";
});

// Date scheduling
const today = new Date();
today.setHours(0, 0, 0, 0);
const monday = new Date(today);
const dow = monday.getDay();
monday.setDate(monday.getDate() + (dow === 0 ? -6 : 1 - dow));

const currentStartDate = ref<Date>(monday);
const uiScheduleDate = ref(isoToUi(monday.toISOString()));

function getMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

function goToDate() {
  if (!uiScheduleDate.value) return;
  const iso = uiToIso(uiScheduleDate.value);
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return;
  currentStartDate.value = getMonday(d);
}

function shiftWeek(dir: number) {
  const d = new Date(currentStartDate.value);
  d.setDate(d.getDate() + dir * 7);
  currentStartDate.value = d;
  uiScheduleDate.value = isoToUi(d.toISOString());
}

const currentDates = computed(() => {
  const result: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(currentStartDate.value);
    d.setDate(d.getDate() + i);
    result.push(d);
  }
  return result;
});

const currentMonthLabel = computed(() => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const d = currentDates.value[2] || new Date();
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
});

function formatShortDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function dayLabel(day: InventoryDay) {
  if (day.status === "closed") return "CLOSED";
  return `${day.slots} left`;
}

function dayPrice(day: InventoryDay) {
  return `$${day.price}`;
}

const inventoryItems = ref<InventoryItem[]>([]);

onMounted(async () => {
  try {
    const res = await getProviderInventory();
    const data = res.data || res; 
    const list = Array.isArray(data) ? data : data.data || [];
    inventoryItems.value = list.map((svc: any) => ({
      id: svc.id,
      name: svc.title || "Untitled",
      subtitle: svc.description || "",
      image: resolveImageUrl(svc.coverImage) || "https://via.placeholder.com/120",
      days: (svc.slots || []).map((slot: any) => ({
        id: slot.id,
        date: typeof slot.date === "string" ? slot.date.slice(0, 10) : "",
        slots: slot.availableSlots ?? 0,
        price: Number(slot.price) || 0,
        status: slot.status === "low_stock" ? "low" : slot.status === "peak_demand" ? "peak" : (slot.status || "available"),
      })),
    }));
  } catch (err) {
    console.error("Failed to fetch inventory", err);
    inventoryItems.value = [];
  }
});

function startEdit(itemIdx: number, dayIdx: number) {
  const day = inventoryItems.value[itemIdx].days[dayIdx];
  editingItemIdx.value = itemIdx;
  editingDayIdx.value = dayIdx;
  editUiDate.value = isoToUi(day.date);
  editSlots.value = day.slots;
  editPrice.value = day.price;
}

function confirmEdit(itemIdx: number, dayIdx: number) {
  if (editingItemIdx.value !== itemIdx || editingDayIdx.value !== dayIdx) return;
  const day = inventoryItems.value[itemIdx].days[dayIdx];
  const isoDate = uiToIso(editUiDate.value);
  day.date = isoDate;
  day.slots = editSlots.value;
  day.price = editPrice.value;
  if (day.slots <= 0 && day.status !== "closed") {
    day.status = "low";
  }
  if (day.slots === 0) {
    day.status = "closed";
  }
  hasChanges.value = true;
  cancelEdit();
  if (day.id) {
    updateInventorySlot(day.id, {
      date: isoDate,
      availableSlots: editSlots.value,
      price: editPrice.value,
      status: day.status,
    }).catch(() => {});
  }
}

function cancelEdit() {
  editingItemIdx.value = null;
  editingDayIdx.value = null;
}

function openDrawer(itemIdx: number) {
  const item = inventoryItems.value[itemIdx];
  if (!item) return;
  selectedItemIndex.value = itemIdx;
  drawerDays.value = JSON.parse(JSON.stringify(item.days));
  drawerUiDates.value = item.days.map(d => isoToUi(d.date));
  selectedItem.value = item;
}

function saveDrawer() {
  if (selectedItemIndex.value === null || !selectedItem.value) return;
  const oldDays = inventoryItems.value[selectedItemIndex.value].days;
  const newDays = JSON.parse(JSON.stringify(drawerDays.value));
  
  // Apply converted dates
  for(let i=0; i<newDays.length; i++) {
    newDays[i].date = uiToIso(drawerUiDates.value[i]);
  }

  inventoryItems.value[selectedItemIndex.value].days = newDays;
  hasChanges.value = true;
  selectedItem.value = null;
  selectedItemIndex.value = null;

  for (let i = 0; i < newDays.length; i++) {
    const nd = newDays[i];
    const od = oldDays[i];
    if (nd.id && (
      nd.date !== od.date ||
      nd.slots !== od.slots ||
      nd.price !== od.price ||
      nd.status !== od.status
    )) {
      updateInventorySlot(nd.id, {
        date: nd.date,
        availableSlots: nd.slots,
        price: nd.price,
        status: nd.status,
      }).catch(() => {});
    }
  }
}

function cancelDrawer() {
  selectedItem.value = null;
  selectedItemIndex.value = null;
  drawerDays.value = [];
  drawerUiDates.value = [];
}

function saveAll() {
  recentChanges.value.unshift({
    type: "teal",
    text: `Inventory saved — ${new Date().toLocaleTimeString()}`,
  });
  hasChanges.value = false;
}

function exportMatrix() {
  const rows = [
    ["Service", "Subtitle", "Date", "Slots", "Price", "Status"],
    ...inventoryItems.value.flatMap((item) =>
      item.days.map((day) => [
        item.name,
        item.subtitle,
        day.date,
        String(day.slots),
        String(day.price),
        day.status,
      ]),
    ),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "provider-inventory-matrix.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function showSupport() {
  alert("Support: hello@anajakktour.kh");
}

function logout() {
  clearAuthData();
  window.location.href = "/customer/homepage";
}

function applyPricing() {
  const value = pricingValue.value;
  const targetItems = pricingTarget.value === "all"
    ? inventoryItems.value
    : inventoryItems.value.filter((item) => item.name === pricingTarget.value);

  for (const item of targetItems) {
    for (const day of item.days) {
      let newPrice = day.price;
      if (pricingRuleType.value === "markup") {
        newPrice = Math.round(day.price * (1 + value / 100) * 100) / 100;
      } else if (pricingRuleType.value === "discount") {
        newPrice = Math.round(day.price * (1 - value / 100) * 100) / 100;
      } else if (pricingRuleType.value === "fixed") {
        newPrice = value;
      }
      day.price = newPrice;
      if (day.id) {
        updateInventorySlot(day.id, { price: newPrice }).catch(() => {});
      }
    }
  }

  hasChanges.value = true;
  recentChanges.value.unshift({
    type: "amber",
    text: `Pricing ${pricingRuleType.value} of ${value}% applied to ${pricingTarget.value === "all" ? "all products" : pricingTarget.value}`,
  });
}

function batchProcess() {
  const maxPax = controllerMaxPax.value;
  for (const item of inventoryItems.value) {
    for (const day of item.days) {
      if (day.slots > maxPax) {
        day.slots = maxPax;
        if (day.id) {
          updateInventorySlot(day.id, { availableSlots: maxPax }).catch(() => {});
        }
      }
    }
  }
  hasChanges.value = true;
  recentChanges.value.unshift({
    type: "teal",
    text: `Batch processed: max ${maxPax} pax limit applied`,
  });
}

const filteredInventoryItems = computed(() => {
  if (!props.searchQuery.trim()) {
    return inventoryItems.value;
  }

  const query = props.searchQuery.toLowerCase();
  return inventoryItems.value.filter(
    (item) =>
      item.name.toLowerCase().includes(query) ||
      item.subtitle.toLowerCase().includes(query) ||
      item.days.some(
        (day) =>
          String(day.slots).includes(query) ||
          String(day.price).includes(query) ||
          day.status.toLowerCase().includes(query),
      ),
  );
});
</script>

<style scoped>
/* Same styles as before */
* { box-sizing: border-box; }
.inventory-shell { min-height: 100vh; display: grid; grid-template-columns: 236px 1fr; background: #f6f8f7; color: #20313a; }
.sidebar { display: flex; flex-direction: column; padding: 18px 16px 16px; background: #f9fbfa; border-right: 1px solid rgba(33, 49, 58, 0.06); }
.sidebar-brand { display: flex; align-items: center; gap: 10px; }
.brand-mark { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; background: #0f7c7f; color: #fff; font-size: 14px; }
.sidebar-brand h1 { margin: 0; font-size: 14px; font-weight: 400; }
.sidebar-brand p { margin: 2px 0 0; font-size: 14px; color: #9ca7ae; letter-spacing: 0.08em; }
.sidebar-nav { display: grid; gap: 8px; margin-top: 28px; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; text-decoration: none; color: #54707a; font-size: 14px; }
.nav-item.active { background: #eef8f5; color: #0f7c7f; box-shadow: inset 3px 0 0 #0f7c7f; }
.nav-item span { width: 18px; text-align: center; }
.new-booking-btn { margin-top: auto; border: 0; border-radius: 8px; padding: 12px 14px; background: #0f7c7f; color: #fff; font-weight: 400; box-shadow: 0 10px 20px rgba(15, 124, 127, 0.25); }
.sidebar-footer { display: grid; gap: 10px; margin-top: 16px; }
.footer-link { border: 0; background: transparent; text-align: left; padding: 2px 0; color: #6c7a82; }
.inventory-main { position: relative; padding: 14px 14px 16px; overflow: hidden; }
.topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 12px; }
.topbar-title { font-size: 14px; font-weight: 400; color: #26444b; }
.topbar-actions { display: flex; align-items: center; gap: 10px; }
.unsaved-badge { font-size: 14px; color: #c33a31; font-weight: 400; }
.save-btn { border: 0; border-radius: 6px; padding: 6px 14px; background: #0f7c7f; color: #fff; font-size: 14px; font-weight: 400; cursor: pointer; }
.sync-pill { display: inline-flex; align-items: center; gap: 8px; padding: 4px 10px; border-radius: 999px; background: #f1f3f2; color: #6a757d; font-size: 14px; }
.metrics-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 12px; }
.metric-card { min-height: 90px; border-radius: 10px; background: white; padding: 16px 18px; box-shadow: 0 10px 26px rgba(33, 49, 58, 0.06); border-top: 4px solid transparent; }
.metric-card p { margin: 0; font-size: 14px; letter-spacing: 0.06em; color: #7c8a92; font-weight: 400; }
.metric-card h3 { margin: 8px 0 4px; font-size: 14px; line-height: 1; }
.metric-card span { font-size: 14px; color: #7d8a91; }
.metric-teal { border-top-color: #119a9a; }
.metric-teal h3, .metric-teal span { color: #0b7f80; }
.metric-gold { border-top-color: #bb7e21; }
.metric-gold h3 { color: #b67912; }
.metric-red { border-top-color: #d64235; }
.metric-red h3 { color: #c7261a; }
.metric-neutral { border-top-color: #d2a14f; }
.metric-neutral h3 { color: #3d4f57; }
.content-grid { display: grid; grid-template-columns: minmax(0, 1fr) 292px; gap: 14px; align-items: start; }
.calendar-card { background: white; border-radius: 12px; box-shadow: 0 10px 26px rgba(33, 49, 58, 0.06); overflow: hidden; }
.calendar-header { display: grid; grid-template-columns: auto 1fr auto auto auto; align-items: center; gap: 10px; padding: 14px 16px 10px; }
.calendar-header h2 { margin: 0; font-size: 14px; }
.icon-btn { border: 0; background: transparent; color: #4f666f; cursor: pointer; font-size: 14px; }
.view-toggle { display: flex; gap: 6px; }
.view-toggle button { border: 0; background: #edf0ee; color: #4f666f; border-radius: 6px; padding: 6px 12px; font-size: 14px; font-weight: 400; }
.view-toggle button.active { background: #0f7c7f; color: #fff; }
.date-picker-input { border: 1px solid #e6eae7; background: #f9fbfa; border-radius: 6px; padding: 6px 10px; font-size: 14px; color: #20313a; cursor: pointer; font-family: inherit; }
.inventory-table { border-top: 1px solid #eef1f0; }
.inventory-head, .inventory-row { display: grid; grid-template-columns: 2.2fr repeat(5, minmax(0, 1fr)); gap: 10px; align-items: center; }
.inventory-head { padding: 12px 16px; color: #75838b; font-size: 14px; font-weight: 400; letter-spacing: 0.1em; border-bottom: 1px solid #eef1f0; }
.inventory-row { width: 100%; border: 0; background: transparent; padding: 14px 16px; border-bottom: 1px solid #f1f3f2; text-align: left; }
.inventory-row:hover { background: #fafcfc; }
.item-info { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.item-info img { width: 52px; height: 52px; border-radius: 8px; object-fit: cover; flex: 0 0 auto; }
.item-info h3 { margin: 0; font-size: 14px; }
.item-info p { margin: 4px 0 0; color: #77848c; font-size: 14px; }
.day-cell { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; min-height: 56px; border-radius: 8px; background: #fbfbfa; color: #51656f; cursor: pointer; transition: box-shadow 0.15s; padding: 4px; position: relative; }
.day-cell:hover { box-shadow: inset 0 0 0 2px #0f7c7f; }
.day-date-label { font-size: 14px; color: #5d6e76; font-weight: 400; margin-bottom: 1px; }
.day-cell strong { font-size: 14px; line-height: 1.05; }
.day-cell span { font-size: 14px; color: #7d8b92; margin-top: 4px; }
.day-cell.available strong { color: #0b7f80; }
.day-cell.peak { background: #fff4df; }
.day-cell.peak strong { color: #9d6a10; }
.day-cell.low strong { color: #c33a31; }
.day-cell.closed { background: #f0f2f3; }
.cell-input { width: 100%; border: 1px solid #0f7c7f; background: white; border-radius: 4px; padding: 3px 6px; font-size: 14px; text-align: center; outline: none; }
.cell-actions { display: flex; gap: 2px; margin-top: 2px; }
.cell-save, .cell-cancel { border: 0; border-radius: 3px; padding: 1px 5px; font-size: 14px; cursor: pointer; line-height: 1.2; }
.cell-save { background: #0f7c7f; color: white; }
.cell-cancel { background: #e8ebea; color: #4f666f; }
.legend-row { display: flex; align-items: center; gap: 18px; padding: 12px 2px 0; color: #5d6e76; font-size: 14px; }
.legend-row > div { display: inline-flex; align-items: center; gap: 8px; }
.legend-row a { margin-left: auto; color: #0f7c7f; text-decoration: none; font-weight: 400; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.available { background: #0b7f80; }
.dot.low { background: #d64336; }
.dot.peak { background: #f0b25c; }
.right-panel { display: grid; gap: 14px; }
.panel-card { background: white; border-radius: 12px; box-shadow: 0 10px 26px rgba(33, 49, 58, 0.06); padding: 14px; }
.panel-card h3 { margin: 0 0 12px; font-size: 14px; }
.field-group { display: grid; gap: 6px; margin-bottom: 12px; }
.field-group label { font-size: 14px; color: #75838b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 400; }
.field-group input, .field-group select { width: 100%; border: 1px solid #e6eae7; background: #f9fbfa; border-radius: 6px; padding: 10px 12px; color: #20313a; }
.primary-action, .secondary-action { width: 100%; border: 1px solid transparent; border-radius: 6px; padding: 10px 12px; font-weight: 400; cursor: pointer; }
.primary-action.amber { background: #f5a623; color: white; }
.secondary-action { background: white; color: #0f7c7f; border-color: #0f7c7f; }
.notice-box { background: #fff7eb; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; }
.notice-box strong { display: block; color: #9d6a10; font-size: 14px; }
.notice-box p { margin: 4px 0 0; color: #7b6b4b; font-size: 14px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.changes-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; color: #30424b; font-size: 14px; }
.changes-list li { display: flex; align-items: center; gap: 8px; }
.bullet { width: 7px; height: 7px; border-radius: 50%; }
.bullet.teal { background: #0f7c7f; }
.bullet.amber { background: #f5a623; }
.floating-save { position: fixed; right: 20px; bottom: 18px; width: 44px; height: 44px; border: 0; border-radius: 12px; background: #0f7c7f; color: #fff; font-size: 14px; box-shadow: 0 14px 28px rgba(15, 124, 127, 0.3); cursor: pointer; z-index: 20; }
.detail-drawer { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.25); display: flex; justify-content: flex-end; z-index: 30; }
.drawer-card { width: min(360px, 92vw); background: white; height: 100%; padding: 16px; box-shadow: -20px 0 40px rgba(0, 0, 0, 0.14); overflow-y: auto; }
.drawer-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.drawer-header h3 { margin: 4px 0 0; font-size: 14px; }
.drawer-image { width: 100%; height: 160px; object-fit: cover; border-radius: 10px; }
.drawer-subtitle { margin: 10px 0 14px; color: #63737c; }
.drawer-grid { display: grid; gap: 10px; }
.drawer-day { padding: 10px 12px; border-radius: 10px; background: #f8faf9; display: grid; gap: 6px; }
.drawer-field { display: grid; grid-template-columns: 80px 1fr; align-items: center; gap: 8px; }
.drawer-field label { font-size: 14px; color: #7b8a91; font-weight: 400; }
.drawer-field input, .drawer-field select { border: 1px solid #e6eae7; background: white; border-radius: 6px; padding: 6px 10px; font-size: 14px; color: #20313a; width: 100%; }
.drawer-footer { display: flex; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #eef1f0; }
.drawer-save-btn, .drawer-cancel-btn { flex: 1; border: 0; border-radius: 8px; padding: 12px; font-weight: 400; font-size: 14px; cursor: pointer; }
.drawer-save-btn { background: #0f7c7f; color: white; }
.drawer-cancel-btn { background: #f1f3f2; color: #55656d; }
@media (max-width: 1220px) {
  .inventory-shell { grid-template-columns: 1fr; }
  .sidebar { display: none; }
  .topbar, .content-grid, .metrics-row, .two-col { grid-template-columns: 1fr; }
  .legend-row { flex-wrap: wrap; }
  .inventory-head,
  .inventory-row {
    grid-template-columns: 1.8fr repeat(5, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .inventory-head,
  .inventory-row {
    grid-template-columns: 1.4fr repeat(5, minmax(0, 1fr));
    min-width: 560px;
  }

  .inventory-table {
    overflow-x: auto;
  }

  .head-cell,
  .inv-cell {
    padding: 10px 6px;
    font-size: 0.875rem;
  }

  .inv-product {
    gap: 8px;
    padding: 10px 8px;
  }

  .inv-product-image {
    width: 36px;
    height: 36px;
  }

  .inv-product-name {
    font-size: 0.875rem;
  }

  .inv-product-type {
    font-size: 0.875rem;
  }

  .schedule-input {
    width: 100%;
    min-width: 0;
    padding: 6px 4px;
    font-size: 0.875rem;
  }

  .metric-card {
    padding: 14px;
  }

  .metric-value {
    font-size: 0.875rem;
  }

  .alert-section {
    padding: 14px;
  }

  .drawer-card {
    width: 100vw;
    max-width: 100%;
    border-radius: 0;
  }

  .detail-drawer {
    align-items: flex-end;
  }

  .drawer-card {
    height: 85vh;
    border-radius: 16px 16px 0 0;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-label {
    font-size: 0.875rem;
  }

  .stat-value {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .inventory-head,
  .inventory-row {
    min-width: 440px;
    grid-template-columns: 1.2fr repeat(5, minmax(0, 1fr));
  }

  .head-cell,
  .inv-cell {
    padding: 8px 4px;
    font-size: 0.875rem;
  }

  .inv-product {
    gap: 6px;
    padding: 8px 4px;
  }

  .inv-product-image {
    width: 28px;
    height: 28px;
  }

  .inv-product-name {
    font-size: 0.875rem;
  }

  .schedule-input {
    padding: 4px 2px;
    font-size: 0.875rem;
  }

  .metric-value {
    font-size: 0.875rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .stat-card {
    padding: 10px;
  }
}
</style>
