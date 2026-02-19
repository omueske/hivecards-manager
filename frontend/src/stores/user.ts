import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('hc_token'))

  function setToken(t: string) {
    token.value = t
    localStorage.setItem('hc_token', t)
  }

  function clear() {
    token.value = null
    localStorage.removeItem('hc_token')
  }

  return { token, setToken, clear }
})
