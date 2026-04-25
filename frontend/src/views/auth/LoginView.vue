<template>
  <main class="auth-page">
    <section class="auth-shell">
      <div class="hero-panel">
        <div class="brand-mark">
          <div class="brand-icon" aria-hidden="true">✦</div>
          <div class="brand-name">Anajak Tour</div>
        </div>

        <div class="hero-copy">
          <div class="hero-accent"></div>
          <h1>Experience the Timeless Splendor of Cambodia.</h1>
          <p>
            Access your private concierge and curated heritage experiences. Your journey into the
            heart of the Khmer Empire begins here.
          </p>
        </div>

        <div class="social-proof">
          <div class="avatar-stack" aria-hidden="true">
            <span class="avatar avatar-one"></span>
            <span class="avatar avatar-two"></span>
            <span class="avatar avatar-three"></span>
          </div>
          <p>Joined by 12,000+ global explorers</p>
        </div>
      </div>

      <div class="form-panel">
        <div class="form-card">
          <header class="form-header">
            <h2>Welcome Back</h2>
            <p>Please enter your details to access your curator dashboard.</p>
          </header>

          <form class="auth-form">
            <label class="field">
              <span>Email Address</span>
              <div class="input-wrap">
                <span class="input-icon" aria-hidden="true">✉</span>
                <input type="email" placeholder="curator@heritage.kh" autocomplete="email" />
              </div>
            </label>

            <label class="field password-field">
              <div class="field-row">
                <span>Password</span>
                <a href="#">Forgot Password?</a>
              </div>
              <div class="input-wrap">
                <span class="input-icon" aria-hidden="true">⌁</span>
                <input type="password" placeholder="••••••••" autocomplete="current-password" />
              </div>
            </label>

            <label class="remember-row">
              <input type="checkbox" checked />
              <span>Remember me for 30 days</span>
            </label>

            <button class="primary-button" type="submit">Sign In to Dashboard →</button>
          </form>

          <p class="signup-row">
            Don't have an account yet?
            <RouterLink to="/register">Curate your Journey →</RouterLink>
          </p>

          <footer class="footer-links">
            <span>© 2024 THE HERITAGE CURATOR. ALL RIGHTS RESERVED.</span>
            <nav>
              <a href="#">PRIVACY POLICY</a>
              <a href="#">TERMS OF SERVICE</a>
              <a href="#">CONTACT SUPPORT</a>
            </nav>
          </footer>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(0, 157, 121, 0.25), transparent 28%),
    radial-gradient(circle at bottom left, rgba(0, 107, 95, 0.45), transparent 34%),
    linear-gradient(180deg, #083538 0%, #0a4b47 56%, #06282c 100%);
  padding: 0;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #f8faf7;
}

.auth-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(420px, 0.85fr);
}

.hero-panel {
  position: relative;
  overflow: hidden;
  padding: 56px 54px 36px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background:
    linear-gradient(180deg, rgba(6, 25, 30, 0.28), rgba(6, 25, 30, 0.54)),
    radial-gradient(circle at 30% 18%, rgba(17, 125, 88, 0.58), transparent 18%),
    radial-gradient(circle at 68% 12%, rgba(6, 161, 111, 0.26), transparent 20%),
    linear-gradient(180deg, rgba(1, 33, 39, 0.35), rgba(1, 33, 39, 0.05)),
    linear-gradient(180deg, #0a3237 0%, #0d4a4f 58%, #061f22 100%);
}

.hero-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgba(4, 19, 21, 0.88), transparent 38%),
    repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent 88px,
      rgba(255, 255, 255, 0.03) 89px,
      transparent 90px
    );
  opacity: 0.95;
  pointer-events: none;
}

.hero-panel::after {
  content: '';
  position: absolute;
  left: -6%;
  right: -6%;
  bottom: -2%;
  height: 34%;
  background:
    radial-gradient(circle at 12% 55%, rgba(5, 33, 34, 0.95) 0 6px, transparent 7px),
    radial-gradient(circle at 20% 40%, rgba(4, 24, 26, 0.98) 0 18px, transparent 19px),
    radial-gradient(circle at 36% 58%, rgba(5, 33, 34, 0.96) 0 10px, transparent 11px),
    radial-gradient(circle at 48% 44%, rgba(5, 33, 34, 0.96) 0 24px, transparent 25px),
    radial-gradient(circle at 60% 63%, rgba(5, 33, 34, 0.96) 0 12px, transparent 13px),
    radial-gradient(circle at 74% 48%, rgba(5, 33, 34, 0.96) 0 26px, transparent 27px),
    radial-gradient(circle at 86% 57%, rgba(5, 33, 34, 0.96) 0 10px, transparent 11px),
    linear-gradient(180deg, transparent, rgba(4, 19, 21, 0.94) 45%, rgba(4, 19, 21, 0.98));
  filter: saturate(0.8);
}

.brand-mark,
.hero-copy,
.social-proof {
  position: relative;
  z-index: 1;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  gap: 14px;
}

.brand-icon {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background: #f4a71d;
  display: grid;
  place-items: center;
  color: #1b2a2a;
  font-size: 15px;
  font-weight: 800;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.2);
}

.brand-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #f7fbf7;
}

.hero-copy {
  max-width: 600px;
  margin-top: auto;
  margin-bottom: 28px;
}

.hero-accent {
  width: 20px;
  height: 3px;
  border-radius: 999px;
  background: #f4a71d;
  margin-bottom: 20px;
}

.hero-copy h1 {
  margin: 0;
  font-size: clamp(2.7rem, 4vw, 4.2rem);
  line-height: 0.95;
  letter-spacing: -0.05em;
  max-width: 10ch;
  font-weight: 800;
  text-wrap: balance;
}

.hero-copy p {
  margin: 18px 0 0;
  max-width: 34rem;
  color: rgba(227, 248, 240, 0.75);
  font-size: 1.05rem;
  line-height: 1.5;
}

.social-proof {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 24px;
}

.avatar-stack {
  display: flex;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  margin-left: -8px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25);
}

.avatar:first-child {
  margin-left: 0;
}

.avatar-one {
  background: linear-gradient(135deg, #f6d365, #fda085);
}

.avatar-two {
  background: linear-gradient(135deg, #89f7fe, #66a6ff);
}

.avatar-three {
  background: linear-gradient(135deg, #fbc2eb, #a6c1ee);
}

.social-proof p {
  margin: 0;
  font-size: 0.92rem;
  color: rgba(228, 247, 239, 0.72);
}

.form-panel {
  background: linear-gradient(180deg, #f9faf8 0%, #f3f4f1 100%);
  color: #142125;
  display: flex;
  align-items: stretch;
}

.form-card {
  width: 100%;
  padding: 78px 28px 26px;
  background:
    radial-gradient(circle at top right, rgba(245, 164, 28, 0.12), transparent 20%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(246, 247, 244, 0.98));
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.form-header h2 {
  margin: 0;
  font-size: clamp(2rem, 2.2vw, 2.7rem);
  line-height: 1.05;
  color: #1d2427;
  font-weight: 800;
}

.form-header p {
  margin: 8px 0 0;
  max-width: 22rem;
  color: #69757a;
  font-size: 0.98rem;
}

.social-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 34px;
}

.social-button,
.primary-button {
  border: 0;
  border-radius: 8px;
  font: inherit;
  cursor: pointer;
}

.social-button {
  background: #ffffff;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #2b3135;
  font-weight: 500;
  box-shadow: 0 1px 0 rgba(17, 24, 39, 0.04), 0 0 0 1px rgba(17, 24, 39, 0.05) inset;
}

.social-dot {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 11px;
  color: #ffffff;
  font-weight: 700;
}

.facebook {
  background: #1877f2;
}

.telegram {
  background: #229ed9;
}

.separator {
  position: relative;
  margin: 28px 0 18px;
  text-align: center;
}

.separator::before,
.separator::after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 90px);
  height: 1px;
  background: rgba(97, 109, 116, 0.16);
}

.separator::before {
  left: 0;
}

.separator::after {
  right: 0;
}

.separator span {
  font-size: 0.71rem;
  letter-spacing: 0.16em;
  font-weight: 700;
  color: #8b9498;
}

.auth-form {
  display: grid;
  gap: 16px;
}

.field {
  display: grid;
  gap: 7px;
}

.field > span,
.field-row {
  font-size: 0.88rem;
  font-weight: 600;
  color: #3b4548;
}

.field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-row a,
.signup-row a,
.footer-links a {
  color: #bf7d10;
  text-decoration: none;
}

.input-wrap {
  height: 42px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid rgba(95, 109, 116, 0.12);
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 10px;
  box-shadow: 0 1px 0 rgba(17, 24, 39, 0.02);
}

.input-icon {
  font-size: 0.92rem;
  color: #8b9498;
  width: 16px;
  text-align: center;
}

.input-wrap input {
  border: 0;
  outline: 0;
  width: 100%;
  font: inherit;
  color: #233036;
  background: transparent;
}

.input-wrap input::selection {
  background: rgba(244, 167, 29, 0.22);
}

.remember-row {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
  color: #495459;
}

.remember-row input {
  width: 14px;
  height: 14px;
  accent-color: #0d7e73;
}

.primary-button {
  margin-top: 2px;
  min-height: 42px;
  background: linear-gradient(180deg, #0e7f76, #0a6d66);
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(10, 109, 102, 0.25);
}

.signup-row {
  margin: 22px 0 0;
  text-align: center;
  font-size: 0.95rem;
  color: #536067;
}

.footer-links {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-end;
  padding-top: 18px;
  margin-top: 26px;
  border-top: 1px solid rgba(97, 109, 116, 0.1);
  color: #8d9497;
  font-size: 0.64rem;
  letter-spacing: 0.14em;
  font-weight: 700;
}

.footer-links nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px 18px;
}

@media (max-width: 1080px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .hero-panel {
    min-height: 56vh;
  }
}

@media (max-width: 640px) {
  .hero-panel {
    padding: 32px 22px 26px;
  }

  .form-card {
    padding: 36px 18px 20px;
  }

  .social-row {
    grid-template-columns: 1fr;
  }

  .footer-links {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer-links nav {
    justify-content: flex-start;
  }
}
</style>