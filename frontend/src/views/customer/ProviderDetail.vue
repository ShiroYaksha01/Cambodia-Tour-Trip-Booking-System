<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import CustomerNavbar from "../../components/customer/CustomerNavbar.vue";
import CustomerFooter from "../../components/customer/CustomerFooter.vue";
import { getProviderDetail } from "../../services/api";
import { resolveImageUrl } from "../../utils/api";

const route = useRoute();
const router = useRouter();

const providerId = route.params.id as string;
const provider = ref<any>(null);
const services = ref<any[]>([]);
const localReviews = ref<any[]>([]);
const loading = ref(true);
const error = ref("");

const providerRating = computed(() => {
  if (localReviews.value.length === 0) return 0;
  const sum = localReviews.value.reduce((acc, rev) => acc + rev.rating, 0);
  return (sum / localReviews.value.length).toFixed(1);
});

const fetchProviderData = async () => {
  try {
    loading.value = true;
    const response = await getProviderDetail(providerId);
    if (response.data.success) {
      provider.value = response.data.data;
      services.value = response.data.data.services || [];
      
      // Load and filter reviews for THIS provider only
      const stored = localStorage.getItem("customerReviews");
      if (stored) {
        const allReviews = JSON.parse(stored);
        localReviews.value = allReviews.filter((r: any) => r.providerId === providerId);
      }
    }
  } catch (err) {
    console.error("Failed to fetch provider detail:", err);
    error.value = "Failed to load provider information. Please try again later.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchProviderData);

const bookService = (serviceId: string) => {
  router.push({
    name: "booking-form",
    params: { id: serviceId },
  });
};

const contactProvider = () => {
  if (provider.value?.email) {
    const subject = encodeURIComponent(`Inquiry about ${provider.value.name} services`);
    const body = encodeURIComponent(`Hello ${provider.value.name},\n\nI am interested in your services and would like to get more information.\n\nThank you.`);
    window.location.href = `mailto:${provider.value.email}?subject=${subject}&body=${body}`;
  } else {
    alert("Provider contact email not available.");
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <CustomerNavbar />

    <template v-if="loading">
      <div class="flex flex-col items-center justify-center py-20">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
        <p class="mt-4 text-gray-600">Loading provider details...</p>
      </div>
    </template>

    <template v-else-if="error">
      <div class="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 text-center">
        <h2 class="text-xl md:text-2xl font-bold text-gray-900">Oops!</h2>
        <p class="mt-2 text-gray-600">{{ error }}</p>
        <button @click="router.back()" class="mt-6 rounded-xl bg-emerald-600 px-6 py-2 text-white">Go Back</button>
      </div>
    </template>

    <template v-else-if="provider">
      <!-- Cover -->
      <section class="relative h-[280px] md:h-[360px] overflow-hidden">
        <img
          :src="resolveImageUrl(provider.coverImage) || 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1600&auto=format&fit=crop'"
          alt="Provider Cover"
          class="h-full w-full object-cover"
        />

        <div class="absolute inset-0 bg-black/50"></div>

        <div class="absolute inset-x-0 bottom-0">
          <div class="max-w-7xl mx-auto px-4 md:px-6 pb-6 md:pb-8">
            <button
              @click="router.back()"
              class="mb-4 md:mb-6 rounded-xl bg-white/20 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold text-white backdrop-blur hover:bg-white/30"
            >
              ← Back
            </button>

            <div class="flex flex-col gap-3 md:gap-5 md:flex-row md:items-end">
              <img
                :src="resolveImageUrl(provider.logo) || 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=300&auto=format&fit=crop'"
                alt="Provider Logo"
                class="h-20 w-20 md:h-24 md:w-24 rounded-full border-4 border-white object-cover shadow-lg"
              />

              <div class="text-white">
                <div class="mb-2 flex flex-wrap items-center gap-2 md:gap-3">
                  <h1 class="text-2xl md:text-4xl font-bold">
                    {{ provider.name }}
                  </h1>

                  <span
                    v-if="provider.isVerified"
                    class="rounded-full bg-emerald-500 px-2 md:px-3 py-0.5 md:py-1 text-xs md:text-sm font-semibold"
                  >
                    Verified Provider
                  </span>
                </div>

                <p class="text-white/90">📍 {{ provider.location || 'Cambodia' }}</p>

                <p class="mt-2 text-white/90">
                  ⭐ {{ providerRating }} / 5
                  <span class="text-white/70">
                    ({{ localReviews.length }} reviews)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Content -->
      <main
        class="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8"
      >
        <!-- Left -->
        <div class="lg:col-span-2 space-y-8">
          <!-- About -->
          <section
            class="rounded-2xl md:rounded-3xl bg-white p-5 md:p-7 shadow-sm border border-gray-100"
          >
            <h2 class="text-xl md:text-2xl font-bold text-gray-900">About Provider</h2>

            <p v-if="provider.tagline" class="mt-2 text-lg font-medium text-emerald-700">
              "{{ provider.tagline }}"
            </p>

            <p class="mt-4 leading-relaxed text-gray-600">
              {{ provider.description || 'No description provided by this provider yet.' }}
            </p>
          </section>

          <!-- Services -->
          <section
            class="rounded-2xl md:rounded-3xl bg-white p-5 md:p-7 shadow-sm border border-gray-100"
          >
            <div class="mb-4 md:mb-6 flex items-center justify-between">
              <div>
                <p
                  class="text-xs md:text-sm font-semibold uppercase tracking-wide text-emerald-600"
                >
                  Services
                </p>

                <h2 class="mt-1 text-xl md:text-2xl font-bold text-gray-900">
                  Services Offered
                </h2>
              </div>
            </div>

            <div v-if="services.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="service in services"
                :key="service.id"
          class="overflow-hidden rounded-xl md:rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
               >
                <img
                  :src="resolveImageUrl(service.coverImage) || 'https://images.unsplash.com/photo-1599283787923-51b965a58b05?q=80&w=900&auto=format&fit=crop'"
                  :alt="service.title"
                  class="h-40 md:h-44 w-full object-cover"
                />

                <div class="p-5">
                  <h3 class="text-lg font-bold text-gray-900">
                    {{ service.title }}
                  </h3>

                  <p class="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-2">
                    {{ service.description }}
                  </p>

                  <div class="mt-4 space-y-1 text-sm text-gray-600">
                    <p>📍 {{ service.location }}</p>
                    <p>⏱ {{ service.duration || 'Flexible' }}</p>
                  </div>

                  <div class="mt-5 flex items-center justify-between">
                    <p class="text-xl font-bold text-emerald-600">
                      ${{ typeof service.price === 'number' ? service.price.toFixed(2) : service.price }}
                    </p>

                    <button
                      @click="bookService(service.id)"
                      class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-10">
              <p class="text-gray-500">No services currently offered by this provider.</p>
            </div>
          </section>

          <!-- Reviews -->
          <section
            class="rounded-2xl md:rounded-3xl bg-white p-5 md:p-7 shadow-sm border border-gray-100"
          >
            <div class="mb-4 md:mb-6 flex items-center justify-between">
              <h2 class="text-xl md:text-2xl font-bold text-gray-900">Customer Reviews</h2>

              <p class="font-semibold text-gray-700">
                ⭐ {{ providerRating }}/5
              </p>
            </div>

            <div v-if="localReviews.length > 0" class="space-y-6">
              <div
                v-for="review in localReviews"
                :key="review.id"
                class="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0"
              >
                <div class="flex items-center gap-4">
                  <div class="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    {{ review.serviceTitle?.charAt(0) || 'C' }}
                  </div>

                  <div>
                    <h4 class="font-semibold text-gray-900">
                      {{ review.title }}
                    </h4>

                    <p class="text-sm text-gray-500">
                      ⭐ {{ review.rating }} · {{ new Date(review.createdAt).toLocaleDateString() }}
                    </p>
                  </div>
                </div>

                <p class="mt-4 leading-relaxed text-gray-600 italic">
                  "{{ review.message }}"
                </p>
                
                <div class="mt-3 flex gap-2">
                  <span class="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase font-bold">{{ review.serviceTitle }}</span>
                </div>
              </div>
            </div>

            <div v-else class="py-10 text-center">
              <p class="text-gray-500">No reviews yet for this provider.</p>
              <p class="text-sm text-gray-400 mt-2">Book a service and be the first to leave a review!</p>
              
              <button 
                @click="router.push({ name: 'customer-profile', query: { tab: 'reviews' } })"
                class="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-600 px-6 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-50"
              >
                Write a Review
              </button>
            </div>
          </section>
        </div>

        <!-- Right Sidebar -->
        <aside class="space-y-6">
          <!-- Provider Info -->
          <section
            class="rounded-2xl md:rounded-3xl bg-white p-5 md:p-7 shadow-sm border border-gray-100"
          >
            <h2 class="text-lg md:text-xl font-bold text-gray-900">Provider Information</h2>

            <div class="mt-5 space-y-4 text-sm text-gray-700">
              <p>
                <span class="font-semibold">Business:</span>
                {{ provider.name }}
              </p>

              <p v-if="provider.email">
                <span class="font-semibold">Email:</span>
                <a :href="'mailto:' + provider.email" class="text-emerald-600 hover:underline">{{ provider.email }}</a>
              </p>

              <p v-if="provider.phone">
                <span class="font-semibold">Phone:</span>
                {{ provider.phone }}
              </p>

              <p v-if="provider.websiteUrl">
                <span class="font-semibold">Website:</span>
                <a :href="provider.websiteUrl.startsWith('http') ? provider.websiteUrl : 'https://' + provider.websiteUrl" target="_blank" class="text-emerald-600 hover:underline">Visit Website</a>
              </p>

              <p v-if="provider.address">
                <span class="font-semibold">Address:</span>
                {{ provider.address }}
              </p>

              <p v-if="provider.languages && provider.languages.length">
                <span class="font-semibold">Languages:</span>
                {{ provider.languages.join(', ') }}
              </p>
              <p v-else>
                <span class="font-semibold">Languages:</span>
                Khmer, English
              </p>
            </div>
          </section>

          <!-- Trust -->
          <section
            class="rounded-2xl md:rounded-3xl bg-white p-5 md:p-7 shadow-sm border border-gray-100"
          >
            <h2 class="text-lg md:text-xl font-bold text-gray-900">
              Why Book With This Provider?
            </h2>

            <ul v-if="provider.highlights && provider.highlights.length" class="mt-5 space-y-3 text-sm text-gray-700">
              <li v-for="highlight in provider.highlights" :key="highlight">✅ {{ highlight }}</li>
            </ul>
            <ul v-else class="mt-5 space-y-3 text-sm text-gray-700">
              <li>✅ Verified local provider</li>
              <li>✅ Secure booking process</li>
              <li>✅ Friendly tour guides</li>
              <li>✅ Fast customer support</li>
              <li>✅ Good customer reviews</li>
            </ul>
          </section>

          <!-- Contact -->
          <section class="rounded-2xl md:rounded-3xl bg-emerald-600 p-5 md:p-7 text-white shadow-sm">
            <h2 class="text-lg md:text-xl font-bold">Need More Information?</h2>

            <p class="mt-3 text-sm text-white/90 leading-relaxed">
              Contact this provider for more details about their services,
              schedule, and booking availability.
            </p>

            <button
              @click="contactProvider"
              class="mt-5 w-full rounded-xl bg-white px-4 py-3 font-semibold text-emerald-700 hover:bg-gray-100"
            >
              Contact Provider
            </button>
          </section>
        </aside>
      </main>
    </template>

    <CustomerFooter />
  </div>
</template>

<style scoped>
@media (max-width: 480px) {
  .p-5 {
    padding: 1rem;
  }

  .space-y-8 > :not([hidden]) ~ :not([hidden]) {
    --tw-space-y-reverse: 0;
    margin-top: calc(1.25rem * calc(1 - var(--tw-space-y-reverse)));
    margin-bottom: calc(1.25rem * var(--tw-space-y-reverse));
  }
}
</style>
