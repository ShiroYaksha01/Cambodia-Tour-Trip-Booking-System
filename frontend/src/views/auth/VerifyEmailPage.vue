<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 font-sans"
  >
    <div
      class="bg-white px-10 py-12 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 text-center w-full max-w-[420px]"
    >
      <div
        class="w-12 h-12 bg-[#f7f7f9] border border-gray-100 rounded-lg mx-auto mb-6 flex justify-center items-center"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4a5568"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
          ></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      </div>

      <h2 class="text-2xl font-semibold text-gray-900 mb-3">
        Verify Your Email
      </h2>
      <p class="text-[15px] text-gray-500 mb-8 leading-relaxed">
        Enter the 6-digit verification code sent to {{ email ? email : 'your email address' }}.
      </p>

      <div class="flex gap-3 justify-center mb-6" @paste="handlePaste">
        <input
          v-for="(digit, index) in code"
          :key="index"
          type="text"
          inputmode="numeric"
          maxlength="1"
          v-model="code[index]"
          ref="inputRefs"
          class="w-12 h-14 text-2xl font-medium text-center border border-gray-300 rounded-md bg-white outline-none transition-all duration-200 focus:border-black focus:ring-[2px] focus:ring-black/10"
          @input="handleInput(index, $event)"
          @keydown="handleKeydown(index, $event)"
        />
      </div>

      <p v-if="errorMessage" class="text-sm text-red-500 mb-4">{{ errorMessage }}</p>
      <p v-if="successMessage" class="text-sm text-green-600 mb-4">{{ successMessage }}</p>

      <button
        class="w-full py-3.5 bg-black text-white rounded-md text-base font-medium transition-colors duration-200 hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed mb-6"
        @click="submitCode"
        :disabled="!isCodeComplete || isLoading"
      >
        {{ isLoading ? 'Verifying...' : 'Verify' }}
      </button>

      <p class="text-sm text-gray-500 m-0">
        Didn't receive a code?
        <button
          class="bg-transparent border-none p-0 text-black text-sm font-semibold cursor-pointer no-underline hover:underline ml-1"
          @click="resendCode"
        >
          Resend Code
        </button>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { verifyEmail, resendVerificationEmail } from "../../services/api";

const route = useRoute();
const router = useRouter();

// State
const email = route.query.email || "";
const code = reactive(["", "", "", "", "", ""]);
const inputRefs = ref([]);
const errorMessage = ref("");
const successMessage = ref("");
const isLoading = ref(false);

// Check if all 6 digits are entered
const isCodeComplete = computed(() => {
  return code.every((digit) => digit !== "");
});

// Handle typing
const handleInput = (index, event) => {
  const value = event.target.value;

  // Ensure only numbers are entered
  if (!/^\d*$/.test(value)) {
    code[index] = "";
    return;
  }

  // Move focus to next input automatically
  if (value && index < 5) {
    inputRefs.value[index + 1].focus();
  }
};

// Handle backspace to move to the previous input
const handleKeydown = (index, event) => {
  if (event.key === "Backspace" && !code[index] && index > 0) {
    inputRefs.value[index - 1].focus();
  }
};

// Handle users pasting a 6-digit code all at once
const handlePaste = (event) => {
  event.preventDefault();
  const pastedData = event.clipboardData
    .getData("text")
    .replace(/\D/g, "")
    .slice(0, 6)
    .split("");

  pastedData.forEach((char, i) => {
    if (i < 6) {
      code[i] = char;
      // Focus the next empty input or the last one
      if (i < 5) {
        inputRefs.value[i + 1].focus();
      } else {
        inputRefs.value[5].focus();
      }
    }
  });
};

// Form submissions
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
    successMessage.value = "Email verified successfully! Redirecting...";
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  } catch (err) {
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

  isLoading.value = true;
  try {
    const res = await resendVerificationEmail(email);
    successMessage.value = res.data?.message || "A new code has been sent to your email.";
  } catch (err) {
    errorMessage.value = err.response?.data?.message || "Failed to resend code.";
  } finally {
    isLoading.value = false;
  }
};
</script>
