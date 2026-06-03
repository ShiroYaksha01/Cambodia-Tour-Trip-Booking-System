import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { getCurrentUserRole, hasAuthSession } from "../utils/auth";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/dashboard",
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
    path: "/choose-role",
    name: "choose-role",
    component: () => import("../views/auth/RoleSelectorView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/dashboard",
    name: "dashboard",
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
    component: () => import("../views/admin/AdminDashboardView.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin"],
    },
  },

  //admin routes for manage users, test: http://localhost:5173/admin/manage-users
  {
    path: "/admin/users",
    name: "admin-manage-users",
    component: () => import("../views/admin/AdminManageUsersView.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin"],
    },
  },

  {
    path: "/admin/revenue",
    name: "admin-revenue",
    component: () => import("../views/AdminRevenuePage.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin"],
    },
  },
  {
    path: "/admin/analytics",
    name: "admin-analytics",
    component: () => import("../views/admin/AdminAnalyticsView.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin"],
    },
  },
  {
    path: "/admin/settings",
    name: "admin-settings",
    component: () => import("../views/admin/AdminSettingsView.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin"],
    },
  },


  {
    path: "/admin/providers",
    name: "admin-providers",
    component: () => import("../views/admin/AdminProvidersView.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin"],
    },
  },
  {
    path: "/admin/bookings",
    name: "admin-bookings",
    component: () => import("../views/admin/AdminBookingsView.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin"],
    },
  },
  {
    path: "/admin/packages",
    name: "admin-packages",
    component: () => import("../views/admin/AdminPackagesView.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin"],
    },
  },
  {
    path: "/provider",
    component: () => import("../views/dashboards/ProviderShellView.vue"),
    meta: {
      requiresAuth: true,
      roles: ["provider"],
    },
    children: [
      {
        path: "",
        name: "provider-dashboard",
        component: () => import("../views/dashboards/ProviderDashboardView.vue"),
        meta: { title: "Command Center" },
      },
      {
        path: "service",
        name: "provider-service",
        component: () => import("../views/dashboards/ServiceManagerView.vue"),
        meta: { title: "Service Manager" },
      },
      {
        path: "inventory",
        name: "provider-inventory",
        component: () => import("../views/dashboards/InventoryView.vue"),
        meta: { title: "Inventory & Pricing" },
      },
      {
        path: "manifest",
        name: "provider-manifest",
        component: () => import("../views/dashboards/ManifestView.vue"),
        meta: { title: "Manifest" },
      },
      {
        path: "ledger",
        name: "provider-ledger",
        component: () => import("../views/dashboards/FinancialLedgerView.vue"),
        meta: { title: "Financial Ledger" },
      },
      {
        path: "settings",
        name: "provider-settings",
        component: () => import("../views/dashboards/SettingsView.vue"),
        meta: { title: "Profile Settings" },
      },
    ],
  },
  {
    path: "/provider/dashboard",
    redirect: { name: "provider-dashboard" },
  },
  {
    path: "/provider/service",
    redirect: { name: "provider-service" },
  },
  {
    path: "/provider/inventory",
    redirect: { name: "provider-inventory" },
  },
  {
    path: "/provider/manifest",
    redirect: { name: "provider-manifest" },
  },
  {
    path: "/provider/ledger",
    redirect: { name: "provider-ledger" },
  },
  {
    path: "/provider/settings",
    redirect: { name: "provider-settings" },
  },
  {
    path: "/customer/explore",
    name: "customer-explore",
    component: () => import("../views/customer/CustomerExploreView.vue"),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/customer/homepage",
    name: "customer-homepage",
    component: () => import("../views/customer/CustomerHomeView.vue"),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/customer/profile",
    name: "customer-profile",
    component: () => import("../views/customer/CustomerProfileView.vue"),
    meta: {
      requiresAuth: true,
      roles: ["customer"],
    },
  },
  {
    path: "/customer/feedback/:id",
    name: "customer-feedback",
    component: () => import("../views/customer/Feedback.vue"),
    meta: {
      requiresAuth: true,
      roles: ["customer"],
    },
  },
  {
    path: "/customer/tour/:id",
    name: "customer-tour-detail",
    component: () => import("../views/customer/ServiceDetailTour.vue"),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/customer/hotel/:id",
    name: "customer-hotel-detail",
    component: () => import("../views/customer/ServiceDetailHotel.vue"),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/customer/transport/:id",
    name: "customer-transport-detail",
    component: () => import("../views/customer/ServiceDetailTransport.vue"),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/service/:id",
    name: "service-detail",
    component: () => import("../views/services/ServiceDetailView.vue"),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/service/:id/book",
    name: "booking-form",
    component: () => import("../views/booking/BookingFormView.vue"),
    meta: {
      requiresAuth: true,
      roles: ["customer"],
    },
  },
  {
    path: "/booking/success",
    name: "booking-success",
    component: () => import("../views/booking/BookingSuccessView.vue"),
    meta: {
      requiresAuth: true,
      roles: ["customer"],
    },
  },
  {
    path: "/booking/history",
    name: "booking-history",
    component: () => import("../views/booking/BookingHistoryView.vue"),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/booking/:id",
    name: "booking-detail",
    component: () => import("../views/booking/BookingDetailView.vue"),
    meta: {
      requiresAuth: true,
      roles: ["customer"],
    },
  },
  {
    path: "/payment/:id",
    name: "payment",
    component: () => import("../views/payment/PaymentView.vue"),
    meta: {
      requiresAuth: true,
      roles: ["customer"],
    },
  },
  {
    path: "/unauthorized",
    name: "unauthorized",
    component: () => import("../views/shared/UnauthorizedView.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/dashboard",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

router.beforeEach((to) => {
  const role = getCurrentUserRole();
  const requiresAuth = Boolean(to.meta.requiresAuth);
  const guestOnly = Boolean(to.meta.guestOnly);
  const allowedRoles = (to.meta.roles as string[] | undefined) ?? [];

  if (requiresAuth && !hasAuthSession()) {
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
