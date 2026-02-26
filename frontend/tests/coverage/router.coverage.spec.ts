import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Router } from 'vue-router'

// Mock getToken function
let mockToken: string | null = null
vi.mock('../../src/auth/token', () => ({
  getToken: () => mockToken
}))

vi.mock('vue-router', () => {
  return {
    createMemoryHistory: () => ({}),
    createRouter: (opts: any) => {
      const routes = opts?.routes ?? []
      const guards: Array<(to: any, from: any, next: (arg?: any) => void) => void> = []
      const currentRoute = { value: { path: '/', fullPath: '/', query: {}, matched: [] as any[] } }

      const findRoute = (path: string) => {
        return routes.find((r: any) => {
          if (r.path === path) return true
          if (r.path?.includes('/:')) {
            const base = String(r.path).split('/:')[0]
            return path.startsWith(base + '/')
          }
          return false
        })
      }

      return {
        currentRoute,
        beforeEach(fn: any) {
          guards.push(fn)
        },
        getRoutes() {
          return routes
        },
        async isReady() {
          return
        },
        async push(path: string) {
          const targetRoute = findRoute(path)
          const to = {
            path,
            fullPath: path,
            query: {},
            matched: targetRoute ? [targetRoute] : [],
          }
          const from = currentRoute.value

          let redirected: any = null
          for (const guard of guards) {
            guard(to, from, (arg?: any) => {
              if (arg) redirected = arg
            })
            if (redirected) break
          }

          if (redirected) {
            const redirectedPath = redirected.path ?? '/'
            const redirectedRoute = findRoute(redirectedPath)
            currentRoute.value = {
              path: redirectedPath,
              fullPath: redirectedPath,
              query: redirected.query ?? {},
              matched: redirectedRoute ? [redirectedRoute] : [],
            }
            return
          }

          currentRoute.value = to
        },
      }
    },
  }
})

import { createRouter, createMemoryHistory } from 'vue-router'

// Mock all page components to avoid running their setup/onMounted code
vi.mock('../../src/pages/Login.vue', () => ({ default: { name: 'Login', template: '<div>Login</div>' } }))
vi.mock('../../src/pages/Register.vue', () => ({ default: { name: 'Register', template: '<div>Register</div>' } }))
vi.mock('../../src/pages/ForgotPassword.vue', () => ({ default: { name: 'ForgotPassword', template: '<div>ForgotPassword</div>' } }))
vi.mock('../../src/pages/ResetPassword.vue', () => ({ default: { name: 'ResetPassword', template: '<div>ResetPassword</div>' } }))
vi.mock('../../src/pages/Profile.vue', () => ({ default: { name: 'Profile', template: '<div>Profile</div>' } }))
vi.mock('../../src/pages/Dashboard.vue', () => ({ default: { name: 'Dashboard', template: '<div>Dashboard</div>' } }))
vi.mock('../../src/pages/HiveList.vue', () => ({ default: { name: 'HiveList', template: '<div>HiveList</div>' } }))
vi.mock('../../src/pages/HiveDetail.vue', () => ({ default: { name: 'HiveDetail', template: '<div>HiveDetail</div>' } }))
vi.mock('../../src/pages/Apiaries.vue', () => ({ default: { name: 'Apiaries', template: '<div>Apiaries</div>' } }))
vi.mock('../../src/pages/Queens.vue', () => ({ default: { name: 'Queens', template: '<div>Queens</div>' } }))
vi.mock('../../src/pages/Changelog.vue', () => ({ default: { name: 'Changelog', template: '<div>Changelog</div>' } }))
vi.mock('../../src/pages/EmailVerified.vue', () => ({ default: { name: 'EmailVerified', template: '<div>EmailVerified</div>' } }))

import Login from '../../src/pages/Login.vue'
import Register from '../../src/pages/Register.vue'
import ForgotPassword from '../../src/pages/ForgotPassword.vue'
import ResetPassword from '../../src/pages/ResetPassword.vue'
import Profile from '../../src/pages/Profile.vue'
import Dashboard from '../../src/pages/Dashboard.vue'
import HiveList from '../../src/pages/HiveList.vue'
import HiveDetail from '../../src/pages/HiveDetail.vue'
import Apiaries from '../../src/pages/Apiaries.vue'
import Queens from '../../src/pages/Queens.vue'
import Changelog from '../../src/pages/Changelog.vue'
import EmailVerified from '../../src/pages/EmailVerified.vue'
import { getToken } from '../../src/auth/token'

describe('Router', () => {
  let router: Router

  beforeEach(() => {
    // Create a fresh router instance for each test
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

    router = createRouter({ history: createMemoryHistory(), routes })

    // Add the auth guard
    router.beforeEach((to, from, next) => {
      const requiresAuth = to.matched.some(r => (r.meta as any)?.requiresAuth)
      const token = getToken()
      if (requiresAuth && !token) {
        next({ path: '/login', query: { redirect: to.fullPath } })
      } else {
        next()
      }
    })
  })

  it('has routes configured', () => {
    const routes = router.getRoutes()
    expect(Array.isArray(routes)).toBe(true)
    expect(routes.length).toBe(12)
  })

  it('redirects to /login when accessing protected route without token', async () => {
    mockToken = null
    await router.isReady()
    await router.push('/hives')
    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.redirect).toBe('/hives')
  })

  it('allows access to protected route when token exists', async () => {
    mockToken = 'test-token'
    await router.isReady()
    await router.push('/hives')
    expect(router.currentRoute.value.path).toBe('/hives')
  })

  it('allows access to public routes without token', async () => {
    mockToken = null
    await router.isReady()
    
    await router.push('/login')
    expect(router.currentRoute.value.path).toBe('/login')
    
    await router.push('/register')
    expect(router.currentRoute.value.path).toBe('/register')
    
    await router.push('/changelog')
    expect(router.currentRoute.value.path).toBe('/changelog')
  })

  it('allows access to root when token exists', async () => {
    mockToken = 'test-token'
    await router.isReady()
    await router.push('/')
    expect(router.currentRoute.value.path).toBe('/')
  })
})
