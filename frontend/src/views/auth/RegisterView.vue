<script setup>
import { ref } from "vue";
import api from "../../services/api";
import { useRouter } from "vue-router";

const router = useRouter();

const username = ref("");
const email = ref("");
const phone = ref("");
const password = ref("");
const file = ref(null);
const agreed = ref(false);
const message = ref("");

const handleFile = (e) => {
  file.value = e.target.files[0];
};

const handleRegister = async () => {
  try {
    const formData = new FormData();

    formData.append("username", username.value);
    formData.append("email", email.value);
    formData.append("phoneNumber", phone.value);
    formData.append("password", password.value);

    if (file.value) {
      formData.append("profilePicture", file.value);
    }

    const res = await api.post("/auth/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    message.value = res.data.message;
    console.log("REGISTER SUCCESS:", res.data);

    router.push("/"); // back to login
  } catch (err) {
    message.value = "Register failed";
    console.log(err);
  }
};
</script>

<template>
  <div class="auth-layout">
    <!-- Hero Panel -->
    <div class="hero-panel">
      <img src="/apsara.png" alt="Apsara dancer" class="hero-bg" />
      <div class="hero-overlay" />
    </div>

    <!-- Form Panel -->
    <div class="form-panel">
      <div class="form-card">
        <h1>Create Account</h1>
        <p class="form-subtitle">
          Sign up to start planning your premium Cambodian expedition.
        </p>

        <!-- Username -->
        <div class="field-group">
          <input v-model="username" type="text" placeholder="Username" />
        </div>

        <!-- Email -->
        <div class="field-group">
          <input v-model="email" type="email" placeholder="Email Address" />
        </div>

        <!-- Phone -->
        <div class="field-group phone-group">
          <div class="phone-prefix">
            <img src="https://flagcdn.com/w20/kh.png" width="18" alt="KH" />
            +855
          </div>
          <input
            v-model="phone"
            type="tel"
            placeholder="Phone Number"
            class="phone-input"
          />
        </div>

        <!-- Password -->
        <div class="field-group password-group">
          <input
            :type="showPass ? 'text' : 'password'"
            v-model="password"
            placeholder="Create Password"
          />
          <button
            class="toggle-pass"
            @click="showPass = !showPass"
            type="button"
          >
            <svg
              v-if="!showPass"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg
              v-else
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
              />
              <path
                d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
              />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
        </div>

        <!-- Agree -->
        <label class="checkbox-label">
          <input type="checkbox" v-model="agreed" />
          <span>
            I agree to the
            <a href="#" class="policy-link">Terms of Service</a> and
            <a href="#" class="policy-link">Privacy Policy</a> of The Heritage
            Curator.
          </span>
        </label>

        <button class="submit-btn" @click="handleRegister">
          Start Your Journey →
        </button>

        <p class="switch-link">
          Already have an account?
          <RouterLink to="/login" class="highlight-link">Sign In</RouterLink>
        </p>

        <div class="bottom-icons">
          <svg
            width="35"
            height="35"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d0d0d0"
            stroke-width="1.5"
          >
            <circle cx="12" cy="10" r="3" />
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            />
          </svg>
          <svg
            width="35"
            height="35"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d0d0d0"
            stroke-width="1.5"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
          </svg>
          <svg
            width="35"
            height="35"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d0d0d0"
            stroke-width="1.5"
          >
            <path
              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.29 6.29l.98-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- <script setup>
import { ref } from "vue";

const username = ref("");
const email = ref("");
const phone = ref("");
const password = ref("");
const agreed = ref(false);
const showPass = ref(false);

function handleRegister() {
  console.log("Register:", email.value);
}
</script> -->

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap");

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.auth-layout {
  position: relative;
  display: flex;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
}

/* ── Hero Panel ── */
.hero-panel {
  position: absolute;
  inset: 0;
}

.hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.04),
    transparent 50%,
    rgba(245, 244, 240, 0.55)
  );
}

/* ── Form Panel ── */
.form-panel {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 2.5rem 1.5rem;
  min-height: 100vh;
  background: transparent;
}

/* ── Form Card (mobile) ── */
.form-card {
  width: 100%;
  max-width: 440px;
  background: #f5f4f0;
  border-radius: 16px;
  padding: 2.2rem;
}

/* ── Typography ── */
.form-card h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #343434;
  margin-bottom: 0.45rem;
  letter-spacing: -0.01em;
}

.form-subtitle {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 1.8rem;
  line-height: 1.55;
}

/* ── Inputs ── */
.field-group {
  position: relative;
  margin-bottom: 0.85rem;
}

.field-group input {
  width: 100%;
  height: 60px;
  padding: 0.85rem 1.1rem;
  border: 1.5px solid transparent;
  border-radius: 8px;
  font-size: 0.92rem;
  font-family: "Inter", sans-serif;
  color: #2a2a2a;
  background: #eceae5;
  outline: none;
  transition:
    border-color 0.2s,
    background 0.2s;
}
.field-group input:focus {
  border-color: #117f81;
  background: #fff;
}
.field-group input::placeholder {
  color: #b0aaa0;
}

/* Phone */
.phone-group {
  display: flex;
  align-items: stretch;
}

.phone-prefix {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 0.9rem;
  background: #eceae5;
  border: 1.5px solid transparent;
  border-right: none;
  border-radius: 8px 0 0 8px;
  font-size: 0.88rem;
  font-weight: 500;
  color: #555;
  white-space: nowrap;
  min-width: 80px;
}

.phone-input {
  flex: 1;
  border-radius: 0 8px 8px 0 !important;
}

/* Password */
.password-group input {
  padding-right: 2.8rem;
}

.toggle-pass {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #aaa;
  display: flex;
  align-items: center;
  padding: 0;
}
.toggle-pass:hover {
  color: #555;
}

/* Agree */
.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.82rem;
  color: #818080;
  line-height: 1.5;
  cursor: pointer;
  margin: 1.3rem 0;
}

.checkbox-label input[type="checkbox"] {
  flex-shrink: 0;
  accent-color: #117f81;
  opacity: 0.7;
  width: 15px;
  height: 15px;
  margin-top: 3px;
}

.policy-link {
  color: #117f81;
  text-decoration: none;
  font-weight: 500;
}
.policy-link:hover {
  text-decoration: underline;
}

/* Button */
.submit-btn {
  width: 100%;
  height: 64px;
  padding: 0.95rem;
  background: #117f81;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-family: "Inter", sans-serif;
  font-weight: 500;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition:
    background 0.2s,
    transform 0.1s;
}
.submit-btn:hover {
  background: #0d6365;
}
.submit-btn:active {
  transform: scale(0.995);
}

.switch-link {
  text-align: center;
  font-size: 0.86rem;
  color: #999;
  margin-top: 1.2rem;
}

.highlight-link {
  color: #117f81;
  text-decoration: none;
  font-weight: 500;
}
.highlight-link:hover {
  text-decoration: underline;
}

.bottom-icons {
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  margin-top: 8rem;
  padding-top: 1.2rem;
  border-top: 1px solid #e0ddd6;
}

/* ── mobile ── */
@media (min-width: 768px) {
  .hero-panel {
    position: relative;
    flex: 0 0 55%;
    min-height: 100vh;
  }

  .form-panel {
    flex: 0 0 45%;
    min-height: 100vh;
    background: #f5f4f0;
    padding: 3rem 3.5rem;
    align-items: center;
  }

  .form-card {
    width: 80%;
    max-width: 80%;
    background: transparent;
    border-radius: 0;
    padding: 0;
  }
}
</style>
