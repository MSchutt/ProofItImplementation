import { createWebHistory, createRouter } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Home',
        redirect: '/assets',
    },
    {
        path: '/assets',
        name: 'Assets',
        component: () => import('../pages/assets/Index.vue')
    },
    {
        path: '/assets/:id',
        name: 'AssetDetail',
        component: () => import('../pages/assets/Detail.vue')
    },
    {
        path: '/assets/create',
        name: 'Assets-Create',
        component: () => import('../pages/assets/create/Create.vue')
    },
    {
        path: '/verify',
        name: 'Verify',
        component: () => import('../pages/Verify.vue')
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;