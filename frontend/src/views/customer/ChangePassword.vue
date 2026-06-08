<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import CustomerNavbar from "../../components/customer/CustomerNavbar.vue";
import CustomerFooter from "../../components/customer/CustomerFooter.vue";
import api from "../../services/api";

const router = useRouter();

const form = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

async function handleChangePassword() {
  errorMessage.value = "";
  successMessage.value = "";

  if (
    !form.value.currentPassword ||
    !form.value.newPassword ||
    !form.value.confirmPassword
  ) {
    errorMessage.value = "Please fill all fields.";
    return;
  }

  if (form.value.newPassword.length < 6) {
    errorMessage.value = "New password must be at least 6 characters.";
    return;
  }

  if (form.value.newPassword !== form.value.confirmPassword) {
    errorMessage.value = "New password and confirm password do not match.";
    return;
  }

  loading.value = true;

  try {
    const response = await api.patch("/users/change-password", {
      currentPassword: form.value.currentPassword,
      newPassword: form.value.newPassword,
    });

    successMessage.value =
      response.data.message || "Password changed successfully.";

    form.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  } catch (err: any) {
    errorMessage.value =
      err.response?.data?.message || "Failed to change password.";
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push("/customer/profile");
}
</script>

<template>
  <div class="change-password-page">
    <CustomerNavbar />

    <main class="change-password-container">
      <section class="password-card">
        <button class="back-btn" @click="goBack">← Back to Profile</button>

        <h1>Change Password</h1>
        <p class="subtitle">
          Update your password to keep your account secure.
        </p>

        <form @submit.prevent="handleChangePassword" class="password-form">
          <div class="form-group">
            <label>Current Password</label>
            <input
              v-model="form.currentPassword"
              type="password"
              placeholder="Enter current password"
            />
          </div>

          <div class="form-group">
            <label>New Password</label>
            <input
              v-model="form.newPassword"
              type="password"
              placeholder="Enter new password"
            />
          </div>

          <div class="form-group">
            <label>Confirm New Password</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              placeholder="Confirm new password"
            />
          </div>

          <p v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </p>

          <p v-if="successMessage" class="success-message">
            {{ successMessage }}
          </p>

          <button class="submit-btn" type="submit" :disabled="loading">
            {{ loading ? "Changing..." : "Change Password" }}
          </button>
        </form>
      </section>
    </main>

    <CustomerFooter />
  </div>
</template>

<style scoped>
.change-password-page {
  min-height: 100vh;
  background: #f5f7f8;
  color: #152323;
  font-family: Arial, sans-serif;
}

.change-password-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
}

.password-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 28px;
  box-shadow: 0 12px 35px rgba(15, 35, 35, 0.08);
}

.back-btn {
  border: none;
  background: transparent;
  color: #0f6e70;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 18px;
}

.password-card h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.subtitle {
  margin: 0 0 24px;
  color: #6b7280;
  font-size: 14px;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group label {
  display: block;
  color: #6b7280;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.form-group input {
  width: 100%;
  border: 1px solid #d1d5db;
  padding: 12px;
  outline: none;
  font-size: 14px;
}

.form-group input:focus {
  border-color: #0f6e70;
  box-shadow: 0 0 0 3px rgba(15, 110, 112, 0.12);
}

.error-message {
  color: #dc2626;
  font-weight: 700;
  margin: 0;
}

.success-message {
  color: #047857;
  font-weight: 700;
  margin: 0;
}

.submit-btn {
  background: #0f6e70;
  color: #ffffff;
  border: none;
  padding: 12px 18px;
  cursor: pointer;
  font-weight: 700;
}

.submit-btn:hover {
  background: #0a5557;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
