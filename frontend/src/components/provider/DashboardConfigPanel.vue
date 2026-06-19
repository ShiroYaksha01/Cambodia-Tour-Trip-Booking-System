<template>
  <aside class="config-panel">
    <div class="panel-header">
      <h3>Bulk Configuration</h3>
      <button type="button" class="close-btn" aria-label="Reset configuration" @click="$emit('discard')">✕</button>
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
          <input v-model="localUiStartDate" type="text" placeholder="DD/MM/YYYY" />
        </div>
        <div class="field-group compact">
          <label>End Date (DD/MM/YYYY)</label>
          <input v-model="localUiEndDate" type="text" placeholder="DD/MM/YYYY" />
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
      <p class="helper-text">{{ categoryData.capacityHelper }}</p>
    </div>

    <div class="config-section">
      <label>{{ categoryData.panelLabel }}</label>
      <div class="pricing-badge">{{ categoryData.panelBadge }}</div>
      <div class="pricing-rules">
        <div v-if="pricingRuleEnabled" class="rule-item">
          <input v-model="localSeasonalSurcharge" type="checkbox">
          <div>
            <span>{{ categoryData.primaryRule.title }}</span>
            <p class="rule-desc">{{ categoryData.primaryRule.description }}</p>
          </div>
          <button type="button" class="btn-remove" aria-label="Remove pricing rule" @click="pricingRuleEnabled = false">✕</button>
        </div>
        <button v-else type="button" class="btn-discard" @click="restorePricingRule">Restore Smart Rule</button>
      </div>
    </div>

    <button type="button" class="btn-update" @click="handleUpdate">{{ categoryData.updateAction }}</button>
    <p v-if="panelMessage" class="panel-message">{{ panelMessage }}</p>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  categoryData: any;
  uiStartDate: string;
  uiEndDate: string;
  capacity: number;
  seasonalSurchargeEnabled: boolean;
  panelMessage: string;
}>();

const emit = defineEmits([
  'update:uiStartDate', 
  'update:uiEndDate', 
  'update:capacity', 
  'update:seasonalSurchargeEnabled',
  'applyDates',
  'resetDates',
  'updateMatrix',
  'discard'
]);

const showDatePicker = ref(false);
const pricingRuleEnabled = ref(true);

const localUiStartDate = ref(props.uiStartDate);
const localUiEndDate = ref(props.uiEndDate);
const localSeasonalSurcharge = ref(props.seasonalSurchargeEnabled);

watch(() => props.uiStartDate, (val) => localUiStartDate.value = val);
watch(() => props.uiEndDate, (val) => localUiEndDate.value = val);
watch(() => props.seasonalSurchargeEnabled, (val) => localSeasonalSurcharge.value = val);

watch(localSeasonalSurcharge, (val) => emit('update:seasonalSurchargeEnabled', val));

const selectedDateRangeLabel = computed(() => `${props.uiStartDate} - ${props.uiEndDate}`);
const selectedDateRangeSubtitle = computed(() => "Selected Period");

const applyDatePicker = () => {
  emit('update:uiStartDate', localUiStartDate.value);
  emit('update:uiEndDate', localUiEndDate.value);
  emit('applyDates');
  showDatePicker.value = false;
};

const resetDatePicker = () => {
  emit('resetDates');
  showDatePicker.value = false;
};

const adjustCapacity = (delta: number) => {
  emit('update:capacity', Math.max(1, props.capacity + delta));
};

const restorePricingRule = () => {
  pricingRuleEnabled.value = true;
  localSeasonalSurcharge.value = true;
};

const handleUpdate = () => {
  emit('updateMatrix', { 
    capacity: props.capacity, 
    seasonalSurchargeEnabled: localSeasonalSurcharge.value, 
    pricingRuleEnabled: pricingRuleEnabled.value 
  });
};
</script>

<style scoped>
/* Copied styles from ProviderDashboardView for Config Panel */
.config-panel {
  position: sticky;
  top: 18px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 24px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 14px 34px rgba(17, 24, 39, 0.05);
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
.picker-cancel {
  min-height: 42px;
  padding: 10px 16px;
  border-radius: 10px;
  font: inherit;
  font-weight: 400;
  cursor: pointer;
}

.btn-update,
.picker-apply {
  border: 0;
  background: #148a74;
  color: #ffffff;
  box-shadow: 0 14px 30px rgba(20, 138, 116, 0.18);
}

.btn-update:hover,
.picker-apply:hover {
  background: #117864;
}

.btn-discard,
.picker-cancel {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #4b5563;
}

.btn-discard:hover,
.picker-cancel:hover {
  background: #f3f4f6;
}
</style>