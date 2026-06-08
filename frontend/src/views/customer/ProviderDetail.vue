<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import CustomerNavbar from "../../components/customer/CustomerNavbar.vue";
import CustomerFooter from "../../components/customer/CustomerFooter.vue";

const route = useRoute();
const router = useRouter();

const providerId = route.params.id;

console.log("Provider ID:", providerId);

const provider = {
  id: providerId,
  name: "Angkor Adventure Travel",
  location: "Siem Reap, Cambodia",
  rating: 4.8,
  totalReviews: 124,
  coverImage:
    "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1600&auto=format&fit=crop",
  logo: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=300&auto=format&fit=crop",
  description:
    "Angkor Adventure Travel is a trusted local tour provider based in Siem Reap. We provide private tours, cultural trips, and adventure experiences around Cambodia.",
  email: "contact@angkoradventure.com",
  phone: "+855 12 345 678",
  experience: "5 years",
  languages: "Khmer, English",
  openingHours: "8:00 AM - 6:00 PM",
};

const services = [
  {
    id: 1,
    name: "Angkor Wat Sunrise Tour",
    description:
      "Explore Angkor Wat during sunrise with a professional local guide.",
    location: "Siem Reap",
    duration: "1 Day",
    price: 25,
    image:
      "https://images.unsplash.com/photo-1599283787923-51b965a58b05?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Kulen Mountain Trip",
    description:
      "Visit Phnom Kulen waterfall, ancient temples, and beautiful nature.",
    location: "Siem Reap",
    duration: "Full Day",
    price: 45,
    image:
      "https://images.unsplash.com/photo-1605649461784-edc6107647c3?q=80&w=900&auto=format&fit=crop",
  },
];

const reviews = [
  {
    id: 1,
    name: "Sokha",
    rating: 5,
    date: "May 2026",
    comment:
      "Amazing tour experience. The guide was friendly and explained the history very clearly.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Dara",
    rating: 4.5,
    date: "April 2026",
    comment:
      "Good service, comfortable transportation, and beautiful places. Highly recommended.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
  },
];

const bookService = (serviceId: number) => {
  router.push({
    name: "booking-form",
    params: { id: serviceId },
  });
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <CustomerNavbar />

    <!-- Cover -->
    <section class="relative h-[360px] overflow-hidden">
      <img
        :src="provider.coverImage"
        alt="Provider Cover"
        class="h-full w-full object-cover"
      />

      <div class="absolute inset-0 bg-black/50"></div>

      <div class="absolute inset-x-0 bottom-0">
        <div class="max-w-7xl mx-auto px-6 pb-8">
          <button
            @click="router.back()"
            class="mb-6 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/30"
          >
            ← Back
          </button>

          <div class="flex flex-col gap-5 md:flex-row md:items-end">
            <img
              :src="provider.logo"
              alt="Provider Logo"
              class="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
            />

            <div class="text-white">
              <div class="mb-2 flex flex-wrap items-center gap-3">
                <h1 class="text-3xl md:text-4xl font-bold">
                  {{ provider.name }}
                </h1>

                <span
                  class="rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold"
                >
                  Verified Provider
                </span>
              </div>

              <p class="text-white/90">📍 {{ provider.location }}</p>

              <p class="mt-2 text-white/90">
                ⭐ {{ provider.rating }} / 5
                <span class="text-white/70">
                  ({{ provider.totalReviews }} reviews)
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main
      class="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <!-- Left -->
      <div class="lg:col-span-2 space-y-8">
        <!-- About -->
        <section
          class="rounded-3xl bg-white p-7 shadow-sm border border-gray-100"
        >
          <h2 class="text-2xl font-bold text-gray-900">About Provider</h2>

          <p class="mt-4 leading-relaxed text-gray-600">
            {{ provider.description }}
          </p>
        </section>

        <!-- Services -->
        <section
          class="rounded-3xl bg-white p-7 shadow-sm border border-gray-100"
        >
          <div class="mb-6 flex items-center justify-between">
            <div>
              <p
                class="text-sm font-semibold uppercase tracking-wide text-emerald-600"
              >
                Services
              </p>

              <h2 class="mt-1 text-2xl font-bold text-gray-900">
                Services Offered
              </h2>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="service in services"
              :key="service.id"
              class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <img
                :src="service.image"
                :alt="service.name"
                class="h-44 w-full object-cover"
              />

              <div class="p-5">
                <h3 class="text-lg font-bold text-gray-900">
                  {{ service.name }}
                </h3>

                <p class="mt-2 text-sm leading-relaxed text-gray-600">
                  {{ service.description }}
                </p>

                <div class="mt-4 space-y-1 text-sm text-gray-600">
                  <p>📍 {{ service.location }}</p>
                  <p>⏱ {{ service.duration }}</p>
                </div>

                <div class="mt-5 flex items-center justify-between">
                  <p class="text-xl font-bold text-emerald-600">
                    ${{ service.price }}
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
        </section>

        <!-- Reviews -->
        <section
          class="rounded-3xl bg-white p-7 shadow-sm border border-gray-100"
        >
          <div class="mb-6 flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">Customer Reviews</h2>

            <p class="font-semibold text-gray-700">
              ⭐ {{ provider.rating }}/5
            </p>
          </div>

          <div class="space-y-6">
            <div
              v-for="review in reviews"
              :key="review.id"
              class="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0"
            >
              <div class="flex items-center gap-4">
                <img
                  :src="review.avatar"
                  :alt="review.name"
                  class="h-12 w-12 rounded-full object-cover"
                />

                <div>
                  <h4 class="font-semibold text-gray-900">
                    {{ review.name }}
                  </h4>

                  <p class="text-sm text-gray-500">
                    ⭐ {{ review.rating }} · {{ review.date }}
                  </p>
                </div>
              </div>

              <p class="mt-4 leading-relaxed text-gray-600">
                {{ review.comment }}
              </p>
            </div>
          </div>
        </section>
      </div>

      <!-- Right Sidebar -->
      <aside class="space-y-6">
        <!-- Provider Info -->
        <section
          class="rounded-3xl bg-white p-7 shadow-sm border border-gray-100"
        >
          <h2 class="text-xl font-bold text-gray-900">Provider Information</h2>

          <div class="mt-5 space-y-4 text-sm text-gray-700">
            <p>
              <span class="font-semibold">Business:</span>
              {{ provider.name }}
            </p>

            <p>
              <span class="font-semibold">Email:</span>
              {{ provider.email }}
            </p>

            <p>
              <span class="font-semibold">Phone:</span>
              {{ provider.phone }}
            </p>

            <p>
              <span class="font-semibold">Experience:</span>
              {{ provider.experience }}
            </p>

            <p>
              <span class="font-semibold">Languages:</span>
              {{ provider.languages }}
            </p>

            <p>
              <span class="font-semibold">Opening:</span>
              {{ provider.openingHours }}
            </p>
          </div>
        </section>

        <!-- Trust -->
        <section
          class="rounded-3xl bg-white p-7 shadow-sm border border-gray-100"
        >
          <h2 class="text-xl font-bold text-gray-900">
            Why Book With This Provider?
          </h2>

          <ul class="mt-5 space-y-3 text-sm text-gray-700">
            <li>✅ Verified local provider</li>
            <li>✅ Secure booking process</li>
            <li>✅ Friendly tour guides</li>
            <li>✅ Fast customer support</li>
            <li>✅ Good customer reviews</li>
          </ul>
        </section>

        <!-- Contact -->
        <section class="rounded-3xl bg-emerald-600 p-7 text-white shadow-sm">
          <h2 class="text-xl font-bold">Need More Information?</h2>

          <p class="mt-3 text-sm text-white/90 leading-relaxed">
            Contact this provider for more details about their services,
            schedule, and booking availability.
          </p>

          <button
            class="mt-5 w-full rounded-xl bg-white px-4 py-3 font-semibold text-emerald-700 hover:bg-gray-100"
          >
            Contact Provider
          </button>
        </section>
      </aside>
    </main>

    <CustomerFooter />
  </div>
</template>
