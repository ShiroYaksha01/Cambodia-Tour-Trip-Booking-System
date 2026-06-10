<script setup lang="ts">
import { computed, ref } from "vue";
import { LockClosedIcon } from "@heroicons/vue/24/outline";
import { useRoute, useRouter } from "vue-router";
import AuthButton from "../../components/auth/AuthButton.vue";
import AuthCard from "../../components/auth/AuthCard.vue";
import AuthInput from "../../components/auth/AuthInput.vue";
import AuthLayout from "../../components/auth/AuthLayout.vue";
import { resetPassword } from "../../services/api";

const router = useRouter();
const route = useRoute();
const email = route.query.email as string;
const otp = route.query.otp as string;

const newPassword = ref("");
const confirmPassword = ref("");
const passwordError = ref("");
const loading = ref(false);

const passwordHint = computed(() => {
  if (!newPassword.value) {
    return "Use a unique password with at least 6 characters.";
  }

  if (newPassword.value.length < 6) {
    return "Weak: add more characters.";
  }

  if (newPassword.value.length < 10) {
    return "Medium: stronger with 10 or more characters.";
  }

  return "Strong password.";
});

const handleUpdatePassword = async () => {
  passwordError.value = "";
  if (newPassword.value.length < 6) {
    passwordError.value = "Password must be at least 6 characters.";
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = "Passwords do not match.";
    return;
  }

  loading.value = true;
  try {
    await resetPassword(email, otp, newPassword.value);
    router.push("/login");
  } catch (error: any) {
    passwordError.value = error.response?.data?.message || "Failed to reset password. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <AuthLayout>
    <AuthCard
      title="Set New Password"
      subtitle="Create a strong password to protect your account."
    >
      <form class="auth-form" @submit.prevent="handleUpdatePassword">
        <AuthInput
          v-model="newPassword"
          label="New password"
          type="password"
          placeholder="Create a new password"
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
          placeholder="Confirm your new password"
          autocomplete="new-password"
          :icon="LockClosedIcon"
          password-toggle
          required
        />

        <p v-if="passwordError" class="auth-message error">{{ passwordError }}</p>

        <AuthButton :loading="loading" loading-text="Resetting password...">
          Reset Password
        </AuthButton>
      </form>
    </AuthCard>
  </AuthLayout>
</template>
