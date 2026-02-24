import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
// Provide a lightweight mock for the generated client so importing `Dashboard` doesn't pull
// the real client during test evaluation.
vi.mock('../src/api-client/services/DefaultService', () => ({
  DefaultService: {
    getApiV1Hives: vi.fn(),
    getApiV1Apiaries: vi.fn(),
    getApiV1Queens: vi.fn(),
    getApiV1Inspections: vi.fn(),
  },
}))
let DefaultService: any
import Dashboard from '../src/pages/Dashboard.vue'

// capture push spy so we can inspect it later
const pushSpy = vi.fn()
vi.mock('vue-router', () => {
  return {
    useRouter: () => ({ push: pushSpy }),
    useRoute: () => ({ query: {} }),
    createRouter: () => ({ push: pushSpy }),
    createMemoryHistory: () => ({}),
  }
})

describe('Dashboard.vue', () => {
  beforeEach(() => {
    // reset stats mocks
    vi.resetAllMocks()
  })

  it('renders stats returned by the API and responds to card clicks', async () => {
    // stub the api calls to return simple results
    const hives = { pagination: { total: 5 } }
    const apiaries: any[] = [{}, {}]
    const queens: any[] = [{}, {}, {}]
    const inspections: any = { items: [ { type: 'inspection' }, { type: 'treatment' }, { type: 'inspection' } ] }

    // import the mocked module at runtime and set return values
    DefaultService = await import('../src/api-client/services/DefaultService')
    ;(DefaultService as any).DefaultService.getApiV1Hives = vi.fn().mockResolvedValue(hives)
    ;(DefaultService as any).DefaultService.getApiV1Apiaries = vi.fn().mockResolvedValue(apiaries)
    ;(DefaultService as any).DefaultService.getApiV1Queens = vi.fn().mockResolvedValue(queens)
    ;(DefaultService as any).DefaultService.getApiV1Inspections = vi.fn().mockResolvedValue(inspections)

    const wrapper = mount(Dashboard)

    // wait for onMounted promises to resolve
    await new Promise((r) => setTimeout(r, 0))
    await new Promise((r) => setTimeout(r, 0))

    // stats should display
    expect(wrapper.html()).toContain('5')
    expect(wrapper.html()).toContain('2')
    expect(wrapper.html()).toContain('3')
    expect(wrapper.html()).toContain('2') // inspections
    expect(wrapper.html()).toContain('1') // treatments

    // clicking the hive card should call router.push
    const hiveCard = wrapper.find('div.stat-card.cursor-pointer')
    await hiveCard.trigger('click')
    expect(pushSpy).toHaveBeenCalledWith('/hives')
  })
})
