import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '../auth/token'

function parseJwtRole(token: string | null): 'user' | 'admin' {
  if (!token) return 'user'
  try {
    const parts = token.split('.')
    if (parts.length < 2) return 'user'
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload?.role === 'admin' ? 'admin' : 'user'
  } catch {
    return 'user'
  }
}

const routes = [
  { path: '/', component: () => import('../pages/Dashboard.vue'), meta: { requiresAuth: true } },
  { path: '/hives', component: () => import('../pages/HiveList.vue'), meta: { requiresAuth: true } },
  { path: '/login', component: () => import('../pages/Login.vue') },
  { path: '/register', component: () => import('../pages/Register.vue') },
  { path: '/forgot-password', component: () => import('../pages/ForgotPassword.vue') },
  { path: '/reset-password', component: () => import('../pages/ResetPassword.vue') },
  { path: '/email-verified', component: () => import('../pages/EmailVerified.vue') },
  { path: '/profile', component: () => import('../pages/Profile.vue'), meta: { requiresAuth: true } },
  { path: '/hives/:id', component: () => import('../pages/HiveDetail.vue'), meta: { requiresAuth: true } },
  { path: '/apiaries', component: () => import('../pages/Apiaries.vue'), meta: { requiresAuth: true } },
  { path: '/queens', component: () => import('../pages/Queens.vue'), meta: { requiresAuth: true } },
  { path: '/admin', component: () => import('../pages/Admin.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/changelog', component: () => import('../pages/Changelog.vue') },
]

const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes })

// simple auth guard: checks for token in localStorage
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(r => (r.meta as any)?.requiresAuth)
  const requiresAdmin = to.matched.some(r => (r.meta as any)?.requiresAdmin)
  const token = getToken()
  if (requiresAuth && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  if (requiresAdmin && parseJwtRole(token) !== 'admin') {
    next({ path: '/' })
    return
  } else {
    next()
  }
})
export default router
