<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, type ComponentPublicInstance } from "vue";
import { useRoute, useRouter } from "vue-router";
import AuthButton from "../../components/auth/AuthButton.vue";
import AuthCard from "../../components/auth/AuthCard.vue";
import AuthLayout from "../../components/auth/AuthLayout.vue";
import { forgotPassword, verifyOtp } from "../../services/api";

const router = useRouter();
const route = useRoute();
const email = (route.query.email as string) || "";
const code = reactive(["", "", "", "", "", ""]);
const codeRefs = ref<HTMLInputElement[]>([]);
const codeError = ref("");
const successMessage = ref("");
const loading = ref(false);
const resendLoading = ref(false);
const countdown = ref(60);
let timerInterval: ReturnType<typeof setInterval> | null = null;

const isCodeComplete = computed(() => code.every((digit) => digit !== ""));

const startTimer = () => {
  countdown.value = 60;
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value -= 1;
    } else if (timerInterval) {
      clearInterval(timerInterval);
    }
  }, 1000);
};

onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});

function setCodeRef(el: Element | ComponentPublicInstance | null, index: number) {
  if (el instanceof HTMLInputElement) {
    codeRefs.value[index] = el;
  }
}

const handleCodeInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value.replace(/\D/g, "").slice(0, 1);
  code[index] = value;

  if (value && index < 5) {
    codeRefs.value[index + 1]?.focus();
  }
};

const handleKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === "Backspace" && !code[index] && index > 0) {
    codeRefs.value[index - 1]?.focus();
  }
};

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault();
  if (!event.clipboardData) {
    return;
  }

  const pastedCode = event.clipboardData
    .getData("text")
    .replace(/\D/g, "")
    .slice(0, 6)
    .split("");

  pastedCode.forEach((digit, index) => {
    code[index] = digit;
  });

  const focusIndex = Math.min(pastedCode.length, 5);
  codeRefs.value[focusIndex]?.focus();
};

const handleVerifyCode = async () => {
  codeError.value = "";
  successMessage.value = "";

  if (!email) {
    codeError.value = "Email is missing. Please start again.";
    return;
  }

  if (!isCodeComplete.value) {
    codeError.value = "Please enter the complete 6-digit code.";
    return;
  }

  loading.value = true;
  try {
    await verifyOtp(email, code.join(""));
    router.push({ name: "reset-password", query: { email, otp: code.join("") } });
  } catch (error: any) {
    codeError.value = error.response?.data?.message || "Invalid or expired OTP.";
  } finally {
    loading.value = false;
  }
};

const handleResendCode = async () => {
  if (countdown.value > 0) {
    return;
  }

  codeError.value = "";
  successMessage.value = "";
  resendLoading.value = true;

  try {
    await forgotPassword(email);
    successMessage.value = "A new code has been sent to your email.";
    startTimer();
  } catch (error: any) {
    codeError.value = error.response?.data?.message || "Failed to resend code. Please try again.";
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
      <form class="auth-form" @submit.prevent="handleVerifyCode">
        <div class="auth-otp-group" @paste="handlePaste">
          <input
            v-for="(_, index) in code"
            :key="index"
            v-model="code[index]"
            :ref="(el) => setCodeRef(el, index)"
            class="auth-otp-input"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="1"
            aria-label="Verification code digit"
            @input="handleCodeInput(index, $event)"
            @keydown="handleKeydown(index, $event)"
          />
        </div>

        <p v-if="codeError" class="auth-message error">{{ codeError }}</p>
        <p v-if="successMessage" class="auth-message success">{{ successMessage }}</p>

        <AuthButton
          :loading="loading"
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
            :disabled="countdown > 0 || resendLoading"
            @click="handleResendCode"
          >
            {{ resendLoading ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend code" }}
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
