<script setup lang="ts">
import { computed, ref, type Component } from "vue";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    type?: string;
    placeholder?: string;
    autocomplete?: string;
    icon?: Component;
    error?: string;
    hint?: string;
    id?: string;
    inputmode?: "text" | "search" | "email" | "tel" | "url" | "none" | "numeric" | "decimal";
    maxlength?: string | number;
    required?: boolean;
    passwordToggle?: boolean;
  }>(),
  {
    type: "text",
    placeholder: "",
    autocomplete: undefined,
    icon: undefined,
    error: "",
    hint: "",
    id: undefined,
    inputmode: undefined,
    maxlength: undefined,
    required: false,
    passwordToggle: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const showPassword = ref(false);
const inputId = computed(() => props.id || `auth-${props.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
const inputType = computed(() => {
  if (props.passwordToggle && props.type === "password") {
    return showPassword.value ? "text" : "password";
  }

  return props.type;
});

function updateValue(event: Event) {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
}
</script>

<template>
  <label class="auth-field" :for="inputId">
    <span class="field-label">{{ label }}</span>
    <span class="input-shell" :class="{ 'has-error': error }">
      <component :is="icon" v-if="icon" class="input-icon" aria-hidden="true" />
      <input
        :id="inputId"
        :value="modelValue"
        :type="inputType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :maxlength="maxlength"
        :required="required"
        @input="updateValue"
      />
      <button
        v-if="passwordToggle && type === 'password'"
        type="button"
        class="password-toggle"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        @click="showPassword = !showPassword"
      >
        <EyeSlashIcon v-if="showPassword" aria-hidden="true" />
        <EyeIcon v-else aria-hidden="true" />
      </button>
    </span>
    <span v-if="error" class="field-error">{{ error }}</span>
    <span v-else-if="hint" class="field-hint">{{ hint }}</span>
  </label>
</template>

<style scoped>
.auth-field {
  display: grid;
  gap: 8px;
}

.field-label {
  color: var(--text-dark, #182525);
  font-size: 0.88rem;
  font-weight: 800;
}

.input-shell {
  min-height: 48px;
  border: 1px solid var(--border, #E5E7E7);
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 1px 0 rgba(0, 31, 36, 0.03);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.input-shell:focus-within {
  border-color: var(--primary, #00796B);
  background: var(--surface, #FFFFFF);
  box-shadow: 0 0 0 4px rgba(0, 121, 107, 0.12);
}

.input-shell.has-error {
  border-color: #c2410c;
  box-shadow: 0 0 0 4px rgba(194, 65, 12, 0.1);
}

.input-icon {
  width: 19px;
  height: 19px;
  flex: 0 0 auto;
  color: var(--accent-gold, #F5A623);
}

input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-dark, #182525);
  font: inherit;
  font-size: 0.96rem;
}

input::placeholder {
  color: var(--text-muted, #6B7676);
  opacity: 0.68;
}

.password-toggle {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  background: transparent;
  color: var(--text-muted, #6B7676);
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease;
}

.password-toggle:hover,
.password-toggle:focus-visible {
  background: rgba(0, 121, 107, 0.09);
  color: var(--primary, #00796B);
  outline: 0;
}

.password-toggle svg {
  width: 19px;
  height: 19px;
}

.field-error,
.field-hint {
  font-size: 0.82rem;
  line-height: 1.45;
}

.field-error {
  color: #b93815;
  font-weight: 700;
}

.field-hint {
  color: var(--text-muted, #6B7676);
}
</style>
