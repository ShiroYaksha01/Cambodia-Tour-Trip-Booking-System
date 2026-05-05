<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// UI State
const currentStep = ref(1)

/* --- Step 1: Email --- */
const email = ref('')
const emailError = ref('')

const validateEmail = (e: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

const handleEmailSubmit = () => {
  emailError.value = ''
  if (!email.value.trim()) {
    emailError.value = 'Please enter your email to reset the password.'
    return
  }
  if (!validateEmail(email.value)) {
    emailError.value = 'Please enter a valid email address.'
    return
  }
  currentStep.value = 2
}

/* --- Step 2: Code Verification --- */
const code = reactive(["", "", "", "", ""])
const codeRefs = ref<HTMLInputElement[]>([])
const codeError = ref('')

const isCodeComplete = computed(() => code.every(d => d !== ""))

const handleCodeInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  if (!/^\d*$/.test(value)) {
    code[index] = ""
    return
  }
  codeError.value = ''

  if (value && index < 4) {
    codeRefs.value[index + 1]?.focus()
  }
}

const handleCodeKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === "Backspace" && !code[index] && index > 0) {
    codeRefs.value[index - 1]?.focus()
  }
}

const handleCodePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData("text").replace(/\D/g, "").slice(0, 5).split("") || []
  
  pastedData.forEach((char, i) => {
    if (i < 5) code[i] = char
  })
  
  const focusIndex = Math.min(pastedData.length, 4)
  codeRefs.value[focusIndex]?.focus()
}

const handleVerifyCode = () => {
  codeError.value = ''
  if (!isCodeComplete.value) {
    codeError.value = 'Please enter the complete 5-digit code.'
    return
  }
  currentStep.value = 3
}

const resendCode = () => {
  // Mock resend action
  alert("Verification code resent to your email!")
}

/* --- Step 3: Reset Confirm --- */
const handleGoToNewPassword = () => {
  currentStep.value = 4
}

/* --- Step 4: Set New Password --- */
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const handleUpdatePassword = () => {
  passwordError.value = ''
  if (!newPassword.value || !confirmPassword.value) {
    passwordError.value = 'Please fill out both password fields.'
    return
  }
  if (newPassword.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Passwords do not match.'
    return
  }
  currentStep.value = 5
}

/* --- Shared Navigation --- */
const goBack = () => {
  if (currentStep.value > 1 && currentStep.value < 5) {
    currentStep.value--
  }
}
</script>

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
        <div class="form-card relative">
          
          <!-- Back button internally routed through states -->
          <button v-if="currentStep > 1 && currentStep < 5" @click="goBack" class="back-link-btn" aria-label="Go back">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
             </svg>
             Back
          </button>

          <!-- Step 1: Email Input -->
          <div v-if="currentStep === 1">
            <header class="form-header">
              <h2>Forgot Password</h2>
              <p>Please enter your email to reset the password.</p>
            </header>

            <form class="auth-form" @submit.prevent="handleEmailSubmit">
              <label class="field">
                <span>Email Address</span>
                <div class="input-wrap">
                  <span class="input-icon" aria-hidden="true">✉</span>
                  <input v-model="email" type="email" placeholder="curator@heritage.kh" autocomplete="email" />
                </div>
              </label>
              
              <p v-if="emailError" class="error-text">{{ emailError }}</p>

              <button class="primary-button" type="submit">Reset Password →</button>
            </form>

            <p class="signup-row">
              Remember your password?
              <RouterLink to="/login">Back to Login →</RouterLink>
            </p>
          </div>

          <!-- Step 2: Verification Code -->
          <div v-if="currentStep === 2">
            <header class="form-header">
              <h2>Check your email</h2>
              <p>We sent a 5-digit reset link to <br/><strong style="color: #1d2427">{{ email }}</strong>.</p>
            </header>
            
            <form class="auth-form" @submit.prevent="handleVerifyCode">
              <div class="code-container" @paste="handleCodePaste">
                <input
                  v-for="(_, index) in code"
                  inputmode="numeric"
                  maxlength="1"
                  v-model="code[index]"
                  ref="codeRefs"
                  class="code-input"
                  @input="handleCodeInput(index, $event)"
                  @keydown="handleCodeKeydown(index, $event)"
                />
              </div>

              <p v-if="codeError" class="error-text" style="text-align: center; margin-top: 4px;">{{ codeError }}</p>

              <button class="primary-button mt-4" type="submit" :disabled="!isCodeComplete">Verify Code →</button>
            </form>

            <p class="signup-row">
              Haven't got the email yet?
              <a href="#" @click.prevent="resendCode">Resend email</a>
            </p>
          </div>

          <!-- Step 3: Password reset confirm -->
          <div v-if="currentStep === 3">
            <header class="form-header">
              <h2>Password reset</h2>
              <p>Your password has been successfully reset. Click confirm to set a new password.</p>
            </header>
            
            <div class="auth-form">
              <button class="primary-button" @click="handleGoToNewPassword">Confirm →</button>
            </div>
          </div>

          <!-- Step 4: Set New Password -->
          <div v-if="currentStep === 4">
            <header class="form-header">
              <h2>Set a new password</h2>
              <p>Create a new password. Ensure it differs from previous ones for security.</p>
            </header>

            <form class="auth-form" @submit.prevent="handleUpdatePassword">
              <label class="field">
                <span>New Password</span>
                <div class="input-wrap">
                  <span class="input-icon" aria-hidden="true">⌁</span>
                  <input v-model="newPassword" :type="showPassword ? 'text' : 'password'" placeholder="••••••••" />
                  <button type="button" class="eye-btn" @click="showPassword = !showPassword">
                   <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" class="eye-icon" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                   <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" class="eye-icon" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </div>
              </label>

              <label class="field">
                <span>Confirm Password</span>
                <div class="input-wrap">
                  <span class="input-icon" aria-hidden="true">⌁</span>
                  <input v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="••••••••" />
                  <button type="button" class="eye-btn" @click="showConfirmPassword = !showConfirmPassword">
                    <svg v-if="showConfirmPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" class="eye-icon" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" class="eye-icon" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </div>
              </label>
              
              <p v-if="passwordError" class="error-text">{{ passwordError }}</p>

              <button class="primary-button" type="submit">Update Password →</button>
            </form>
          </div>

          <!-- Step 5: Success -->
          <div v-if="currentStep === 5" class="success-screen">
            <div class="success-icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <header class="form-header centered-header">
              <h2>Successful</h2>
              <p>Congratulations! Your password has been changed.</p>
            </header>
            <div class="auth-form">
              <button @click="router.push('/login')" class="primary-button" style="width: 100%;">Continue to Login →</button>
            </div>
          </div>

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
/* Inherit from Original Old UI framework */
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

.hero-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgba(4, 19, 21, 0.88), transparent 38%),
    repeating-linear-gradient(90deg, transparent 0, transparent 88px, rgba(255, 255, 255, 0.03) 89px, transparent 90px);
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
    linear-gradient(180deg, transparent, rgba(4, 19, 21, 0.94) 45%, rgba(4, 19, 21, 0.98));
  filter: saturate(0.8);
}

.brand-mark, .hero-copy, .social-proof { position: relative; z-index: 1; }

.brand-mark { display: inline-flex; align-items: center; gap: 14px; }

.brand-icon {
  width: 30px; height: 30px; border-radius: 6px; background: #f4a71d;
  display: grid; place-items: center; color: #1b2a2a; font-size: 15px; font-weight: 800;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.2);
}

.brand-name { font-size: 1.05rem; font-weight: 700; color: #f7fbf7; }

.hero-copy { max-width: 600px; margin-top: auto; margin-bottom: 28px; }
.hero-accent { width: 20px; height: 3px; border-radius: 999px; background: #f4a71d; margin-bottom: 20px; }
.hero-copy h1 { margin: 0; font-size: clamp(2.7rem, 4vw, 4.2rem); line-height: 0.95; letter-spacing: -0.05em; font-weight: 800; text-wrap: balance; }
.hero-copy p { margin: 18px 0 0; max-width: 34rem; color: rgba(227, 248, 240, 0.75); font-size: 1.05rem; line-height: 1.5; }

.social-proof { display: flex; align-items: center; gap: 14px; margin-top: 24px; }
.avatar-stack { display: flex; }
.avatar { width: 30px; height: 30px; border-radius: 999px; border: 2px solid rgba(255, 255, 255, 0.45); margin-left: -8px; box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25); }
.avatar:first-child { margin-left: 0; }
.avatar-one { background: linear-gradient(135deg, #f6d365, #fda085); }
.avatar-two { background: linear-gradient(135deg, #89f7fe, #66a6ff); }
.avatar-three { background: linear-gradient(135deg, #fbc2eb, #a6c1ee); }
.social-proof p { margin: 0; font-size: 0.92rem; color: rgba(228, 247, 239, 0.72); }

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

.input-wrap:focus-within { border-color: #0e7f76; box-shadow: 0 0 0 2px rgba(14, 127, 118, 0.15); }
.input-icon { font-size: 0.92rem; color: #8b9498; width: 16px; text-align: center; }
.input-wrap input { border: 0; outline: 0; width: 100%; font: inherit; color: #233036; background: transparent; }
.input-wrap input::focus { outline: none; }
.input-wrap input::selection { background: rgba(244, 167, 29, 0.22); }

/* Eye Toggle Native */
.eye-btn {
  background: none; border: none; cursor: pointer; color: #8b9498; padding: 0; display: flex; align-items: center;
}
.eye-icon { transition: color 0.2s; }
.eye-btn:hover .eye-icon { color: #0e7f76; }

.primary-button {
  border: 0; border-radius: 8px; font: inherit; cursor: pointer; margin-top: 8px; min-height: 42px; width: 100%;
  background: linear-gradient(180deg, #0e7f76, #0a6d66); color: #ffffff; font-weight: 700; box-shadow: 0 12px 24px rgba(10, 109, 102, 0.25);
  display: inline-flex; align-items: center; justify-content: center; transition: opacity 0.2s, transform 0.1s;
}
.primary-button:hover { background: linear-gradient(180deg, #0d756d, #09615b); }
.primary-button:active { transform: translateY(1px); }
.primary-button:disabled { opacity: 0.6; cursor: not-allowed; }

.signup-row { margin: 22px 0 0; text-align: center; font-size: 0.95rem; color: #536067; }
.signup-row a { color: #bf7d10; text-decoration: none; font-weight: 600; }
.signup-row a:hover { text-decoration: underline; }

/* Code verification boxes */
.code-container { display: flex; justify-content: center; gap: 10px; margin-bottom: 4px; }
.code-input {
  width: 48px; height: 56px; border: 1px solid rgba(95, 109, 116, 0.2); border-radius: 10px;
  font-size: 20px; font-weight: 600; text-align: center; background-color: #ffffff; color: #233036;
  transition: border-color 0.2s, box-shadow 0.2s; outline: none;
}
.code-input:focus { border-color: #0e7f76; box-shadow: 0 0 0 3px rgba(14, 127, 118, 0.15); }

/* Step UX features */
.error-text { color: #d63c3c; font-size: 0.85rem; font-weight: 500; margin: 4px 0 0 4px; }
.mt-4 { margin-top: 16px; }

/* Custom Back Button inner spacing */
.back-link-btn {
  position: absolute; top: 32px; left: 24px; display: inline-flex; align-items: center; gap: 6px;
  background: none; border: none; font-size: 0.9rem; font-weight: 600; color: #69757a; cursor: pointer; transition: color 0.2s;
}
.back-link-btn:hover { color: #1d2427; }

/* Enhanced Success screen */
.success-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 0 40px; }
.success-icon-wrap {
  width: 64px; height: 64px; background: rgba(14, 127, 118, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;
}
.success-icon-wrap svg { width: 32px; height: 32px; color: #0e7f76; }
.centered-header { text-align: center; }
.centered-header p { margin: 12px auto 0; text-align: center; max-width: 250px; }

/* Footer Links */
.footer-links {
  display: flex; justify-content: space-between; gap: 16px; align-items: flex-end; padding-top: 18px; margin-top: 26px;
  border-top: 1px solid rgba(97, 109, 116, 0.1); color: #8d9497; font-size: 0.64rem; letter-spacing: 0.14em; font-weight: 700;
}
.footer-links nav { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 12px 18px; }
.footer-links a { color: #bf7d10; text-decoration: none; }
.footer-links a:hover { text-decoration: underline; }

@media (max-width: 1080px) {
  .auth-shell { grid-template-columns: 1fr; }
  .hero-panel { min-height: 56vh; }
}

@media (max-width: 640px) {
  .hero-panel { padding: 32px 22px 26px; }
  .form-card { padding: 60px 18px 20px; }
  .back-link-btn { top: 20px; left: 16px; }
  .footer-links { flex-direction: column; align-items: flex-start; }
  .footer-links nav { justify-content: flex-start; }
}
</style>
