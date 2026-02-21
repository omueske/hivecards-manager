import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import ForgotPassword from '../pages/ForgotPassword.vue'
import ResetPassword from '../pages/ResetPassword.vue'
import Profile from '../pages/Profile.vue'
import Dashboard from '../pages/Dashboard.vue'
import HiveList from '../pages/HiveList.vue'
import HiveDetail from '../pages/HiveDetail.vue'
import Apiaries from '../pages/Apiaries.vue'
import Queens from '../pages/Queens.vue'
import Changelog from '../pages/Changelog.vue'
import EmailVerified from '../pages/EmailVerified.vue'
import { getToken } from '../auth/token'

const routes = [
  { path: '/', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/hives', component: HiveList, meta: { requiresAuth: true } },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/forgot-password', component: ForgotPassword },
  { path: '/reset-password', component: ResetPassword },
  { path: '/email-verified', component: EmailVerified },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/hives/:id', component: HiveDetail, meta: { requiresAuth: true } },
  { path: '/apiaries', component: Apiaries, meta: { requiresAuth: true } },
  { path: '/queens', component: Queens, meta: { requiresAuth: true } },
  { path: '/changelog', component: Changelog },
]

const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes })

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
