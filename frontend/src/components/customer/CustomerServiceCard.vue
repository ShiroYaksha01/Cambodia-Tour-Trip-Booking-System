<template>
  <div
    class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100
           hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
  >
    <!-- Image -->
    <div class="relative overflow-hidden h-52">
      <img
        :src="tour.image"
        :alt="tour.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <!-- Rating badge -->
      <div class="absolute top-3 right-3 flex items-center gap-1
                  bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm">
        <span class="text-gold text-xs">★</span>
        <span class="text-xs font-semibold text-gray-800">{{ tour.rating }}</span>
        <span class="text-xs text-gray-400">({{ tour.reviews }} reviews)</span>
      </div>
      <!-- Duration badge -->
      <div class="absolute bottom-3 left-3 flex items-center gap-1
                  bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
        <span class="text-white text-xs">🕐 {{ tour.duration }}</span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5 flex flex-col flex-1">

      <!-- Location -->
      <div class="flex items-center gap-1.5 mb-2">
        <span class="text-gold text-xs">🏛</span>
        <span class="text-xs font-semibold text-gold uppercase tracking-wider">{{ tour.location }}</span>
      </div>

      <!-- Title -->
      <h3 class="font-serif font-bold text-gray-900 text-lg leading-tight mb-2">
        {{ tour.title }}
      </h3>

      <!-- Description -->
      <p class="text-gray-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">
        {{ tour.description }}
      </p>

      <!-- Divider -->
      <div class="border-t border-gray-100 pt-4 flex items-center justify-between">
        <!-- Price -->
        <div>
          <span class="text-xs text-gray-400 block">From</span>
          <span class="font-bold text-gray-900 text-xl">${{ tour.price.toFixed(2) }}</span>
        </div>
        <!-- CTA -->
        <button
          @click.stop="$emit('book', tour)"
          class="px-5 py-2 rounded-lg border border-dark-green text-dark-green text-sm font-medium
                 hover:bg-dark-green hover:text-white transition-all active:scale-[0.97]"
        >
          Book Now
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
export interface Tour {
  id: number
  title: string
  location: string
  description: string
  image: string
  rating: number
  reviews: number
  price: number
  duration: string
}

defineProps<{ tour: Tour }>()
defineEmits<{ book: [tour: Tour] }>()
</script>