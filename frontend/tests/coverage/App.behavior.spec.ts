import { vi, expect, test, beforeEach, afterEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'

// Mock i18n setLocale before importing App — expose the mock via the module
vi.mock('../../src/i18n', () => {
  const setLocale = vi.fn()
  return { setLocale }
})

// Provide a controllable vue-router mock before importing App. Expose mocks via __mocks
vi.mock('vue-router', () => {
  const replace = vi.fn()
  const push = vi.fn()
  const back = vi.fn()
  const useRouter = () => ({ replace, push, back })
  const useRoute = () => ({ path: '/' })
  const createRouter = () => ({ push: vi.fn(), beforeEach: vi.fn(), getRoutes: () => [] })
  return { useRouter, useRoute, createRouter, createMemoryHistory: () => ({}), createWebHistory: () => ({}), createWebHashHistory: () => ({}), __mocks: { replace, push, back } }
})

// Mock DefaultService used by onLogoutClicked dynamic import
vi.mock('../../src/api-client/services/DefaultService', () => ({ postApiV1AuthLogout: vi.fn() }))

import App from '../../src/App.vue'
import { useUserStore } from '../../src/stores/user'

let originalLocation: any

beforeEach(() => {
  // ensure clean localStorage and Pinia between tests
  localStorage.clear()
  originalLocation = window.location
})

afterEach(() => {
  // restore location
  try {
    Object.defineProperty(window, 'location', { value: originalLocation })
  } catch (e) {}
  vi.clearAllMocks()
})

test('redirects to /login on mount when no token and path not public', async () => {
  // set non-public path
  Object.defineProperty(window, 'location', { value: { pathname: '/protected', href: '/protected' }, configurable: true })
  const pinia = createPinia()
  const wrapper = shallowMount(App, { global: { plugins: [pinia], mocks: { $route: { path: '/protected' } } } })
  // onMounted runs during mount — ensure replace was called
  const routerMocks = (await import('vue-router')).__mocks
  expect(routerMocks.replace).toHaveBeenCalledWith('/login')
  expect(wrapper.exists()).toBe(true)
})

test('does not redirect when token present', async () => {
  localStorage.setItem('hc_token', 'sometoken')
  Object.defineProperty(window, 'location', { value: { pathname: '/', href: '/' }, configurable: true })
  const pinia = createPinia()
  const wrapper = shallowMount(App, { global: { plugins: [pinia], mocks: { $route: { path: '/' } } } })
  const routerMocks = (await import('vue-router')).__mocks
  expect(routerMocks.replace).not.toHaveBeenCalled()
  expect(wrapper.exists()).toBe(true)
})

test('changing lang calls setLocale', async () => {
  const pinia = createPinia()
  const wrapper = shallowMount(App, { global: { plugins: [pinia], mocks: { $route: { path: '/' } } } })
  // change lang to English
  ;(wrapper.vm as any).lang = { value: 'en', label: 'English' }
  // allow watch to run
  await Promise.resolve()
  const i18n = await import('../../src/i18n')
  expect(i18n.setLocale).toHaveBeenCalledWith('en')
})

test('onLogoutClicked clears store and pushes /login', async () => {
  const pinia = createPinia()
  const wrapper = shallowMount(App, { global: { plugins: [pinia], mocks: { $route: { path: '/' } } } })
  const store = useUserStore()
  const clearSpy = vi.spyOn(store, 'clear')
  // ensure localStorage key exists to be removed
  localStorage.setItem('hc_has_refresh', '1')
  // call method exposed on component instance
  await (wrapper.vm as any).onLogoutClicked()
  expect(clearSpy).toHaveBeenCalled()
  const routerMocks = (await import('vue-router')).__mocks
  expect(routerMocks.push).toHaveBeenCalledWith('/login')
  expect(localStorage.getItem('hc_has_refresh')).toBeNull()
})

test('initials computed from token payload', async () => {
  // payload: { username: 'Max Mustermann' }
  const payload = Buffer.from(JSON.stringify({ username: 'Max Mustermann' })).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const token = `h.${payload}.s`
  localStorage.setItem('hc_token', token)
  const pinia = createPinia()
  const wrapper = shallowMount(App, { global: { plugins: [pinia], mocks: { $route: { path: '/' } } } })
  // initials should be 'MM'
  expect((wrapper.vm as any).initials).toBe('MM')
})
