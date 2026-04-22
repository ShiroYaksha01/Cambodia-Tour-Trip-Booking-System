import { createRouter, createWebHistory } from "vue-router";
import welcome_page from '../views/welcome_page.vue'
import register_page from '../views/register_page.vue'

const routes = [
    {path: '/welcome', component: welcome_page},
    {path: '/register', component: register_page},
]

export default createRouter({
    history: createWebHistory(),
    routes
})