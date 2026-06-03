<template>
  <div class="settings-container">
    <!-- header provided by ProviderHeader in the shell -->

    <!-- Content -->
    <main class="settings-content">
      <!-- Public Profile Section -->
      <section class="settings-section">
        <div class="section-icon">📋</div>
        <div class="section-header">
          <h2>Public Profile</h2>
          <p class="section-description">This information will be visible to travelers and curators across the platform. Ensure your brand represents the quality of your services.</p>
        </div>

        <div class="settings-grid">
          <!-- Business Logo -->
          <div class="settings-group logo-group">
            <label>Business Logo</label>
            <div class="logo-upload">
              <div class="logo-preview">
                <img v-if="logoPreview" :src="logoPreview" :alt="companyName || 'Logo'" />
                <div v-else class="logo-placeholder">📷</div>
              </div>
              <div class="logo-info">
                <p class="file-name">{{ logoFileName || 'JPG, PNG or GIF, Max 2MB' }}</p>
                <button @click="triggerLogoUpload" class="upload-btn">Update Branding</button>
                <input
                  ref="logoInput"
                  type="file"
                  accept="image/*"
                  style="display: none"
                  @change="handleLogoUpload"
                />
              </div>
              <div class="checkmark">✓</div>
            </div>
          </div>

          <!-- Business Biography -->
          <div class="settings-group full-width">
            <label>Business Biography</label>
            <p class="field-hint">Tell travelers about your heritage curation expertise...</p>
            <textarea
              v-model="biography"
              class="textarea"
              placeholder="Describe your heritage experiences, specialties, and what makes your curations unique..."
              rows="4"
            ></textarea>
          </div>

          <!-- Facebook Page -->
          <div class="settings-group">
            <label>Facebook Page</label>
            <div class="social-input">
              <span class="social-icon">f</span>
              <input v-model="facebookUrl" type="text" placeholder="fb.com/yourbrand" />
            </div>
          </div>

          <!-- Telegram Handle -->
          <div class="settings-group">
            <label>Telegram Handle</label>
            <div class="social-input">
              <span class="social-icon">✈</span>
              <input v-model="telegramHandle" type="text" placeholder="@brand_support" />
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Details Section -->
      <section class="settings-section">
        <div class="section-icon">📧</div>
        <div class="section-header">
          <div class="header-top">
            <h2>Contact Details</h2>
            <span class="private-badge">PRIVATE</span>
          </div>
          <p class="section-description">These details are for administrative communication only.</p>
        </div>

        <div class="settings-grid">
          <!-- Official Email -->
          <div class="settings-group">
            <label>Official Email</label>
            <input v-model="officialEmail" type="email" placeholder="ops@heritagecuration.com" />
          </div>

          <!-- Phone Number -->
          <div class="settings-group">
            <label>Phone Number</label>
            <input v-model="phoneNumber" type="tel" placeholder="+855 12 345 678" />
          </div>
        </div>

        <p class="admin-note">ℹ These details are for administrative communication only.</p>
      </section>

      <!-- Payout Settings Section -->
      <section class="settings-section payout-section">
        <div class="section-icon">🏦</div>
        <div class="section-header">
          <h2>Payout Settings</h2>
        </div>

        <div class="payout-card">
          <div class="payout-field">
            <label>BANK ACCOUNT NUMBER</label>
            <div class="account-display">
              <span class="account-number">{{ bankAccountMasked }}</span>
              <button class="copy-btn">📋</button>
            </div>
          </div>

          <div class="payout-field">
            <label>BANK NAME</label>
            <div class="account-display">
              <span class="bank-name">{{ bankName }}</span>
              <button class="edit-btn">✎</button>
            </div>
          </div>

          <button class="btn-secure-update">Secure Update</button>
        </div>
      </section>

      <!-- Policy Manager Section -->
      <section class="settings-section">
        <div class="section-icon">⚙</div>
        <div class="section-header">
          <h2>Policy Manager</h2>
          <p class="section-description">Define your business rules and cancellation terms for curated trips.</p>
        </div>

        <div class="policy-grid">
          <div class="policy-box">
            <h3>Refund Rules</h3>
            <p class="policy-hint">Enter refund details... e.g. Full refund 48 hours before the trip begins.</p>
            <textarea
              v-model="refundRules"
              class="policy-textarea"
              placeholder="Define your refund policy..."
              rows="3"
            ></textarea>
          </div>

          <div class="policy-box">
            <h3>Guest Requirements</h3>
            <p class="policy-hint">Enter requirements... e.g. Minimum age 12, comfortable footwear required for temple climbs.</p>
            <textarea
              v-model="guestRequirements"
              class="policy-textarea"
              placeholder="Define guest requirements..."
              rows="3"
            ></textarea>
          </div>
        </div>

        <div class="compliance-warning">
          <span class="warning-icon">⚠</span>
          <p>Legal Compliance: Changes to policies will only apply to new bookings created after the save date.</p>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="settings-footer">
      <div class="footer-left">
        <button class="btn-text">➕ New Booking</button>
        <button class="btn-text">? Support</button>
        <button @click="handleLogout" class="btn-text">🚪 Logout</button>
      </div>
      <div class="footer-right">
        <p class="last-updated">Last updated: Oct 24, 2023 at 09:15 AM</p>
        <button @click="discardChanges" class="btn-secondary">Discard Changes</button>
        <button @click="saveChanges" class="btn-primary">Save Changes</button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { clearAuthData } from "../../utils/auth";

defineProps<{
  searchQuery?: string;
}>();

const companyName = ref("Angkor Treasures");
const biography = ref("Curating authentic heritage experiences since 2015...");
const facebookUrl = ref("fb.com/yourbrand");
const telegramHandle = ref("@brand_support");
const officialEmail = ref("ops@heritagecuration.com");
const phoneNumber = ref("+855 12 345 678");
const bankAccountMasked = ref("801 234 567");
const bankName = ref("TREASURE_CORP@ABA");
const refundRules = ref("");
const guestRequirements = ref("");
const logoFileName = ref("");
const logoPreview = ref("");

const logoInput = ref<HTMLInputElement | null>(null);
const router = useRouter();

// header/profile info provided by ProviderHeader in shell; no local computed needed

function handleLogout() {
  if (confirm("Are you sure you want to log out?")) {
    clearAuthData();
    window.location.href = "/customer/homepage";
  }
}

function triggerLogoUpload() {
  logoInput.value?.click();
}

function handleLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    logoFileName.value = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      logoPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

function saveChanges() {
  // Mock save
  alert("Settings saved successfully!");
}

function discardChanges() {
  // Reset to defaults
  logoFileName.value = "";
  logoPreview.value = "";
  alert("Changes discarded.");
}
</script>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f5f5f5;
}

.settings-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.settings-header h1 {
  margin: 0;
  font-size: 20px;
  color: #1a1a1a;
}

.subtitle {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #666;
}

.header-icons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.provider-profile {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0f6e70, #efb34f);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
}

.avatar--image {
  background: transparent;
}

.avatar--image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}

.settings-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.settings-section {
  background: white;
  border-radius: 6px;
  padding: 24px;
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  align-items: start;
}

.settings-section.payout-section {
  grid-template-columns: 1fr;
}

.section-icon {
  font-size: 24px;
  line-height: 1.2;
}

.section-header h2 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.section-header .header-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.private-badge {
  background: #e8f5f0;
  color: #0f6e70;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
}

.section-description {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.settings-grid {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settings-group.full-width {
  grid-column: 1 / -1;
}

.settings-group.logo-group {
  grid-column: 1 / -1;
}

.settings-group label {
  font-size: 12px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-hint {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.settings-group input,
.settings-group textarea {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
}

.settings-group input:focus,
.settings-group textarea:focus {
  outline: none;
  border-color: #0f6e70;
  background: #f9fffe;
}

.textarea {
  resize: vertical;
}

.social-input {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.social-icon {
  padding: 8px 12px;
  background: #f5f5f5;
  border-right: 1px solid #ddd;
  font-weight: 600;
  color: #0f6e70;
}

.social-input input {
  flex: 1;
  border: none;
  padding: 8px 12px;
}

.social-input input:focus {
  outline: none;
  background: #f9fffe;
}

.logo-upload {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.logo-preview {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  border: 2px solid #ddd;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: white;
}

.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  font-size: 32px;
  color: #ddd;
}

.logo-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.file-name {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.upload-btn {
  padding: 6px 12px;
  background: #0f6e70;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.upload-btn:hover {
  background: #0d5a5c;
}

.checkmark {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  background: #0f6e70;
  color: white;
  border-radius: 50%;
  font-size: 16px;
  font-weight: bold;
}

.admin-note {
  grid-column: 1 / -1;
  margin: 8px 0 0 0;
  padding: 8px 12px;
  background: #f9f9f9;
  border-left: 2px solid #999;
  font-size: 12px;
  color: #666;
}

.payout-card {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #0f6e70, #1b9699);
  color: white;
  border-radius: 6px;
  padding: 24px;
  display: grid;
  gap: 16px;
}

.payout-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payout-field label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.account-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.account-number,
.bank-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.copy-btn,
.edit-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.copy-btn:hover,
.edit-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-secure-update {
  grid-column: 1 / -1;
  padding: 10px 16px;
  background: #ffa500;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.btn-secure-update:hover {
  background: #ff9500;
}

.policy-grid {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.policy-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.policy-box h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.policy-hint {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.policy-textarea {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  font-family: inherit;
  resize: vertical;
}

.policy-textarea:focus {
  outline: none;
  border-color: #0f6e70;
  background: #f9fffe;
}

.compliance-warning {
  grid-column: 1 / -1;
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #fff4e6;
  border-radius: 4px;
  border-left: 4px solid #ffa500;
  align-items: flex-start;
}

.warning-icon {
  flex: 0 0 24px;
  display: grid;
  place-items: center;
  font-size: 18px;
}

.compliance-warning p {
  margin: 0;
  font-size: 12px;
  color: #8b6f47;
  line-height: 1.4;
}

.settings-footer {
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.footer-left {
  display: flex;
  gap: 12px;
}

.btn-text {
  background: none;
  border: none;
  color: #0f6e70;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
}

.btn-text:hover {
  opacity: 0.8;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.last-updated {
  margin: 0;
  font-size: 11px;
  color: #999;
}

.btn-secondary {
  padding: 8px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #1a1a1a;
}

.btn-secondary:hover {
  background: #f5f5f5;
}

.btn-primary {
  padding: 8px 16px;
  background: #0f6e70;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.btn-primary:hover {
  background: #0d5a5c;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .policy-grid {
    grid-template-columns: 1fr;
  }

  .logo-upload {
    grid-template-columns: 1fr;
  }

  .settings-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .footer-right {
    flex-direction: column;
  }
}
</style>
