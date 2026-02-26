import { vi } from 'vitest'
import { nextTick } from 'vue'

beforeEach(() => {
  vi.clearAllMocks()
})

import { mount } from '@vue/test-utils'

// Ensure the generated API client is mocked in this test's module graph
// so that any import-time or dynamic calls do not load the real client.
vi.mock('../../src/api-client/services/DefaultService', () => {
  const handler = {
    get(_target: any, prop: string) {
      if (!(_target as any)[prop]) (_target as any)[prop] = vi.fn()
      return (_target as any)[prop]
    },
  }
  const proxy = new Proxy({}, handler)
  return { DefaultService: proxy }
})

import CreateHiveDialog from '../../src/components/CreateHiveDialog.vue'

// ensure prompt is deterministic
const origPrompt = global.prompt

afterAll(() => {
  global.prompt = origPrompt
})

test('submit creates hive and emits created', async () => {
  console.log('TEST: submit creates hive start')
  const wrapper = mount(CreateHiveDialog, { props: { visible: true } })
  // setup formRef.validate to succeed (defensive: don't overwrite template ref)
  const vm = wrapper.vm as any
  await nextTick()
  await nextTick()
  if (!vm.formRef) vm.formRef = { value: {} }
  vm.formRef.value = vm.formRef.value || {}
  vm.formRef.value.validate = async () => true
  // mock DefaultService.postApiV1Hives
  const ds = (await import('../../src/api-client/services/DefaultService')).DefaultService as any
  ds.postApiV1Hives.mockResolvedValue({ id: 'new-id' })
  // ensure quasar Notify.create exists
  const q = await import('quasar')
  q.Notify = q.Notify || {}
  q.Notify.create = vi.fn()
  // call submit
  console.log('TEST: calling submit (create)')
  await (wrapper.vm as any).submit()
  // should emit created
  expect(wrapper.emitted()).toHaveProperty('created')
  console.log('TEST: submit creates hive done')
})

test('createApiary calls post and updates options', async () => {
  console.log('TEST: createApiary start')
  const wrapper = mount(CreateHiveDialog, { props: { visible: true } })
  // mock prompt
  global.prompt = vi.fn(() => 'MyApiary') as any
  const ds = (await import('../../src/api-client/services/DefaultService')).DefaultService as any
  ds.postApiV1Apiaries.mockResolvedValue({ id: 'api-1', name: 'MyApiary' })
  // call createApiary
  const q = await import('quasar')
  vi.spyOn(q.Notify, 'create').mockImplementation(vi.fn())
  console.log('TEST: calling createApiary')
  await (wrapper.vm as any).createApiary()
  // apiaryOptions should include new entry
  expect((wrapper.vm as any).apiaryOptions[0].label).toBe('MyApiary')
  console.log('TEST: createApiary done')
})

test('submit respects validation failure (does not emit)', async () => {
  console.log('TEST: submit respects validation failure start')
  const ds = (await import('../../src/api-client/services/DefaultService')).DefaultService as any
  // ensure post is a spy before mounting so any mount-time calls are captured
  ds.postApiV1Hives = vi.fn()
  const wrapper = mount(CreateHiveDialog, { props: { visible: true } })
  // validation fails — set `validate` on the existing ref so the
  // component's closure observes it.
  const vm = wrapper.vm as any
  await nextTick()
  await nextTick()
  if (!vm.formRef) vm.formRef = { value: {} }
  if (vm.formRef && typeof vm.formRef === 'object' && 'value' in vm.formRef) {
    vm.formRef.value = vm.formRef.value || {}
    vm.formRef.value.validate = async () => false
  } else {
    vm.formRef.validate = async () => false
  }
  const q = await import('quasar')
  vi.spyOn(q.Notify, 'create').mockImplementation(vi.fn())
  console.log('TEST: calling submit (validation fails)')
  await (wrapper.vm as any).submit()
  // ensure create API was not called when validation fails
  expect(ds.postApiV1Hives).not.toHaveBeenCalled()
  console.log('TEST: submit respects validation failure done')
})

test('submit assigns queen when selected and not already assigned', async () => {
  console.log('TEST: submit assigns queen start')
  const ds = (await import('../../src/api-client/services/DefaultService')).DefaultService as any
  // ensure hive create returns a new id and assign API is spied
  ds.postApiV1Hives = vi.fn().mockResolvedValue({ id: 'new-id-3' })
  ds.postApiV1QueensAssign = vi.fn().mockResolvedValue({})
  // prepare DefaultService to return queens on mount so component populates
  // its `queens` reactive correctly. Install mocks before mounting.
  ds.getApiV1Queens = vi.fn().mockResolvedValue([{ id: 'q123', hiveHistory: [] }])
  const wrapper = mount(CreateHiveDialog, { props: { visible: true } })
  const vm = wrapper.vm as any
  await nextTick()
  await nextTick()
  // ensure form validates and queens are loaded by setting setupState refs directly
  const setup = (wrapper.vm as any).$?.setupState as any
  if (setup) {
    setup.formRef = setup.formRef || { value: {} }
    setup.formRef.value = setup.formRef.value || {}
    setup.formRef.value.validate = async () => true
    setup.queens = setup.queens || { value: [] }
    setup.queens.value = [{ id: 'q123', hiveHistory: [] }]
    setup.queenOptions = setup.queenOptions || { value: [] }
    setup.queenOptions.value = [{ label: 'q123', value: 'q123' }]
    setup.selectedQueenId = setup.selectedQueenId || { value: null }
    setup.selectedQueenId.value = 'q123'
    // sanity: ensure setup values applied
    expect(setup.selectedQueenId.value).toBe('q123')
    expect(Array.isArray(setup.queens.value) && setup.queens.value.length).toBeGreaterThan(0)
  } else {
    // fallback: best-effort
    if (!vm.formRef) vm.formRef = { value: {} }
    vm.formRef.value = vm.formRef.value || {}
    vm.formRef.value.validate = async () => true
    vm.queens = [{ id: 'q123', hiveHistory: [] }]
    vm.queenOptions = [{ label: 'q123', value: 'q123' }]
    vm.selectedQueenId = 'q123'
  }
  // ensure selectedQueenId still set at submit time (loadQueens may overwrite it)
  if (setup) setup.selectedQueenId.value = 'q123'
  // wait for any async queen loading to finish (component sets loadingQueens)
  const waitForLoad = async () => {
    for (let i = 0; i < 50; i++) {
      const stillLoading = setup?.loadingQueens?.value ?? (wrapper.vm as any).loadingQueens
      if (!stillLoading) return
      await new Promise((r) => setTimeout(r, 5))
    }
  }
  await waitForLoad()
  // ensure selected queen still set after any load
  if (setup) setup.selectedQueenId.value = 'q123'
  // call submit which will create the hive and then assign the queen
  // debug current state before submit
  // eslint-disable-next-line no-console
  console.log('DBG before submit selectedQueenId=', setup?.selectedQueenId?.value)
  // eslint-disable-next-line no-console
  console.log('DBG before submit queens=', setup?.queens?.value)
  await (wrapper.vm as any).submit()
  // assert assignment API was called
  expect(ds.postApiV1QueensAssign).toHaveBeenCalledWith('q123', { hiveId: 'new-id-3' })
  // debug: show call lists
  // eslint-disable-next-line no-console
  console.log('DEBUG: postApiV1Hives calls', ds.postApiV1Hives.mock.calls)
  // eslint-disable-next-line no-console
  console.log('DEBUG: postApiV1QueensAssign calls', ds.postApiV1QueensAssign.mock.calls)
  // assignment may be done asynchronously by the component; ensure create happened and no error
  expect(wrapper.emitted()).toHaveProperty('created')
  console.log('TEST: submit assigns queen done')
})

test('submit handles API error (no emit)', async () => {
  console.log('TEST: submit handles API error start')
  // suppress expected console.error from component error handler
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const wrapper = mount(CreateHiveDialog, { props: { visible: true } })
  const vm = wrapper.vm as any
  await nextTick()
  await nextTick()
  if (!vm.formRef) vm.formRef = { value: {} }
  vm.formRef.value = vm.formRef.value || {}
  vm.formRef.value.validate = async () => true
  const ds = (await import('../../src/api-client/services/DefaultService')).DefaultService as any
  ds.postApiV1Hives.mockRejectedValue(new Error('boom'))
  const q = await import('quasar')
  vi.spyOn(q.Notify, 'create').mockImplementation(vi.fn())
  console.log('TEST: calling submit (error)')
  await (wrapper.vm as any).submit()
  expect(wrapper.emitted()).not.toHaveProperty('created')
  consoleErrorSpy.mockRestore()
  console.log('TEST: submit handles API error done')
})
