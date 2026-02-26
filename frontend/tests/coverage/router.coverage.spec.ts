import { vi } from 'vitest'

// Mock all page components to avoid running their setup/onMounted code
vi.mock('../../src/pages/Login.vue', () => ({ default: {} }))
vi.mock('../../src/pages/Register.vue', () => ({ default: {} }))
vi.mock('../../src/pages/ForgotPassword.vue', () => ({ default: {} }))
vi.mock('../../src/pages/ResetPassword.vue', () => ({ default: {} }))
vi.mock('../../src/pages/Profile.vue', () => ({ default: {} }))
vi.mock('../../src/pages/Dashboard.vue', () => ({ default: {} }))
vi.mock('../../src/pages/HiveList.vue', () => ({ default: {} }))
vi.mock('../../src/pages/HiveDetail.vue', () => ({ default: {} }))
vi.mock('../../src/pages/Apiaries.vue', () => ({ default: {} }))
vi.mock('../../src/pages/Queens.vue', () => ({ default: {} }))
vi.mock('../../src/pages/Changelog.vue', () => ({ default: {} }))
vi.mock('../../src/pages/EmailVerified.vue', () => ({ default: {} }))

import router from '../../src/router'

test('router has routes', () => {
  const routes = router.getRoutes()
  expect(Array.isArray(routes)).toBe(true)
  expect(routes.length).toBeGreaterThan(0)
})
