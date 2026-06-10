<script setup lang="ts">
import type { Component } from "vue";
import {
  BriefcaseIcon,
  BuildingStorefrontIcon,
  ShieldCheckIcon,
} from "@heroicons/vue/24/outline";
import { useRouter } from "vue-router";
import AuthCard from "../../components/auth/AuthCard.vue";
import AuthLayout from "../../components/auth/AuthLayout.vue";
import { setCurrentUserRole } from "../../utils/auth";

type RoleOption = {
  role: "admin" | "provider" | "customer";
  title: string;
  description: string;
  icon: Component;
};

const router = useRouter();

const roleOptions: RoleOption[] = [
  {
    role: "customer",
    title: "Customer",
    description: "Search Cambodia trips, manage bookings, and continue checkout.",
    icon: BriefcaseIcon,
  },
  {
    role: "provider",
    title: "Provider",
    description: "Manage tourism services, inventory, pricing, and reservations.",
    icon: BuildingStorefrontIcon,
  },
  {
    role: "admin",
    title: "Admin",
    description: "Open system oversight, users, providers, bookings, and analytics.",
    icon: ShieldCheckIcon,
  },
];

function selectRole(role: "admin" | "provider" | "customer") {
  setCurrentUserRole(role);

  setTimeout(() => {
    if (role === "admin") {
      router.push("/admin/dashboard");
    } else if (role === "provider") {
      router.push("/provider/dashboard");
    } else {
      router.push("/customer/homepage");
    }
  }, 100);
}
</script>

<template>
  <AuthLayout>
    <AuthCard
      title="Choose Your Dashboard"
      subtitle="Your account role controls the workspace and tools you see after sign in."
    >
      <div class="role-state-list">
        <button
          v-for="option in roleOptions"
          :key="option.role"
          type="button"
          class="role-state-card"
          @click="selectRole(option.role)"
        >
          <component :is="option.icon" class="role-state-icon" aria-hidden="true" />
          <span>
            <strong>{{ option.title }}</strong>
            <small>{{ option.description }}</small>
          </span>
        </button>
      </div>

      <template #footer>
        <RouterLink to="/login">Back to login</RouterLink>
      </template>
    </AuthCard>
  </AuthLayout>
</template>

<style scoped>
.role-state-list {
  display: grid;
  gap: 13px;
}

.role-state-card {
  min-height: 92px;
  border: 1px solid var(--border, #E5E7E7);
  border-radius: 12px;
  display: grid;
  grid-template-columns: 44px 1fr;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.75);
  color: var(--text-dark, #182525);
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.role-state-card:hover,
.role-state-card:focus-visible {
  transform: translateY(-1px);
  border-color: var(--primary, #00796B);
  background: var(--surface, #FFFFFF);
  box-shadow: 0 14px 30px rgba(0, 121, 107, 0.15);
  outline: 0;
}

.role-state-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  padding: 10px;
  background: rgba(245, 166, 35, 0.14);
  color: var(--accent-gold, #F5A623);
}

.role-state-card span,
.role-state-card strong,
.role-state-card small {
  display: block;
}

.role-state-card strong {
  font-size: 1rem;
  color: var(--text-dark, #182525);
}

.role-state-card small {
  margin-top: 5px;
  color: var(--text-muted, #6B7676);
  font-size: 0.86rem;
  line-height: 1.45;
}
</style>
