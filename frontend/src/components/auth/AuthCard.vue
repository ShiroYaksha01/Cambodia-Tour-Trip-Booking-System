<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <div class="auth-card">
    <header class="auth-card-header">
      <p class="card-kicker">Anajak Tour</p>
      <h2>{{ title }}</h2>
      <p v-if="subtitle">{{ subtitle }}</p>
    </header>

    <slot />

    <footer v-if="$slots.footer" class="auth-card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
.auth-card {
  width: min(100%, 480px);
  border: 1px solid var(--border, #E5E7E7);
  border-radius: 18px;
  padding: 32px;
  background:
    radial-gradient(circle at top right, rgba(245, 166, 35, 0.12), transparent 28%),
    linear-gradient(180deg, var(--surface, #FFFFFF) 0%, var(--surface-soft, #FAFAF7) 100%);
  box-shadow: 0 26px 70px rgba(0, 31, 36, 0.18);
  color: var(--text-dark, #182525);
}
.auth-card-header {
  margin-bottom: 24px;
}

.card-kicker {
  margin: 0 0 10px;
  color: var(--accent-gold, #F5A623);
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.auth-card-header h2 {
  margin: 0;
  color: var(--text-dark, #182525);
  font-size: clamp(2rem, 3.4vw, 2.65rem);
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: 0;
}

.auth-card-header p:not(.card-kicker) {
  margin: 10px 0 0;
  color: var(--text-muted, #6B7676);
  font-size: 0.98rem;
  line-height: 1.6;
}

.auth-card-footer {
  margin-top: 22px;
  color: var(--text-muted, #6B7676);
  text-align: center;
  font-size: 0.94rem;
  line-height: 1.5;
}

.auth-card-footer :deep(a) {
  color: var(--primary, #00796B);
  font-weight: 800;
  text-decoration: none;
}

.auth-card-footer :deep(a:hover) {
  color: var(--primary-dark, #005B50);
  text-decoration: underline;
}

@media (max-width: 640px) {
  .auth-card {
    border-radius: 14px;
    padding: 24px 20px;
  }
}

</style>
