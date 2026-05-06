import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { getCurrentUserRole } from "../utils/auth";
// import HomePage from "../pages/HomePage.vue";

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

      return { name: "customer-dashboard" };
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
    path: "/provider",
    component: () => import("../views/dashboards/ProviderShellView.vue"),
    meta: {
      requiresAuth: false,
      roles: ["provider"],
    },
    children: [
      {
        path: "",
        name: "provider-dashboard",
        component: () => import("../views/dashboards/ProviderDashboardView.vue"),
      },
      {
        path: "service",
        name: "provider-service",
        component: () => import("../views/dashboards/ServiceManagerView.vue"),
      },
      {
        path: "inventory",
        name: "provider-inventory",
        component: () => import("../views/dashboards/InventoryView.vue"),
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
    path: "/customer/dashboard",
    name: "customer-dashboard",
    component: () => import("../views/dashboards/CustomerDashboardView.vue"),
    meta: {
      requiresAuth: true,
      roles: ["customer"],
    },
  },
  {
    path: "/unauthorized",
    name: "unauthorized",
    component: () => import("../views/UnauthorizedView.vue"),
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
