import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'

// simple router mock must be declared before component import
const backSpy = vi.fn()
const replaceSpy = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ back: backSpy, replace: replaceSpy, currentRoute: { value: { fullPath: '/login' } } }),
  useRoute: () => ({ query: {}, params: { id: 'h1' } }),
}))
// Prevent importing the real generated API client at module-eval time (can cause hangs)
vi.mock('../src/api-client/services/DefaultService', () => ({
  DefaultService: {
    getApiV1Hives1: vi.fn(),
    getApiV1Apiaries1: vi.fn(),
    getApiV1Inspections: vi.fn(),
    getApiV1Queens: vi.fn(),
    deleteApiV1Inspections: vi.fn(),
    postApiV1QueensAssign: vi.fn(),
  },
}))

import HiveDetail from '../src/pages/HiveDetail.vue'

describe('HiveDetail.vue helpers', () => {
  let vm: any
  beforeEach(() => {
    const wrapper = mount(HiveDetail)
    vm = wrapper.vm
  })

  it('formatDate returns dash for undefined and formats date', () => {
    expect(vm.formatDate()).toBe('-')
    expect(vm.formatDate('2021-02-03')).toContain('2021')
  })

  it('typeLabel/icon/color map correctly', () => {
    expect(vm.typeLabel('inspection')).toMatch(/inspection/i)
    expect(vm.typeIcon('harvest')).toBe('local_florist')
    expect(vm.typeColor('feeding')).toBe('orange')
  })

  it('goBack calls router.back and then replace for login path', async () => {
    vm.goBack()
    expect(backSpy).toHaveBeenCalled()
    // after timeout
    await new Promise((r) => setTimeout(r, 70))
    expect(replaceSpy).toHaveBeenCalledWith('/')
  })
})