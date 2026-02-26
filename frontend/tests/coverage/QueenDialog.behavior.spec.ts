import { vi } from 'vitest'

// Mock DefaultService before importing the component
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

test('submit creates queen and emits created', async () => {
  const wrapper = shallowMount(QueenDialog, { props: { visible: true } })
  const ds = (await import('../../src/api-client/services/DefaultService')).DefaultService as any
  ds.postApiV1Queens.mockResolvedValue({ id: 'q1' })
  // ensure quasar Notify.create exists
  const q = await import('quasar')
  q.Notify = q.Notify || {}
  q.Notify.create = vi.fn()
  await (wrapper.vm as any).submit()
  expect(wrapper.emitted()).toHaveProperty('created')
})

test('submit updates queen when props.queen present', async () => {
  const queen = { id: 'q2', name: 'Old' }
  const wrapper = shallowMount(QueenDialog, { props: { visible: true, queen } })
  const ds = (await import('../../src/api-client/services/DefaultService')).DefaultService as any
  ds.putApiV1Queens.mockResolvedValue({ id: 'q2', name: 'Updated' })
  const q = await import('quasar')
  q.Notify = q.Notify || {}
  q.Notify.create = vi.fn()
  await (wrapper.vm as any).submit()
  expect(wrapper.emitted()).toHaveProperty('updated')
})

test('submit handles create error (does not emit)', async () => {
  const wrapper = shallowMount(QueenDialog, { props: { visible: true } })
  const ds = (await import('../../src/api-client/services/DefaultService')).DefaultService as any
  ds.postApiV1Queens.mockRejectedValue(new Error('fail'))
  const q = await import('quasar')
  q.Notify = q.Notify || {}
  q.Notify.create = vi.fn()
  await (wrapper.vm as any).submit()
  expect(wrapper.emitted()).not.toHaveProperty('created')
})
