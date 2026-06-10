<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: "button" | "submit" | "reset";
    loading?: boolean;
    disabled?: boolean;
    loadingText?: string;
  }>(),
  {
    type: "submit",
    loading: false,
    disabled: false,
    loadingText: "Please wait...",
  },
);
</script>

<template>
  <button class="auth-button" :type="type" :disabled="disabled || loading">
    <span v-if="loading" class="spinner" aria-hidden="true"></span>
    <span>{{ loading ? loadingText : "" }}</span>
    <span v-if="!loading"><slot /></span>
  </button>
</template>

<style scoped>
.auth-button {
  width: 100%;
  min-height: 48px;
  border: 0;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, var(--primary-dark, #005B50), var(--primary, #00796B));
  color: var(--surface, #FFFFFF);
  font: inherit;
  font-weight: 850;
  cursor: pointer;
  box-shadow: 0 16px 34px rgba(0, 121, 107, 0.28);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.04);
  box-shadow: 0 20px 42px rgba(0, 121, 107, 0.35);
}

.auth-button:focus-visible {
  outline: 3px solid rgba(245, 166, 35, 0.5);
  outline-offset: 3px;
}

.auth-button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
  box-shadow: none;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: var(--surface, #FFFFFF);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
