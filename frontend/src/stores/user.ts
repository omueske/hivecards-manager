import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getToken, setToken as setInMemoryToken, clearToken } from '../auth/token'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(getToken())

  function setToken(t: string) {
    token.value = t
    try {
      setInMemoryToken(t)
    } catch (e) {
      // ignore
    }
  }

  function clear() {
    token.value = null
    try {
      clearToken()
    } catch (e) {}
  }

  return { token, setToken, clear }
})
