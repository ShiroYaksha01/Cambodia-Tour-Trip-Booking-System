import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { getCurrentUserRole } from '../utils/auth'

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/dashboard",
    // name: "home",
    // component: HomePage,
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/auth/LoginView.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/verify-email",
    name: "verify-email",
    component: () => import("../views/auth/VerifyEmailPage.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/auth/RegisterView.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: () => import("../views/auth/ForgotPassword.vue"),
    meta: { guestOnly: true },
  },
  {
    path: '/choose-role',
    name: 'choose-role',
    component: () => import('../views/auth/RoleSelectorView.vue'),
  },
  {
    path: '/choose-role',
    name: 'choose-role',
    component: () => import('../views/auth/RoleSelectorView.vue'),
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    redirect: () => {
      const role = getCurrentUserRole();

      if (!role) {
        return { name: "login" };
      }

      if (role === "admin") {
        return { name: "admin-dashboard" };
      }

      if (role === "provider") {
        return { name: "provider-dashboard" };
      }

      if (role === "customer") {
        return { name: "customer-homepage" };
      }

      return { name: "unauthorized" };
    },
  },
  {
    path: "/admin/dashboard",
    name: "admin-dashboard",
    component: () => import("../views/dashboards/AdminDashboardView.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin"],
    },
  },
  {
    path: "/provider/dashboard",
    name: "provider-dashboard",
    component: () => import("../views/dashboards/ProviderDashboardView.vue"),
    meta: {
      requiresAuth: true,
      roles: ["provider"],
    },
  },
  {
    path: "/customer/homepage",
    name: "customer-homepage",
    component: () => import("../views/CustomerHomepage.vue"),
    meta: {
      requiresAuth: true,
      roles: ["customer"],
    },
  },
  {
    path: '/service/:id',
    name: 'service-detail',
    component: () => import('../views/services/ServiceDetailView.vue'),
  },
  {
    path: '/service/:id/book',
    name: 'booking-form',
    component: () => import('../views/booking/BookingFormView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['customer'],
    },
  },
  {
    path: '/booking/success',
    name: 'booking-success',
    component: () => import('../views/booking/BookingSuccessView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['customer'],
    },
  },
  {
    path: '/booking/history',
    name: 'booking-history',
    component: () => import('../views/booking/BookingHistoryView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['customer'],
    },
  },
  {
    path: '/booking/:id',
    name: 'booking-detail',
    component: () => import('../views/booking/BookingDetailView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['customer'],
    },
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('../views/UnauthorizedView.vue'),
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/dashboard",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to) => {
  const role = getCurrentUserRole();
  const requiresAuth = Boolean(to.meta.requiresAuth);
  const guestOnly = Boolean(to.meta.guestOnly);
  const allowedRoles = (to.meta.roles as string[] | undefined) ?? [];

  if (requiresAuth && !role) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  if (guestOnly && role) {
    return { name: "dashboard" };
  }

  if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    return { name: "unauthorized" };
  }

  return true;
});

export default router;
