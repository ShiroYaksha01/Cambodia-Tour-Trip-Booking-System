<script setup lang="ts">
import { ref } from "vue";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/vue/24/outline";
import { useRouter } from "vue-router";
import AuthButton from "../../components/auth/AuthButton.vue";
import AuthCard from "../../components/auth/AuthCard.vue";
import AuthInput from "../../components/auth/AuthInput.vue";
import AuthLayout from "../../components/auth/AuthLayout.vue";
import api from "../../services/api";
import { setCurrentUserRole } from "../../utils/auth";

const router = useRouter();

const email = ref("");
const password = ref("");
const rememberMe = ref(true);
const message = ref("");
const loading = ref(false);

const handleLogin = async () => {
  message.value = "";

  if (!email.value.trim() || !password.value) {
    message.value = "Please enter your email and password.";
    return;
  }

  loading.value = true;
  try {
    const res = await api.post("/auth/login", {
      email: email.value,
      password: password.value,
    });

    message.value = res.data.message;

    if (res.data.success) {
      localStorage.setItem("auth_user", JSON.stringify(res.data.user));
      localStorage.setItem("auth_role", res.data.user.role);

      setCurrentUserRole(res.data.user.role);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("auth_user", JSON.stringify(res.data.user));

      const redirectPath = router.currentRoute.value.query.redirect as string;
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push("/dashboard");
      }
    }
  } catch (err: any) {
    message.value = err.response?.data?.message || "Login failed";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <AuthLayout>
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to continue planning your Cambodia journey."
    >
      <form class="auth-form" @submit.prevent="handleLogin">
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
          placeholder="Enter your password"
          autocomplete="current-password"
          :icon="LockClosedIcon"
          password-toggle
          required
        />

        <div class="auth-form-row">
          <label class="auth-check">
            <input v-model="rememberMe" type="checkbox" />
            <span>Remember me</span>
          </label>

          <RouterLink class="auth-link" to="/forgot-password">
            Forgot password?
          </RouterLink>
        </div>

        <p v-if="message" class="auth-message error">{{ message }}</p>

        <AuthButton :loading="loading" loading-text="Signing in...">
          Sign In
        </AuthButton>
      </form>

      <p class="auth-note">
        You will be redirected based on your account role.
      </p>

      <template #footer>
        New to Anajak Tour?
        <RouterLink to="/register">Create an account</RouterLink>
      </template>
    </AuthCard>
  </AuthLayout>
</template>
