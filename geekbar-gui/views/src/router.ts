import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/",
            component: () => import("./pages/geekbar"),
        },
        {
            path: "/setting",
            component: () => import("./pages/setting")
        }
    ],
})

export default router;