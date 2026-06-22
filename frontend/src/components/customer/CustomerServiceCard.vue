<template>
  <div
    class="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700
           hover:shadow-xl dark:hover:shadow-gray-900/50 hover:-translate-y-1 transition-all duration-300 flex flex-col"
  >
    <!-- Image -->
    <div class="relative overflow-hidden h-52">
      <img
        :src="tour.image || 'https://freedomdestinations.co.uk/wp-content/uploads/Angkor-Wat-Cambodia-4.jpg'"
        :alt="tour.title || 'Service Image'"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />


      <!-- Duration badge -->
      <div
        class="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1"
      >
        <span class="text-white text-xs"> 🕐 {{ tour.duration }} </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5 flex flex-col flex-1">
      <!-- Location -->
      <div class="flex items-center gap-1.5 mb-2">
        <span class="text-gold text-xs">🏛</span>
        <span class="text-xs font-semibold text-gold uppercase tracking-wider">
          {{ tour.location }}
        </span>
      </div>

      <!-- Title -->
      <h3 class="font-serif font-bold text-gray-900 dark:text-white text-lg leading-tight mb-2 transition-colors duration-200">
        {{ tour.title }}
      </h3>

      <!-- Description -->
      <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4 flex-1 line-clamp-2 transition-colors duration-200">
        {{ tour.description }}
      </p>

      <!-- Divider -->
      <div class="border-t border-gray-100 dark:border-gray-700 pt-4">
        <!-- Price -->
        <div class="mb-4">
          <span class="text-xs text-gray-400 block">From</span>
          <span class="font-bold text-gray-900 dark:text-white text-xl transition-colors duration-200">${{ (tour.price || 0).toFixed(2) }}</span>
        </div>

        <!-- Buttons -->
        <div class="flex items-center gap-3">
          <!-- Provider Detail Button -->
          <button
            type="button"
            @click.stop="$emit('provider-detail', tour)"
            class="flex-1 px-4 py-2 rounded-lg border border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-500 text-sm font-medium hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-gray-900 transition-all active:scale-[0.97]"
          >
            Provider Detail
          </button>

          <!-- Book Now Button -->
          <button
            type="button"
            @click.stop="$emit('book', tour)"
            class="flex-1 px-4 py-2 rounded-lg border border-dark-green dark:border-emerald-500 text-dark-green dark:text-emerald-500 text-sm font-medium hover:bg-dark-green dark:hover:bg-emerald-500 hover:text-white dark:hover:text-gray-900 transition-all active:scale-[0.97]"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { resolveImageUrl } from '../../utils/api';

export interface Tour {
  id: string | number;
  title: string;
  location: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  duration: string;

  // Add these optional fields for provider detail
  providerId?: number | string;
  provider_id?: number | string;
  provider?: {
    id?: number | string;
    name?: string;
    businessName?: string;
  };
}

const props = defineProps<{ service: any }>();

const tour = computed<Tour>(() => {
  const service = props.service;
  const rawImage = service.coverImage
    || service.images?.find((img: any) => img.isCover)?.imageUrl
    || service.images?.[0]?.imageUrl;
  
  const coverImage = resolveImageUrl(rawImage)
    || 'https://freedomdestinations.co.uk/wp-content/uploads/Angkor-Wat-Cambodia-4.jpg';

  return {
    id: service.id,
    title: service.title,
    location: service.location || 'Cambodia',
    description: service.description || '',
    image: coverImage,
    rating: service.rating || 4.5,
    reviews: Math.floor(Math.random() * 100) + 10,
    price: typeof service.price === 'string' ? parseFloat(service.price) : service.price,
    duration: service.duration || 'Flexible',
    provider: service.provider,
    providerId: service.provider?.id || service.providerId || service.provider_id
  };
});

defineEmits<{
  book: [tour: Tour];
  "provider-detail": [tour: Tour];
}>();
</script>