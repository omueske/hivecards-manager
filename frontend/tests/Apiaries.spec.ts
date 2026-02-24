// debug: ensure file evaluation is visible in CI runs
// eslint-disable-next-line no-console
// Apiaries.spec loaded (debug log removed)
import { mount } from '@vue/test-utils'
// Provide a lightweight module mock to avoid loading the full generated client at import time
// eslint-disable-next-line @typescript-eslint/no-unused-vars
vi.mock('../src/api-client/services/DefaultService', () => ({
  DefaultService: {
    getApiV1Apiaries: vi.fn(),
    getApiV1Hives: vi.fn(),
  },
}))
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Apiaries from '../src/pages/Apiaries.vue'
import { DefaultService } from '../src/api-client/services/DefaultService'

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() },
  useQuasar: () => ({ notify: vi.fn() }),
}))

// reuse the global mocks from setupTests for i18n, router etc, so no need to mock here again

describe('Apiaries.vue', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // make sure fetch is not interfering
    global.fetch = vi.fn()
  })

  it('load() populates apiaries and hiveCounts', async () => {
    const apiaries = [{ id: 'a1', name: 'A1', color: '#fff' }]
    const hives = { items: [{ apiaryId: 'a1' }, { apiaryId: 'a1' }, { apiaryId: 'a2' }] }
    ;(DefaultService.getApiV1Apiaries as any) = vi.fn().mockResolvedValue(apiaries)
    ;(DefaultService.getApiV1Hives as any) = vi.fn().mockResolvedValue(hives)

    const wrapper = mount(Apiaries)
    const vm: any = wrapper.vm
    // manually invoke load (onMounted also calls it but we can await results)
    await vm.load()
    expect(vm.apiaries).toEqual(apiaries)
    expect(vm.hiveCounts).toEqual({ a1: 2, a2: 1 })
    expect(vm.loading).toBe(false)
  })

  it('openCreate / openEdit / askDelete adjust state', () => {
    const wrapper = mount(Apiaries)
    const vm: any = wrapper.vm

    vm.openCreate()
    expect(vm.editingId).toBeNull()
    expect(vm.dialogVisible).toBe(true)

    vm.openEdit({ id: 'x', name: 'foo', color: '#123' })
    expect(vm.editingId).toBe('x')
    expect(vm.form.name).toBe('foo')
    expect(vm.form.color).toBe('#123')
    expect(vm.dialogVisible).toBe(true)

    vm.askDelete('z')
    expect(vm.deletingId).toBe('z')
    expect(vm.confirmDeleteVisible).toBe(true)
  })
})