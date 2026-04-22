<template>
  <main class="signup-page">
    <section class="signup-shell">
      <div class="visual-panel" aria-hidden="true"></div>

      <section class="form-panel">
        <div class="form-card">
          <header class="card-header">
            <h1>Create Account</h1>
            <p>Sign up to start planning your premium Cambodian expedition.</p>
          </header>

          <form class="signup-form">
            <label class="field">
              <input type="text" placeholder="Full Name" />
            </label>

            <label class="field">
              <input type="email" placeholder="Email Address" />
            </label>

            <div class="phone-row">
              <label class="field country">
                <input type="text" value="+855" />
              </label>
              <label class="field phone">
                <input type="tel" placeholder="Phone Number" />
              </label>
            </div>

            <label class="field password">
              <input type="password" placeholder="Create Password" />
              <span class="eye">◌</span>
            </label>

            <label class="terms">
              <input type="checkbox" />
              <span>
                I agree to the
                <a href="#">Terms of Service</a>
                and
                <a href="#">Privacy Policy</a>
                of The Heritage Curator.
              </span>
            </label>

            <RouterLink class="cta" to="/auth/verification">Start Your Journey →</RouterLink>
          </form>

          <div class="divider"></div>

          <p class="switch-auth">
            Already have an account?
            <RouterLink to="/auth/sign-in">Sign In</RouterLink>
          </p>

          <div class="footer-icons" aria-hidden="true">
            <span>◌</span>
            <span>⌂</span>
            <span>△</span>
          </div>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.signup-page {
  min-height: 100vh;
  background: #efefed;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1d2427;
}

.signup-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(340px, 1.08fr) minmax(360px, 0.92fr);
}

.visual-panel {
  position: relative;
  overflow: hidden;
  background-color: #e8eceb;
  background-image: linear-gradient(rgba(7, 24, 31, 0.18), rgba(7, 24, 31, 0.08)),
    url('/auth-signup-hero.jpg'),
    url('/auth-signup-hero.svg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.form-panel {
  display: grid;
  align-items: center;
  background: linear-gradient(180deg, #f3f3f3 0%, #efefef 100%);
}

.form-card {
  width: min(420px, 100%);
  margin: 0 auto;
  padding: 36px 24px 24px;
}

.card-header h1 {
  margin: 0;
  font-size: 2.6rem;
  line-height: 1;
  letter-spacing: -0.03em;
  font-weight: 800;
}

.card-header p {
  margin: 10px 0 0;
  max-width: 24ch;
  color: #5b656a;
  font-size: 0.95rem;
}

.signup-form {
  margin-top: 28px;
  display: grid;
  gap: 12px;
}

.field {
  display: flex;
  align-items: center;
  min-height: 48px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #e9e9e9;
  padding: 0 12px;
}

.field input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  color: #253036;
}

.field input::placeholder {
  color: #656d72;
}

.phone-row {
  display: grid;
  gap: 10px;
  grid-template-columns: 84px 1fr;
}

.country {
  justify-content: center;
}

.country input {
  text-align: center;
}

.password {
  justify-content: space-between;
}

.eye {
  color: #7a8388;
  font-size: 1rem;
  margin-left: 8px;
}

.terms {
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 2px;
  font-size: 0.84rem;
  color: #5c666b;
}

.terms input {
  margin-top: 1px;
  width: 14px;
  height: 14px;
  accent-color: #0c7971;
}

.terms a,
.switch-auth a {
  color: #127178;
  text-decoration: none;
  font-weight: 600;
}

.cta {
  display: grid;
  place-items: center;
  min-height: 46px;
  border: 0;
  border-radius: 4px;
  background: linear-gradient(180deg, #0f8782, #0b6f68);
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  margin-top: 4px;
  text-decoration: none;
}

.divider {
  height: 1px;
  background: #dddddd;
  margin: 60px 0 18px;
}

.switch-auth {
  text-align: center;
  font-size: 0.96rem;
  color: #5c666b;
  margin: 0;
}

.footer-icons {
  margin-top: 18px;
  display: flex;
  justify-content: center;
  gap: 18px;
  color: #b9b9b9;
  font-size: 1.25rem;
}

@media (max-width: 1024px) {
  .signup-shell {
    grid-template-columns: 1fr;
  }

  .visual-panel {
    min-height: 42vh;
  }
}

@media (max-width: 640px) {
  .form-card {
    padding: 26px 16px 18px;
  }

  .card-header h1 {
    font-size: 2.2rem;
  }
}
</style>