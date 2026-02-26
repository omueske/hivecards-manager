import { vi } from 'vitest'

// Mock DefaultService before importing the component to avoid import-time calls
vi.mock('../../src/api-client/services/DefaultService', () => {
  const handler = {
    get(_target: any, prop: string) {
      if (!(_target as any)[prop]) ( _target as any)[prop] = vi.fn()
      return (_target as any)[prop]
    },
  }
  const proxy = new Proxy({}, handler)
  return { DefaultService: proxy }
})

import { shallowMount } from '@vue/test-utils'
import QueenDialog from '../../src/components/QueenDialog.vue'

test('QueenDialog mounts (smoke)', () => {
  const wrapper = shallowMount(QueenDialog, { props: { visible: false } })
  expect(wrapper.exists()).toBe(true)
})
