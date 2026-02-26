/**
 * Proactive token refresh scheduler.
 *
 * After every successful login or refresh, call `scheduleRefresh(token)`.
 * It decodes the JWT exp claim (no library needed) and fires a refresh
 * 60 seconds before the token expires.  On success it rescheduled itself;
 * on failure it clears the session and redirects to /login.
 *
 * Call `cancelRefresh()` on logout to stop the timer.
 */

import { setToken, clearToken } from './token'

// Filled in by the consumer (user store) after it is initialised.
// Using a callback avoids circular imports between this module and the store.
type OnRefreshSuccess = (newToken: string) => void
type OnRefreshFailure = () => void

let _onSuccess: OnRefreshSuccess = () => {}
let _onFailure: OnRefreshFailure = () => {}
let _timerId: ReturnType<typeof setTimeout> | null = null

/** Register callbacks.  Called once from the user store setup. */
export function initRefreshCallbacks(onSuccess: OnRefreshSuccess, onFailure: OnRefreshFailure) {
  _onSuccess = onSuccess
  _onFailure = onFailure
}

/** Decode exp from a JWT without any external library. */
function getTokenExp(token: string): number | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    // base64url → base64
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(payload)
    const parsed = JSON.parse(json)
    return typeof parsed.exp === 'number' ? parsed.exp : null
  } catch {
    return null
  }
}

/** Cancel any pending refresh timer. */
export function cancelRefresh() {
  if (_timerId !== null) {
    clearTimeout(_timerId)
    _timerId = null
  }
}

/**
 * Schedule a proactive refresh for the given access token.
 * Will fire 60 s before expiry (minimum 5 s from now).
 */
export function scheduleRefresh(token: string) {
  cancelRefresh()

  const exp = getTokenExp(token)
  if (!exp) return

  const nowMs = Date.now()
  const expiresInMs = exp * 1000 - nowMs
  const refreshInMs = Math.max(expiresInMs - 60_000, 5_000)

  _timerId = setTimeout(async () => {
    _timerId = null
    await doRefresh()
  }, refreshInMs)
}

export async function doRefresh() {
  try {
    const base = (import.meta as any).env?.VITE_API_BASE || ''
    const resp = await fetch(base + '/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!resp.ok || resp.status === 204) {
      // Refresh token gone or invalid — log the user out
      clearToken()
      localStorage.removeItem('hc_has_refresh')
      cancelRefresh()
      _onFailure()
      return
    }

    const body = await resp.json()
    if (body?.accessToken) {
      setToken(body.accessToken)
      _onSuccess(body.accessToken)
      // Reschedule for the new token
      scheduleRefresh(body.accessToken)
    } else {
      clearToken()
      localStorage.removeItem('hc_has_refresh')
      _onFailure()
    }
  } catch {
    // Network error — try again in 30 s instead of logging out immediately
    _timerId = setTimeout(doRefresh, 30_000)
  }
}
