<template>
  <div class="settings-container">
    <!-- header provided by ProviderHeader in the shell -->

    <!-- Content -->
    <main class="settings-content">
      <!-- Public Profile Section -->
      <section class="public-profile-section">
        <div class="profile-section-header">
          <div class="profile-section-icon">
            <BuildingStorefrontIcon />
          </div>
          <div>
            <p class="profile-kicker">Marketplace Profile</p>
            <h2>Public Profile</h2>
            <p>This information appears on your traveler-facing provider profile.</p>
          </div>
        </div>

        <div class="profile-layout">
          <div class="profile-editor">
            <div class="profile-card profile-card--media-info">
              <div class="card-title-row">
                <div>
                  <h3>Brand Media & Basic Info</h3>
                  <p>Keep your provider profile polished, clear, and traveler-ready.</p>
                </div>
                <PhotoIcon class="card-title-icon" />
              </div>

              <div class="media-info-grid">
                <div class="media-column">
                  <div class="cover-uploader">
                    <div class="cover-preview" :style="coverPreview ? { backgroundImage: `url(${coverPreview})` } : undefined">
                      <div v-if="!coverPreview" class="cover-empty">
                        <PhotoIcon />
                        <span>Cover banner preview</span>
                      </div>
                    </div>
                    <div class="upload-row">
                      <div>
                        <label>Cover Banner</label>
                        <p>{{ coverFileName || "JPG/PNG, recommended 1600x500px" }}</p>
                      </div>
                      <button type="button" class="profile-upload-btn" @click="triggerCoverUpload">
                        {{ coverPreview ? "Change Cover" : "Upload Cover" }}
                      </button>
                      <input
                        ref="coverInput"
                        type="file"
                        accept="image/png,image/jpeg"
                        class="hidden-file-input"
                        @change="handleCoverUpload"
                      />
                    </div>
                  </div>

                  <div class="logo-uploader">
                    <div class="brand-logo-preview">
                      <img v-if="logoPreview" :src="logoPreview" :alt="companyName || 'Business logo'" />
                      <BuildingStorefrontIcon v-else />
                    </div>
                    <div class="logo-upload-copy">
                      <label>Business Logo</label>
                      <p>{{ logoFileName || "JPG/PNG, max 2MB" }}</p>
                    </div>
                    <button type="button" class="profile-upload-btn" @click="triggerLogoUpload">
                      {{ logoPreview ? "Change Logo" : "Upload Logo" }}
                    </button>
                    <input
                      ref="logoInput"
                      type="file"
                      accept="image/png,image/jpeg"
                      class="hidden-file-input"
                      @change="handleLogoUpload"
                    />
                  </div>
                </div>

                <div class="profile-form-grid basic-info-grid">
                  <div class="profile-field">
                    <label>Business Name</label>
                    <input v-model="companyName" type="text" placeholder="Anajak Tour" />
                  </div>
                  <div class="profile-field">
                    <label>Tagline</label>
                    <input v-model="tagline" type="text" placeholder="Premium Cambodia travel experiences" />
                  </div>
                  <div class="profile-field full">
                    <label>Business Biography</label>
                    <textarea
                      v-model="biography"
                      placeholder="Tell travelers what makes your tours special..."
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div class="profile-card">
              <div class="card-title-row">
                <div>
                  <h3>Travel Profile Highlights</h3>
                  <p>Select the signals and languages travelers should notice first.</p>
                </div>
                <CheckBadgeIcon class="card-title-icon" />
              </div>
              <div class="highlight-language-grid">
                <div>
                  <h4>Highlights</h4>
                  <div class="chip-grid">
                    <button
                      v-for="highlight in highlightOptions"
                      :key="highlight"
                      type="button"
                      class="select-chip"
                      :class="{ active: selectedHighlights.includes(highlight) }"
                      @click="toggleHighlight(highlight)"
                    >
                      {{ highlight }}
                    </button>
                  </div>
                </div>
                <div>
                  <h4>Languages</h4>
                  <div class="language-chip-row">
                    <button
                      v-for="language in languageOptions"
                      :key="language"
                      type="button"
                      class="select-chip compact"
                      :class="{ active: selectedLanguages.includes(language) }"
                      @click="toggleLanguage(language)"
                    >
                      {{ language }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="profile-card">
              <div class="card-title-row">
                <div>
                  <h3>Location & Public Links</h3>
                  <p>Help travelers find, contact, and trust your business.</p>
                </div>
                <MapPinIcon class="card-title-icon" />
              </div>
              <div class="location-social-grid">
                <div class="profile-form-grid">
                  <div class="profile-field">
                    <label>City / Province</label>
                    <input v-model="cityProvince" type="text" placeholder="Siem Reap" />
                  </div>
                  <div class="profile-field">
                    <label>Google Maps Link</label>
                    <input v-model="googleMapsLink" type="url" placeholder="https://maps.google.com/..." />
                  </div>
                  <div class="profile-field full">
                    <label>Business Address</label>
                    <input v-model="businessAddress" type="text" placeholder="Street, commune, district" />
                  </div>
                </div>

                <div class="profile-form-grid">
                  <div class="profile-field">
                    <label>Public Email</label>
                    <input v-model="officialEmail" type="email" placeholder="hello@anajaktour.com" />
                  </div>
                  <div class="profile-field">
                    <label>Phone Number</label>
                    <input v-model="phoneNumber" type="tel" placeholder="+855 12 345 678" />
                  </div>
                  <div class="profile-field">
                    <label>Facebook Page</label>
                    <input v-model="facebookUrl" type="text" placeholder="fb.com/yourbrand" />
                  </div>
                  <div class="profile-field">
                    <label>Telegram Handle</label>
                    <input v-model="telegramHandle" type="text" placeholder="@brand_support" />
                  </div>
                  <div class="profile-field">
                    <label>Website</label>
                    <input v-model="websiteUrl" type="url" placeholder="https://yourbrand.com" />
                  </div>
                  <div class="profile-field">
                    <label>Instagram</label>
                    <input v-model="instagramHandle" type="text" placeholder="@yourbrand" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside class="verification-preview-card">
            <div class="preview-cover" :style="coverPreview ? { backgroundImage: `url(${coverPreview})` } : undefined"></div>
            <div class="preview-body">
              <div class="preview-logo">
                <img v-if="logoPreview" :src="logoPreview" :alt="companyName || 'Business logo'" />
                <BuildingStorefrontIcon v-else />
              </div>
              <div class="verified-badge">
                <CheckBadgeIcon />
                Verified Provider
              </div>
              <h3>{{ companyName || "Your Business Name" }}</h3>
              <p class="preview-tagline">{{ tagline || "Premium Cambodia travel experiences" }}</p>
              <p class="preview-location">
                <MapPinIcon />
                {{ cityProvince || "City / Province" }}
              </p>
              <p v-if="businessAddress" class="preview-address">{{ businessAddress }}</p>
              <p v-if="biography" class="preview-bio">{{ biography }}</p>
              <div class="preview-tags">
                <span v-for="highlight in previewHighlights" :key="highlight">{{ highlight }}</span>
              </div>
              <div class="preview-languages">
                <span v-for="language in previewLanguages" :key="language">{{ language }}</span>
              </div>
              <div class="preview-contact-actions">
                <a :href="facebookHref" target="_blank" rel="noreferrer">
                  <UserGroupIcon />
                  Facebook
                </a>
                <a :href="telegramHref" target="_blank" rel="noreferrer">
                  <ChatBubbleLeftRightIcon />
                  Telegram
                </a>
                <a :href="websiteHref" target="_blank" rel="noreferrer">
                  <GlobeAltIcon />
                  Website
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <!-- Contact Details Section -->
      <section class="settings-section">
        <div class="section-icon"><EnvelopeIcon /></div>
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

        <p class="admin-note"><InformationCircleIcon /> These details are for administrative communication only.</p>
      </section>

      <!-- Payout Settings Section -->
      <section class="settings-section payout-section">
        <div class="section-icon"><BanknotesIcon /></div>
        <div class="section-header">
          <h2>Payout Settings</h2>
        </div>

        <div class="payout-card">
          <div class="payout-field">
            <label>BANK ACCOUNT NUMBER</label>
            <div class="account-display">
              <input v-model="bankAccountMasked" class="payout-input" placeholder="e.g. 000 123 456" />
              <button class="copy-btn" type="button" aria-label="Copy bank account" @click.prevent="copyBankAccount">
                <ClipboardDocumentIcon />
              </button>
            </div>
          </div>

          <div class="payout-field">
            <label>BANK NAME</label>
            <div class="account-display">
              <input ref="bankNameInput" v-model="bankName" class="payout-input" placeholder="e.g. ABA Bank" />
              <button class="edit-btn" type="button" aria-label="Edit bank name" @click.prevent="focusBankName">
                <PencilSquareIcon />
              </button>
            </div>
          </div>

          <button class="btn-secure-update" @click="saveChanges">Secure Update</button>
        </div>
      </section>

      <!-- Policy Manager Section -->
      <section class="settings-section">
        <div class="section-icon"><DocumentTextIcon /></div>
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
          <span class="warning-icon"><ExclamationTriangleIcon /></span>
          <p>Legal Compliance: Changes to policies will only apply to new bookings created after the save date.</p>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="settings-footer">
      <div class="footer-left">
        <button class="btn-text" type="button" @click="router.push({ name: 'provider-service' })">
          <PlusIcon />
          New Booking
        </button>
        <button class="btn-text" type="button" @click="showSupport">
          <QuestionMarkCircleIcon />
          Support
        </button>
        <button @click="handleLogout" class="btn-text">
          <ArrowRightOnRectangleIcon />
          Logout
        </button>
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
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  ArrowRightOnRectangleIcon,
  BanknotesIcon,
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhotoIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/outline";
import { clearAuthData } from "../../utils/auth";
import { getProviderProfile, updateProviderProfile } from "../../services/api";

defineProps<{
  searchQuery?: string;
}>();

type ProfileSnapshot = {
  companyName: string;
  tagline: string;
  biography: string;
  officialEmail: string;
  phoneNumber: string;
  facebookUrl: string;
  telegramHandle: string;
  websiteUrl: string;
  instagramHandle: string;
  cityProvince: string;
  businessAddress: string;
  googleMapsLink: string;
  bankAccountMasked: string;
  bankName: string;
  refundRules: string;
  guestRequirements: string;
  logoPreview: string;
  logoFileName: string;
  coverPreview: string;
  coverFileName: string;
  selectedHighlights: string[];
  selectedLanguages: string[];
};

const router = useRouter();
const companyName = ref("");
const tagline = ref("");
const biography = ref("");
const facebookUrl = ref("fb.com/yourbrand");
const telegramHandle = ref("@brand_support");
const websiteUrl = ref("");
const instagramHandle = ref("");
const cityProvince = ref("");
const businessAddress = ref("");
const googleMapsLink = ref("");
const officialEmail = ref("");
const phoneNumber = ref("");
const bankAccountMasked = ref("801 234 567");
const bankName = ref("TREASURE_CORP@ABA");
const refundRules = ref("");
const guestRequirements = ref("");
const logoFileName = ref("");
const logoPreview = ref("");
const coverFileName = ref("");
const coverPreview = ref("");
const highlightOptions = [
  "Licensed Tour Operator",
  "Local Expert Guides",
  "Private Tours Available",
  "Airport Pickup",
  "24/7 Traveler Support",
  "Family Friendly",
];
const languageOptions = ["Khmer", "English", "Chinese", "French"];
const selectedHighlights = ref<string[]>(["Licensed Tour Operator", "Local Expert Guides"]);
const selectedLanguages = ref<string[]>(["Khmer", "English"]);

const logoInput = ref<HTMLInputElement | null>(null);
const coverInput = ref<HTMLInputElement | null>(null);
const bankNameInput = ref<HTMLInputElement | null>(null);
let lastSavedProfile: ProfileSnapshot | null = null;

const previewHighlights = computed(() => {
  return selectedHighlights.value.length
    ? selectedHighlights.value.slice(0, 4)
    : ["Licensed Tour Operator", "Local Expert Guides"];
});
const previewLanguages = computed(() => {
  return selectedLanguages.value.length ? selectedLanguages.value : ["Khmer", "English"];
});
const facebookHref = computed(() => normalizeExternalLink(facebookUrl.value, "https://facebook.com/"));
const telegramHref = computed(() => {
  const value = telegramHandle.value.trim();
  if (!value) return "#";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://t.me/${value.replace(/^@/, "")}`;
});
const websiteHref = computed(() => normalizeExternalLink(websiteUrl.value, "https://"));

onMounted(loadProfile);

async function loadProfile() {
  try {
    const res = await getProviderProfile();
    const data = res.data || res; // Handle different response shapes
    applyProfile({
      companyName: data.companyName || "",
      tagline: data.tagline || "Curated tours with trusted local experts",
      biography: data.description || "",
      officialEmail: data.user?.email || "",
      phoneNumber: data.user?.phoneNumber || "",
      facebookUrl: data.facebookUrl || "fb.com/yourbrand",
      telegramHandle: data.telegramUrl || "@brand_support",
      websiteUrl: data.websiteUrl || "",
      instagramHandle: data.instagramHandle || "",
      cityProvince: data.cityProvince || "Siem Reap",
      businessAddress: data.businessAddress || "",
      googleMapsLink: data.googleMapsLink || "",
      bankAccountMasked: data.bankAccountNumber || "Not set",
      bankName: data.bankName || "Not set",
      refundRules: data.refundPolicy || "",
      guestRequirements: data.guestRequirements || "",
      logoPreview: data.logo || "",
      logoFileName: "",
      coverPreview: data.coverImage || "",
      coverFileName: "",
      selectedHighlights: Array.isArray(data.highlights) ? data.highlights : ["Licensed Tour Operator", "Local Expert Guides"],
      selectedLanguages: Array.isArray(data.languages) ? data.languages : ["Khmer", "English"],
    });
    lastSavedProfile = currentProfileSnapshot();
  } catch (err) {
    console.error("Failed to fetch provider profile", err);
  }
}

function currentProfileSnapshot() {
  return {
    companyName: companyName.value,
    tagline: tagline.value,
    biography: biography.value,
    officialEmail: officialEmail.value,
    phoneNumber: phoneNumber.value,
    facebookUrl: facebookUrl.value,
    telegramHandle: telegramHandle.value,
    websiteUrl: websiteUrl.value,
    instagramHandle: instagramHandle.value,
    cityProvince: cityProvince.value,
    businessAddress: businessAddress.value,
    googleMapsLink: googleMapsLink.value,
    bankAccountMasked: bankAccountMasked.value,
    bankName: bankName.value,
    refundRules: refundRules.value,
    guestRequirements: guestRequirements.value,
    logoPreview: logoPreview.value,
    logoFileName: logoFileName.value,
    coverPreview: coverPreview.value,
    coverFileName: coverFileName.value,
    selectedHighlights: [...selectedHighlights.value],
    selectedLanguages: [...selectedLanguages.value],
  };
}

function applyProfile(profile: ProfileSnapshot) {
  companyName.value = profile.companyName;
  tagline.value = profile.tagline;
  biography.value = profile.biography;
  officialEmail.value = profile.officialEmail;
  phoneNumber.value = profile.phoneNumber;
  facebookUrl.value = profile.facebookUrl;
  telegramHandle.value = profile.telegramHandle;
  websiteUrl.value = profile.websiteUrl;
  instagramHandle.value = profile.instagramHandle;
  cityProvince.value = profile.cityProvince;
  businessAddress.value = profile.businessAddress;
  googleMapsLink.value = profile.googleMapsLink;
  bankAccountMasked.value = profile.bankAccountMasked;
  bankName.value = profile.bankName;
  refundRules.value = profile.refundRules;
  guestRequirements.value = profile.guestRequirements;
  logoPreview.value = profile.logoPreview;
  logoFileName.value = profile.logoFileName;
  coverPreview.value = profile.coverPreview;
  coverFileName.value = profile.coverFileName;
  selectedHighlights.value = [...profile.selectedHighlights];
  selectedLanguages.value = [...profile.selectedLanguages];
}

function handleLogout() {
  if (confirm("Are you sure you want to log out?")) {
    clearAuthData();
    window.location.href = "/customer/homepage";
  }
}

function triggerLogoUpload() {
  logoInput.value?.click();
}

function triggerCoverUpload() {
  coverInput.value?.click();
}

function readImageFile(file: File, onLoad: (src: string) => void) {
  const reader = new FileReader();
  reader.onload = (e) => {
    onLoad(e.target?.result as string);
  };
  reader.readAsDataURL(file);
}

function handleLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo file must be smaller than 2MB.");
      target.value = "";
      return;
    }
    logoFileName.value = file.name;
    readImageFile(file, (src) => {
      logoPreview.value = src;
    });
  }
}

function handleCoverUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    coverFileName.value = file.name;
    readImageFile(file, (src) => {
      coverPreview.value = src;
    });
  }
}

function toggleHighlight(highlight: string) {
  selectedHighlights.value = selectedHighlights.value.includes(highlight)
    ? selectedHighlights.value.filter((item) => item !== highlight)
    : [...selectedHighlights.value, highlight];
}

function toggleLanguage(language: string) {
  selectedLanguages.value = selectedLanguages.value.includes(language)
    ? selectedLanguages.value.filter((item) => item !== language)
    : [...selectedLanguages.value, language];
}

function normalizeExternalLink(value: string, fallbackPrefix: string) {
  const trimmed = value.trim();
  if (!trimmed) return "#";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.includes(".")) return `https://${trimmed}`;
  return `${fallbackPrefix}${trimmed.replace(/^\/+/, "")}`;
}

async function saveChanges() {
  try {
    await updateProviderProfile({
      companyName: companyName.value,
      tagline: tagline.value,
      description: biography.value,
      email: officialEmail.value,
      phoneNumber: phoneNumber.value,
      facebookUrl: facebookUrl.value,
      telegramUrl: telegramHandle.value,
      websiteUrl: websiteUrl.value,
      instagramHandle: instagramHandle.value,
      cityProvince: cityProvince.value,
      businessAddress: businessAddress.value,
      googleMapsLink: googleMapsLink.value,
      highlights: selectedHighlights.value,
      languages: selectedLanguages.value,
      coverImage: coverPreview.value,
      logo: logoPreview.value,
      bankAccountNumber: bankAccountMasked.value,
      bankName: bankName.value,
      refundPolicy: refundRules.value,
      guestRequirements: guestRequirements.value,
    });
    lastSavedProfile = currentProfileSnapshot();
    alert("Settings saved successfully!");
  } catch (err) {
    console.error("Failed to save changes", err);
    alert("Error saving settings.");
  }
}

function discardChanges() {
  if (lastSavedProfile) {
    applyProfile(lastSavedProfile);
  }
  alert("Changes discarded.");
}

async function copyBankAccount() {
  try {
    await navigator.clipboard.writeText(bankAccountMasked.value);
    alert("Bank account copied.");
  } catch {
    alert(`Bank account: ${bankAccountMasked.value}`);
  }
}

function focusBankName() {
  bankNameInput.value?.focus();
  bankNameInput.value?.select();
}

function showSupport() {
  alert("Support: hello@anajaktour.kh");
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
  background: linear-gradient(135deg, #148a74, #efb34f);
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

.public-profile-section {
  margin-bottom: 20px;
  --profile-primary: #148a74;
  --profile-primary-hover: #117864;
  --profile-primary-soft: #e8f5f0;
  --profile-primary-border: #cfe9e3;
  --profile-accent: #efb34f;
  --profile-text: #111827;
  --profile-muted: #667085;
  --profile-subtle: #98a2b3;
  --profile-border: #e5e7eb;
  --profile-bg: #f5f5f5;
  --profile-surface-soft: #f9fafb;
}

.public-profile-section,
.public-profile-section * {
  box-sizing: border-box;
}

.profile-section-header {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.profile-section-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  color: var(--profile-primary);
  background: var(--profile-primary-soft);
  border: 1px solid var(--profile-primary-border);
  border-radius: 16px;
}

.profile-section-icon svg,
.card-title-icon,
.cover-empty svg,
.brand-logo-preview svg,
.preview-logo svg,
.verified-badge svg,
.preview-location svg,
.preview-contact-actions svg {
  width: 22px;
  height: 22px;
}

.profile-kicker {
  margin: 0 0 4px;
  color: var(--profile-primary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.profile-section-header h2 {
  margin: 0;
  color: var(--profile-text);
  font-size: 24px;
  font-weight: 800;
}

.profile-section-header p {
  margin: 6px 0 0;
  color: var(--profile-muted);
  font-size: 13px;
  line-height: 1.45;
}

.profile-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 360px);
  gap: 20px;
  align-items: start;
}

.profile-editor {
  display: grid;
  gap: 16px;
  min-width: 0;
}

.profile-card,
.verification-preview-card {
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.profile-card {
  padding: 18px;
  min-width: 0;
}

.media-info-grid {
  display: grid;
  grid-template-columns: minmax(250px, 0.85fr) minmax(0, 1.15fr);
  gap: 18px;
  align-items: start;
  min-width: 0;
}

.media-column {
  display: grid;
  gap: 14px;
  min-width: 0;
}

.basic-info-grid {
  align-content: start;
  min-width: 0;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.card-title-row h3 {
  margin: 0;
  color: var(--profile-text);
  font-size: 16px;
  font-weight: 800;
}

.card-title-row p {
  margin: 5px 0 0;
  color: var(--profile-muted);
  font-size: 12px;
  line-height: 1.45;
}

.card-title-icon {
  flex: 0 0 auto;
  color: var(--profile-primary);
}

.cover-uploader {
  display: grid;
  gap: 14px;
  min-width: 0;
}

.cover-preview {
  min-height: 146px;
  border: 1px dashed #d1d5db;
  border-radius: 16px;
  background-color: var(--profile-surface-soft);
  background-position: center;
  background-size: cover;
  overflow: hidden;
}

.cover-empty {
  height: 100%;
  min-height: 146px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  color: var(--profile-muted);
  font-size: 13px;
  font-weight: 700;
}

.cover-empty svg {
  color: var(--profile-primary);
}

.upload-row,
.logo-uploader {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14px;
  align-items: center;
  min-width: 0;
}

.logo-uploader {
  grid-template-columns: 64px 1fr auto;
  margin-top: 0;
  padding: 12px;
  background: var(--profile-surface-soft);
  border: 1px solid var(--profile-border);
  border-radius: 16px;
}

.highlight-language-grid,
.location-social-grid {
  display: grid;
  gap: 18px;
  min-width: 0;
}

.highlight-language-grid {
  grid-template-columns: minmax(0, 1.15fr) minmax(220px, 0.85fr);
}

.highlight-language-grid h4 {
  margin: 0 0 10px;
  color: var(--profile-text);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.location-social-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.location-social-grid .profile-form-grid {
  align-content: start;
}

.location-social-grid .profile-form-grid + .profile-form-grid {
  padding-left: 18px;
  border-left: 1px solid #eef0f2;
}

.brand-logo-preview {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  overflow: hidden;
  color: var(--profile-primary);
  background: var(--profile-surface-soft);
  border: 1px solid var(--profile-border);
  border-radius: 16px;
}

.brand-logo-preview img,
.preview-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-row label,
.logo-upload-copy label,
.profile-field label {
  display: block;
  color: var(--profile-text);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.upload-row p,
.logo-upload-copy p {
  margin: 5px 0 0;
  color: var(--profile-muted);
  font-size: 12px;
}

.profile-upload-btn {
  min-height: 42px;
  padding: 0 16px;
  color: #fff;
  background: var(--profile-primary);
  border: 0;
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.profile-upload-btn:hover {
  background: var(--profile-primary-hover);
}

.hidden-file-input {
  display: none;
}

.profile-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  min-width: 0;
}

.profile-field {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.profile-field.full {
  grid-column: 1 / -1;
}

.profile-field input,
.profile-field textarea {
  width: 100%;
  border: 1px solid var(--profile-border);
  border-radius: 12px;
  background: #fff;
  color: var(--profile-text);
  font-family: inherit;
  font-size: 14px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.profile-field input {
  height: 46px;
  padding: 0 14px;
}

.profile-field textarea {
  min-height: 112px;
  max-height: 150px;
  padding: 12px 14px;
  resize: vertical;
}

.profile-field input::placeholder,
.profile-field textarea::placeholder {
  color: var(--profile-subtle);
}

.profile-field input:focus,
.profile-field textarea:focus {
  outline: none;
  border-color: var(--profile-primary);
  box-shadow: 0 0 0 4px rgba(20, 138, 116, 0.12);
  background: #fbfffc;
}

.chip-grid,
.language-chip-row,
.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.select-chip {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--profile-border);
  border-radius: 999px;
  background: #fff;
  color: var(--profile-text);
  cursor: pointer;
  font-size: 13px;
  font-weight: 750;
}

.select-chip.compact {
  min-height: 36px;
}

.select-chip.active {
  border-color: var(--profile-primary);
  background: var(--profile-primary);
  color: #fff;
  box-shadow: 0 8px 18px rgba(20, 138, 116, 0.18);
}

.verification-preview-card {
  position: sticky;
  top: 12px;
  overflow: hidden;
}

.preview-cover {
  height: 150px;
  background: linear-gradient(135deg, rgba(20, 138, 116, 0.18), rgba(239, 179, 79, 0.16));
  background-position: center;
  background-size: cover;
}

.preview-body {
  padding: 0 18px 18px;
}

.preview-logo {
  width: 78px;
  height: 78px;
  display: grid;
  place-items: center;
  margin-top: -39px;
  overflow: hidden;
  color: var(--profile-primary);
  background: #fff;
  border: 4px solid #fff;
  border-radius: 16px;
  box-shadow: 0 10px 22px rgba(11, 43, 76, 0.12);
}

.verified-badge {
  width: fit-content;
  display: flex;
  gap: 6px;
  align-items: center;
  margin: 14px 0 12px;
  padding: 6px 10px;
  color: var(--profile-primary);
  background: var(--profile-primary-soft);
  border: 1px solid var(--profile-primary-border);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.verified-badge svg,
.preview-location svg {
  color: var(--profile-primary);
}

.preview-body h3 {
  margin: 0;
  color: var(--profile-text);
  font-size: 20px;
  font-weight: 800;
}

.preview-tagline {
  margin: 6px 0 12px;
  color: var(--profile-muted);
  font-size: 13px;
  line-height: 1.4;
}

.preview-location {
  display: flex;
  gap: 7px;
  align-items: center;
  margin: 0 0 8px;
  color: var(--profile-text);
  font-size: 13px;
  font-weight: 700;
}

.preview-location svg {
  width: 18px;
  height: 18px;
}

.preview-address,
.preview-bio {
  margin: 0 0 12px;
  color: var(--profile-muted);
  font-size: 12px;
  line-height: 1.45;
}

.preview-bio {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.preview-tags,
.preview-languages {
  margin-top: 12px;
}

.preview-tags span {
  padding: 6px 9px;
  color: var(--profile-primary);
  background: var(--profile-primary-soft);
  border: 1px solid var(--profile-primary-border);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.preview-languages {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-languages span {
  padding: 5px 8px;
  color: #475467;
  background: #f2f4f7;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.preview-contact-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 16px;
}

.preview-contact-actions a {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 8px;
  color: var(--profile-primary);
  background: #fff;
  border: 1px solid var(--profile-primary-border);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  text-decoration: none;
}

.preview-contact-actions svg {
  width: 15px;
  height: 15px;
}

.settings-section {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
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
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  color: var(--profile-primary, #148a74);
  background: var(--profile-primary-soft, #e8f5f0);
  border-radius: 12px;
}

.section-icon svg {
  width: 21px;
  height: 21px;
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
  color: #148a74;
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
  border-color: #148a74;
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
  color: #148a74;
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
  border-radius: 16px;
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
  background: #148a74;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.upload-btn:hover {
  background: #117864;
}

.checkmark {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  background: #148a74;
  color: white;
  border-radius: 50%;
  font-size: 16px;
  font-weight: bold;
}

.admin-note {
  grid-column: 1 / -1;
  margin: 8px 0 0 0;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f9f9f9;
  border-left: 2px solid #148a74;
  font-size: 12px;
  color: #666;
}

.admin-note svg {
  width: 16px;
  height: 16px;
  color: #148a74;
  flex: 0 0 auto;
}

.payout-card {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #148a74, #117864);
  color: white;
  border-radius: 16px;
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

.payout-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 4px 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  width: 100%;
}

.payout-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.payout-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
}

.copy-btn,
.edit-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 4px 8px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 12px;
}

.copy-btn svg,
.edit-btn svg {
  width: 16px;
  height: 16px;
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
  border-radius: 12px;
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
  border-color: #148a74;
  background: #f9fffe;
}

.compliance-warning {
  grid-column: 1 / -1;
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #fff4e6;
  border-radius: 16px;
  border-left: 4px solid #ffa500;
  align-items: flex-start;
}

.warning-icon {
  flex: 0 0 24px;
  display: grid;
  place-items: center;
}

.warning-icon svg {
  width: 20px;
  height: 20px;
  color: #ffa500;
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
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #148a74;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
}

.btn-text svg {
  width: 16px;
  height: 16px;
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
  background: #148a74;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.btn-primary:hover {
  background: #117864;
}

@media (max-width: 1180px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .verification-preview-card {
    position: static;
  }
}

@media (max-width: 1320px) {
  .media-info-grid,
  .location-social-grid {
    grid-template-columns: 1fr;
  }

  .location-social-grid .profile-form-grid + .profile-form-grid {
    padding-left: 0;
    padding-top: 16px;
    border-left: 0;
    border-top: 1px solid #eef0f2;
  }
}

@media (max-width: 768px) {
  .settings-content {
    padding: 18px;
  }

  .profile-section-header {
    align-items: center;
  }

  .profile-section-header h2 {
    font-size: 21px;
  }

  .profile-card {
    padding: 16px;
  }

  .media-info-grid,
  .highlight-language-grid,
  .location-social-grid,
  .profile-form-grid,
  .upload-row,
  .logo-uploader {
    grid-template-columns: 1fr;
  }

  .location-social-grid .profile-form-grid + .profile-form-grid {
    padding-left: 0;
    padding-top: 16px;
    border-left: 0;
    border-top: 1px solid #eef0f2;
  }

  .profile-upload-btn {
    width: 100%;
  }

  .cover-preview,
  .cover-empty {
    min-height: 150px;
  }

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

  .footer-left,
  .footer-right {
    align-items: stretch;
  }
}
</style>
