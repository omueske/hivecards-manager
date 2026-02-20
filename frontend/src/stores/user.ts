import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getToken, setToken as setInMemoryToken, clearToken } from '../auth/token'
import { scheduleRefresh, cancelRefresh, initRefreshCallbacks } from '../auth/tokenRefresh'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(getToken())

  function setToken(t: string) {
    token.value = t
    try {
      setInMemoryToken(t)
    } catch (e) {
      // ignore
    }
    scheduleRefresh(t)
  }

  function clear() {
    token.value = null
    try {
      clearToken()
    } catch (e) {}
    cancelRefresh()
    localStorage.removeItem('hc_has_refresh')
  }

  // Register callbacks so the refresh module can update the store token
  // or trigger logout without importing the store (avoids circular deps)
  initRefreshCallbacks(
    (newToken) => { token.value = newToken },
    () => {
      token.value = null
      // Redirect to login — use window.location to avoid importing the router here
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    },
  )

  return { token, setToken, clear }
})
