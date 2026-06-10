<script setup lang="ts">
import { computed, reactive, ref, type ComponentPublicInstance } from "vue";
import { useRoute, useRouter } from "vue-router";
import AuthButton from "../../components/auth/AuthButton.vue";
import AuthCard from "../../components/auth/AuthCard.vue";
import AuthLayout from "../../components/auth/AuthLayout.vue";
import { resendVerificationEmail, verifyEmail } from "../../services/api";

const route = useRoute();
const router = useRouter();
const email = (route.query.email as string) || "";
const code = reactive(["", "", "", "", "", ""]);
const inputRefs = ref<HTMLInputElement[]>([]);
const errorMessage = ref("");
const successMessage = ref("");
const isLoading = ref(false);
const resendLoading = ref(false);

const isCodeComplete = computed(() => code.every((digit) => digit !== ""));

function setInputRef(el: Element | ComponentPublicInstance | null, index: number) {
  if (el instanceof HTMLInputElement) {
    inputRefs.value[index] = el;
  }
}

const handleInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value.replace(/\D/g, "").slice(0, 1);
  code[index] = value;

  if (value && index < 5) {
    inputRefs.value[index + 1]?.focus();
  }
};

const handleKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === "Backspace" && !code[index] && index > 0) {
    inputRefs.value[index - 1]?.focus();
  }
};

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault();
  if (!event.clipboardData) {
    return;
  }

  const pastedData = event.clipboardData
    .getData("text")
    .replace(/\D/g, "")
    .slice(0, 6)
    .split("");

  pastedData.forEach((char, index) => {
    code[index] = char;
  });

  const focusIndex = Math.min(pastedData.length, 5);
  inputRefs.value[focusIndex]?.focus();
};

const submitCode = async () => {
  errorMessage.value = "";
  successMessage.value = "";
  const verificationCode = code.join("");

  if (!email) {
    errorMessage.value = "Email is missing. Please try registering again.";
    return;
  }

  isLoading.value = true;
  try {
    await verifyEmail(email, verificationCode);
    successMessage.value = "Email verified successfully. Redirecting...";
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || "Verification failed. Invalid or expired OTP.";
  } finally {
    isLoading.value = false;
  }
};

const resendCode = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!email) {
    errorMessage.value = "Email is missing.";
    return;
  }

  resendLoading.value = true;
  try {
    const res = await resendVerificationEmail(email);
    successMessage.value = res.data?.message || "A new code has been sent to your email.";
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || "Failed to resend code.";
  } finally {
    resendLoading.value = false;
  }
};
</script>

<template>
  <AuthLayout>
    <AuthCard
      title="Verify Your Email"
      subtitle="Enter the code sent to your email to activate your account."
    >
      <form class="auth-form" @submit.prevent="submitCode">
        <div class="auth-otp-group" @paste="handlePaste">
          <input
            v-for="(_, index) in code"
            :key="index"
            v-model="code[index]"
            :ref="(el) => setInputRef(el, index)"
            class="auth-otp-input"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="1"
            aria-label="Email verification code digit"
            @input="handleInput(index, $event)"
            @keydown="handleKeydown(index, $event)"
          />
        </div>

        <p v-if="errorMessage" class="auth-message error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="auth-message success">{{ successMessage }}</p>

        <AuthButton
          :loading="isLoading"
          :disabled="!isCodeComplete"
          loading-text="Verifying..."
        >
          Verify Account
        </AuthButton>

        <p class="auth-note">
          Didn't receive the code?
          <button
            type="button"
            class="auth-link"
            :disabled="resendLoading"
            @click="resendCode"
          >
            {{ resendLoading ? "Sending..." : "Resend code" }}
          </button>
        </p>
      </form>
    </AuthCard>
  </AuthLayout>
</template>

<style scoped>
.auth-link:disabled {
  color: var(--text-muted, #6B7676);
  opacity: 0.68;
  cursor: not-allowed;
  text-decoration: none;
}
</style>
