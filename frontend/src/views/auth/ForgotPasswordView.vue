<script setup lang="ts">
import { ref } from "vue";
import { EnvelopeIcon } from "@heroicons/vue/24/outline";
import { useRouter } from "vue-router";
import AuthButton from "../../components/auth/AuthButton.vue";
import AuthCard from "../../components/auth/AuthCard.vue";
import AuthInput from "../../components/auth/AuthInput.vue";
import AuthLayout from "../../components/auth/AuthLayout.vue";
import { forgotPassword } from "../../services/api";

const router = useRouter();
const email = ref("");
const emailError = ref("");
const loading = ref(false);

const handleEmailSubmit = async () => {
  emailError.value = "";
  if (!email.value.trim()) {
    emailError.value = "Please enter your email.";
    return;
  }

  loading.value = true;
  try {
    await forgotPassword(email.value);
    router.push({ name: "verify-otp", query: { email: email.value } });
  } catch (error: any) {
    emailError.value = error.response?.data?.message || "Failed to process request. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <AuthLayout>
    <AuthCard
      title="Forgot Password?"
      subtitle="Enter your email and we'll send instructions to reset your password."
    >
      <form class="auth-form" @submit.prevent="handleEmailSubmit">
        <AuthInput
          v-model="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          :icon="EnvelopeIcon"
          :error="emailError"
          required
        />

        <AuthButton :loading="loading" loading-text="Sending reset link...">
          Send Reset Link
        </AuthButton>
      </form>

      <template #footer>
        <RouterLink to="/login">Back to login</RouterLink>
      </template>
    </AuthCard>
  </AuthLayout>
</template>
