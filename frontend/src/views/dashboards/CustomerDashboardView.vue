<template>
  <main class="min-h-screen bg-[#f9faf8] font-sans text-[#142125]">
    <!-- Navbar placeholder -->
    <nav class="bg-white border-b border-[#5f6d74]/10 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded bg-[#f4a71d] flex items-center justify-center text-sm font-bold text-[#1b2a2a] shadow-sm">✦</div>
        <span class="font-bold tracking-tight text-[#1d2427]">ANAJAK TOUR</span>
      </div>
      <LogoutButton />
    </nav>

    <section class="max-w-5xl mx-auto py-12 px-6">
      <header class="mb-12">
        <h1 class="text-4xl font-extrabold text-[#1d2427] tracking-tight mb-2">Welcome Back</h1>
        <p class="text-[#69757a] text-[1.1rem]">Your gateway to Cambodia's timeless wonders.</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Explore Card -->
        <router-link to="/service/19f3d5e8-040f-407f-9386-bdeabab7591e" class="group bg-white p-8 rounded-2xl shadow-[0_12px_24px_rgba(10,109,102,0.04)] border border-[#5f6d74]/10 hover:shadow-[0_20px_40px_rgba(10,109,102,0.08)] transition-all transform hover:-translate-y-1 overflow-hidden relative">
          <div class="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(245,164,28,0.1),transparent_70%)]"></div>
          <div class="w-12 h-12 rounded-xl bg-[#e6f2f1] text-[#0e7f76] flex items-center justify-center mb-6 group-hover:bg-[#0e7f76] group-hover:text-white transition-colors">
            <span class="text-xl">🏛</span>
          </div>
          <h3 class="text-xl font-bold text-[#1d2427] mb-2">Explore Experiences</h3>
          <p class="text-[#69757a] text-[0.95rem] leading-relaxed mb-6">Discover curated heritage tours and historical journeys across the Kingdom.</p>
          <span class="text-sm font-bold text-[#0e7f76] flex items-center gap-2">
            Browse Catalogue <span class="group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </router-link>

        <!-- Dossier Card -->
        <router-link to="/booking/history" class="group bg-white p-8 rounded-2xl shadow-[0_12px_24px_rgba(10,109,102,0.04)] border border-[#5f6d74]/10 hover:shadow-[0_20px_40px_rgba(10,109,102,0.08)] transition-all transform hover:-translate-y-1 overflow-hidden relative">
          <div class="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(14,127,118,0.08),transparent_70%)]"></div>
          <div class="w-12 h-12 rounded-xl bg-[#fff9e6] text-[#b37400] flex items-center justify-center mb-6 group-hover:bg-[#f4a71d] group-hover:text-[#1b2a2a] transition-colors">
            <span class="text-xl">📜</span>
          </div>
          <h3 class="text-xl font-bold text-[#1d2427] mb-2">Your Curator Dossier</h3>
          <p class="text-[#69757a] text-[0.95rem] leading-relaxed mb-6">Review and manage your scheduled reservations and travel documents.</p>
          <span class="text-sm font-bold text-[#bf7d10] flex items-center gap-2">
            View My History <span class="group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </router-link>
      </div>

      <div class="mt-16 pt-12 border-t border-[#5f6d74]/10">
        <h4 class="text-[0.65rem] font-bold text-[#8d9497] uppercase tracking-[0.2em] mb-8">Curated Spotlight</h4>
        <div class="bg-[#0a4b47] rounded-2xl p-10 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
           <div class="relative z-10 max-w-lg">
              <h2 class="text-3xl font-extrabold mb-4 leading-tight">Private Angkor Wat Sunrise Experience</h2>
              <p class="text-[#e3f8f0]/80 text-[1rem] leading-relaxed mb-8">Our most sought-after journey. Witness the sun rise over the triple towers of Angkor Wat with a dedicated historian.</p>
              <router-link to="/service/19f3d5e8-040f-407f-9386-bdeabab7591e" class="inline-flex py-3 px-8 rounded-lg bg-[#f4a71d] text-[#1b2a2a] font-bold shadow-lg hover:bg-[#e49b18] transition-all">
                Book This Experience
              </router-link>
           </div>
           <div class="relative z-10 w-full md:w-64 h-48 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center">
              <div class="text-4xl mb-2">✦</div>
              <span class="text-xs font-bold tracking-widest uppercase opacity-60">Heritage Rank #1</span>
           </div>
           <!-- Pattern -->
           <div class="absolute inset-0 opacity-10 pointer-events-none">
              <div class="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(255,255,255,0.1)_21px)]"></div>
           </div>
        </div>
      </div>
    </section>

    <footer class="py-12 text-center text-[#8d9497] text-[0.64rem] tracking-[0.14em] font-bold border-t border-[#5f6d74]/5">
       <span>© 2024 THE HERITAGE CURATOR. ALL RIGHTS RESERVED.</span>
    </footer>
  </main>
</template>

<script setup lang="ts">
import LogoutButton from "../../components/LogoutButton.vue";
</script>

<style scoped>
/* Scoped styles kept minimal as we use Tailwind-like classes for consistency */
</style>
