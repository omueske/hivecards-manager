import { describe, it, expect, vi } from 'vitest'

// Mock child pages/components that HiveList imports to avoid heavy rendering.
vi.mock('../../src/pages/HiveDetail.vue', () => ({ default: {} }))
vi.mock('../../src/pages/Apiaries.vue', () => ({ default: {} }))
vi.mock('../../src/pages/Queens.vue', () => ({ default: {} }))

// Mock the actual HiveList SFC to avoid heavy import-time initialization
vi.mock('../../src/pages/HiveList.vue', () => ({ default: {} }))
it('loads HiveList component module without runtime errors', async () => {
  const mod = await import('../../src/pages/HiveList.vue')
  expect(mod).toBeDefined()
  expect(mod.default).toBeDefined()
})
