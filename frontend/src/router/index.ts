import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import Profile from '../pages/Profile.vue'
import Dashboard from '../pages/Dashboard.vue'
import HiveList from '../pages/HiveList.vue'
import HiveDetail from '../pages/HiveDetail.vue'
import Apiaries from '../pages/Apiaries.vue'
import Queens from '../pages/Queens.vue'
import { getToken } from '../auth/token'

const routes = [
  { path: '/', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/hives', component: HiveList, meta: { requiresAuth: true } },
  { path: '/login', component: Login },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/hives/:id', component: HiveDetail, meta: { requiresAuth: true } },
  { path: '/apiaries', component: Apiaries, meta: { requiresAuth: true } },
  { path: '/queens', component: Queens, meta: { requiresAuth: true } },
]

const router = createRouter({ history: createWebHistory(), routes })

// simple auth guard: checks for token in localStorage
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(r => (r.meta as any)?.requiresAuth)
  const token = getToken()
  if (requiresAuth && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})
export default router
