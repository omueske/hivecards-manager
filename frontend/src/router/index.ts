import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import HiveList from '../pages/HiveList.vue'
import HiveDetail from '../pages/HiveDetail.vue'

const routes = [
  { path: '/', component: HiveList, meta: { requiresAuth: true } },
  { path: '/login', component: Login },
  { path: '/hives/:id', component: HiveDetail, meta: { requiresAuth: true } },
]

const router = createRouter({ history: createWebHistory(), routes })

// simple auth guard: checks for token in localStorage
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(r => (r.meta as any)?.requiresAuth)
  const token = localStorage.getItem('hc_token')
  if (requiresAuth && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})
export default router
