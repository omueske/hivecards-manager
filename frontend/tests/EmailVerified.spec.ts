import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import EmailVerified from '../src/pages/EmailVerified.vue'

describe('EmailVerified.vue', () => {
  it('renders verification text and link', () => {
    const wrapper = mount(EmailVerified)
    expect(wrapper.text()).toContain('Email verified!')
    expect(wrapper.find('a').attributes('href')).toBe('/login')
  })
})