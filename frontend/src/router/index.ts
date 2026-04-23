import { createRouter, createWebHistory } from "vue-router";

import welcome_page from '../views/welcome_page.vue';
import register_page from '../views/register_page.vue';
import VerifyEmailPage from "../views/verify_email_page.vue";
import AuthSignInView from '../views/AuthSignInView.vue';

const routes = [
    {path: '/', redirect: '/welcome',component: welcome_page},
    {path: '/sign-in', name: 'auth-sign-in', component: AuthSignInView,},
    {path: '/register', component: register_page},
    { path: "/verify-email", component: VerifyEmailPage },
];


export default createRouter({
    history: createWebHistory(),
    routes
})