import { createRouter, createWebHistory } from "vue-router";
import WelcomePage from "../views/welcome_page.vue";
import RegisterPage from "../views/register_page.vue";
import VerifyEmailPage from "../views/verify_email_page.vue";

const routes = [
  { path: "/", redirect: "/welcome" },
  { path: "/welcome", component: WelcomePage },
  { path: "/register", component: RegisterPage },
  { path: "/verify-email", component: VerifyEmailPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
