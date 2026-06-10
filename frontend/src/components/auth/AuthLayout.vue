<template>
  <main class="auth-page">
    <section class="auth-shell">
      <aside class="brand-panel" aria-label="Anajak Tour introduction">
        <div class="brand-content">
          <RouterLink to="/" class="brand-mark" aria-label="Anajak Tour home">
            <span class="brand-emblem">
              <img src="/logo-mark.png" alt="" aria-hidden="true" />
            </span>
            <span class="brand-text">Anajak Tour</span>
          </RouterLink>

          <div class="brand-copy">
            <p class="eyebrow">Premium Cambodia marketplace</p>
            <h1>Discover Cambodia. Book Your Journey.</h1>
            <p>
              Curated tours, trusted local guides, boutique stays, transport, and
              flexible packages in one secure travel platform.
            </p>
          </div>

          <div class="trust-grid" aria-label="Trust highlights">
            <div>
              <strong>12,000+</strong>
              <span>travelers</span>
            </div>
            <div>
              <strong>Verified</strong>
              <span>providers</span>
            </div>
            <div>
              <strong>Secure</strong>
              <span>booking</span>
            </div>
          </div>
        </div>
      </aside>

      <section class="form-panel">
        <slot />
      </section>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  --dark-bg: #001F24;
  --dark-bg-2: #003C3C;
  --dark-bg-3: #061B1D;
  --primary: #00796B;
  --primary-dark: #005B50;
  --accent-gold: #F5A623;
  --text-dark: #182525;
  --text-muted: #6B7676;
  --surface: #FFFFFF;
  --surface-soft: #FAFAF7;
  --border: #E5E7E7;

  min-height: 100vh;
  background: var(--dark-bg);
  color: var(--surface-soft);
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

.auth-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(430px, 1fr);
}

.brand-panel {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  padding: 0;
  background:
    linear-gradient(90deg, rgba(0, 31, 36, 0.08), rgba(0, 31, 36, 0)),
    url("/auth-cambodia-hero.png") 58% center / cover no-repeat,
    var(--dark-bg);
  isolation: isolate;
}

.brand-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(90deg, rgba(0, 31, 36, 0.86) 0%, rgba(0, 31, 36, 0.54) 38%, rgba(0, 31, 36, 0.06) 100%),
    linear-gradient(180deg, rgba(0, 31, 36, 0.12) 0%, rgba(0, 31, 36, 0.3) 100%);
  pointer-events: none;
}

.brand-content {
  min-height: 100vh;
  padding: clamp(34px, 4vw, 52px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 36px;
}

.brand-mark {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 13px;
  color: var(--surface-soft);
  text-decoration: none;
}

.brand-emblem {
  width: 44px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
  overflow: hidden;
}

.brand-emblem img {
  width: 36px;
  height: 34px;
  object-fit: contain;
}

.brand-text {
  color: var(--surface);
  font-size: 1.08rem;
  font-weight: 800;
}

.brand-copy {
  max-width: 560px;
  padding: 36px 0 28px;
}

.eyebrow {
  margin: 0 0 14px;
  color: var(--accent-gold);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.brand-copy h1 {
  max-width: 12ch;
  margin: 0;
  color: var(--surface);
  font-size: clamp(2.45rem, 4vw, 4.25rem);
  font-weight: 900;
  line-height: 0.96;
  letter-spacing: 0;
}

.brand-copy p:not(.eyebrow) {
  max-width: 520px;
  margin: 20px 0 0;
  color: rgba(250, 250, 247, 0.82);
  font-size: 1.02rem;
  line-height: 1.7;
}

.trust-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  max-width: 560px;
}

.trust-grid div {
  min-height: 78px;
  border: 1px solid rgba(245, 166, 35, 0.24);
  border-radius: 8px;
  padding: 16px;
  background: rgba(6, 27, 29, 0.58);
  backdrop-filter: blur(16px);
}

.trust-grid strong,
.trust-grid span {
  display: block;
}

.trust-grid strong {
  color: var(--accent-gold);
  font-size: 1.12rem;
  line-height: 1.2;
}

.trust-grid span {
  margin-top: 6px;
  color: rgba(250, 250, 247, 0.72);
  font-size: 0.86rem;
}

.form-panel {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: clamp(28px, 4vw, 52px);
  background:
    radial-gradient(circle at top right, rgba(245, 166, 35, 0.11), transparent 26%),
    linear-gradient(180deg, var(--surface-soft) 0%, #f1f3ef 100%);
}

@media (max-width: 1080px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .brand-panel {
    min-height: 42vh;
    background-position: 58% center;
  }

  .brand-content {
    min-height: 42vh;
    padding: 36px;
    gap: 32px;
  }

  .brand-copy {
    padding: 18px 0 0;
  }

  .brand-copy h1 {
    max-width: 12ch;
    font-size: clamp(2.3rem, 6vw, 3.6rem);
  }

  .form-panel {
    min-height: auto;
    padding: 38px 24px 54px;
  }
}

@media (max-width: 640px) {
  .brand-panel {
    min-height: 34vh;
    background-position: 58% center;
  }

  .brand-content {
    min-height: 34vh;
    padding: 24px 20px;
    gap: 24px;
  }

  .brand-emblem {
    width: 38px;
    height: 38px;
  }

  .brand-copy h1 {
    font-size: 2.1rem;
  }

  .brand-copy p:not(.eyebrow) {
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .trust-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .trust-grid div {
    min-height: auto;
    padding: 14px;
  }

  .form-panel {
    padding: 22px 14px 42px;
  }
}
</style>
