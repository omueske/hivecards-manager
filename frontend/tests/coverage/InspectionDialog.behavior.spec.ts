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
import InspectionDialog from '../../src/components/InspectionDialog.vue'

test('submit posts inspection and emits created', async () => {
  const wrapper = shallowMount(InspectionDialog, { props: { visible: true, hiveId: 'h1' } })
  const ds = (await import('../../src/api-client/services/DefaultService')).DefaultService as any
  ds.postApiV1Inspections.mockResolvedValue({ id: 'i1' })
  await (wrapper.vm as any).submit()
  expect(wrapper.emitted()).toHaveProperty('created')
})

test('saveNewAgent posts and updates options', async () => {
  const wrapper = shallowMount(InspectionDialog, { props: { visible: true, hiveId: 'h1' } })
  // mock fetch to return ok
  global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ id: 'a1', name: 'X' }) })) as any
  // ensure Notify.create exists on quasar mock
  const q = await import('quasar')
  q.Notify = q.Notify || {}
  q.Notify.create = vi.fn()
  // open add dialog and set name
  const vm = wrapper.vm as any
  vm.openAddDialog('treatment')
  vm.newAgentName = 'NewAgent'
  await vm.saveNewAgent()
  // agentOptions should include new agent when listing
  expect((wrapper.vm as any).agentOptions.includes('NewAgent')).toBe(true)
})

test('saveNewAgent handles POST failure gracefully', async () => {
  const wrapper = shallowMount(InspectionDialog, { props: { visible: true, hiveId: 'h1' } })
  // mock fetch to fail
  global.fetch = vi.fn(async () => ({ ok: false, json: async () => ({ message: 'err' }) })) as any
  const vm = wrapper.vm as any
  vm.openAddDialog('feeding')
  vm.newAgentName = 'FailAgent'
  await vm.saveNewAgent()
  // should not include the failed agent
  expect(vm.feedOptions.includes('FailAgent')).toBe(false)
})

test('submit in edit mode calls PUT and emits updated', async () => {
  const inspection = { id: 'ins1', date: '2020-01-01' }
  const wrapper = shallowMount(InspectionDialog, { props: { visible: true, hiveId: 'h1', inspection } })
  // ensure fetch PUT path returns ok
  global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ id: 'ins1' }) })) as any
  await (wrapper.vm as any).submit()
  expect(wrapper.emitted()).toHaveProperty('updated')
})
