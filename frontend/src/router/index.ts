import { createRouter, createWebHistory } from 'vue-router'

import AuthSignInView from '../views/AuthSignInView.vue'
import AuthSignUpView from '../views/AuthSignUpView.vue'
import AuthVerificationView from '../views/AuthVerificationView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/auth/sign-in',
    },
    {
      path: '/auth/sign-in',
      name: 'auth-sign-in',
      component: AuthSignInView,
    },
    {
      path: '/auth/sign-up',
      name: 'auth-sign-up',
      component: AuthSignUpView,
    },
    {
      path: '/auth/verification',
      name: 'auth-verification',
      component: AuthVerificationView,
    },
  ],
})

export default router
