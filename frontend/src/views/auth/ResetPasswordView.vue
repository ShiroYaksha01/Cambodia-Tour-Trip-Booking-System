<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { resetPassword } from '../../services/api'

const router = useRouter()
const route = useRoute()
const email = route.query.email as string
const otp = route.query.otp as string

const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const loading = ref(false)

const handleUpdatePassword = async () => {
  passwordError.value = ''
  if (newPassword.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Passwords do not match.'
    return
  }

  loading.value = true
  try {
    await resetPassword(email, otp, newPassword.value)
    router.push('/login')
  } catch (error: any) {
    passwordError.value = 'Failed to reset password. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-shell">
      <div class="hero-panel">
        <RouterLink to="/" class="brand-mark">
          <div class="brand-icon" aria-hidden="true">✦</div>
          <div class="brand-name">Anajak Tour</div>
        </RouterLink>
        <div class="hero-copy">
          <h1>Experience the Timeless Splendor of Cambodia.</h1>
        </div>
      </div>

      <div class="form-panel">
        <div class="form-card">
          <header class="form-header">
            <h2>Set a new password</h2>
            <p>Create a new password.</p>
          </header>

          <form class="auth-form" @submit.prevent="handleUpdatePassword">
            <label class="field">
              <span>New Password</span>
              <div class="input-wrap">
                <input v-model="newPassword" type="password" placeholder="••••••••" required />
              </div>
            </label>

            <label class="field">
              <span>Confirm Password</span>
              <div class="input-wrap">
                <input v-model="confirmPassword" type="password" placeholder="••••••••" required />
              </div>
            </label>
            
            <p v-if="passwordError" class="error-text">{{ passwordError }}</p>

            <button class="primary-button" type="submit" :disabled="loading">
              {{ loading ? 'Updating...' : 'Update Password →' }}
            </button>
          </form>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Reuse same styles as ForgotPasswordView.vue */
.auth-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(0, 157, 121, 0.25), transparent 28%),
    radial-gradient(circle at bottom left, rgba(0, 107, 95, 0.45), transparent 34%),
    linear-gradient(180deg, #083538 0%, #0a4b47 56%, #06282c 100%);
  padding: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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

.brand-mark { display: inline-flex; align-items: center; gap: 14px; text-decoration: none; }
.brand-icon {
  width: 30px; height: 30px; border-radius: 6px; background: #f4a71d;
  display: grid; place-items: center; color: #1b2a2a; font-size: 15px; font-weight: 800;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.2);
}
.brand-name { font-size: 1.05rem; font-weight: 700; color: #f7fbf7; }

.hero-copy { max-width: 600px; margin-top: auto; margin-bottom: 28px; }
.hero-copy h1 { margin: 0; font-size: clamp(2.7rem, 4vw, 4.2rem); line-height: 0.95; letter-spacing: -0.05em; font-weight: 800; text-wrap: balance; }

.form-panel { background: linear-gradient(180deg, #f9faf8 0%, #f3f4f1 100%); color: #142125; display: flex; align-items: stretch; }
.form-card { 
  width: 100%; padding: 78px 28px 26px; 
  background: radial-gradient(circle at top right, rgba(245, 164, 28, 0.12), transparent 20%), linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(246, 247, 244, 0.98));
  backdrop-filter: blur(6px); display: flex; flex-direction: column; justify-content: space-between; 
}
.form-header h2 { margin: 0; font-size: clamp(2rem, 2.2vw, 2.7rem); line-height: 1.05; color: #1d2427; font-weight: 800; }
.form-header p { margin: 8px 0 0; max-width: 22rem; color: #69757a; font-size: 0.98rem; line-height: 1.5; }

.auth-form { display: grid; gap: 16px; margin-top: 34px; }
.field { display: grid; gap: 7px; }
.field > span { font-size: 0.88rem; font-weight: 600; color: #3b4548; }

.input-wrap {
  height: 42px; border-radius: 8px; background: #ffffff; border: 1px solid rgba(95, 109, 116, 0.12);
  display: flex; align-items: center; padding: 0 14px; gap: 10px; box-shadow: 0 1px 0 rgba(17, 24, 39, 0.02);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.input-wrap input { border: 0; outline: 0; width: 100%; font: inherit; color: #233036; background: transparent; }

.primary-button {
  border: 0; border-radius: 8px; font: inherit; cursor: pointer; margin-top: 8px; min-height: 42px; width: 100%;
  background: linear-gradient(180deg, #0e7f76, #0a6d66); color: #ffffff; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center;
}
.primary-button:disabled { opacity: 0.6; cursor: not-allowed; }

.error-text { color: #d63c3c; font-size: 0.85rem; font-weight: 500; margin: 4px 0 0 4px; }
@media (max-width: 1080px) {
  .auth-shell { grid-template-columns: 1fr; }
  .hero-panel { min-height: 56vh; }
}
</style>
