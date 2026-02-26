import { shallowMount } from '@vue/test-utils'
import Changelog from '../../src/pages/Changelog.vue'

test('Changelog renders', () => {
  const wrapper = shallowMount(Changelog)
  expect(wrapper.exists()).toBe(true)
})
