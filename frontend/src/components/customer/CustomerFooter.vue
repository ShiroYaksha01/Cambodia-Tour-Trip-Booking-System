<template>
  <footer class="bg-gray-900 text-white pt-16 pb-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <!-- Top grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

        <!-- Brand column -->
        <div class="lg:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <span class="bg-gold text-white rounded-lg px-2 py-1 text-base">🏛</span>
            <span class="font-serif font-bold text-lg">Anajak Tour</span>
          </div>
          <p class="text-gray-400 text-sm leading-relaxed mb-5">
            Your premium gateway to Cambodia's timeless heritage. Curated tours, private concierge,
            and unforgettable experiences since 2018.
          </p>
          <!-- Socials -->
          <div class="flex gap-3">
            <a v-for="social in socials" :key="social.label" :href="social.href"
               class="w-9 h-9 rounded-lg bg-white/10 hover:bg-gold flex items-center justify-center
                      transition-colors" :aria-label="social.label">
              <span class="text-sm" v-html="social.icon"></span>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="font-serif font-semibold text-base mb-4 text-white">Quick Links</h4>
          <ul class="space-y-2.5">
            <li v-for="link in quickLinks" :key="link.label">
              <RouterLink :to="link.to"
                class="text-gray-400 text-sm hover:text-gold transition-colors flex items-center gap-1.5">
                <span class="text-gold text-xs">→</span>{{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Destinations -->
        <div>
          <h4 class="font-serif font-semibold text-base mb-4 text-white">Popular Destinations</h4>
          <ul class="space-y-2.5">
            <li v-for="dest in destinations" :key="dest">
              <a href="#"
                class="text-gray-400 text-sm hover:text-gold transition-colors flex items-center gap-1.5">
                <span class="text-gold text-xs">📍</span>{{ dest }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="font-serif font-semibold text-base mb-4 text-white">Contact Us</h4>
          <ul class="space-y-3">
            <li v-for="item in contacts" :key="item.label"
                class="flex items-start gap-2.5 text-sm text-gray-400">
              <span class="mt-0.5 text-gold flex-shrink-0">{{ item.icon }}</span>
              <span>{{ item.value }}</span>
            </li>
          </ul>
        </div>

      </div>

      <!-- Bottom bar -->
      <div class="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p class="text-gray-500 text-xs">
          © {{ new Date().getFullYear() }} Anajak Tour. All rights reserved.
        </p>
        <div class="flex gap-5">
          <a href="#" class="text-gray-500 text-xs hover:text-gold transition-colors">Privacy Policy</a>
          <a href="#" class="text-gray-500 text-xs hover:text-gold transition-colors">Terms of Service</a>
          <a href="#" class="text-gray-500 text-xs hover:text-gold transition-colors">Cookie Policy</a>
        </div>
      </div>

    </div>
  </footer>
</template>

<script setup lang="ts">
const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Tours & Packages', to: '/tours' },
  { label: 'Destinations', to: '/destinations' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'FAQs', to: '/faqs' },
]

const destinations = [
  'Siem Reap – Angkor Wat',
  'Phnom Penh',
  'Sihanoukville',
  'Koh Rong Island',
  'Kampot & Kep',
  'Battambang',
]

const contacts = [
  { icon: '📍', label: 'Address', value: 'No. 12, Street 278, Phnom Penh, Cambodia' },
  { icon: '📞', label: 'Phone', value: '+855 23 456 789' },
  { icon: '✉️', label: 'Email', value: 'hello@anajakktour.kh' },
  { icon: '🕐', label: 'Hours', value: 'Mon – Sat: 8:00 AM – 6:00 PM' },
]

const socials = [
  { label: 'Facebook', href: '#', icon: '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>' },
  { label: 'Instagram', href: '#', icon: '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>' },
  { label: 'Telegram', href: '#', icon: '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.67l-2.967-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.943.916z"/></svg>' },
]
</script>