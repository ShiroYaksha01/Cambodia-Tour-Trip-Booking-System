<script setup lang="ts">
import { computed, ref } from "vue";
import { EnvelopeIcon, LockClosedIcon, UserIcon } from "@heroicons/vue/24/outline";
import { useRouter } from "vue-router";
import AuthButton from "../../components/auth/AuthButton.vue";
import AuthCard from "../../components/auth/AuthCard.vue";
import AuthInput from "../../components/auth/AuthInput.vue";
import AuthLayout from "../../components/auth/AuthLayout.vue";
import api from "../../services/api";

type PublicRole = "customer" | "provider";

const router = useRouter();

const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const selectedRole = ref<PublicRole>("customer");
const message = ref("");
const loading = ref(false);

const passwordHint = computed(() => {
  if (!password.value) {
    return "Use at least 6 characters.";
  }

  if (password.value.length < 6) {
    return "Password is too short.";
  }

  if (password.value.length < 10) {
    return "Good password. Add more characters for stronger protection.";
  }

  return "Strong password.";
});

const handleRegister = async () => {
  message.value = "";

  if (!username.value.trim() || !email.value.trim() || !password.value || !confirmPassword.value) {
    message.value = "Please complete all required fields.";
    return;
  }

  if (password.value.length < 6) {
    message.value = "Password must be at least 6 characters.";
    return;
  }

  if (password.value !== confirmPassword.value) {
    message.value = "Passwords do not match.";
    return;
  }

  loading.value = true;
  try {
    const formData = new FormData();

    formData.append("username", username.value);
    formData.append("email", email.value);
    formData.append("password", password.value);
    formData.append("role", selectedRole.value);

    const res = await api.post("/auth/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    message.value = res.data.message;
    router.push({ name: "verify-email", query: { email: email.value } });
  } catch (err: any) {
    message.value = err.response?.data?.message || "Register failed";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <AuthLayout>
    <AuthCard
      class="register-card"
      title="Create Your Account"
    >
      <form class="auth-form" @submit.prevent="handleRegister">
        <AuthInput
          v-model="username"
          label="Full name"
          type="text"
          placeholder="Sokha Dara"
          autocomplete="name"
          :icon="UserIcon"
          required
        />

        <AuthInput
          v-model="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          :icon="EnvelopeIcon"
          required
        />

        <AuthInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="Create a password"
          autocomplete="new-password"
          :icon="LockClosedIcon"
          :hint="passwordHint"
          password-toggle
          required
        />

        <AuthInput
          v-model="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Confirm your password"
          autocomplete="new-password"
          :icon="LockClosedIcon"
          password-toggle
          required
        />

        <div class="auth-form-stack">
          <span class="role-label">Choose your role</span>
          <div class="auth-role-grid">
            <button
              type="button"
              class="auth-role-card"
              :class="{ active: selectedRole === 'customer' }"
              @click="selectedRole = 'customer'"
            >
              <strong>Customer</strong>
              <span>Book tours and manage trips</span>
            </button>

            <button
              type="button"
              class="auth-role-card"
              :class="{ active: selectedRole === 'provider' }"
              @click="selectedRole = 'provider'"
            >
              <strong>Provider</strong>
              <span>List services and manage bookings</span>
            </button>
          </div>
        </div>

        <p v-if="message" class="auth-message error">{{ message }}</p>

        <AuthButton :loading="loading" loading-text="Creating account...">
          Create Account
        </AuthButton>
      </form>

      <template #footer>
        Already have an account?
        <RouterLink to="/login">Sign in</RouterLink>
      </template>
    </AuthCard>
  </AuthLayout>
</template>

<style scoped>
:deep(.register-card) {
  width: min(100%, 430px);
  padding: 24px 26px;
}

:deep(.register-card .auth-card-header) {
  margin-bottom: 18px;
}

:deep(.auth-card-header h2) {
  font-size: clamp(1.45rem, 2vw, 1.8rem);
}

.auth-form {
  gap: 11px;
}

.auth-form-stack {
  gap: 9px;
}

:deep(.auth-field) {
  gap: 6px;
}

:deep(.input-shell) {
  min-height: 42px;
}

:deep(.auth-button) {
  min-height: 42px;
}

:deep(.auth-card-footer) {
  margin-top: 18px;
}

.role-label {
  color: var(--text-dark, #182525);
  font-size: 0.88rem;
  font-weight: 800;
}
</style>
